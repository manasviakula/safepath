export type IncidentSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type IncidentStatus = 'Active' | 'Investigating' | 'Resolved' | 'Simulated' | 'Monitoring';

export interface Incident {
  id: string;
  location: string;
  type: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedPath: string; // e.g. "Corridor B ↔ Staircase A"
  affectedEdgeIds?: string[];
  timestamp: string;
  description: string;
  reportedBy?: string;
}
