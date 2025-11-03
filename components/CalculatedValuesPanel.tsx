import React from 'react';
import { CalculationResults } from '../types';

interface CalculatedValuesPanelProps {
  results: CalculationResults;
}

const formatNumber = (num: number | undefined, digits = 2) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    // Use scientific notation for very small numbers
    if (num > 0 && num < 0.001) {
        return num.toExponential(digits);
    }
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const MetricItem: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-gray-200 dark:border-slate-700">
        <dt className="text-sm text-gray-600 dark:text-slate-300">{label}</dt>
        <dd className="text-sm font-semibold text-gray-800 dark:text-slate-100">
            {value} <span className="font-normal text-gray-500 dark:text-slate-400">{unit}</span>
        </dd>
    </div>
);


const CalculatedValuesPanel: React.FC<CalculatedValuesPanelProps> = ({ results }) => {
    return (
        <div className="space-y-6">
            <div>
                <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 mb-2">Pipeline Physical Properties</h4>
                <dl className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-inner">
                    <MetricItem label="Total Pipe Mass" value={formatNumber(results.pipeMass, 1)} unit="kg" />
                    <MetricItem label="Pipe Outer Surface Area" value={formatNumber(results.pipeSurfaceArea, 1)} unit="m²" />
                    <MetricItem label="Pipeline Internal Volume" value={formatNumber(results.pipeVolume, 3)} unit="m³" />
                    <MetricItem label="Pipeline Gas Volume (Normal)" value={formatNumber(results.pipeVolumeInNm3, 1)} unit="Nm³" />
                    <MetricItem label="Pipe Steel Cross-Section" value={formatNumber(results.pipeCrossSectionArea * 10000, 1)} unit="cm²" />
                    <MetricItem label="Pipe Inner Radius" value={formatNumber(results.pipeInnerRadius, 1)} unit="mm" />
                    <MetricItem label="Pipe Outer Radius" value={formatNumber(results.pipeOuterRadius, 1)} unit="mm" />
                </dl>
            </div>
            <div>
                <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 mb-2">Thermal Properties</h4>
                <dl className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-inner">
                    <MetricItem label="Initial Pipe Specific Heat (Cp)" value={formatNumber(results.initialCp_SS304, 1)} unit="J/kg·K" />
                    <MetricItem label="Final Pipe Specific Heat (Cp)" value={formatNumber(results.finalCp_SS304, 1)} unit="J/kg·K" />
                    <MetricItem label="Pipe Wall Thermal Resistance" value={formatNumber(results.R_pipe, 3)} unit="K/W" />
                    <MetricItem label="Insulation Thermal Resistance" value={formatNumber(results.R_insulation, 3)} unit="K/W" />
                </dl>
            </div>
        </div>
    );
};

export default CalculatedValuesPanel;
