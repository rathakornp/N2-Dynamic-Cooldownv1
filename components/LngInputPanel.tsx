import React from 'react';
import { LngIntroductionInputs, CalculationResults } from '../types.ts';

type LngFormInputs = { [K in keyof LngIntroductionInputs]: LngIntroductionInputs[K] | '' };

interface LngInputPanelProps {
  inputs: LngFormInputs;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCalculate: () => void;
  isLoading: boolean;
  cooldownResults: CalculationResults;
}

const StyledInput: React.FC<{
    label: string;
    name: keyof LngIntroductionInputs;
    value: number | '';
    unit: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    step?: string;
}> = ({ label, name, value, unit, onChange, step = "any" }) => (
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
                className="block w-full pr-16 sm:text-sm rounded-md dark:bg-slate-700 dark:placeholder-gray-400 dark:text-white border-gray-300 dark:border-slate-600 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-slate-300 sm:text-sm">{unit}</span>
            </div>
        </div>
    </div>
);

const InfoItem: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-gray-200 dark:border-slate-700">
        <dt className="text-sm text-gray-600 dark:text-slate-300">{label}</dt>
        <dd className="text-sm font-semibold text-gray-800 dark:text-slate-100">
            {value} <span className="font-normal text-gray-500 dark:text-slate-400">{unit}</span>
        </dd>
    </div>
);

const formatNumber = (num: number, digits = 2) => num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });

const LngInputPanel: React.FC<LngInputPanelProps> = ({ inputs, onInputChange, onCalculate, isLoading, cooldownResults }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg space-y-8">
        <fieldset className="space-y-2">
          <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">Calculation Basis (from Cooldown)</legend>
          <dl className="p-2">
              <InfoItem label="Pipeline Internal Volume" value={formatNumber(cooldownResults.pipeVolume)} unit="m³" />
              <InfoItem label="Pipeline Length" value={formatNumber(cooldownResults.pipeLength, 0)} unit="m" />
              <InfoItem label="Final Cooldown Temp" value={formatNumber(cooldownResults.inputs.targetTemp)} unit="°C" />
          </dl>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 w-full">LNG Introduction Parameters</legend>
          <StyledInput label="Initial Filling Rate" name="initialLngFillingRate" value={inputs.initialLngFillingRate} unit="m³/h" onChange={onInputChange} />
          <StyledInput label="Max Filling Velocity" name="maxLngVelocity" value={inputs.maxLngVelocity} unit="m/s" onChange={onInputChange} step="0.01" />
          <StyledInput label="Filling Ramp-Up Time" name="fillingRampUpTime" value={inputs.fillingRampUpTime} unit="hours" onChange={onInputChange} />
          <StyledInput label="LNG Temperature" name="lngTemperature" value={inputs.lngTemperature} unit="°C" onChange={onInputChange} />
          <StyledInput label="LNG Density" name="lngDensity" value={inputs.lngDensity} unit="kg/m³" onChange={onInputChange} />
          <StyledInput label="Vent System Backpressure" name="ventBackPressure" value={inputs.ventBackPressure} unit="bara" onChange={onInputChange} />
        </fieldset>
        
        <button
          onClick={onCalculate}
          disabled={isLoading}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-slate-800"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating...
            </>
          ) : (
            "Calculate LNG Filling"
          )}
        </button>
    </div>
  );
};

export default LngInputPanel;