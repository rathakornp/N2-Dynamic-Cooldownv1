import React from 'react';
import { CalculationResults } from '../types.ts';
import CalculationBasisPanel from './CalculationBasisPanel.tsx';
import CalculatedValuesPanel from './CalculatedValuesPanel.tsx';
import ReferenceEquationsPanel from './ReferenceEquationsPanel.tsx';
import N2ConsumptionBreakdownPanel from './N2ConsumptionBreakdownPanel.tsx';

interface DetailedResultsPrintProps {
  results: CalculationResults;
}

const DetailedResultsPrint: React.FC<DetailedResultsPrintProps> = ({ results }) => {
  return (
    <div className="space-y-12">
      <div className="print-page-break print-block">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-8">Detailed Calculation Output</h1>
        <CalculationBasisPanel inputs={results.inputs} />
      </div>

      <div className="pt-4 print-block">
        <N2ConsumptionBreakdownPanel results={results} />
      </div>

      <div className="pt-4 print-block">
        <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-200 pb-4">
          Calculated Properties
        </h2>
        <div className="mt-6">
          <CalculatedValuesPanel results={results} />
        </div>
      </div>
      
      <ReferenceEquationsPanel />
    </div>
  );
};

export default DetailedResultsPrint;