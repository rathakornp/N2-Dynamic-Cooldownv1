import React from 'react';
import { CalculationResults } from '../types';
import CalculatedValuesPanel from '../components/CalculatedValuesPanel';
import CalculationBasisPanel from '../components/CalculationBasisPanel';
import ReferenceEquationsPanel from '../components/ReferenceEquationsPanel';
import N2ConsumptionBreakdownPanel from '../components/N2ConsumptionBreakdownPanel';

interface DetailedResultsPageProps {
  results: CalculationResults;
}

const DetailedResultsPage: React.FC<DetailedResultsPageProps> = ({ results }) => {

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg mx-auto detailed-results-page"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      <div className="p-12 space-y-12">
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-slate-700 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            Detailed Calculation Output
          </h2>
        </div>

        <CalculationBasisPanel inputs={results.inputs} />
        <N2ConsumptionBreakdownPanel results={results} />
        <ReferenceEquationsPanel />

        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-4">
              Calculated Properties
            </h2>
            <div className="mt-8">
               <CalculatedValuesPanel results={results} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedResultsPage;