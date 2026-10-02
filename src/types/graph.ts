export type NodeType = 'room' | 'corridor' | 'hall' | 'staircase' | 'exit' | 'lab';

export interface LocationNode {
  id: string;
  name: string;
  type: NodeType;
  x: number;
  y: number;
  available: boolean;
  floor?: number;
  capacity?: number;
  description?: string;
}

export type PathStatus = 'available' | 'blocked' | 'warning';
export type CongestionLevel = 'low' | 'medium' | 'high';

export interface PathEdge {
  id: string;
  from: string;
  to: string;
  weight: number; // distance in meters or weighted cost
  status: PathStatus;
  congestion: CongestionLevel;
  label?: string;
}

export interface FacilityGraph {
  nodes: LocationNode[];
  edges: PathEdge[];
}

// Clean aliases required by architecture spec
export type Node = LocationNode;
export type Edge = PathEdge;
export type Graph = FacilityGraph;
export type Exit = LocationNode;

