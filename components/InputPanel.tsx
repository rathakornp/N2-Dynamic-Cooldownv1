import React, { useState } from 'react';
import { CalculationInputs } from '../types.ts';

// Fix: Define a type for form inputs that allows empty strings, to match the props from App.tsx.
type FormInputs = { [K in keyof CalculationInputs]: CalculationInputs[K] | '' };

interface InputPanelProps {
  // Fix: Update the 'inputs' prop to accept the FormInputs type.
  inputs: FormInputs;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
  isLoading: boolean;
  errors: Record<string, string>;
}

const StyledInput: React.FC<{
    label: string;
    name: keyof CalculationInputs;
    value: number | '';
    unit: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    step?: string;
    error?: string;
}> = ({ label, name, value, unit, onChange, step = "any", error }) => {
    const baseClasses = "block w-full pr-12 sm:text-sm rounded-md dark:bg-slate-700 dark:placeholder-gray-400 dark:text-white";
    const normalClasses = "border-gray-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-500 dark:focus:border-indigo-500";
    const errorClasses = "border-red-500 dark:border-red-400 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500";

    return (
        <div>
            {/* Fix: Cast `name` prop to string for DOM attributes to resolve type errors. */}
            <label htmlFor={name as string} className="block text-sm font-medium text-gray-700 dark:text-slate-200">{label}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <input
                    type="number"
                    name={name as string}
                    id={name as string}
                    value={value}
                    onChange={onChange}
                    step={step}
                    className={`${baseClasses} ${error ? errorClasses : normalClasses}`}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name as string}-error` : undefined}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-slate-300 sm:text-sm">{unit}</span>
                </div>
            </div>
            {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400" id={`${name as string}-error`}>{error}</p>}
        </div>
    );
};

const InputPanel: React.FC<InputPanelProps> = ({ inputs, onInputChange, onCalculate, isLoading, errors }) => {
  const hasErrors = Object.keys(errors).length > 0;
  const [isAdvancedVisible, setIsAdvancedVisible] = useState(false);
  
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg space-y-8">
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">Pipeline Properties</legend>
        <StyledInput label="Length" name="pipeLength" value={inputs.pipeLength} unit="m" onChange={onInputChange} error={errors.pipeLength} />
        <StyledInput label="Outer Diameter (OD)" name="pipeOD" value={inputs.pipeOD} unit="mm" onChange={onInputChange} error={errors.pipeOD} />
        <StyledInput label="Wall Thickness (WT)" name="pipeWT" value={inputs.pipeWT} unit="mm" onChange={onInputChange} error={errors.pipeWT} />
        <StyledInput label="Pipe Roughness" name="pipeRoughness" value={inputs.pipeRoughness} unit="mm" onChange={onInputChange} error={errors.pipeRoughness} step="0.001" />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">Process Conditions</legend>
        <StyledInput label="Initial Temperature" name="initialTemp" value={inputs.initialTemp} unit="°C" onChange={onInputChange} error={errors.initialTemp} />
        <StyledInput label="Target Temperature" name="targetTemp" value={inputs.targetTemp} unit="°C" onChange={onInputChange} error={errors.targetTemp} />
        <StyledInput label="Ambient Temperature" name="ambientTemp" value={inputs.ambientTemp} unit="°C" onChange={onInputChange} error={errors.ambientTemp} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">N₂ Vaporizer & Control Strategy</legend>
        <div className="pt-2 space-y-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 -mb-2">N₂ Inlet Temperature Profile (Step & Hold)</h4>
             <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-slate-600">
                <StyledInput label="Initial N₂ Inlet Temperature" name="initialN2InletTemp" value={inputs.initialN2InletTemp} unit="°C" onChange={onInputChange} error={errors.initialN2InletTemp} />
                <StyledInput label="Final N₂ Inlet Temperature" name="finalN2InletTemp" value={inputs.finalN2InletTemp} unit="°C" onChange={onInputChange} error={errors.finalN2InletTemp} />
                <StyledInput label="Temp Step Size" name="n2TempStepSizeC" value={inputs.n2TempStepSizeC} unit="°C" onChange={onInputChange} error={errors.n2TempStepSizeC} />
                <StyledInput label="Temp Hold Duration" name="n2TempHoldDurationHours" value={inputs.n2TempHoldDurationHours} unit="hours" onChange={onInputChange} error={errors.n2TempHoldDurationHours} />
            </div>
        </div>

        <div className="pt-4 space-y-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 -mb-2">N₂ Flow Profile (Two-Stage Linear Ramp)</h4>
            <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-slate-600">
                <StyledInput label="Initial N₂ Flow" name="initialN2Flow" value={inputs.initialN2Flow} unit="Nm³/h" onChange={onInputChange} error={errors.initialN2Flow} />
                <StyledInput label="Intermediate N₂ Flow" name="intermediateN2Flow" value={inputs.intermediateN2Flow} unit="Nm³/h" onChange={onInputChange} error={errors.intermediateN2Flow} />
                <StyledInput label="Max N₂ Flow" name="maxN2Flow" value={inputs.maxN2Flow} unit="Nm³/h" onChange={onInputChange} error={errors.maxN2Flow} />
                <StyledInput label="Intermediate Flow Ramp Time" name="flowRampIntermediateTimeHours" value={inputs.flowRampIntermediateTimeHours} unit="hours" onChange={onInputChange} error={errors.flowRampIntermediateTimeHours} />
                <StyledInput label="End Flow Ramp Time" name="flowRampTotalTimeHours" value={inputs.flowRampTotalTimeHours} unit="hours" onChange={onInputChange} error={errors.flowRampTotalTimeHours} />
            </div>
        </div>
      </fieldset>
      
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">Constraints & Margin</legend>
        <StyledInput label="Cooldown Rate Limit" name="cooldownRateLimit" value={inputs.cooldownRateLimit} unit="°C/hr" onChange={onInputChange} error={errors.cooldownRateLimit} />
         <StyledInput label="Operational Margin" name="operationalMarginPercent" value={inputs.operationalMarginPercent} unit="%" onChange={onInputChange} error={errors.operationalMarginPercent} />
      </fieldset>

      <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
        <button
          onClick={() => setIsAdvancedVisible(!isAdvancedVisible)}
          className="w-full text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center justify-center gap-2"
        >
          {isAdvancedVisible ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
              Hide Advanced Settings
            </>
          ) : (
             <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
              Show Advanced Settings
            </>
          )}
        </button>
      </div>

      {isAdvancedVisible && (
        <div className="space-y-8 border-t border-gray-200 dark:border-slate-700 pt-6">
           <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">Advanced Heat Transfer</legend>
              <StyledInput label="Insulation Thickness" name="insulationThickness" value={inputs.insulationThickness} unit="mm" onChange={onInputChange} error={errors.insulationThickness} />
              <StyledInput label="Insulation k-value" name="insulationKValue" value={inputs.insulationKValue} unit="W/m·K" onChange={onInputChange} error={errors.insulationKValue} step="0.001" />
              <StyledInput label="External Convection Coeff." name="extConvectionCoeff" value={inputs.extConvectionCoeff} unit="W/m²·K" onChange={onInputChange} error={errors.extConvectionCoeff} />
              <StyledInput label="Emissivity" name="emissivity" value={inputs.emissivity} unit="" onChange={onInputChange} error={errors.emissivity} step="0.01" />
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">Advanced Operational Plan</legend>
              <div className="pt-2 space-y-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 -mb-2">Hold or Soak</h4>
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-slate-600">
                    <StyledInput label="Number of Hold Periods" name="numberOfHolds" value={inputs.numberOfHolds} unit="" onChange={onInputChange} error={errors.numberOfHolds} step="1" />
                    <StyledInput label="Duration of Each Hold" name="holdDurationHours" value={inputs.holdDurationHours} unit="hours" onChange={onInputChange} error={errors.holdDurationHours} />
                  </div>
              </div>
               <div className="pt-4 space-y-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 -mb-2">Purge</h4>
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-slate-600">
                    <StyledInput label="Number of Purge Volumes" name="purgeVolumes" value={inputs.purgeVolumes} unit="volumes" onChange={onInputChange} error={errors.purgeVolumes} />
                  </div>
              </div>
              <div className="pt-4 space-y-4">
                  <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 -mb-2">Preservation</h4>
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-slate-600">
                    <StyledInput label="Preservation Duration" name="preservationDurationDays" value={inputs.preservationDurationDays} unit="days" onChange={onInputChange} error={errors.preservationDurationDays} />
                    <StyledInput label="Preservation Leak Rate" name="preservationLeakRatePercentPerDay" value={inputs.preservationLeakRatePercentPerDay} unit="%/day" onChange={onInputChange} error={errors.preservationLeakRatePercentPerDay} />
                  </div>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">Advanced Simulation Parameters</legend>
              <StyledInput label="Time Step" name="timeStepS" value={inputs.timeStepS} unit="seconds" onChange={onInputChange} error={errors.timeStepS} />
            </fieldset>
        </div>
      )}
      
      <button
        onClick={onCalculate}
        disabled={isLoading || hasErrors}
        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-slate-800"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculating...
          </>
        ) : (
          hasErrors ? "Fix Errors to Calculate" : "Calculate Cooldown"
        )}
      </button>
    </div>
  );
};

export default InputPanel;