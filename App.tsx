import React, { useState, useCallback, useEffect } from 'react';
import { CalculationInputs, CalculationResults } from './types';
import { runCooldownSimulation } from './services/calculationService';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import { initialInputs } from './constants';
import ThemeToggle from './components/ThemeToggle';
import NavBar from './components/NavBar';
import DetailedResultsPage from './pages/DetailedResultsPage';
import PrintButton from './components/PrintButton';
import PrintReport from './components/PrintReport';
import FeatureOverviewPage from './pages/FeatureOverviewPage';
import OperatingGuidePage from './pages/OperatingGuidePage';
import ContingencyGuidePage from './pages/ContingencyGuidePage';

// Fix: Create a new type to represent form state, allowing empty strings for inputs.
type FormInputs = { [K in keyof CalculationInputs]: CalculationInputs[K] | '' };

const validateInputs = (currentInputs: FormInputs): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    // Check for non-numeric or empty
    for (const key in currentInputs) {
        // Fix: The type of currentInputs now correctly reflects that values can be `''`, so this comparison is valid.
        if (currentInputs[key as keyof CalculationInputs] === '' || isNaN(Number(currentInputs[key as keyof CalculationInputs]))) {
            newErrors[key] = 'Must be a valid number.';
        }
    }
    // Don't run further checks if basic type is wrong for any field
    if (Object.keys(newErrors).length > 0) return newErrors;

    // Fix: After validation, we can safely cast to CalculationInputs. The redundant conversion loop is removed.
    const inputsAsNumbers = currentInputs as CalculationInputs;

    // Positive value checks
    const positiveChecks: (keyof CalculationInputs)[] = ['pipeLength', 'pipeOD', 'pipeWT', 'cooldownRateLimit', 'insulationThickness', 'insulationKValue', 'initialN2Flow', 'timeStepS', 'totalRampTimeHours', 'intermediateRampTimeHours'];
    positiveChecks.forEach(key => {
        if (inputsAsNumbers[key] <= 0) {
            newErrors[key] = 'Must be greater than 0.';
        }
    });
    
    const nonNegativeChecks: (keyof CalculationInputs)[] = ['maxN2Flow', 'extConvectionCoeff', 'numberOfHolds', 'holdDurationHours', 'purgeVolumes', 'preservationDurationDays', 'preservationLeakRatePercentPerDay', 'operationalMarginPercent'];
    nonNegativeChecks.forEach(key => {
        if (inputsAsNumbers[key] < 0) {
            newErrors[key] = 'Cannot be negative.';
        }
    });

    // Logical checks
    if (inputsAsNumbers.pipeWT >= inputsAsNumbers.pipeOD / 2) {
        newErrors.pipeWT = 'Must be less than half the outer diameter.';
    }
    if (inputsAsNumbers.emissivity < 0 || inputsAsNumbers.emissivity > 1) {
        newErrors.emissivity = 'Must be between 0 and 1.';
    }
    if (inputsAsNumbers.targetTemp >= inputsAsNumbers.initialTemp) {
        newErrors.targetTemp = 'Must be colder than initial temperature.';
    }
    if (inputsAsNumbers.finalN2InletTemp >= inputsAsNumbers.initialTemp) {
        newErrors.finalN2InletTemp = 'Final N₂ inlet must be colder than pipe initial temperature.';
    }
    if (inputsAsNumbers.finalN2InletTemp >= inputsAsNumbers.initialN2InletTemp) {
        newErrors.finalN2InletTemp = 'Must be colder than initial N₂ temperature.';
    }
    if (inputsAsNumbers.initialN2InletTemp >= inputsAsNumbers.initialTemp) {
        newErrors.initialN2InletTemp = "Should be at or colder than pipe's initial temperature.";
    }
    if (inputsAsNumbers.initialN2Flow > inputsAsNumbers.maxN2Flow) {
        newErrors.initialN2Flow = 'Must be less than or equal to Max N₂ Flow.';
    }
    if (inputsAsNumbers.intermediateRampTimeHours >= inputsAsNumbers.totalRampTimeHours) {
        newErrors.intermediateRampTimeHours = 'Must be less than Total Ramp Time.';
    }
    if (inputsAsNumbers.intermediateN2Flow < inputsAsNumbers.initialN2Flow) {
        newErrors.intermediateN2Flow = 'Must be >= Initial Flow.';
    }
    if (inputsAsNumbers.intermediateN2Flow > inputsAsNumbers.maxN2Flow) {
        newErrors.intermediateN2Flow = 'Must be <= Max Flow.';
    }


    return newErrors;
};

const getInitialTheme = (): 'light' | 'dark' => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    return storedTheme;
  }
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};


function App() {
  // Fix: Use the `FormInputs` type for the state to correctly handle empty input fields.
  const [inputs, setInputs] = useState<FormInputs>(initialInputs);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState<'simulation' | 'details' | 'features' | 'guide' | 'contingency'>('simulation');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Validate inputs whenever they change
  useEffect(() => {
      const validationErrors = validateInputs(inputs);
      setErrors(validationErrors);
  }, [inputs]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({
      ...prev,
      [name]: value === '' ? '' : parseFloat(value)
    }));
  }, []);

  const handleCalculate = useCallback(() => {
    if (Object.keys(errors).length > 0) {
      return; // Safeguard, button should be disabled
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    setPage('simulation'); // Reset to the main page on new calculation
    
    // Use setTimeout to allow the UI to update to the loading state
    setTimeout(() => {
      try {
        // Fix: Cast inputs to `CalculationInputs` since validation ensures all values are numbers here.
        const simulationResult = runCooldownSimulation(inputs as CalculationInputs);
        if ('error' in simulationResult) {
          setError(simulationResult.error);
          setResults(null);
        } else {
          setResults(simulationResult);
          setError(null);
        }
      } catch (e) {
        if (e instanceof Error) {
            setError(`An unexpected error occurred: ${e.message}`);
        } else {
            setError('An unexpected error occurred during calculation.');
        }
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 50); // a short delay
  }, [inputs, errors]);

  return (
    <div className="min-h-screen font-sans">
      <div className="screen-only">
        <header className="bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-700/50 sticky top-0 z-10 no-print">
          <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100">
                N2 Pipeline Cooldown Calculator
              </h1>
              <p className="text-gray-600 dark:text-slate-300 mt-1">
                A rate-controlled transient energy balance model for SS304 pipelines.
              </p>
            </div>
            <div className="flex items-center gap-2">
                <PrintButton 
                  disabled={!results}
                />
                <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>
          <NavBar 
              currentPage={page}
              setCurrentPage={setPage}
              hasResults={!!results}
          />
        </header>

        <main className="container mx-auto p-4 md:p-8">
          {page === 'simulation' && (
              <div className="flex flex-col lg:flex-row gap-8 items-start">
                  <div className="w-full lg:w-[420px] lg:flex-shrink-0">
                      <InputPanel 
                      inputs={inputs} 
                      onInputChange={handleInputChange} 
                      onCalculate={handleCalculate}
                      isLoading={isLoading}
                      errors={errors}
                      />
                  </div>
                  <div className="flex-grow w-full">
                     <div 
                      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg mx-auto"
                      style={{ width: '210mm' }}
                    >
                      <ResultsPanel 
                        results={results} 
                        isLoading={isLoading} 
                        error={error} 
                        theme={theme}
                      />
                    </div>
                  </div>
              </div>
          )}
          {page === 'details' && results && (
              <DetailedResultsPage results={results} />
          )}
          {page === 'features' && (
              <FeatureOverviewPage />
          )}
           {page === 'guide' && (
              <OperatingGuidePage />
          )}
          {page === 'contingency' && (
              <ContingencyGuidePage />
          )}
        </main>

        <footer className="text-center py-4 mt-8 text-gray-500 dark:text-slate-400 text-sm no-print">
          <p>&copy; {new Date().getFullYear()} Thai Nippon Steel Engineering and Construction Company Limited. All rights reserved.</p>
        </footer>
      </div>

      {results && (
        <div id="print-report-container" className="print-only">
          <PrintReport results={results} />
        </div>
      )}
    </div>
  );
}

export default App;