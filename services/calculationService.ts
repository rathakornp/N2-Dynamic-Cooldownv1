import { CalculationInputs, CalculationResults, ChartDataPoint, LengthProfileDataPoint, TimeSeriesProfilePoint } from '../types.ts';

// Physical Constants
const RHO_SS304 = 8000; // Density of SS304 in kg/m³
const SIGMA = 5.67e-8; // Stefan-Boltzmann constant in W/(m²·K⁴)
const RHO_N2_NORMAL = 1.251; // Density of N2 at normal conditions (0°C, 1 atm) in kg/Nm³
const MOLAR_MASS_N2 = 0.028014; // kg/mol
const IDEAL_GAS_CONSTANT_R = 8.31446; // J/(mol·K)
const ATMOSPHERIC_PRESSURE_BAR = 1.01325;
const NORMAL_TEMP_K = 273.15;
const NUM_SEGMENTS = 50; // Discretize the pipe into 50 segments for 1D analysis
const MIXING_ZONE_SEGMENTS = 5; // The length of the thermal front in terms of segments

// --- Helper Functions for Physical Properties ---

// Approximate Cp for SS304 (J/kg·K)
const getCp_SS304 = (tempC: number): number => {
  const tempK = tempC + 273.15;
  if (tempK < 100) return 150 + 2.5 * tempK;
  return 440 + 0.15 * (tempK - 273);
};

// Approximate Cp for N2 gas at low pressure (J/kg·K)
const getCp_N2 = (tempC: number): number => 1040;

// Thermal conductivity of N2 gas (W/m·K)
const getConductivity_N2 = (tempC: number): number => {
    const T = tempC + 273.15;
    // Simple linear fit, good enough for this range
    return 0.000078 * T + 0.0034;
};


// Dynamic Viscosity of N2 gas (Pa·s) using Sutherland's Law
const getViscosity_N2 = (tempC: number): number => {
    const T = tempC + 273.15;
    const T_ref = 293.15; // 20°C
    const mu_ref = 1.76e-5; // Pa·s at T_ref
    const S = 111; // Sutherland's constant for N2
    return mu_ref * Math.pow(T / T_ref, 1.5) * (T_ref + S) / (T + S);
};

// Density of N2 gas (kg/m³) using Ideal Gas Law
const getDensity_N2 = (tempC: number, pressure_bar_abs: number): number => {
    const T_K = tempC + 273.15;
    const P_Pa = pressure_bar_abs * 100000;
    return (P_Pa * MOLAR_MASS_N2) / (IDEAL_GAS_CONSTANT_R * T_K);
};

// Haaland equation for Darcy friction factor (explicit and accurate)
const getFrictionFactor = (reynolds: number, relativeRoughness: number): number => {
    if (reynolds < 2300) { // Laminar flow
        return 64 / reynolds;
    }
    // Turbulent flow
    const f_inv_sqrt = -1.8 * Math.log10(Math.pow(relativeRoughness / 3.7, 1.11) + 6.9 / reynolds);
    return Math.pow(1 / f_inv_sqrt, 2);
};


// --- Refactored Simulation Logic Helpers ---

/**
 * Calculates the N2 temperature profile along the pipe for a given flow and pipe temperature state.
 */
function calculateN2TempProfile(
    pipeTempsC: number[],
    n2InletTempC: number,
    n2FlowNm3h: number,
    pipeInnerDiameter_m: number,
    segmentInnerSurfaceArea_m2: number
): { n2TempsC: number[]; qRemovedBySegmentW: number[] } {
    const n2TempsC = [n2InletTempC];
    const qRemovedBySegmentW = [];
    const n2Flow_kg_s = (n2FlowNm3h * RHO_N2_NORMAL) / 3600;

    if (n2Flow_kg_s <= 1e-6) {
        return { n2TempsC: pipeTempsC, qRemovedBySegmentW: new Array(NUM_SEGMENTS).fill(0) };
    }

    for (let i = 0; i < NUM_SEGMENTS; i++) {
        const segmentTempC = pipeTempsC[i];
        const currentN2InletTempC = n2TempsC[i];
        
        const { q_removed_W, n2OutletTempC } = calculateHeatRemovalForSegment(
            n2FlowNm3h,
            segmentTempC,
            currentN2InletTempC,
            pipeInnerDiameter_m,
            segmentInnerSurfaceArea_m2
        );
        n2TempsC.push(n2OutletTempC);
        qRemovedBySegmentW.push(q_removed_W);
    }
    return { n2TempsC, qRemovedBySegmentW };
}


/**
 * Calculates heat ingress from the environment iteratively.
 */
function calculateHeatIngress(
    currentTempC: number,
    ambientTempC: number,
    insulationOuterSurfaceArea_m2: number,
    emissivity: number,
    extConvectionCoeff: number,
    R_conductive: number
): { q_convection_W: number; q_radiation_W: number; q_ingress_total_W: number; insulationSurfaceTempC: number } {
    if (ambientTempC <= currentTempC) {
        return { q_convection_W: 0, q_radiation_W: 0, q_ingress_total_W: 0, insulationSurfaceTempC: currentTempC };
    }

    const ambientTempK = ambientTempC + 273.15;
    let insulationSurfaceTempC = currentTempC + 0.75 * (ambientTempC - currentTempC);
    let h_rad = 0;
    let h_combined_ext = 0;
    let R_external = 0;
    const MAX_ITERATIONS = 10;
    const TOLERANCE = 0.1;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
        const insulationSurfaceTempK = insulationSurfaceTempC + 273.15;
        h_rad = SIGMA * emissivity * (ambientTempK + insulationSurfaceTempK) * (ambientTempK**2 + insulationSurfaceTempK**2);
        h_combined_ext = extConvectionCoeff + h_rad;
        R_external = 1 / (h_combined_ext * insulationOuterSurfaceArea_m2);
        const newInsulationSurfaceTempC = (ambientTempC * R_conductive + currentTempC * R_external) / (R_conductive + R_external);
        
        if (Math.abs(newInsulationSurfaceTempC - insulationSurfaceTempC) < TOLERANCE) {
            insulationSurfaceTempC = newInsulationSurfaceTempC;
            break;
        }
        insulationSurfaceTempC = newInsulationSurfaceTempC;
    }

    const R_total = R_conductive + R_external;
    const q_ingress_total_W = (ambientTempC - currentTempC) / R_total;

    if (q_ingress_total_W <= 0) {
        return { q_convection_W: 0, q_radiation_W: 0, q_ingress_total_W: 0, insulationSurfaceTempC };
    }

    const q_convection_W = (extConvectionCoeff / h_combined_ext) * q_ingress_total_W;
    const q_radiation_W = (h_rad / h_combined_ext) * q_ingress_total_W;

    return { q_convection_W, q_radiation_W, q_ingress_total_W, insulationSurfaceTempC };
}

/**
 * Calculates the heat removed by the nitrogen flow for a single segment using an internal convection model.
 */
function calculateHeatRemovalForSegment(
    currentN2Flow_Nm3_h: number,
    segmentTempC: number,
    n2InletTempC: number,
    pipeInnerDiameter_m: number,
    segmentInnerSurfaceArea_m2: number
): { q_removed_W: number; n2OutletTempC: number } {
    if (currentN2Flow_Nm3_h <= 1e-6 || segmentTempC <= n2InletTempC) {
      return { q_removed_W: 0, n2OutletTempC: n2InletTempC };
    }

    const n2Flow_kg_s = (currentN2Flow_Nm3_h * RHO_N2_NORMAL) / 3600;
    const pipeInnerXSArea_m2 = Math.PI * (pipeInnerDiameter_m / 2)**2;

    // Properties at average fluid temperature
    const avgN2TempC = (segmentTempC + n2InletTempC) / 2;
    const density = getDensity_N2(avgN2TempC, ATMOSPHERIC_PRESSURE_BAR);
    const viscosity = getViscosity_N2(avgN2TempC);
    const cp_N2 = getCp_N2(avgN2TempC);
    const k_N2 = getConductivity_N2(avgN2TempC);
    
    const velocity = n2Flow_kg_s / (density * pipeInnerXSArea_m2);
    const reynolds = (density * velocity * pipeInnerDiameter_m) / viscosity;
    const prandtl = (cp_N2 * viscosity) / k_N2;

    let nusselt;
    if (reynolds < 2300) { // Laminar
        nusselt = 3.66;
    } else { // Turbulent - Dittus-Boelter
        nusselt = 0.023 * Math.pow(reynolds, 0.8) * Math.pow(prandtl, 0.4); // For heating of fluid
    }
    
    const h_internal = (nusselt * k_N2) / pipeInnerDiameter_m;
    const q_removed_W = h_internal * segmentInnerSurfaceArea_m2 * (segmentTempC - n2InletTempC);

    const deltaT_N2_actual = q_removed_W / (n2Flow_kg_s * cp_N2);
    const n2OutletTempC = n2InletTempC + deltaT_N2_actual;

    return { q_removed_W, n2OutletTempC };
}

/**
 * Updates a pipe segment's temperature based on the net heat flow over a time step.
 */
function updatePipeTemperature(
    currentTempC: number,
    netHeatFlow_W: number,
    segmentMass_kg: number,
    timeStepS: number,
): number {
    const cp_SS304 = getCp_SS304(currentTempC);
    const pipeThermalMass_J_per_K = segmentMass_kg * cp_SS304;
    const deltaT_pipe_per_step = (netHeatFlow_W * timeStepS) / pipeThermalMass_J_per_K;
    return currentTempC + deltaT_pipe_per_step;
}

export function runCooldownSimulation(
  inputs: CalculationInputs
): CalculationResults | { error: string } {
    
    const {
        pipeLength, pipeOD, pipeWT, pipeRoughness, initialTemp, targetTemp, ambientTemp, 
        initialN2InletTemp, finalN2InletTemp, n2TempStepSizeC, n2TempHoldDurationHours,
        flowRampTotalTimeHours, flowRampIntermediateTimeHours, intermediateN2Flow,
        initialN2Flow, maxN2Flow, insulationThickness, insulationKValue,
        extConvectionCoeff, emissivity, cooldownRateLimit, timeStepS,
        numberOfHolds, holdDurationHours,
        purgeVolumes, preservationDurationDays, preservationLeakRatePercentPerDay, operationalMarginPercent
    } = inputs;

    if (timeStepS <= 0) return { error: "Time step must be positive." };

    const pipeOD_m = pipeOD / 1000;
    const pipeWT_m = pipeWT / 1000;
    const insulationThickness_m = insulationThickness / 1000;
    const pipeRoughness_m = pipeRoughness / 1000;
    const pipeInnerRadius_m = pipeOD_m / 2 - pipeWT_m;
    const pipeOuterRadius_m = pipeOD_m / 2;
    const insulationOuterRadius_m = pipeOuterRadius_m + insulationThickness_m;
    if (pipeInnerRadius_m <= 0) return { error: "Pipe wall thickness is too large." };
    
    const totalPipeCrossSectionArea_m2 = Math.PI * (pipeOuterRadius_m ** 2 - pipeInnerRadius_m ** 2);
    const totalPipeInternalVolume_m3 = Math.PI * (pipeInnerRadius_m ** 2) * pipeLength;
    const totalPipeVolume_m3 = totalPipeCrossSectionArea_m2 * pipeLength;
    const totalPipeMass_kg = totalPipeVolume_m3 * RHO_SS304;
    const totalPipeOuterSurfaceArea_m2 = Math.PI * pipeOD_m * pipeLength;
    const pipeInnerDiameter_m = 2 * pipeInnerRadius_m;
    const pipeInnerXSArea_m2 = Math.PI * pipeInnerRadius_m ** 2;

    const segmentLength_m = pipeLength / NUM_SEGMENTS;
    const segmentMass_kg = totalPipeMass_kg / NUM_SEGMENTS;
    const segmentInsulationOuterSurfaceArea_m2 = (Math.PI * (2 * insulationOuterRadius_m) * pipeLength) / NUM_SEGMENTS;
    const segmentInnerSurfaceArea_m2 = Math.PI * pipeInnerDiameter_m * segmentLength_m;

    const initialGasMoles = (ATMOSPHERIC_PRESSURE_BAR * 100000 * totalPipeInternalVolume_m3) / (IDEAL_GAS_CONSTANT_R * (initialTemp + 273.15));
    const pipeVolumeInNm3 = (initialGasMoles * IDEAL_GAS_CONSTANT_R * NORMAL_TEMP_K) / (ATMOSPHERIC_PRESSURE_BAR * 100000);

    const k_ss304 = 20;
    const R_pipe_segment = Math.log(pipeOuterRadius_m / pipeInnerRadius_m) / (2 * Math.PI * k_ss304 * segmentLength_m);
    const R_insulation_segment = Math.log(insulationOuterRadius_m / pipeOuterRadius_m) / (2 * Math.PI * insulationKValue * segmentLength_m);
    const R_conductive_segment = R_pipe_segment + R_insulation_segment;

    let currentTimeS = 0;
    let pipeTempsC = new Array(NUM_SEGMENTS).fill(initialTemp);
    let currentN2Flow_Nm3_h = initialN2Flow;
    let totalN2Used_Nm3 = 0;
    
    const chartData: ChartDataPoint[] = [];
    const timeSeriesProfile: TimeSeriesProfilePoint[] = [];
    let nextSnapshotTimeS = 3600;

    const MAX_ITERATIONS = 500000;
    let iteration = 0;

    chartData.push({
        time: 0,
        temperature: initialTemp,
        n2Flow: initialN2Flow,
        cooldownRate: 0,
        n2Accumulated: 0,
        pressure_bar: ATMOSPHERIC_PRESSURE_BAR,
        q_total: 0, q_convection: 0, q_radiation: 0, q_removed: 0, q_accumulation: 0,
        netHeatRemovedAccumulated: 0, heatAddedAccumulated: 0, heatRemovedAccumulated: 0, heatAddedConvectionAccumulated: 0, heatAddedRadiationAccumulated: 0,
    });
    timeSeriesProfile.push({ time: 0, profile: pipeTempsC.map((temp, index) => ({ length_m: (index + 1) * segmentLength_m, temperature: temp })) });

    while (pipeTempsC[NUM_SEGMENTS - 1] > targetTemp && iteration < MAX_ITERATIONS) {
        iteration++;
        const prevOutletTempC = pipeTempsC[NUM_SEGMENTS - 1];
        const currentTimeHours = currentTimeS / 3600;

        // --- New Step & Hold N2 Inlet Temperature Logic ---
        let currentN2InletTempC;
        if (n2TempStepSizeC <= 0 || n2TempHoldDurationHours <= 0) {
            // If invalid inputs, jump to final temp. This is a failsafe.
            currentN2InletTempC = finalN2InletTemp;
        } else {
            const numberOfStepsTaken = Math.floor(currentTimeHours / n2TempHoldDurationHours);
            const tempDrop = numberOfStepsTaken * n2TempStepSizeC;
            currentN2InletTempC = initialN2InletTemp - tempDrop;
        }
        // Clamp to the final temperature to prevent overshooting and hold it there
        currentN2InletTempC = Math.max(finalN2InletTemp, currentN2InletTempC);


        // --- Mixing Zone Logic ---
        const frontLeaderSegment = pipeVolumeInNm3 > 0 
            ? Math.floor((totalN2Used_Nm3 / pipeVolumeInNm3) * NUM_SEGMENTS) 
            : NUM_SEGMENTS;
        const frontTrailerSegment = frontLeaderSegment - MIXING_ZONE_SEGMENTS;

        const { qRemovedBySegmentW } = calculateN2TempProfile(
            pipeTempsC, currentN2InletTempC, currentN2Flow_Nm3_h, pipeInnerDiameter_m, segmentInnerSurfaceArea_m2
        );

        let total_q_ingress_W = 0, total_q_convection_W = 0, total_q_radiation_W = 0, total_q_removed_W = 0;

        for (let i = 0; i < NUM_SEGMENTS; i++) {
            const currentSegmentTempC = pipeTempsC[i];
            const ingress = calculateHeatIngress(currentSegmentTempC, ambientTemp, segmentInsulationOuterSurfaceArea_m2, emissivity, extConvectionCoeff, R_conductive_segment);
            
            let removal_W = 0;
            if (i < frontTrailerSegment) {
                // Segment is fully engulfed by cold gas
                removal_W = qRemovedBySegmentW[i];
            } else if (i >= frontTrailerSegment && i <= frontLeaderSegment) {
                // Segment is in the mixing zone, apply a factor
                if (MIXING_ZONE_SEGMENTS > 0) {
                    const mixingFactor = (frontLeaderSegment - i) / MIXING_ZONE_SEGMENTS;
                    removal_W = qRemovedBySegmentW[i] * mixingFactor;
                }
            } 
            // else i > frontLeaderSegment, segment is still full of warm gas, removal_W remains 0.
            
            const netHeatFlow_W = ingress.q_ingress_total_W - removal_W;
            pipeTempsC[i] = updatePipeTemperature(currentSegmentTempC, netHeatFlow_W, segmentMass_kg, timeStepS);
            
            total_q_ingress_W += ingress.q_ingress_total_W;
            total_q_convection_W += ingress.q_convection_W;
            total_q_radiation_W += ingress.q_radiation_W;
            total_q_removed_W += removal_W;
        }

        const outletTempC = pipeTempsC[NUM_SEGMENTS - 1];
        
        const actualCooldownRate_C_per_hr = (prevOutletTempC - outletTempC) / (timeStepS / 3600.0);
        
        currentTimeS += timeStepS;

        if (currentTimeS >= nextSnapshotTimeS) {
            const currentProfile: LengthProfileDataPoint[] = pipeTempsC.map((temp, index) => ({ length_m: (index + 1) * segmentLength_m, temperature: temp }));
            timeSeriesProfile.push({ time: currentTimeS / 3600, profile: currentProfile });
            nextSnapshotTimeS += 3600;
        }

        totalN2Used_Nm3 += currentN2Flow_Nm3_h * (timeStepS / 3600);

        // --- New Pressure Drop Calculation ---
        let inletPressure_bar = ATMOSPHERIC_PRESSURE_BAR;
        if (currentN2Flow_Nm3_h > 1e-6) {
            let currentSegmentInletPressure_Pa = ATMOSPHERIC_PRESSURE_BAR * 100000;
            const n2Flow_kg_s = (currentN2Flow_Nm3_h * RHO_N2_NORMAL) / 3600;
            const relativeRoughness = pipeRoughness_m / pipeInnerDiameter_m;
            
            // Iterate backwards from outlet to inlet
            for (let i = NUM_SEGMENTS - 1; i >= 0; i--) {
                const segmentTempC = pipeTempsC[i];
                const density = getDensity_N2(segmentTempC, currentSegmentInletPressure_Pa / 100000);
                const viscosity = getViscosity_N2(segmentTempC);
                const velocity = n2Flow_kg_s / (density * pipeInnerXSArea_m2);
                const reynolds = (density * velocity * pipeInnerDiameter_m) / viscosity;
                const frictionFactor = getFrictionFactor(reynolds, relativeRoughness);
                const pressureDrop_Pa = frictionFactor * (segmentLength_m / pipeInnerDiameter_m) * (density * velocity**2) / 2;
                currentSegmentInletPressure_Pa += pressureDrop_Pa;
            }
            inletPressure_bar = currentSegmentInletPressure_Pa / 100000;
        }

        const lastPoint = chartData[chartData.length - 1];
        chartData.push({
            time: currentTimeS / 3600,
            temperature: outletTempC,
            n2Flow: currentN2Flow_Nm3_h,
            cooldownRate: actualCooldownRate_C_per_hr,
            n2Accumulated: totalN2Used_Nm3,
            pressure_bar: inletPressure_bar,
            q_total: total_q_ingress_W / 1000, q_convection: total_q_convection_W / 1000,
            q_radiation: total_q_radiation_W / 1000, q_removed: total_q_removed_W / 1000,
            q_accumulation: - (total_q_ingress_W - total_q_removed_W) / 1000,
            heatAddedAccumulated: lastPoint.heatAddedAccumulated + (total_q_ingress_W * timeStepS / 1e6),
            heatAddedConvectionAccumulated: lastPoint.heatAddedConvectionAccumulated + (total_q_convection_W * timeStepS / 1e6),
            heatAddedRadiationAccumulated: lastPoint.heatAddedRadiationAccumulated + (total_q_radiation_W * timeStepS / 1e6),
            heatRemovedAccumulated: lastPoint.heatRemovedAccumulated + (total_q_removed_W * timeStepS / 1e6),
            netHeatRemovedAccumulated: (lastPoint.heatRemovedAccumulated + (total_q_removed_W * timeStepS / 1e6)) - (lastPoint.heatAddedAccumulated + (total_q_ingress_W * timeStepS / 1e6)),
        });
        
        // --- N2 Flow Rate Controller (Two-Stage Linear Ramp) ---
        if (flowRampTotalTimeHours > 0 && currentTimeHours <= flowRampTotalTimeHours) {
            if (currentTimeHours <= flowRampIntermediateTimeHours) {
                // Stage 1: Ramp from initial to intermediate flow
                const rampProgress = flowRampIntermediateTimeHours > 0 ? currentTimeHours / flowRampIntermediateTimeHours : 1;
                currentN2Flow_Nm3_h = initialN2Flow + rampProgress * (intermediateN2Flow - initialN2Flow);
            } else {
                // Stage 2: Ramp from intermediate to max flow
                const timeInStage2 = currentTimeHours - flowRampIntermediateTimeHours;
                const durationStage2 = flowRampTotalTimeHours - flowRampIntermediateTimeHours;
                const rampProgress = durationStage2 > 0 ? timeInStage2 / durationStage2 : 1;
                currentN2Flow_Nm3_h = intermediateN2Flow + rampProgress * (maxN2Flow - intermediateN2Flow);
            }
        } else {
            // If ramp duration is zero or the ramp is complete, hold at max flow.
            currentN2Flow_Nm3_h = maxN2Flow;
        }
        currentN2Flow_Nm3_h = Math.min(maxN2Flow, Math.max(initialN2Flow, currentN2Flow_Nm3_h));

        
        const { qRemovedBySegmentW: qRemovedAtMaxFlow } = calculateN2TempProfile(
            pipeTempsC, currentN2InletTempC, maxN2Flow, pipeInnerDiameter_m, segmentInnerSurfaceArea_m2
        );
        const ingressAtOutlet = calculateHeatIngress(outletTempC, ambientTemp, segmentInsulationOuterSurfaceArea_m2, emissivity, extConvectionCoeff, R_conductive_segment);
        const removalAtMaxFlowW = qRemovedAtMaxFlow[NUM_SEGMENTS - 1];
                
        if (ingressAtOutlet.q_ingress_total_W >= removalAtMaxFlowW && (initialTemp - outletTempC) > 1e-6) {
             return { error: `Stalled at outlet temperature ${outletTempC.toFixed(1)}°C. Heat ingress to the final pipe segment (${ingressAtOutlet.q_ingress_total_W.toFixed(0)} W) exceeds its maximum possible heat removal (${removalAtMaxFlowW.toFixed(0)} W). Increase max N₂ flow or improve insulation.` };
        }
    }

    if (iteration >= MAX_ITERATIONS) {
        return { error: "Simulation timed out. Check input parameters." };
    }
    
    const n2ForCooldownNm3 = totalN2Used_Nm3;

    // --- Post-Simulation: Calculate N2 for Hold Periods ---
    let n2ForHoldsNm3 = 0;
    if (numberOfHolds > 0 && holdDurationHours > 0) {
        // Assume holds occur at the coldest state for a conservative estimate
        const finalPipeTemps = new Array(NUM_SEGMENTS).fill(targetTemp);
        let totalIngressAtTarget_W = 0;
        for (let i = 0; i < NUM_SEGMENTS; i++) {
            const ingress = calculateHeatIngress(finalPipeTemps[i], ambientTemp, segmentInsulationOuterSurfaceArea_m2, emissivity, extConvectionCoeff, R_conductive_segment);
            totalIngressAtTarget_W += ingress.q_ingress_total_W;
        }
        
        const heatToCancel_J_per_s = totalIngressAtTarget_W;
        const deltaT_N2 = targetTemp - finalN2InletTemp;
        const cp_N2 = getCp_N2((targetTemp + finalN2InletTemp) / 2);
        
        if (deltaT_N2 > 0) { // Ensure there is a positive temperature difference for heat transfer
            const requiredMassFlow_kg_s = heatToCancel_J_per_s / (cp_N2 * deltaT_N2);
            const requiredVolumeFlow_Nm3_h = (requiredMassFlow_kg_s * 3600) / RHO_N2_NORMAL;
            const totalHoldHours = numberOfHolds * holdDurationHours;
            n2ForHoldsNm3 = requiredVolumeFlow_Nm3_h * totalHoldHours;
        }
    }
    
    // --- Post-Simulation: Calculate N2 for Purge & Preservation ---
    const n2ForPurgeNm3 = pipeVolumeInNm3 * purgeVolumes;
    const n2ForPreservationNm3 = pipeVolumeInNm3 * (preservationLeakRatePercentPerDay / 100) * preservationDurationDays;
    
    // --- Post-Simulation: Final Totals with Margin ---
    const subTotalN2Nm3 = n2ForCooldownNm3 + n2ForHoldsNm3 + n2ForPurgeNm3 + n2ForPreservationNm3;
    const operationalMarginNm3 = subTotalN2Nm3 * (operationalMarginPercent / 100);
    const grandTotalN2Nm3 = subTotalN2Nm3 + operationalMarginNm3;


    const finalData = chartData[chartData.length - 1];
    const peakCooldownRate = Math.max(...chartData.map(p => p.cooldownRate));
    const peakHeatRemovalkW = Math.max(...chartData.map(p => p.q_removed));

    const finalTemperatureProfile: LengthProfileDataPoint[] = pipeTempsC.map((temp, index) => ({
      length_m: (index + 1) * segmentLength_m,
      temperature: temp,
    }));
    
    timeSeriesProfile.push({ time: currentTimeS / 3600, profile: finalTemperatureProfile });

    const results: CalculationResults = {
        inputs: inputs,
        totalTimeHours: currentTimeS / 3600,
        totalN2Nm3: totalN2Used_Nm3, // Kept for historical reference if needed
        totalN2Kg: grandTotalN2Nm3 * RHO_N2_NORMAL, // Base total on grand total
        peakCooldownRate: peakCooldownRate,
        peakHeatRemovalkW: peakHeatRemovalkW,
        
        n2ForPurgeNm3: n2ForPurgeNm3,
        n2ForCooldownNm3: n2ForCooldownNm3,
        n2ForHoldsNm3: n2ForHoldsNm3,
        n2ForPreservationNm3: n2ForPreservationNm3,
        subTotalN2Nm3: subTotalN2Nm3,
        operationalMarginNm3: operationalMarginNm3,
        grandTotalN2Nm3: grandTotalN2Nm3,

        totalHeatRemovedMJ: finalData.heatRemovedAccumulated,
        totalHeatIngressMJ: finalData.heatAddedAccumulated,
        totalHeatIngressConvectionMJ: finalData.heatAddedAccumulated * (finalData.q_convection / finalData.q_total || 1),
        totalHeatIngressRadiationMJ: finalData.heatAddedAccumulated * (finalData.q_radiation / finalData.q_total || 1),
        pipeMass: totalPipeMass_kg,
        pipeSurfaceArea: totalPipeOuterSurfaceArea_m2,
        stallTemp: 0, 
        calculatedUValue: 0,
        pipeVolume: totalPipeInternalVolume_m3,
        pipeVolumeInNm3: pipeVolumeInNm3,
        initialCp_SS304: getCp_SS304(initialTemp),
        finalCp_SS304: getCp_SS304(targetTemp),
        pipeOuterRadius: pipeOuterRadius_m * 1000,
        pipeInnerRadius: pipeInnerRadius_m * 1000,
        pipeCrossSectionArea: totalPipeCrossSectionArea_m2,
        R_pipe: R_pipe_segment * NUM_SEGMENTS,
        R_insulation: R_insulation_segment * NUM_SEGMENTS,
        deltaT_pipe_initial: 0,
        deltaT_pipe_final: 0,
        pipeLength: pipeLength,
        maxN2Flow: maxN2Flow,
        cooldownRateLimit: cooldownRateLimit,
        targetTemp: targetTemp,
        initialN2InletTemp,
        finalN2InletTemp,
        chartData: chartData,
        temperatureProfile: finalTemperatureProfile,
        timeSeriesProfile: timeSeriesProfile,
    };

    return results;
}
