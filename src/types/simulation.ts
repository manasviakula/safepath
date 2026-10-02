export interface SimulationScenario {
  id: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium';
  icon: string;
  blockedEdgeIds: string[];
  blockedNodeIds?: string[];
  congestionModifications?: { edgeId: string; congestion: 'low' | 'medium' | 'high'; weightMultiplier: number }[];
  affectedAreas: string[];
  initialRoute: {
    exit: string;
    distance: number;
    time: string;
    path: string[];
  };
  reroutedRoute: {
    exit: string;
    distance: number;
    time: string;
    path: string[];
  };
}

export interface SimulationEvent {
  id: string;
  timeOffset: string;
  type: 'hazard_detected' | 'path_blocked' | 'reroute_triggered' | 'exit_cleared' | 'evacuation_dispatched';
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Info';
  location: string;
}
