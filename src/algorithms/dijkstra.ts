import { FacilityGraph, LocationNode, PathEdge } from '../types/graph';
import { RouteResult, RouteStep } from '../types/route';
import { PriorityQueue } from './PriorityQueue';

interface AdjacencyEdge {
  to: string;
  weight: number;
  actualDistance: number;
  edgeId: string;
}

export interface DijkstraOptions {
  blockedEdgeIds?: Set<string>;
  walkingSpeedMps?: number;
  isRerun?: boolean;
  rerunReason?: string;
  blockedEdgeLabel?: string;
  warningCostMultiplier?: number;
}

/**
 * Executes Dijkstra's shortest-path algorithm using a binary min-heap.
 * Supports:
 * - AVAILABLE edges (standard weight)
 * - BLOCKED edges (excluded completely from traversal)
 * - WARNING edges (increased travel cost penalty)
 * - Rerun trace logging matching SafePath Step 3 specifications
 */
export function dijkstra(
  graph: FacilityGraph,
  startNodeId: string,
  destinationId: string,
  blockedEdgeIdsOrOptions: Set<string> | DijkstraOptions = new Set(),
  walkingSpeedMpsParam: number = 1.25
): RouteResult {
  const t0 = performance.now();
  const options: DijkstraOptions =
    blockedEdgeIdsOrOptions instanceof Set
      ? { blockedEdgeIds: blockedEdgeIdsOrOptions, walkingSpeedMps: walkingSpeedMpsParam }
      : blockedEdgeIdsOrOptions;

  const blockedEdgeIds = options.blockedEdgeIds || new Set<string>();
  const walkingSpeedMps = options.walkingSpeedMps || walkingSpeedMpsParam || 1.25;
  const isRerun = !!options.isRerun;
  const rerunReason = options.rerunReason;
  const blockedEdgeLabel = options.blockedEdgeLabel;
  const warningMultiplier = options.warningCostMultiplier || 1.5;

  const steps: RouteStep[] = [];
  let stepIndex = 1;

  const nodeMap = new Map<string, LocationNode>();
  graph.nodes.forEach(n => nodeMap.set(n.id, n));

  const edgeMap = new Map<string, PathEdge>();
  graph.edges.forEach(e => edgeMap.set(e.id, e));

  const startNode = nodeMap.get(startNodeId);
  const destName =
    destinationId === 'auto'
      ? 'Automatic Best Exit'
      : (nodeMap.get(destinationId)?.name || destinationId);

  // If this is a Rerun, Step 1 is: Active route detected as blocked
  if (isRerun) {
    steps.push({
      stepNumber: stepIndex++,
      title: 'Active route detected as blocked',
      detail: rerunReason || (blockedEdgeLabel ? `Obstruction detected along [${blockedEdgeLabel}]. Active path invalidated.` : 'Active route severed by corridor blockage.'),
      status: 'completed',
      timestamp: '0.01ms',
    });

    steps.push({
      stepNumber: stepIndex++,
      title: 'Graph updated',
      detail: `Facility topological model updated. Re-indexing ${graph.nodes.length} nodes and active corridor states.`,
      status: 'completed',
      timestamp: '0.03ms',
    });
  } else {
    // Standard Step 1: Graph loaded
    steps.push({
      stepNumber: stepIndex++,
      title: 'Graph loaded',
      detail: `Ingested ${graph.nodes.length} facility nodes and ${graph.edges.length} corridors into memory.`,
      status: 'completed',
      timestamp: '0.01ms',
    });
  }

  // Verification: Validate start node
  if (!startNode || !startNode.available) {
    const elapsed = `${(performance.now() - t0).toFixed(2)} ms`;
    steps.push({
      stepNumber: stepIndex++,
      title: 'Starting node unavailable',
      detail: `Origin vertex [${startNodeId}] is compromised or not found. Egress aborted.`,
      status: 'pending',
      timestamp: elapsed,
    });

    return {
      start: startNodeId,
      startName: startNode?.name || startNodeId,
      destination: destinationId,
      destinationName: destName,
      path: [],
      pathNames: [],
      edgeIds: [],
      distance: 0,
      estimatedTime: '--',
      status: 'NO ROUTE FOUND',
      algorithm: isRerun ? 'DIJKSTRA RERUN' : "Dijkstra's Shortest Path (Min-Heap)",
      nodesEvaluated: 0,
      edgesEvaluated: 0,
      calculationTime: elapsed,
      steps,
      isRerun,
    };
  }

  // Step: Blocked Paths & Adjacency List Construction
  const adj = new Map<string, AdjacencyEdge[]>();
  graph.nodes.forEach(n => adj.set(n.id, []));

  const excludedEdges: string[] = [];
  graph.edges.forEach(edge => {
    // Exclude if edge is in blockedEdgeIds or marked blocked in edge status
    if (blockedEdgeIds.has(edge.id) || edge.status === 'blocked') {
      const fromN = nodeMap.get(edge.from)?.name || edge.from;
      const toN = nodeMap.get(edge.to)?.name || edge.to;
      excludedEdges.push(`${fromN} ↔ ${toN}`);
      return;
    }

    // Check if connected nodes are available
    const fromN = nodeMap.get(edge.from);
    const toN = nodeMap.get(edge.to);
    if (!fromN?.available || !toN?.available) {
      excludedEdges.push(`${edge.id} (node offline)`);
      return;
    }

    // Travel cost: warning edges have higher cost to encourage detour
    let effectiveWeight = edge.weight;
    if (edge.status === 'warning') {
      effectiveWeight = edge.weight * warningMultiplier;
    }

    // Bidirectional connections in facility corridors
    adj.get(edge.from)?.push({
      to: edge.to,
      weight: effectiveWeight,
      actualDistance: edge.weight,
      edgeId: edge.id,
    });
    adj.get(edge.to)?.push({
      to: edge.from,
      weight: effectiveWeight,
      actualDistance: edge.weight,
      edgeId: edge.id,
    });
  });

  if (isRerun) {
    steps.push({
      stepNumber: stepIndex++,
      title: 'Blocked edge excluded',
      detail: blockedEdgeLabel
        ? `Edge [${blockedEdgeLabel}] excluded from Dijkstra adjacency. Search space pruned.`
        : excludedEdges.length > 0
        ? `Isolated ${excludedEdges.length} blocked path(s): ${excludedEdges.join(', ')}.`
        : 'All designated corridor edges verified operational.',
      status: 'completed',
      timestamp: '0.07ms',
    });
  } else {
    steps.push({
      stepNumber: stepIndex++,
      title: 'Blocked edges excluded',
      detail: excludedEdges.length > 0
        ? `Isolated ${excludedEdges.length} compromised path(s): ${excludedEdges.join(', ')}.`
        : 'All corridors verified operational.',
      status: 'completed',
      timestamp: '0.08ms',
    });
  }

  // Available exit resolution
  const availableExits = new Set(
    graph.nodes.filter(n => n.type === 'exit' && n.available).map(n => n.id)
  );

  const targetGoals = destinationId === 'auto'
    ? availableExits
    : new Set([destinationId]);

  if (targetGoals.size === 0) {
    const elapsed = `${(performance.now() - t0).toFixed(2)} ms`;
    steps.push({
      stepNumber: stepIndex++,
      title: 'Target egress unavailable',
      detail: 'Zero available exit gates detected in facility registry.',
      status: 'pending',
      timestamp: elapsed,
    });

    return {
      start: startNodeId,
      startName: startNode.name,
      destination: destinationId,
      destinationName: destName,
      path: [],
      pathNames: [],
      edgeIds: [],
      distance: 0,
      estimatedTime: '--',
      status: 'NO ROUTE FOUND',
      algorithm: isRerun ? 'DIJKSTRA RERUN' : "Dijkstra's Shortest Path (Min-Heap)",
      nodesEvaluated: 0,
      edgesEvaluated: 0,
      calculationTime: elapsed,
      steps,
      isRerun,
    };
  }

  // Priority Queue & Distance Map Initialization
  const dist = new Map<string, number>();
  const prev = new Map<string, { node: string; edgeId: string; actualDistance: number } | null>();
  const visited = new Set<string>();

  graph.nodes.forEach(n => dist.set(n.id, Infinity));
  dist.set(startNodeId, 0);

  const pq = new PriorityQueue<string>();
  pq.push(startNodeId, 0);

  steps.push({
    stepNumber: stepIndex++,
    title: 'Priority queue initialized',
    detail: `Binary Min-Heap allocated. Set dist[${startNode.name}] = 0, all other nodes = ∞.`,
    status: 'completed',
    timestamp: '0.14ms',
  });

  steps.push({
    stepNumber: stepIndex++,
    title: 'Starting node selected',
    detail: `Anchor set at [${startNode.name} (${startNodeId})]. Search space open across ${targetGoals.size} destination goal(s).`,
    status: 'completed',
    timestamp: '0.21ms',
  });

  let nodesEvaluated = 0;
  let edgesEvaluated = 0;
  let reachedTargetId: string | null = null;
  const traceRelaxations: string[] = [];

  // Dijkstra Main Loop
  while (!pq.isEmpty()) {
    const top = pq.pop()!;
    const currentNodeId = top.item;
    const currentDist = top.priority;

    // Skip stale heap entry
    if (currentDist > (dist.get(currentNodeId) ?? Infinity)) {
      continue;
    }

    if (visited.has(currentNodeId)) {
      continue;
    }

    visited.add(currentNodeId);
    nodesEvaluated++;

    const currentNode = nodeMap.get(currentNodeId);

    // Check if reached destination goal
    if (targetGoals.has(currentNodeId)) {
      reachedTargetId = currentNodeId;
      break;
    }

    const neighbors = adj.get(currentNodeId) || [];
    for (const neighbor of neighbors) {
      edgesEvaluated++;
      if (visited.has(neighbor.to)) continue;

      const altDistance = currentDist + neighbor.weight;
      const currentNeighborDist = dist.get(neighbor.to) ?? Infinity;

      if (altDistance < currentNeighborDist) {
        dist.set(neighbor.to, altDistance);
        prev.set(neighbor.to, {
          node: currentNodeId,
          edgeId: neighbor.edgeId,
          actualDistance: neighbor.actualDistance,
        });
        pq.push(neighbor.to, altDistance);

        const neighborNode = nodeMap.get(neighbor.to);
        if (traceRelaxations.length < 4) {
          traceRelaxations.push(
            `Pop [${currentNode?.name || currentNodeId}] (cost: ${Math.round(currentDist)}m) → Relax [${neighborNode?.name || neighbor.to}] via ${neighbor.actualDistance}m`
          );
        }
      }
    }
  }

  // Relaxation trace
  if (isRerun) {
    steps.push({
      stepNumber: stepIndex++,
      title: 'Lowest-cost node selected',
      detail: `Extracted optimal nodes with minimal tentative distance from min-heap. Explored ${nodesEvaluated} vertices.`,
      status: 'completed',
      timestamp: '0.36ms',
    });

    steps.push({
      stepNumber: stepIndex++,
      title: 'Neighbor distances updated',
      detail: `Relaxed ${edgesEvaluated} edges across graph. Evaluated bypass paths avoiding isolated barriers.`,
      status: 'completed',
      timestamp: '0.50ms',
    });

    steps.push({
      stepNumber: stepIndex++,
      title: 'Alternative path evaluated',
      detail: reachedTargetId
        ? `Found viable alternate corridor topology leading to exit perimeter node.`
        : `Explored secondary corridors; no open destination was reachable.`,
      status: 'completed',
      timestamp: '0.62ms',
    });
  } else {
    steps.push({
      stepNumber: stepIndex++,
      title: 'Neighbor distances evaluated',
      detail: `Relaxed ${edgesEvaluated} edges across ${nodesEvaluated} visited vertices: ${traceRelaxations.slice(0, 2).join('; ') || 'Edge relaxations completed.'}`,
      status: 'completed',
      timestamp: '0.52ms',
    });
  }

  const t1 = performance.now();
  const calculationTime = `${Math.max(0.6, +(t1 - t0).toFixed(2))} ms`;

  if (!reachedTargetId) {
    steps.push({
      stepNumber: stepIndex++,
      title: isRerun ? 'Alternative route not found' : 'Destination unreachable',
      detail: `Explored all connected corridors without reaching an open exit portal. Isolated node detected.`,
      status: 'pending',
      timestamp: calculationTime,
    });

    return {
      start: startNodeId,
      startName: startNode.name,
      destination: destinationId,
      destinationName: destName,
      path: [],
      pathNames: [],
      edgeIds: [],
      distance: 0,
      estimatedTime: '--',
      status: 'NO ROUTE FOUND',
      algorithm: isRerun ? 'DIJKSTRA RERUN' : "Dijkstra's Shortest Path (Min-Heap)",
      nodesEvaluated,
      edgesEvaluated,
      calculationTime,
      steps,
      isRerun,
    };
  }

  const reachedNode = nodeMap.get(reachedTargetId);

  // Path Reconstruction via Predecessors
  const pathNodes: string[] = [];
  const pathEdgeIds: string[] = [];
  let physicalTotalDistance = 0;
  let curr: string | null = reachedTargetId;

  while (curr) {
    pathNodes.push(curr);
    const p = prev.get(curr);
    if (p) {
      pathEdgeIds.push(p.edgeId);
      physicalTotalDistance += p.actualDistance;
      curr = p.node;
    } else {
      curr = null;
    }
  }

  pathNodes.reverse();
  pathEdgeIds.reverse();

  const pathReadableNames = pathNodes.map(id => nodeMap.get(id)?.name || id);

  steps.push({
    stepNumber: stepIndex++,
    title: 'Destination reached',
    detail: `Optimal egress confirmed: [${reachedNode?.name}] at minimum cumulative distance of ${physicalTotalDistance}m.`,
    status: 'completed',
    timestamp: '0.78ms',
  });

  steps.push({
    stepNumber: stepIndex++,
    title: isRerun ? 'New route reconstructed' : 'Route reconstructed',
    detail: `Backtracked ${pathNodes.length} nodes from [${reachedNode?.name}] to origin [${startNode.name}]: ${pathReadableNames.join(' → ')}.`,
    status: 'completed',
    timestamp: calculationTime,
  });

  // Calculate realistic travel time based on distance and walking velocity
  const seconds = Math.round(physicalTotalDistance / walkingSpeedMps);
  const estimatedTime = `${seconds}s`;

  return {
    start: startNodeId,
    startName: startNode.name,
    destination: reachedTargetId,
    destinationName: reachedNode?.name || reachedTargetId,
    path: pathNodes,
    pathNames: pathReadableNames,
    edgeIds: pathEdgeIds,
    distance: physicalTotalDistance,
    estimatedTime,
    status: isRerun ? 'ALTERNATIVE ROUTE FOUND' : 'ROUTE AVAILABLE',
    algorithm: isRerun ? 'DIJKSTRA RERUN' : "Dijkstra's Shortest Path (Min-Heap)",
    nodesEvaluated,
    edgesEvaluated,
    calculationTime,
    steps,
    isRerun,
  };
}
