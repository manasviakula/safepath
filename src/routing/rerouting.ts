import { Incident } from '../types/incident';
import { RouteHistoryItem } from '../types/history';
import { LocationNode, PathEdge } from '../types/graph';
import { RouteResult } from '../types/route';

/**
 * Creates a formal incident record when a path blockage is reported.
 */
export function createIncidentFromBlockage(
  edge: PathEdge,
  fromNode?: LocationNode,
  toNode?: LocationNode,
  seqNumber: number = 6
): Incident {
  const fromName = fromNode?.name || edge.from;
  const toName = toNode?.name || edge.to;
  const location = `${fromName} ↔ ${toName}`;

  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0]; // "19:47:12"
  const formattedId = `INC-${String(seqNumber).padStart(3, '0')}`;

  return {
    id: formattedId,
    location: fromName,
    type: 'Obstruction',
    severity: 'Critical',
    status: 'Active',
    affectedPath: location,
    affectedEdgeIds: [edge.id],
    timestamp,
    description: `Dynamic barrier obstruction reported along corridor between ${fromName} and ${toName}. Egress pathway blocked.`,
    reportedBy: 'SafePath Dynamic Rerouting Engine',
  };
}

/**
 * Creates a route history timeline item recording a reroute event.
 */
export function createRouteHistoryEntry(
  event: string,
  reason: string,
  previousRoute: RouteResult | null,
  newRoute: RouteResult,
  blockedEdgeLabel?: string
): RouteHistoryItem {
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0].slice(0, 5); // "19:47"

  const prevDist = previousRoute?.distance ?? 0;
  const newDist = newRoute.distance;
  const distDelta = newDist - prevDist;
  const distDeltaStr = distDelta > 0 ? `+${distDelta}m` : distDelta < 0 ? `${distDelta}m` : '0m';

  const parseSeconds = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const match = timeStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const prevSec = parseSeconds(previousRoute?.estimatedTime);
  const newSec = parseSeconds(newRoute.estimatedTime);
  const timeDeltaSec = newSec - prevSec;
  const timeDeltaStr = timeDeltaSec > 0 ? `+${timeDeltaSec}s` : timeDeltaSec < 0 ? `${timeDeltaSec}s` : '0s';

  return {
    id: `HIST-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    timestamp,
    event,
    reason,
    previousPathNames: previousRoute?.pathNames || [],
    newPathNames: newRoute.pathNames,
    previousDistance: prevDist,
    newDistance: newDist,
    distanceDelta: distDeltaStr,
    timeDelta: timeDeltaStr,
    selectedExit: newRoute.destinationName,
    blockedEdgeLabel,
  };
}
