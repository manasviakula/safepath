export const ANALYTICS_METRICS = {
  routesCalculated: 1482,
  successfulRoutes: 1429,
  routesRecalculated: 138,
  averageRouteDistance: '24.6 m',
  blockedPathsCount: 2,
  availableExitsCount: 3,
  totalExits: 3,
  systemUptime: '99.98%',
  avgCalculationLatency: '1.2 ms',
  occupantsEvacuated: 342,
};

export const HOURLY_ROUTES_DATA = [
  { time: '08:00', routes: 45, rerouted: 2 },
  { time: '09:00', routes: 110, rerouted: 5 },
  { time: '10:00', routes: 185, rerouted: 12 },
  { time: '11:00', routes: 230, rerouted: 18 },
  { time: '12:00', routes: 310, rerouted: 34 },
  { time: '13:00', routes: 280, rerouted: 29 },
  { time: '14:00', routes: 322, rerouted: 38 },
];

export const SUCCESS_VS_REROUTED_DATA = [
  { zone: 'West Wing (R101/Corr A)', direct: 420, rerouted: 32 },
  { zone: 'Central Hub (Main Hall)', direct: 510, rerouted: 58 },
  { zone: 'East Lab & Corridor B', direct: 280, rerouted: 41 },
  { zone: 'South Sector (Stairs)', direct: 219, rerouted: 7 },
];

export const INCIDENT_FREQUENCY_DATA = [
  { type: 'Fire Hazard', count: 8, severity: 'Critical', fill: '#ef4444' },
  { type: 'Smoke Detection', count: 14, severity: 'High', fill: '#f97316' },
  { type: 'Congestion Surge', count: 26, severity: 'Medium', fill: '#f59e0b' },
  { type: 'Access Blockage', count: 9, severity: 'Medium', fill: '#3b82f6' },
  { type: 'Sensor Fault', count: 5, severity: 'Low', fill: '#64748b' },
];

export const EXIT_UTILIZATION_DATA = [
  { exit: 'Exit A (West Ground)', capacity: 400, routedOccupants: 385, percentage: '96%' },
  { exit: 'Exit B (North Perimeter)', capacity: 600, routedOccupants: 520, percentage: '87%' },
  { exit: 'Exit C (East Loading)', capacity: 300, routedOccupants: 240, percentage: '80%' },
];
