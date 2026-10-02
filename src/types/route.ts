export type RouteStatus =
  | 'ROUTE AVAILABLE'
  | 'BLOCKED'
  | 'REROUTED'
  | 'NO ROUTE FOUND'
  | 'ACTIVE ROUTE BLOCKED'
  | 'ALTERNATIVE ROUTE FOUND';

export interface RouteStep {
  stepNumber: number;
  title: string;
  detail: string;
  status: 'completed' | 'in-progress' | 'pending';
  timestamp: string;
}

export interface RouteResult {
  start: string; // Node ID
  startName: string;
  destination: string; // Node ID or 'auto'
  destinationName: string;
  path: string[]; // List of Node IDs in order
  pathNames: string[];
  edgeIds: string[]; // List of Edge IDs traversed
  distance: number; // in meters
  estimatedTime: string; // e.g. "42s"
  status: RouteStatus;
  algorithm: string; // e.g. "Dijkstra Shortest Path (Min-Heap)"
  nodesEvaluated: number;
  edgesEvaluated: number;
  calculationTime: string; // e.g. "1.4 ms"
  steps: RouteStep[];
  isRerun?: boolean;
}

// Clean alias
export type Route = RouteResult;

export interface RouteComparisonData {
  isRerouted: boolean;
  previousRoute: RouteResult | null;
  newRoute: RouteResult;
  distanceDelta: number; // e.g. +12
  timeDeltaSeconds: number; // e.g. +10
  timeDelta: string; // e.g. "+10s"
  distanceDeltaStr: string; // e.g. "+12 m"
  blockedPathsCount: number;
  availableExitsCount: number;
  reason: string;
}

