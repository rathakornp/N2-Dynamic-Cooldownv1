export interface CalculationInputs {
  // Pipeline
  pipeLength: number;
  pipeOD: number;
  pipeWT: number;
  pipeRoughness: number; // New
  
  // Process
  initialTemp: number;
  targetTemp: number;
  ambientTemp: number;
  
  // N2 Vaporizer
  initialN2InletTemp: number; // New
  finalN2InletTemp: number; // Renamed from n2InletTemp
  totalRampTimeHours: number; // Renamed from n2TempRampDownHours
  intermediateRampTimeHours: number; // New for multi-stage ramp
  intermediateN2Flow: number; // New for multi-stage ramp
  initialN2Flow: number;
  maxN2Flow: number;

  // Heat Transfer & Constraints
  insulationThickness: number;
  insulationKValue: number;
  extConvectionCoeff: number;
  emissivity: number;
  cooldownRateLimit: number;
  numberOfHolds: number; // New
  holdDurationHours: number; // New

  // Purge, Preservation & Margin
  purgeVolumes: number; // New
  preservationDurationDays: number; // New
  preservationLeakRatePercentPerDay: number; // New
  operationalMarginPercent: number; // New

  // Simulation
  timeStepS: number;
}

export interface ChartDataPoint {
  time: number; // in hours
  temperature: number; // in Celsius - NOTE: This now represents the OUTLET temperature
  n2Flow: number; // in Nm³/h
  cooldownRate: number; // in °C/hr
  n2Accumulated: number; // in Nm³
  pressure_bar: number; // in bar absolute - NOTE: This now represents INLET pressure
  q_total: number; // total heat ingress in kW
  q_convection: number; // convective heat ingress in kW
  q_radiation: number; // radiative heat ingress in kW
  q_removed: number; // heat removed by N2 in kW
  q_accumulation: number; // net heat change in the pipe in kW
  netHeatRemovedAccumulated: number; // in MJ
  heatAddedAccumulated: number; // in MJ
  heatAddedConvectionAccumulated: number; // in MJ
  heatAddedRadiationAccumulated: number; // in MJ
  heatRemovedAccumulated: number; // in MJ
}

export interface LengthProfileDataPoint {
  length_m: number;
  temperature: number;
}

export interface TimeSeriesProfilePoint {
  time: number; // in hours
  profile: LengthProfileDataPoint[];
}

export interface CalculationResults {
  // Original inputs for reference
  inputs: CalculationInputs;

  // Key Metrics
  totalTimeHours: number;
  totalN2Nm3: number; // Renamed to n2ForCooldownNm3, but keeping for compatibility until refactor
  totalN2Kg: number;
  peakCooldownRate: number;
  peakHeatRemovalkW: number;
  
  // N2 Consumption Breakdown
  n2ForPurgeNm3: number; // New
  n2ForCooldownNm3: number; // Explicitly for cooldown phase
  n2ForHoldsNm3: number; 
  n2ForPreservationNm3: number; // New
  subTotalN2Nm3: number; // New
  operationalMarginNm3: number; // New
  grandTotalN2Nm3: number; // New (replaces totalPlannedN2Nm3)
  
  // Heat Totals
  totalHeatRemovedMJ: number;
  totalHeatIngressMJ: number;
  totalHeatIngressConvectionMJ: number;
  totalHeatIngressRadiationMJ: number;
  
  // Calculated Properties
  pipeMass: number;
  pipeSurfaceArea: number;
  stallTemp: number;
  calculatedUValue: number;
  pipeVolume: number;
  pipeVolumeInNm3: number; // New
  initialCp_SS304: number; // J/kg·K
  finalCp_SS304: number;   // J/kg·K
  pipeOuterRadius: number; // mm
  pipeInnerRadius: number; // mm
  pipeCrossSectionArea: number; // m^2

  // New Detailed Heat Transfer Properties
  R_pipe: number; // K/W
  R_insulation: number; // K/W
  deltaT_pipe_initial: number; // °C
  deltaT_pipe_final: number; // °C
  
  // Pass-through for charting and analysis
  pipeLength: number;
  maxN2Flow: number;
  cooldownRateLimit: number;
  targetTemp: number;
  initialN2InletTemp: number;
  finalN2InletTemp: number;
  totalRampTimeHours: number;

  // Chart Data
  chartData: ChartDataPoint[];
  temperatureProfile: LengthProfileDataPoint[]; // Final snapshot
  timeSeriesProfile: TimeSeriesProfilePoint[]; // Hourly snapshots
}