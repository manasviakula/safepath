export interface RouteHistoryItem {
  id: string;
  timestamp: string; // e.g. "10:42:15"
  event: string; // e.g. "Corridor A blocked"
  reason: string;
  previousPathNames: string[];
  newPathNames: string[];
  previousDistance: number;
  newDistance: number;
  distanceDelta: string; // e.g. "+12m" or "-8m"
  timeDelta: string; // e.g. "+10s" or "-6s"
  selectedExit: string;
  blockedEdgeLabel?: string;
}
