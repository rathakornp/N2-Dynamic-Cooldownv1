import React from 'react';
import { CalculationResults } from '../types';
import ResultsPanel from './ResultsPanel';
import CalculationBasisPanel from './CalculationBasisPanel';
import ReferenceEquationsPanel from './ReferenceEquationsPanel';
import CalculatedValuesPanel from './CalculatedValuesPanel';

interface PrintReportProps {
  results: CalculationResults;
}

const PrintSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <fieldset className="border-t border-gray-300 pt-4">
        <legend className="text-2xl font-bold text-gray-800 px-2">
            {title}
        </legend>
        <div className="mt-6">
            {children}
        </div>
    </fieldset>
);


const PrintReport: React.FC<PrintReportProps> = ({ results }) => {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold">N₂ Pipeline Cooldown Simulation Report</h1>
        <p className="text-md text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
      </div>
      
      <ResultsPanel results={results} theme="light" isLoading={false} error={null} />
      
      <PrintSection title="Detailed Calculation Output">
        <div className="space-y-10">
          <CalculationBasisPanel inputs={results.inputs} />
          <ReferenceEquationsPanel />
          <div>
              <h3 className="text-xl font-bold text-gray-800 border-b border-gray-300 pb-3 mb-6">
                Calculated Properties
              </h3>
              <CalculatedValuesPanel results={results} />
          </div>
        </div>
      </PrintSection>
    </div>
  );
};

export default PrintReport;