import React from 'react';
import { CalculationResults } from '../types.ts';

interface N2ConsumptionBreakdownPanelProps {
  results: CalculationResults;
}

const formatNumber = (num: number | undefined, digits = 0) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const MetricRow: React.FC<{ label: string; value: string; unit: string; isSubTotal?: boolean; isGrandTotal?: boolean; }> = ({ label, value, unit, isSubTotal = false, isGrandTotal = false }) => (
    <div className={`flex justify-between items-center py-2 ${isSubTotal ? 'border-t-2 border-gray-300 dark:border-slate-600 mt-2 pt-2' : 'border-b border-gray-200 dark:border-slate-700'} ${isGrandTotal ? 'py-3 bg-indigo-50 dark:bg-indigo-900/40 px-4 -mx-4 rounded-lg' : ''}`}>
        <dt className={`text-sm ${isSubTotal || isGrandTotal ? 'font-bold' : ''} ${isGrandTotal ? 'text-indigo-800 dark:text-indigo-200' : 'text-gray-600 dark:text-slate-300'}`}>{label}</dt>
        <dd className={`text-sm font-semibold ${isGrandTotal ? 'text-xl text-indigo-700 dark:text-indigo-200' : 'text-gray-800 dark:text-slate-100'}`}>
            {value} <span className={`font-normal ${isGrandTotal ? 'text-base' : ''} text-gray-500 dark:text-slate-400`}>{unit}</span>
        </dd>
    </div>
);

const N2ConsumptionBreakdownPanel: React.FC<N2ConsumptionBreakdownPanelProps> = ({ results }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-4">
                N₂ Consumption Analysis
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                 <dl className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-inner">
                    <MetricRow label="N₂ for Purge" value={formatNumber(results.n2ForPurgeNm3)} unit="Nm³" />
                    <MetricRow label="N₂ for Cooldown" value={formatNumber(results.n2ForCooldownNm3)} unit="Nm³" />
                    <MetricRow label="N₂ for Hold Periods" value={formatNumber(results.n2ForHoldsNm3)} unit="Nm³" />
                    <MetricRow label="N₂ for Preservation" value={formatNumber(results.n2ForPreservationNm3)} unit="Nm³" />
                    <MetricRow label="Sub-Total N₂" value={formatNumber(results.subTotalN2Nm3)} unit="Nm³" isSubTotal/>
                </dl>
                <dl className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg shadow-inner">
                    <MetricRow label="Sub-Total N₂" value={formatNumber(results.subTotalN2Nm3)} unit="Nm³" />
                    <MetricRow label={`Operational Margin (${results.inputs.operationalMarginPercent}%)`} value={formatNumber(results.operationalMarginNm3)} unit="Nm³" />
                    <MetricRow label="Grand Total N₂ Consumption" value={formatNumber(results.grandTotalN2Nm3)} unit="Nm³" isGrandTotal/>
                    <MetricRow label="Grand Total N₂ Mass" value={formatNumber(results.totalN2Kg)} unit="kg" />
                </dl>
            </div>
        </div>
    );
};

export default N2ConsumptionBreakdownPanel;