import React from 'react';
import { CalculationResults, LngIntroductionResults } from '../types.ts';
import LngPrintResults from './LngPrintResults.tsx';
import CooldownPrintResults from './CooldownPrintResults.tsx';
import DetailedResultsPrint from './DetailedResultsPrint.tsx';

interface PrintReportProps {
  results: CalculationResults;
  lngResults: LngIntroductionResults | null;
}

const PrintReport: React.FC<PrintReportProps> = ({ results, lngResults }) => {
  return (
    <div className="p-10">
      <div className="text-center mb-8 print-block">
        <h1 className="text-3xl font-bold text-gray-900">N₂ Pipeline Cooldown Simulation Report</h1>
        <p className="text-md text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
      </div>
      
      <CooldownPrintResults results={results} theme="light" />
      
      <div className="pt-12">
        <DetailedResultsPrint results={results} />
      </div>
      
      {lngResults && (
        <div className="pt-12">
            <div className="text-center mb-8 print-block print-page-break">
                <h1 className="text-3xl font-bold text-gray-900">LNG Introduction Simulation Report</h1>
                 <p className="text-md text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
            </div>
            <LngPrintResults results={lngResults} theme="light" />
        </div>
      )}
    </div>
  );
};

export default PrintReport;
