// Fix: Removed conflicting self-import of types.

export interface CalculationInputs {
  pipeLength: number;
  pipeOD: number;
  pipeWT: number;
  pipeRoughness: number;
  initialTemp: number;
  targetTemp: number;
  ambientTemp: number;
  initialN2InletTemp: number;
  finalN2InletTemp: number;
  n2TempStepSizeC: number;
  n2TempHoldDurationHours: number;
  flowRampTotalTimeHours: number;
  flowRampIntermediateTimeHours: number;
  intermediateN2Flow: number;
  initialN2Flow: number;
  maxN2Flow: number;
  insulationThickness: number;
  insulationKValue: number;
  extConvectionCoeff: number;
  emissivity: number;
  cooldownRateLimit: number;
  numberOfHolds: number;
  holdDurationHours: number;
  purgeVolumes: number;
  preservationDurationDays: number;
  preservationLeakRatePercentPerDay: number;
  operationalMarginPercent: number;
  timeStepS: number;
}

export interface ChartDataPoint {
  time: number;
  temperature: number;
  n2Flow: number;
  cooldownRate: number;
  n2Accumulated: number;
  pressure_bar: number;
  q_total: number;
  q_convection: number;
  q_radiation: number;
  q_removed: number;
  q_accumulation: number;
  netHeatRemovedAccumulated: number;
  heatAddedAccumulated: number;
  heatRemovedAccumulated: number;
  heatAddedConvectionAccumulated: number;
  heatAddedRadiationAccumulated: number;
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
  inputs: CalculationInputs;
  totalTimeHours: number;
  totalN2Nm3: number;
  totalN2Kg: number;
  peakCooldownRate: number;
  peakHeatRemovalkW: number;
  n2ForPurgeNm3: number;
  n2ForCooldownNm3: number;
  n2ForHoldsNm3: number;
  n2ForPreservationNm3: number;
  subTotalN2Nm3: number;
  operationalMarginNm3: number;
  grandTotalN2Nm3: number;
  totalHeatRemovedMJ: number;
  totalHeatIngressMJ: number;
  totalHeatIngressConvectionMJ: number;
  totalHeatIngressRadiationMJ: number;
  pipeMass: number;
  pipeSurfaceArea: number;
  stallTemp: number;
  calculatedUValue: number;
  pipeVolume: number;
  pipeVolumeInNm3: number;
  initialCp_SS304: number;
  finalCp_SS304: number;
  pipeOuterRadius: number;
  pipeInnerRadius: number;
  pipeCrossSectionArea: number;
  R_pipe: number;
  R_insulation: number;
  deltaT_pipe_initial: number;
  deltaT_pipe_final: number;
  pipeLength: number;
  maxN2Flow: number;
  cooldownRateLimit: number;
  targetTemp: number;
  initialN2InletTemp: number;
  finalN2InletTemp: number;
  chartData: ChartDataPoint[];
  temperatureProfile: LengthProfileDataPoint[];
  timeSeriesProfile: TimeSeriesProfilePoint[];
}

export interface LngIntroductionInputs {
  initialLngFillingRate: number;
  maxLngVelocity: number;
  fillingRampUpTime: number;
  lngDensity: number;
  ventBackPressure: number;
  lngTemperature: number;
}

export interface LngChartDataPoint {
  time: number;
  lngFlowRate: number;
  lngVelocity: number;
  filledVolume: number;
  n2VentRate: number;
  inletPressure: number;
}

export interface LengthPressureDataPoint {
  length_m: number;
  pressure_bar: number;
}

export interface PressureTimeSeriesPoint {
  time: number; // in hours
  profile: LengthPressureDataPoint[];
}

export interface LngIntroductionResults {
  inputs: LngIntroductionInputs;
  cooldownResults: CalculationResults;
  totalFillingTimeHours: number;
  totalLngVolume_m3: number;
  totalLngMass_kg: number;
  maxFlowRate_m3_h: number;
  chartData: LngChartDataPoint[];
  pressureTimeSeries: PressureTimeSeriesPoint[];
  tempTimeSeriesProfile: TimeSeriesProfilePoint[];
  finalTempProfile: LengthProfileDataPoint[];
}