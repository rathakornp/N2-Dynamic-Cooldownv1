import { CalculationInputs } from './types';

export const initialInputs: CalculationInputs = {
  // Pipeline
  pipeLength: 622,          // m
  pipeOD: 323.8,          // mm (e.g., 6" pipe)
  pipeWT: 21.44,           // mm (e.g., Schedule 40)
  pipeRoughness: 0.045,     // mm (e.g., commercial steel)
  
  // Process
  initialTemp: 40,        // °C
  targetTemp: -110,       // °C
  ambientTemp: 40,        // °C
  
  // N2 Vaporizer
  initialN2InletTemp: 15,   // °C
  finalN2InletTemp: -150,     // °C
  totalRampTimeHours: 8,   // hours
  intermediateRampTimeHours: 4, // hours
  intermediateN2Flow: 3000, // Nm³/h
  initialN2Flow: 1000,    // Nm³/h
  maxN2Flow: 5000,        // Nm³/h

  // Heat Transfer & Constraints
  insulationThickness: 100, // mm
  insulationKValue: 0.01, // W/m·K (e.g., aerogel for LNG)
  extConvectionCoeff: 10,  // W/m²·K (for moderate wind)
  emissivity: 0.9,        // common for painted/oxidized surfaces
  cooldownRateLimit: 10,  // °C/hr
  numberOfHolds: 1,       
  holdDurationHours: 2,   

  // Purge, Preservation & Margin
  purgeVolumes: 3,        // New
  preservationDurationDays: 0, // New
  preservationLeakRatePercentPerDay: 1, // New
  operationalMarginPercent: 20, // New

  // Simulation
  timeStepS: 60,          // seconds
};