// Fix: Corrected import path for types.
import { LngIntroductionInputs } from './types.ts';

export const initialLngInputs: LngIntroductionInputs = {
  initialLngFillingRate: 5,      // m³/h
  maxLngVelocity: 0.1,           // m/s
  fillingRampUpTime: 1,          // hours
  lngDensity: 450,               // kg/m³ (average for LNG)
  ventBackPressure: 1.1,         // bara (slightly above atmospheric)
  lngTemperature: -162,          // °C
};