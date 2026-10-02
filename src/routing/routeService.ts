import { FacilityGraph, LocationNode, PathEdge } from '../types/graph';
import { RouteResult, RouteComparisonData } from '../types/route';
import { dijkstra, DijkstraOptions } from '../algorithms/dijkstra';

export interface RouteValidationResult {
  isValid: boolean;
  blockedEdgeId?: string;
  blockedEdgeLabel?: string;
  reason?: string;
}

/**
 * Validates whether the currently active route remains fully uncompromised.
 * Returns invalid if any traversed edge is blocked or if any node is unavailable.
 */
export function validateActiveRoute(
  route: RouteResult | null,
  blockedEdgeIds: Set<string>,
  edges: PathEdge[],
  nodes: LocationNode[]
): RouteValidationResult {
  if (!route || route.status === 'NO ROUTE FOUND' || route.path.length === 0) {
    return { isValid: false, reason: 'No active route currently exists.' };
  }

  const edgeMap = new Map<string, PathEdge>();
  edges.forEach(e => edgeMap.set(e.id, e));

  const nodeMap = new Map<string, LocationNode>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  // 1. Check all traversed edges in the active route
  for (const edgeId of route.edgeIds) {
    const edge = edgeMap.get(edgeId);
    if (blockedEdgeIds.has(edgeId) || edge?.status === 'blocked') {
      const fromName = nodeMap.get(edge?.from || '')?.name || edge?.from || 'Unknown';
      const toName = nodeMap.get(edge?.to || '')?.name || edge?.to || 'Unknown';
      const label = `${fromName} ↔ ${toName}`;
      return {
        isValid: false,
        blockedEdgeId: edgeId,
        blockedEdgeLabel: label,
        reason: `Traversed path segment [${label}] has been flagged BLOCKED.`,
      };
    }
  }

  // 2. Check all nodes in the path
  for (const nodeId of route.path) {
    const node = nodeMap.get(nodeId);
    if (node && !node.available) {
      return {
        isValid: false,
        reason: `Traversed location node [${node.name}] is no longer operational.`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Computes an evacuation route using Dijkstra.
 * If a specific destination is requested and becomes unreachable, automatically
 * evaluates other open perimeter exits to choose the lowest-cost reachable exit.
 */
export function computeEvacuationRoute(
  graph: FacilityGraph,
  startId: string,
  destinationId: string,
  blockedEdgeIds: Set<string>,
  options: {
    isRerun?: boolean;
    rerunReason?: string;
    blockedEdgeLabel?: string;
    allowExitFallback?: boolean;
  } = {}
): RouteResult {
  const allowExitFallback = options.allowExitFallback !== false;

  // Run initial Dijkstra
  const primaryResult = dijkstra(graph, startId, destinationId, {
    blockedEdgeIds,
    isRerun: options.isRerun,
    rerunReason: options.rerunReason,
    blockedEdgeLabel: options.blockedEdgeLabel,
  });

  // If destination is a specific exit, but unreachable, evaluate other exits
  if (
    primaryResult.status === 'NO ROUTE FOUND' &&
    destinationId !== 'auto' &&
    allowExitFallback
  ) {
    const fallbackResult = dijkstra(graph, startId, 'auto', {
      blockedEdgeIds,
      isRerun: options.isRerun,
      rerunReason: options.rerunReason,
      blockedEdgeLabel: options.blockedEdgeLabel,
    });

    if (fallbackResult.status !== 'NO ROUTE FOUND') {
      // Re-route succeeded with exit fallback
      return fallbackResult;
    }
  }

  return primaryResult;
}

/**
 * Builds comparison metrics between previous baseline route and newly recalculated route.
 */
export function buildRouteComparison(
  previousRoute: RouteResult | null,
  newRoute: RouteResult,
  blockedEdgesCount: number,
  availableExitsCount: number,
  reason: string
): RouteComparisonData {
  const prevDist = previousRoute?.distance ?? 0;
  const newDist = newRoute.distance;
  const distDelta = newDist - prevDist;
  const distDeltaStr = distDelta > 0 ? `+${distDelta} m` : distDelta < 0 ? `${distDelta} m` : '0 m';

  // Parse seconds from estimatedTime ("42s" -> 42)
  const parseSeconds = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const match = timeStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const prevSec = parseSeconds(previousRoute?.estimatedTime);
  const newSec = parseSeconds(newRoute.estimatedTime);
  const timeDeltaSec = newSec - prevSec;
  const timeDelta = timeDeltaSec > 0 ? `+${timeDeltaSec}s` : timeDeltaSec < 0 ? `${timeDeltaSec}s` : '0s';

  return {
    isRerouted: true,
    previousRoute,
    newRoute,
    distanceDelta: distDelta,
    timeDeltaSeconds: timeDeltaSec,
    timeDelta,
    distanceDeltaStr: distDeltaStr,
    blockedPathsCount: blockedEdgesCount,
    availableExitsCount,
    reason,
  };
}
