import React from 'react';
import { CalculationResults, LngIntroductionInputs } from '../types.ts';

const formatNumber = (num: number | undefined, digits = 2) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    if (num > 0 && num < 0.001) return num.toExponential(digits);
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const MetricItem: React.FC<{ label: string; value: string; unit: string }> = ({ label, value, unit }) => (
    <div className="flex justify-between items-baseline py-2 border-b border-gray-200 dark:border-slate-700 last:border-b-0">
        <dt className="text-sm text-gray-600 dark:text-slate-300">{label}</dt>
        <dd className="text-sm font-semibold text-gray-800 dark:text-slate-100 text-right">
            {value} <span className="font-normal text-gray-500 dark:text-slate-400">{unit}</span>
        </dd>
    </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2 mb-2">{title}</h2>
        <dl className="p-4 bg-white dark:bg-slate-800 rounded-r-lg border-l-4 border-indigo-400 dark:border-indigo-500">
            {children}
        </dl>
    </div>
);


const LngCalculationBasisPanel: React.FC<{
  cooldownResults: CalculationResults;
  lngInputs: LngIntroductionInputs;
}> = ({ cooldownResults, lngInputs }) => {
    return (
        <div className="space-y-8 print-block">
            <Section title="1. Calculation Basis">
                <MetricItem label="Pipeline Internal Volume" value={formatNumber(cooldownResults.pipeVolume)} unit="m³" />
                <MetricItem label="Pipeline Length" value={formatNumber(cooldownResults.pipeLength, 0)} unit="m" />
                <MetricItem label="Pipe Initial Temperature" value={formatNumber(cooldownResults.inputs.targetTemp)} unit="°C" />
            </Section>
            <Section title="2. LNG Introduction Parameters">
                <MetricItem label="Initial Filling Rate" value={formatNumber(lngInputs.initialLngFillingRate)} unit="m³/h" />
                <MetricItem label="Max Filling Velocity" value={formatNumber(lngInputs.maxLngVelocity)} unit="m/s" />
                <MetricItem label="Filling Ramp-Up Time" value={formatNumber(lngInputs.fillingRampUpTime)} unit="hours" />
                <MetricItem label="LNG Density" value={formatNumber(lngInputs.lngDensity, 0)} unit="kg/m³" />
                <MetricItem label="Vent Backpressure" value={formatNumber(lngInputs.ventBackPressure)} unit="bara" />
            </Section>
        </div>
    );
};

export default LngCalculationBasisPanel;