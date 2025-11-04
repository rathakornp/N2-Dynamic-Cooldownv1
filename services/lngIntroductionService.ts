import { LngIntroductionInputs, CalculationResults, LngIntroductionResults, LngChartDataPoint, PressureTimeSeriesPoint, LengthPressureDataPoint, TimeSeriesProfilePoint, LengthProfileDataPoint } from '../types.ts';

const RHO_N2_NORMAL = 1.251; // Density of N2 at normal conditions (0°C, 1 atm) in kg/Nm³
const MOLAR_MASS_N2 = 0.028014; // kg/mol
const IDEAL_GAS_CONSTANT_R = 8.31446; // J/(mol·K)
const ATMOSPHERIC_PRESSURE_BAR = 1.01325;
const NUM_SIM_SEGMENTS = 50;

// --- Helper Functions for Physical Properties (for pressure drop) ---
const getViscosity_N2 = (tempC: number): number => {
    const T = tempC + 273.15;
    const T_ref = 293.15;
    const mu_ref = 1.76e-5;
    const S = 111;
    return mu_ref * Math.pow(T / T_ref, 1.5) * (T_ref + S) / (T + S);
};
const getDensity_N2 = (tempC: number, pressure_bar_abs: number): number => {
    const T_K = tempC + 273.15;
    const P_Pa = pressure_bar_abs * 100000;
    return (P_Pa * MOLAR_MASS_N2) / (IDEAL_GAS_CONSTANT_R * T_K);
};
const getFrictionFactor = (reynolds: number, relativeRoughness: number): number => {
    if (reynolds < 2300) return 64 / reynolds;
    const f_inv_sqrt = -1.8 * Math.log10(Math.pow(relativeRoughness / 3.7, 1.11) + 6.9 / reynolds);
    return Math.pow(1 / f_inv_sqrt, 2);
};


export function runLngIntroductionSimulation(
  inputs: LngIntroductionInputs,
  cooldownResults: CalculationResults,
): LngIntroductionResults | { error: string } {
  const { initialLngFillingRate, maxLngVelocity, fillingRampUpTime, lngDensity, ventBackPressure, lngTemperature } = inputs;
  // Fix: pipeVolume and pipeInnerRadius are calculated properties on the main results object, not inputs.
  const { pipeLength, pipeRoughness } = cooldownResults.inputs;
  const { pipeVolume, pipeInnerRadius } = cooldownResults;
  const pipePostCooldownTemp = cooldownResults.inputs.targetTemp;

  if (pipeVolume <= 0 || pipeLength <= 0) return { error: "Invalid pipe dimensions from cooldown results." };

  const pipeInnerDiameter_m = (pipeInnerRadius * 2) / 1000;
  const pipeInnerXSArea_m2 = Math.PI * (pipeInnerRadius / 1000) ** 2;
  const maxFlowRate_m3_s = maxLngVelocity * pipeInnerXSArea_m2;
  const maxFlowRate_m3_h = maxFlowRate_m3_s * 3600;

  if (initialLngFillingRate > maxFlowRate_m3_h) {
    return { error: `Initial filling rate (${initialLngFillingRate} m³/h) cannot exceed the max rate calculated from velocity limit (${maxFlowRate_m3_h.toFixed(1)} m³/h).` };
  }

  const chartData: LngChartDataPoint[] = [];
  const pressureTimeSeries: PressureTimeSeriesPoint[] = [];
  const tempTimeSeriesProfile: TimeSeriesProfilePoint[] = [];
  let currentTimeS = 0;
  const timeStepS = 60;
  let filledVolume_m3 = 0;
  
  const snapshotIntervalS = 1800; // 30 minutes
  let nextSnapshotTimeS = 0;

  const MAX_ITERATIONS = 50000;
  let iteration = 0;
  
  // Initial state (t=0)
  chartData.push({
      time: 0,
      lngFlowRate: initialLngFillingRate,
      lngVelocity: (initialLngFillingRate / 3600) / pipeInnerXSArea_m2,
      filledVolume: 0,
      n2VentRate: 0,
      inletPressure: ventBackPressure
  });
  
  const segmentLength_m = pipeLength / NUM_SIM_SEGMENTS;
  const initialTempProfile = Array.from({ length: NUM_SIM_SEGMENTS }, (_, i) => ({
    length_m: (i + 0.5) * segmentLength_m,
    temperature: pipePostCooldownTemp
  }));
  tempTimeSeriesProfile.push({ time: 0, profile: initialTempProfile });

  const initialPressureProfile = Array.from({ length: NUM_SIM_SEGMENTS }, (_, i) => ({
    length_m: (i + 0.5) * segmentLength_m,
    pressure_bar: ventBackPressure
  }));
  pressureTimeSeries.push({ time: 0, profile: initialPressureProfile });

  while (filledVolume_m3 < pipeVolume && iteration < MAX_ITERATIONS) {
    iteration++;
    const currentTimeHours = currentTimeS / 3600;

    let currentFlowRate_m3_h = initialLngFillingRate;
    if (fillingRampUpTime > 0 && currentTimeHours < fillingRampUpTime) {
      const rampProgress = currentTimeHours / fillingRampUpTime;
      currentFlowRate_m3_h = initialLngFillingRate + rampProgress * (maxFlowRate_m3_h - initialLngFillingRate);
    } else {
      currentFlowRate_m3_h = maxFlowRate_m3_h;
    }

    const volumeAdded_m3 = currentFlowRate_m3_h * (timeStepS / 3600);
    filledVolume_m3 += volumeAdded_m3;
    
    currentTimeS += timeStepS;

    const currentVelocity_m_s = (currentFlowRate_m3_h / 3600) / pipeInnerXSArea_m2;
    const filledLength_m = filledVolume_m3 / pipeInnerXSArea_m2;

    const finalTemp_K = pipePostCooldownTemp + 273.15;
    const n2MolesDisplaced = (ventBackPressure * 100000 * volumeAdded_m3) / (IDEAL_GAS_CONSTANT_R * finalTemp_K);
    const n2VolumeDisplaced_Nm3 = (n2MolesDisplaced * IDEAL_GAS_CONSTANT_R * 273.15) / (1.01325 * 100000);
    const n2VentRate_Nm3_h = n2VolumeDisplaced_Nm3 / (timeStepS / 3600);
    const n2VentRate_kg_s = (n2VentRate_Nm3_h * RHO_N2_NORMAL) / 3600;

    let inletPressure_bar = ventBackPressure;
    if(n2VentRate_kg_s > 1e-6) {
        const n2ColumnLength = Math.max(0, pipeLength - filledLength_m);
        const relativeRoughness = (pipeRoughness / 1000) / pipeInnerDiameter_m;
        const density = getDensity_N2(pipePostCooldownTemp, ventBackPressure);
        const viscosity = getViscosity_N2(pipePostCooldownTemp);
        const velocity = n2VentRate_kg_s / (density * pipeInnerXSArea_m2);
        const reynolds = (density * velocity * pipeInnerDiameter_m) / viscosity;
        const frictionFactor = getFrictionFactor(reynolds, relativeRoughness);
        const pressureDrop_Pa = frictionFactor * (n2ColumnLength / pipeInnerDiameter_m) * (density * velocity**2) / 2;
        inletPressure_bar = ventBackPressure + (pressureDrop_Pa / 100000);
    }

    chartData.push({
      time: currentTimeS / 3600,
      lngFlowRate: currentFlowRate_m3_h,
      lngVelocity: currentVelocity_m_s,
      filledVolume: Math.min(filledVolume_m3, pipeVolume),
      n2VentRate: n2VentRate_Nm3_h,
      inletPressure: inletPressure_bar,
    });
    
    if (currentTimeS >= nextSnapshotTimeS) {
        // --- Generate Temperature Profile Snapshot ---
        const tempProfile: LengthProfileDataPoint[] = [];
        for (let i = 0; i < NUM_SIM_SEGMENTS; i++) {
            const segmentPos_m = (i + 0.5) * segmentLength_m;
            tempProfile.push({
                length_m: segmentPos_m,
                temperature: segmentPos_m < filledLength_m ? lngTemperature : pipePostCooldownTemp,
            });
        }
        tempTimeSeriesProfile.push({ time: currentTimeHours, profile: tempProfile });

        // --- Generate Pressure Profile Snapshot ---
        const pressureProfile: LengthPressureDataPoint[] = [];
        const n2ColumnLength = Math.max(0, pipeLength - filledLength_m);
        for(let i = 0; i < NUM_SIM_SEGMENTS; i++) {
            const segmentPos_m = (i + 0.5) * segmentLength_m;
            let pressure_bar = ventBackPressure;
            if(segmentPos_m < filledLength_m) {
                pressure_bar = inletPressure_bar; // Simplified: liquid column pressure is higher
            } else {
                 const distanceFromVent = n2ColumnLength - (segmentPos_m - filledLength_m);
                 const dp_Pa_at_point = (inletPressure_bar - ventBackPressure) * 100000 * (distanceFromVent / n2ColumnLength || 0);
                 pressure_bar = ventBackPressure + dp_Pa_at_point / 100000;
            }
            pressureProfile.push({ length_m: segmentPos_m, pressure_bar });
        }
        pressureTimeSeries.push({ time: currentTimeHours, profile: pressureProfile });

        nextSnapshotTimeS += snapshotIntervalS;
    }
  }

  if (iteration >= MAX_ITERATIONS) {
    return { error: "LNG filling simulation timed out. Check inputs." };
  }
  
  const finalTempProfile = Array.from({ length: NUM_SIM_SEGMENTS }, (_, i) => ({
    length_m: (i + 0.5) * segmentLength_m,
    temperature: lngTemperature
  }));
  tempTimeSeriesProfile.push({ time: currentTimeS/3600, profile: finalTempProfile });

  const results: LngIntroductionResults = {
    inputs: inputs,
    cooldownResults: cooldownResults,
    totalFillingTimeHours: currentTimeS / 3600,
    totalLngVolume_m3: pipeVolume,
    totalLngMass_kg: pipeVolume * lngDensity,
    maxFlowRate_m3_h: maxFlowRate_m3_h,
    chartData: chartData,
    pressureTimeSeries: pressureTimeSeries,
    tempTimeSeriesProfile: tempTimeSeriesProfile,
    finalTempProfile: finalTempProfile,
  };

  return results;
}