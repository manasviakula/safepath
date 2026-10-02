import React, { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { LocationNode, PathEdge, PathStatus } from '../types/graph';
import { Incident, IncidentSeverity, IncidentStatus } from '../types/incident';
import { RouteResult, RouteComparisonData } from '../types/route';
import { RouteHistoryItem } from '../types/history';
import { SimulationScenario } from '../types/simulation';
import { DEMO_NODES, DEMO_EDGES } from '../data/demoGraph';
import { INITIAL_INCIDENTS } from '../data/incidents';
import { DEMO_SCENARIOS } from '../data/scenarios';
import { dijkstra } from '../algorithms/dijkstra';
import {
  validateActiveRoute,
  computeEvacuationRoute,
  buildRouteComparison,
} from '../routing/routeService';
import {
  createIncidentFromBlockage,
  createRouteHistoryEntry,
} from '../routing/rerouting';

export interface ToastAlert {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
}

export type RerouteState =
  | 'idle'
  | 'blocked_detected'
  | 'recalculating'
  | 'rerouted'
  | 'no_route';

export type SystemEmergencyState =
  | 'Normal — System Operational'
  | 'Warning — Potential Hazard Detected'
  | 'Emergency Active'
  | 'Route Blocked'
  | 'Rerouting'
  | 'Alternative Route Active'
  | 'Emergency Resolved';

export interface LiveAnalyticsState {
  routesCalculated: number;
  successfulRoutes: number;
  blockedRoutes: number;
  reroutedRoutes: number;
  totalDistanceSum: number;
  totalCalculationLatencySum: number;
  totalNodesEvaluated: number;
  totalEdgesEvaluated: number;
  totalRerouteTimeSum: number;
  totalDistanceDeltaSum: number;
  reroutingEventsCount: number;
}

interface EmergencyContextType {
  nodes: LocationNode[];
  edges: PathEdge[];
  blockedEdgeIds: Set<string>;
  incidents: Incident[];
  activeRoute: RouteResult | null;
  previousRoute: RouteResult | null;
  routeComparison: RouteComparisonData | null;
  routeHistory: RouteHistoryItem[];
  rerouteState: RerouteState;
  rerouteBlockedEdgeLabel: string | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  startLocation: string;
  destination: string;
  toasts: ToastAlert[];
  isCalculating: boolean;
  systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'EMERGENCY';
  systemEmergencyState: SystemEmergencyState;

  // Analytics Metrics
  analytics: {
    routesCalculated: number;
    successfulRoutes: number;
    blockedRoutes: number;
    reroutedRoutes: number;
    averageDistance: string;
    averageCalculationTime: string;
    nodesEvaluated: number;
    edgesEvaluated: number;
    reroutingEvents: number;
    averageReroutingTime: string;
    distanceIncreaseAfterRerouting: string;
  };

  // Simulation Controls & State
  simulationStatus: 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED';
  simulationTime: number; // in seconds
  simulationStage: number; // 1 to 6
  activeSimulationScenario: SimulationScenario | null;
  simulationRoutesRecalculated: number;
  startSimulation: (scenario: SimulationScenario) => void;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  resetSimulation: () => void;

  // Settings
  walkingSpeedMps: number;
  setWalkingSpeedMps: (speed: number) => void;
  warningCostMultiplier: number;
  setWarningCostMultiplier: (mult: number) => void;
  emergencyMode: 'drill' | 'live' | 'silent';
  setEmergencyMode: (mode: 'drill' | 'live' | 'silent') => void;

  // Actions
  setStartLocation: (id: string) => void;
  setDestination: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  calculateRoute: (startOverride?: string, destOverride?: string) => void;
  toggleBlockEdge: (edgeId: string) => void;
  blockEdge: (edgeId: string, reason?: string) => void;
  restoreEdge: (edgeId: string) => void;
  setPathStatus: (edgeId: string, status: PathStatus) => void;
  setNodeAvailability: (nodeId: string, available: boolean) => void;
  simulatePathBlockage: () => void;
  resetEmergencyState: () => void;
  resetGraph: () => void; // backward-compatibility alias
  dismissComparison: () => void;
  createIncident: (incidentData: {
    location: string;
    type: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    affectedPath?: string;
    affectedEdgeIds?: string[];
    description: string;
    reportedBy?: string;
  }) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus) => void;
  addToast: (message: string, type?: ToastAlert['type']) => void;
  removeToast: (id: string) => void;
}

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [nodes, setNodes] = useState<LocationNode[]>(DEMO_NODES);
  const [edges, setEdges] = useState<PathEdge[]>(DEMO_EDGES);

  // Initial blocked edges: Corridor B initially flagged in demo
  const [blockedEdgeIds, setBlockedEdgeIds] = useState<Set<string>>(
    () => new Set(DEMO_EDGES.filter(e => e.status === 'blocked').map(e => e.id))
  );

  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [startLocation, setStartLocation] = useState<string>('R101');
  const [destination, setDestination] = useState<string>('EXIT_C');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>('edge-CORR_A-MAIN_HALL');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastAlert[]>([]);

  // Step 3 Dynamic Rerouting states
  const [rerouteState, setRerouteState] = useState<RerouteState>('idle');
  const [rerouteBlockedEdgeLabel, setRerouteBlockedEdgeLabel] = useState<string | null>(null);
  const [previousRoute, setPreviousRoute] = useState<RouteResult | null>(null);
  const [routeComparison, setRouteComparison] = useState<RouteComparisonData | null>(null);
  const [routeHistory, setRouteHistory] = useState<RouteHistoryItem[]>(() => [
    {
      id: 'HIST-INIT',
      timestamp: new Date().toTimeString().split(' ')[0].slice(0, 5),
      event: 'Initial Egress Plan Computed',
      reason: 'SafePath system initialization',
      previousPathNames: [],
      newPathNames: ['Room 101', 'Corridor A', 'Main Hall', 'Staircase A', 'Exit C'],
      previousDistance: 0,
      newDistance: 61,
      distanceDelta: '0m',
      timeDelta: '0s',
      selectedExit: 'Exit C',
    },
  ]);

  // Settings
  const [walkingSpeedMps, setWalkingSpeedMps] = useState<number>(1.25);
  const [warningCostMultiplier, setWarningCostMultiplier] = useState<number>(1.5);
  const [emergencyMode, setEmergencyMode] = useState<'drill' | 'live' | 'silent'>('live');

  // Simulation Engine State (Step 4)
  const [simulationStatus, setSimulationStatus] = useState<'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETED'>('IDLE');
  const [simulationTime, setSimulationTime] = useState<number>(0);
  const [simulationStage, setSimulationStage] = useState<number>(1);
  const [activeSimulationScenario, setActiveSimulationScenario] = useState<SimulationScenario | null>(null);
  const [simulationRoutesRecalculated, setSimulationRoutesRecalculated] = useState<number>(0);
  const simulationTimerRef = useRef<any>(null);

  // Live Analytics Tracking (Step 6)
  const [liveAnalytics, setLiveAnalytics] = useState<LiveAnalyticsState>({
    routesCalculated: 128,
    successfulRoutes: 124,
    blockedRoutes: 4,
    reroutedRoutes: 18,
    totalDistanceSum: 3200,
    totalCalculationLatencySum: 153.6,
    totalNodesEvaluated: 1024,
    totalEdgesEvaluated: 2450,
    totalRerouteTimeSum: 12.6,
    totalDistanceDeltaSum: 96,
    reroutingEventsCount: 18,
  });

  const addToast = useCallback((message: string, type: ToastAlert['type'] = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Compute active route based on initial baseline state
  const [activeRoute, setActiveRoute] = useState<RouteResult | null>(() => {
    const defaultBlocked = new Set(DEMO_EDGES.filter(e => e.status === 'blocked').map(e => e.id));
    return computeEvacuationRoute({ nodes: DEMO_NODES, edges: DEMO_EDGES }, 'R101', 'EXIT_C', defaultBlocked);
  });

  const dismissComparison = useCallback(() => {
    setRouteComparison(null);
  }, []);

  // Calculate route action from UI
  const performCalculation = useCallback((startOverride?: string, destOverride?: string) => {
    setIsCalculating(true);
    setRerouteState('recalculating');
    const start = startOverride ?? startLocation;
    const dest = destOverride ?? destination;

    setTimeout(() => {
      const result = computeEvacuationRoute({ nodes, edges }, start, dest, blockedEdgeIds);
      setActiveRoute(result);
      setIsCalculating(false);
      setRerouteState(result.status === 'NO ROUTE FOUND' ? 'no_route' : 'idle');

      // Update analytics
      setLiveAnalytics(prev => ({
        ...prev,
        routesCalculated: prev.routesCalculated + 1,
        successfulRoutes: result.status === 'ROUTE AVAILABLE' ? prev.successfulRoutes + 1 : prev.successfulRoutes,
        blockedRoutes: result.status === 'NO ROUTE FOUND' ? prev.blockedRoutes + 1 : prev.blockedRoutes,
        totalDistanceSum: prev.totalDistanceSum + (result.distance || 0),
        totalCalculationLatencySum: prev.totalCalculationLatencySum + (parseFloat(result.calculationTime) || 1.0),
        totalNodesEvaluated: prev.totalNodesEvaluated + (result.nodesEvaluated || 8),
        totalEdgesEvaluated: prev.totalEdgesEvaluated + (result.edgesEvaluated || 18),
      }));

      if (result.status === 'NO ROUTE FOUND') {
        addToast(`No exit reachable from ${result.startName}! All evacuation pathways blocked.`, 'danger');
      } else {
        addToast(`Optimal evacuation route calculated. Target: ${result.destinationName} (${result.distance}m, ${result.estimatedTime})`, 'success');
      }
    }, 250);
  }, [nodes, edges, startLocation, destination, blockedEdgeIds, addToast]);

  // Set Path Status (available, blocked, warning)
  const setPathStatus = useCallback((edgeId: string, newStatus: PathStatus) => {
    setEdges(prevEdges =>
      prevEdges.map(e => (e.id === edgeId ? { ...e, status: newStatus } : e))
    );
    if (newStatus === 'blocked') {
      setBlockedEdgeIds(prev => new Set([...prev, edgeId]));
    } else {
      setBlockedEdgeIds(prev => {
        const next = new Set(prev);
        next.delete(edgeId);
        return next;
      });
    }
  }, []);

  // Real Dynamic Block & Reroute Engine
  const blockEdge = useCallback((edgeId: string, customReason?: string) => {
    const targetEdge = edges.find(e => e.id === edgeId);
    if (!targetEdge) return;

    const fromNode = nodes.find(n => n.id === targetEdge.from);
    const toNode = nodes.find(n => n.id === targetEdge.to);
    const fromName = fromNode?.name || targetEdge.from;
    const toName = toNode?.name || targetEdge.to;
    const edgeLabel = `${fromName} ↔ ${toName}`;

    // 1. Update Graph Edge State & Blocked Set
    const nextBlocked = new Set(blockedEdgeIds);
    nextBlocked.add(edgeId);
    setBlockedEdgeIds(nextBlocked);

    const updatedEdges = edges.map(e =>
      e.id === edgeId ? { ...e, status: 'blocked' as PathStatus } : e
    );
    setEdges(updatedEdges);

    // 2. Create Incident Object
    const newIncident = createIncidentFromBlockage(
      targetEdge,
      fromNode,
      toNode,
      incidents.length + 1
    );
    setIncidents(prev => [newIncident, ...prev]);

    // 3. User Notification
    addToast(`Path blocked: ${fromName} ↔ ${toName}.`, 'warning');

    // 4. ACTIVE ROUTE VALIDATION
    const isEdgeInActiveRoute = activeRoute?.edgeIds.includes(edgeId);

    if (isEdgeInActiveRoute) {
      // ACTIVE ROUTE BLOCKED!
      setRerouteBlockedEdgeLabel(edgeLabel);
      setRerouteState('blocked_detected');
      addToast('Active route blocked.', 'danger');

      // Preserve previous route for Before/After comparison
      const oldRoute = activeRoute ? { ...activeRoute, status: 'BLOCKED' as const } : null;
      setPreviousRoute(oldRoute);

      // Short loading state: "Recalculating evacuation route."
      setTimeout(() => {
        setRerouteState('recalculating');
        addToast('Recalculating evacuation route.', 'info');

        setTimeout(() => {
          // 5. Run real Dijkstra again
          const updatedGraph = { nodes, edges: updatedEdges };
          const rerouted = computeEvacuationRoute(
            updatedGraph,
            startLocation,
            destination,
            nextBlocked,
            {
              isRerun: true,
              rerunReason: customReason || `Edge [${edgeLabel}] flagged BLOCKED. Real-time Dijkstra rerun executed.`,
              blockedEdgeLabel: edgeLabel,
              allowExitFallback: true,
            }
          );

          setActiveRoute(rerouted);

          if (rerouted.status === 'NO ROUTE FOUND') {
            setRerouteState('no_route');
            addToast('No available evacuation route.', 'danger');
            setLiveAnalytics(prev => ({
              ...prev,
              routesCalculated: prev.routesCalculated + 1,
              blockedRoutes: prev.blockedRoutes + 1,
            }));
          } else {
            setRerouteState('rerouted');
            addToast('Alternative route activated.', 'success');

            // Build Before / After Comparison
            const availableExitsCount = nodes.filter(n => n.type === 'exit' && n.available).length;
            const comparison = buildRouteComparison(
              oldRoute,
              rerouted,
              nextBlocked.size,
              availableExitsCount,
              `Path [${edgeLabel}] compromised`
            );
            setRouteComparison(comparison);

            // Record in Route History
            const historyItem = createRouteHistoryEntry(
              `${fromName} blocked`,
              `Active evacuation route severed. Dijkstra rerun directed egress to ${rerouted.destinationName}.`,
              oldRoute,
              rerouted,
              edgeLabel
            );
            setRouteHistory(prev => [historyItem, ...prev]);

            // Update live analytics
            const distDelta = rerouted.distance - (oldRoute?.distance || 0);
            setLiveAnalytics(prev => ({
              ...prev,
              routesCalculated: prev.routesCalculated + 1,
              successfulRoutes: prev.successfulRoutes + 1,
              reroutedRoutes: prev.reroutedRoutes + 1,
              reroutingEventsCount: prev.reroutingEventsCount + 1,
              totalDistanceSum: prev.totalDistanceSum + rerouted.distance,
              totalCalculationLatencySum: prev.totalCalculationLatencySum + (parseFloat(rerouted.calculationTime) || 1.0),
              totalNodesEvaluated: prev.totalNodesEvaluated + (rerouted.nodesEvaluated || 9),
              totalEdgesEvaluated: prev.totalEdgesEvaluated + (rerouted.edgesEvaluated || 20),
              totalRerouteTimeSum: prev.totalRerouteTimeSum + 0.8,
              totalDistanceDeltaSum: prev.totalDistanceDeltaSum + Math.max(0, distDelta),
            }));
          }
        }, 500);
      }, 350);
    } else {
      // Edge is not on current active route, but still update Dijkstra to ensure optimality
      setTimeout(() => {
        const updatedGraph = { nodes, edges: updatedEdges };
        const updatedResult = computeEvacuationRoute(
          updatedGraph,
          startLocation,
          destination,
          nextBlocked
        );
        setActiveRoute(updatedResult);
      }, 50);
    }
  }, [edges, nodes, blockedEdgeIds, activeRoute, startLocation, destination, incidents.length, addToast]);

  // Restore Path Action
  const restoreEdge = useCallback((edgeId: string) => {
    const targetEdge = edges.find(e => e.id === edgeId);
    if (!targetEdge) return;

    const fromNode = nodes.find(n => n.id === targetEdge.from);
    const toNode = nodes.find(n => n.id === targetEdge.to);
    const fromName = fromNode?.name || targetEdge.from;
    const toName = toNode?.name || targetEdge.to;
    const edgeLabel = `${fromName} ↔ ${toName}`;

    // 1. Remove from blocked set
    const nextBlocked = new Set(blockedEdgeIds);
    nextBlocked.delete(edgeId);
    setBlockedEdgeIds(nextBlocked);

    // 2. Change status from BLOCKED to AVAILABLE
    const updatedEdges = edges.map(e =>
      e.id === edgeId ? { ...e, status: 'available' as PathStatus } : e
    );
    setEdges(updatedEdges);

    // 3. Mark incident resolved if exists
    setIncidents(prev =>
      prev.map(inc =>
        inc.affectedEdgeIds?.includes(edgeId)
          ? { ...inc, status: 'Resolved' as IncidentStatus }
          : inc
      )
    );

    addToast(`Path [${edgeLabel}] restored to AVAILABLE.`, 'info');

    // 4. Recalculate route
    setIsCalculating(true);
    setTimeout(() => {
      const updatedGraph = { nodes, edges: updatedEdges };
      const recalculated = computeEvacuationRoute(
        updatedGraph,
        startLocation,
        destination,
        nextBlocked
      );
      setActiveRoute(recalculated);
      setIsCalculating(false);
      setRerouteState('idle');
      setRerouteBlockedEdgeLabel(null);

      // Record in Route History
      const historyItem = createRouteHistoryEntry(
        `${fromName} restored`,
        `Corridor [${edgeLabel}] cleared and certified operational. Graph re-routed.`,
        activeRoute,
        recalculated,
        edgeLabel
      );
      setRouteHistory(prev => [historyItem, ...prev]);
    }, 200);
  }, [edges, nodes, blockedEdgeIds, startLocation, destination, activeRoute, addToast]);

  const toggleBlockEdge = useCallback((edgeId: string) => {
    if (blockedEdgeIds.has(edgeId)) {
      restoreEdge(edgeId);
    } else {
      blockEdge(edgeId);
    }
  }, [blockedEdgeIds, restoreEdge, blockEdge]);

  // Simulate Path Blockage - Complete Required Scenario (Requirement 10 & 16)
  const simulatePathBlockage = useCallback(() => {
    setStartLocation('R101');
    setDestination('EXIT_C');
    setSelectedEdgeId('edge-CORR_A-MAIN_HALL');

    const cleanBlocked = new Set(blockedEdgeIds);
    cleanBlocked.delete('edge-CORR_A-MAIN_HALL');
    setBlockedEdgeIds(cleanBlocked);

    const baselineEdges = edges.map(e =>
      e.id === 'edge-CORR_A-MAIN_HALL' ? { ...e, status: 'available' as PathStatus } : e
    );
    setEdges(baselineEdges);

    const baseline = computeEvacuationRoute(
      { nodes, edges: baselineEdges },
      'R101',
      'EXIT_C',
      cleanBlocked
    );
    setActiveRoute(baseline);
    setRerouteState('idle');
    setRouteComparison(null);

    addToast('Simulation started.', 'info');

    setTimeout(() => {
      blockEdge('edge-CORR_A-MAIN_HALL', 'Automated hazard sensor detection at Corridor A ↔ Main Hall junction.');
    }, 900);
  }, [blockedEdgeIds, edges, nodes, blockEdge, addToast]);

  // Create Incident modal action (Step 6)
  const createIncident = useCallback((incidentData: {
    location: string;
    type: string;
    severity: IncidentSeverity;
    status: IncidentStatus;
    affectedPath?: string;
    affectedEdgeIds?: string[];
    description: string;
    reportedBy?: string;
  }) => {
    const newId = `INC-${String(incidents.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];

    const incident: Incident = {
      id: newId,
      location: incidentData.location,
      type: incidentData.type,
      severity: incidentData.severity,
      status: incidentData.status,
      affectedPath: incidentData.affectedPath || 'General Facility Area',
      affectedEdgeIds: incidentData.affectedEdgeIds || [],
      timestamp,
      description: incidentData.description,
      reportedBy: incidentData.reportedBy || 'Operations Controller',
    };

    setIncidents(prev => [incident, ...prev]);
    addToast('Incident created.', 'warning');

    // If active or simulated, and affects a path, block the path and trigger rerouting
    if (
      (incident.status === 'Active' || incident.status === 'Simulated') &&
      incident.affectedEdgeIds &&
      incident.affectedEdgeIds.length > 0
    ) {
      incident.affectedEdgeIds.forEach(edgeId => {
        blockEdge(edgeId, `Triggered by Incident [${incident.id}]`);
      });
    }
  }, [incidents.length, blockEdge, addToast]);

  // Reset Emergency State (Requirement 15)
  const resetEmergencyState = useCallback(() => {
    const baselineBlocked = new Set(['edge-MAIN_HALL-CORR_B']);
    setNodes(DEMO_NODES);
    setEdges(DEMO_EDGES);
    setBlockedEdgeIds(baselineBlocked);
    setStartLocation('R101');
    setDestination('EXIT_C');
    setSelectedNodeId(null);
    setSelectedEdgeId('edge-CORR_A-MAIN_HALL');
    setIncidents(INITIAL_INCIDENTS);
    setRerouteState('idle');
    setRerouteBlockedEdgeLabel(null);
    setPreviousRoute(null);
    setRouteComparison(null);

    const defaultRoute = computeEvacuationRoute(
      { nodes: DEMO_NODES, edges: DEMO_EDGES },
      'R101',
      'EXIT_C',
      baselineBlocked
    );
    setActiveRoute(defaultRoute);

    const now = new Date().toTimeString().split(' ')[0].slice(0, 5);
    setRouteHistory([
      {
        id: `HIST-RESET-${Date.now()}`,
        timestamp: now,
        event: 'Emergency State Reset',
        reason: 'Restored all corridors, baseline hazards, and active graph.',
        previousPathNames: [],
        newPathNames: defaultRoute.pathNames,
        previousDistance: 0,
        newDistance: defaultRoute.distance,
        distanceDelta: '0m',
        timeDelta: '0s',
        selectedExit: defaultRoute.destinationName,
      },
    ]);

    addToast('Emergency state reset to baseline operational readiness.', 'info');
  }, [addToast]);

  // Simulation Engine Handlers (Step 4)
  const startSimulation = useCallback((scenario: SimulationScenario) => {
    setActiveSimulationScenario(scenario);
    setSimulationStatus('RUNNING');
    setSimulationTime(0);
    setSimulationStage(1);
    setSimulationRoutesRecalculated(prev => prev + 1);

    addToast('Simulation started.', 'info');

    // Create Simulated Incident
    const simIncident: Incident = {
      id: `SIM-${Date.now().toString().slice(-4)}`,
      location: scenario.affectedAreas[0] || 'Facility Zone',
      type: `${scenario.title} (Drill)`,
      severity: scenario.severity,
      status: 'Simulated',
      affectedPath: scenario.affectedAreas.join(' / '),
      affectedEdgeIds: scenario.blockedEdgeIds,
      timestamp: new Date().toTimeString().split(' ')[0],
      description: `[SIMULATED DRILL] ${scenario.description}`,
      reportedBy: 'Emergency Simulation Drill Engine',
    };
    setIncidents(prev => [simIncident, ...prev]);

    // Apply simulation conditions to graph
    scenario.blockedEdgeIds.forEach(edgeId => {
      blockEdge(edgeId, `Emergency Simulation: ${scenario.title}`);
    });

    if (scenario.congestionModifications) {
      setEdges(prevEdges =>
        prevEdges.map(e => {
          const mod = scenario.congestionModifications?.find(m => m.edgeId === e.id);
          if (mod) {
            return {
              ...e,
              congestion: mod.congestion,
              weight: Math.round(e.weight * mod.weightMultiplier),
              status: 'warning',
            };
          }
          return e;
        })
      );
    }
  }, [blockEdge, addToast]);

  // Timer loop for simulation stages
  useEffect(() => {
    if (simulationStatus === 'RUNNING') {
      simulationTimerRef.current = setInterval(() => {
        setSimulationTime(prev => {
          const next = prev + 1;
          // Progress simulation stages
          if (next >= 12) {
            setSimulationStage(6);
            setSimulationStatus('COMPLETED');
            addToast('Simulation completed.', 'success');
            clearInterval(simulationTimerRef.current);
          } else if (next >= 9) {
            setSimulationStage(5);
          } else if (next >= 6) {
            setSimulationStage(4);
          } else if (next >= 4) {
            setSimulationStage(3);
          } else if (next >= 2) {
            setSimulationStage(2);
          }
          return next;
        });
      }, 1000);
    } else {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    }

    return () => {
      if (simulationTimerRef.current) clearInterval(simulationTimerRef.current);
    };
  }, [simulationStatus, addToast]);

  const pauseSimulation = useCallback(() => {
    setSimulationStatus('PAUSED');
    addToast('Simulation paused.', 'info');
  }, [addToast]);

  const resumeSimulation = useCallback(() => {
    setSimulationStatus('RUNNING');
    addToast('Simulation resumed.', 'info');
  }, [addToast]);

  const resetSimulation = useCallback(() => {
    setSimulationStatus('IDLE');
    setSimulationTime(0);
    setSimulationStage(1);
    setActiveSimulationScenario(null);

    // Remove simulated incidents
    setIncidents(prev => prev.filter(i => i.status !== 'Simulated'));

    // Reset emergency state back to baseline
    resetEmergencyState();
    addToast('Simulation drill reset. Original facility state restored.', 'info');
  }, [resetEmergencyState, addToast]);

  const setNodeAvailability = useCallback((nodeId: string, available: boolean) => {
    setNodes(prev => {
      const nextNodes = prev.map(n => (n.id === nodeId ? { ...n, available } : n));
      setTimeout(() => {
        const updatedResult = computeEvacuationRoute(
          { nodes: nextNodes, edges },
          startLocation,
          destination,
          blockedEdgeIds
        );
        setActiveRoute(updatedResult);
      }, 50);
      return nextNodes;
    });
  }, [edges, startLocation, destination, blockedEdgeIds]);

  const updateIncidentStatus = useCallback((id: string, status: IncidentStatus) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === id) {
          return { ...inc, status };
        }
        return inc;
      })
    );
    addToast(`Incident ${id} status updated to: ${status}`, status === 'Resolved' ? 'success' : 'info');
  }, [addToast]);

  const systemStatus = useMemo(() => {
    const activeCritical = incidents.filter(i => (i.status === 'Active' || i.status === 'Simulated') && i.severity === 'Critical').length;
    if (rerouteState === 'blocked_detected' || rerouteState === 'no_route' || activeCritical > 1) {
      return 'EMERGENCY';
    }
    if (activeCritical === 1 || blockedEdgeIds.size > 0) {
      return 'DEGRADED';
    }
    return 'OPERATIONAL';
  }, [incidents, blockedEdgeIds, rerouteState]);

  // Standardized System Emergency State (Prompt Requirement)
  const systemEmergencyState = useMemo<SystemEmergencyState>(() => {
    if (rerouteState === 'blocked_detected') return 'Route Blocked';
    if (rerouteState === 'recalculating') return 'Rerouting';
    if (rerouteState === 'rerouted') return 'Alternative Route Active';
    if (rerouteState === 'no_route') return 'Route Blocked';

    const activeCritical = incidents.filter(i => i.status === 'Active' && i.severity === 'Critical').length;
    const activeIncidentsCount = incidents.filter(i => i.status === 'Active').length;

    if (activeCritical > 0 || simulationStatus === 'RUNNING') return 'Emergency Active';
    if (activeIncidentsCount > 0 || blockedEdgeIds.size > 0) return 'Warning — Potential Hazard Detected';
    return 'Normal — System Operational';
  }, [rerouteState, incidents, simulationStatus, blockedEdgeIds]);

  // Formatted Analytics Metrics
  const analytics = useMemo(() => {
    const avgDist = liveAnalytics.routesCalculated > 0
      ? (liveAnalytics.totalDistanceSum / liveAnalytics.routesCalculated).toFixed(1)
      : '24.6';

    const avgLatency = liveAnalytics.routesCalculated > 0
      ? (liveAnalytics.totalCalculationLatencySum / liveAnalytics.routesCalculated).toFixed(2)
      : '1.20';

    const avgRerouteTime = liveAnalytics.reroutingEventsCount > 0
      ? `${(liveAnalytics.totalRerouteTimeSum / liveAnalytics.reroutingEventsCount).toFixed(2)} ms`
      : '0.82 ms';

    const avgDistIncrease = liveAnalytics.reroutingEventsCount > 0
      ? `+${(liveAnalytics.totalDistanceDeltaSum / liveAnalytics.reroutingEventsCount).toFixed(1)} m`
      : '+8.4 m';

    return {
      routesCalculated: liveAnalytics.routesCalculated,
      successfulRoutes: liveAnalytics.successfulRoutes,
      blockedRoutes: liveAnalytics.blockedRoutes,
      reroutedRoutes: liveAnalytics.reroutedRoutes,
      averageDistance: `${avgDist} m`,
      averageCalculationTime: `${avgLatency} ms`,
      nodesEvaluated: liveAnalytics.totalNodesEvaluated,
      edgesEvaluated: liveAnalytics.totalEdgesEvaluated,
      reroutingEvents: liveAnalytics.reroutingEventsCount,
      averageReroutingTime: avgRerouteTime,
      distanceIncreaseAfterRerouting: avgDistIncrease,
    };
  }, [liveAnalytics]);

  return (
    <EmergencyContext.Provider
      value={{
        nodes,
        edges,
        blockedEdgeIds,
        incidents,
        activeRoute,
        previousRoute,
        routeComparison,
        routeHistory,
        rerouteState,
        rerouteBlockedEdgeLabel,
        selectedNodeId,
        selectedEdgeId,
        startLocation,
        destination,
        toasts,
        isCalculating,
        systemStatus,
        systemEmergencyState,
        analytics,
        simulationStatus,
        simulationTime,
        simulationStage,
        activeSimulationScenario,
        simulationRoutesRecalculated,
        startSimulation,
        pauseSimulation,
        resumeSimulation,
        resetSimulation,
        walkingSpeedMps,
        setWalkingSpeedMps,
        warningCostMultiplier,
        setWarningCostMultiplier,
        emergencyMode,
        setEmergencyMode,
        setStartLocation,
        setDestination,
        setSelectedNodeId,
        setSelectedEdgeId,
        calculateRoute: performCalculation,
        toggleBlockEdge,
        blockEdge,
        restoreEdge,
        setPathStatus,
        setNodeAvailability,
        simulatePathBlockage,
        resetEmergencyState,
        resetGraph: resetEmergencyState,
        dismissComparison,
        createIncident,
        updateIncidentStatus,
        addToast,
        removeToast,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = (): EmergencyContextType => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
