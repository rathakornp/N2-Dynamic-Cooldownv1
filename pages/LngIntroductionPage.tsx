

import React, { useState, useCallback } from 'react';
import { CalculationResults, LngIntroductionInputs, LngIntroductionResults } from '../types.ts';
import LngInputPanel from '../components/LngInputPanel.tsx';
import LngResultsPanel from '../components/LngResultsPanel.tsx';
import { runLngIntroductionSimulation } from '../services/lngIntroductionService.ts';
import { initialLngInputs } from '../lngConstants.ts';
import { PrintMode } from '../App.tsx';

interface LngIntroductionPageProps {
  cooldownResults: CalculationResults;
  theme: 'light' | 'dark';
  lngResults: LngIntroductionResults | null;
  setLngResults: (results: LngIntroductionResults | null) => void;
  onShowPrintPreview: (mode: PrintMode) => void;
}

type LngFormInputs = { [K in keyof LngIntroductionInputs]: LngIntroductionInputs[K] | '' };

const LngIntroductionPage: React.FC<LngIntroductionPageProps> = ({ cooldownResults, theme, lngResults, setLngResults, onShowPrintPreview }) => {
  const [inputs, setInputs] = useState<LngFormInputs>(initialLngInputs);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  }, []);

  const handleCalculate = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setLngResults(null);
    
    setTimeout(() => {
      try {
        const simulationResult = runLngIntroductionSimulation(inputs as LngIntroductionInputs, cooldownResults);
        if ('error' in simulationResult) {
          setError(simulationResult.error);
          setLngResults(null);
        } else {
          setLngResults(simulationResult);
          setError(null);
        }
      } catch (e) {
        if (e instanceof Error) {
            setError(`An unexpected error occurred: ${e.message}`);
        } else {
            setError('An unexpected error occurred during calculation.');
        }
        setLngResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 50);
  }, [inputs, cooldownResults, setLngResults]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="w-full lg:w-[420px] lg:flex-shrink-0">
        <LngInputPanel 
          inputs={inputs}
          onInputChange={handleInputChange}
          onCalculate={handleCalculate}
          isLoading={isLoading}
          cooldownResults={cooldownResults}
        />
      </div>
      <div className="flex-grow w-full">
          <div 
              className="bg-white dark:bg-slate-800 rounded-lg shadow-lg mx-auto"
              style={{ width: '210mm' }}
          >
              <LngResultsPanel
                  results={lngResults}
                  isLoading={isLoading}
                  error={error}
                  theme={theme}
                  cooldownResults={cooldownResults}
                  lngInputs={lngResults ? lngResults.inputs : null}
                  onShowPrintPreview={onShowPrintPreview}
              />
          </div>
      </div>
    </div>
  );
};

export default LngIntroductionPage;