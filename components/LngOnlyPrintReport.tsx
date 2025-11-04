import React from 'react';
import { LngIntroductionResults } from '../types.ts';
import LngPrintResults from './LngPrintResults.tsx';

interface LngOnlyPrintReportProps {
  results: LngIntroductionResults;
}

const LngOnlyPrintReport: React.FC<LngOnlyPrintReportProps> = ({ results }) => {
  return (
    <div className="p-10">
      <div className="text-center mb-6 print-block">
        <h1 className="text-3xl font-bold">LNG Introduction Simulation Results</h1>
        <p className="text-md text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
      </div>
      <LngPrintResults results={results} theme="light" />
    </div>
  );
};

export default LngOnlyPrintReport;