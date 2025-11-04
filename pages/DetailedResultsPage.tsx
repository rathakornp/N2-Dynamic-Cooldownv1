import React from 'react';
import { CalculationResults } from '../types.ts';
import CalculationBasisPanel from '../components/CalculationBasisPanel.tsx';
import N2ConsumptionBreakdownPanel from '../components/N2ConsumptionBreakdownPanel.tsx';
import CalculatedValuesPanel from '../components/CalculatedValuesPanel.tsx';
import ReferenceEquationsPanel from '../components/ReferenceEquationsPanel.tsx';

interface DetailedResultsPageProps {
  results: CalculationResults;
}

const DetailedResultsPage: React.FC<DetailedResultsPageProps> = ({ results }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg mx-auto p-8 space-y-12"
         style={{ width: '210mm' }}>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Detailed Calculation Output</h1>
          <p className="text-md text-gray-600 dark:text-slate-300">A comprehensive breakdown of all inputs, outputs, and models.</p>
        </div>

        <CalculationBasisPanel inputs={results.inputs} />

        <div className="pt-4">
             <N2ConsumptionBreakdownPanel results={results} />
        </div>
       
        <div className="pt-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-4">
                Calculated Properties
            </h2>
            <div className="mt-6">
                 <CalculatedValuesPanel results={results} />
            </div>
        </div>

        <div className="pt-4">
             <ReferenceEquationsPanel />
        </div>
    </div>
  );
};

export default DetailedResultsPage;