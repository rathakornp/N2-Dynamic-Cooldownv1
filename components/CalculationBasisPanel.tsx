import React from 'react';
import { CalculationInputs } from '../types.ts';

interface CalculationBasisPanelProps {
  inputs: CalculationInputs;
}

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
        <h4 className="text-md font-medium text-gray-800 dark:text-slate-200 mb-2">{title}</h4>
        <dl className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-inner">
            {children}
        </dl>
    </div>
);


const CalculationBasisPanel: React.FC<CalculationBasisPanelProps> = ({ inputs }) => {
    return (
        <div className="space-y-8">
             <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-4">
                Calculation Basis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <Section title="User Inputs: Pipeline">
                        <MetricItem label="Length" value={formatNumber(inputs.pipeLength)} unit="m" />
                        <MetricItem label="Outer Diameter (OD)" value={formatNumber(inputs.pipeOD)} unit="mm" />
                        <MetricItem label="Wall Thickness (WT)" value={formatNumber(inputs.pipeWT)} unit="mm" />
                        <MetricItem label="Pipe Roughness" value={formatNumber(inputs.pipeRoughness, 3)} unit="mm" />
                    </Section>

                    <Section title="User Inputs: Process Conditions">
                        <MetricItem label="Initial Temperature" value={formatNumber(inputs.initialTemp)} unit="°C" />
                        <MetricItem label="Target Temperature" value={formatNumber(inputs.targetTemp)} unit="°C" />
                        <MetricItem label="Ambient Temperature" value={formatNumber(inputs.ambientTemp)} unit="°C" />
                    </Section>
                    
                     <Section title="User Inputs: N₂ Vaporizer & Ramps">
                        <MetricItem label="Initial N₂ Inlet Temp" value={formatNumber(inputs.initialN2InletTemp)} unit="°C" />
                        <MetricItem label="Final N₂ Inlet Temp" value={formatNumber(inputs.finalN2InletTemp)} unit="°C" />
                        <MetricItem label="Initial N₂ Flow" value={formatNumber(inputs.initialN2Flow)} unit="Nm³/h" />
                        <MetricItem label="Intermediate N₂ Flow" value={formatNumber(inputs.intermediateN2Flow)} unit="Nm³/h" />
                        <MetricItem label="Max N₂ Flow" value={formatNumber(inputs.maxN2Flow)} unit="Nm³/h" />
                        <MetricItem label="Intermediate Ramp Time" value={formatNumber(inputs.intermediateRampTimeHours)} unit="hours" />
                        <MetricItem label="End Ramp Time" value={formatNumber(inputs.totalRampTimeHours)} unit="hours" />
                    </Section>

                    <Section title="User Inputs: Heat Transfer & Constraints">
                        <MetricItem label="Insulation Thickness" value={formatNumber(inputs.insulationThickness)} unit="mm" />
                        <MetricItem label="Insulation k-value" value={formatNumber(inputs.insulationKValue, 3)} unit="W/m·K" />
                        <MetricItem label="External Convection Coeff." value={formatNumber(inputs.extConvectionCoeff)} unit="W/m²·K" />
                        <MetricItem label="Emissivity" value={formatNumber(inputs.emissivity)} unit="" />
                        <MetricItem label="Cooldown Rate Limit" value={formatNumber(inputs.cooldownRateLimit)} unit="°C/hr" />
                        <MetricItem label="Simulation Time Step" value={formatNumber(inputs.timeStepS)} unit="seconds" />
                    </Section>
                </div>

                <div className="space-y-6">
                    <Section title="User Inputs: Operational Plan">
                        <MetricItem label="Number of Purge Volumes" value={formatNumber(inputs.purgeVolumes)} unit="volumes" />
                        <MetricItem label="Number of Hold Periods" value={formatNumber(inputs.numberOfHolds)} unit="" />
                        <MetricItem label="Duration of Each Hold" value={formatNumber(inputs.holdDurationHours)} unit="hours" />
                        <MetricItem label="Preservation Duration" value={formatNumber(inputs.preservationDurationDays)} unit="days" />
                        <MetricItem label="Preservation Leak Rate" value={formatNumber(inputs.preservationLeakRatePercentPerDay)} unit="%/day" />
                        <MetricItem label="Operational Margin" value={formatNumber(inputs.operationalMarginPercent)} unit="%" />
                    </Section>

                     <Section title="Physical Constants">
                        <MetricItem label="SS304 Density (ρ)" value="8000" unit="kg/m³" />
                        <MetricItem label="Stefan-Boltzmann (σ)" value="5.67e-8" unit="W/(m²·K⁴)" />
                        <MetricItem label="N₂ Normal Density (ρ)" value="1.251" unit="kg/Nm³" />
                        <MetricItem label="N₂ Molar Mass (M)" value="0.028" unit="kg/mol" />
                        <MetricItem label="Ideal Gas Constant (R)" value="8.314" unit="J/(mol·K)" />
                        <MetricItem label="Atmospheric Pressure" value="1.01325" unit="bar" />
                    </Section>
                </div>
            </div>
        </div>
    );
};

export default CalculationBasisPanel;