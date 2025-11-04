import React, { useState, useCallback, useEffect } from 'react';
import { CalculationInputs, CalculationResults, LngIntroductionResults } from './types.ts';
import { runCooldownSimulation } from './services/calculationService.ts';
import InputPanel from './components/InputPanel.tsx';
import ResultsPanel from './components/ResultsPanel.tsx';
import { initialInputs } from './constants.ts';
import ThemeToggle from './components/ThemeToggle.tsx';
import NavBar from './components/NavBar.tsx';
import DetailedResultsPage from './pages/DetailedResultsPage.tsx';
import PrintButton from './components/PrintButton.tsx';
import FeatureOverviewPage from './pages/FeatureOverviewPage.tsx';
import OperatingGuidePage from './pages/OperatingGuidePage.tsx';
import ContingencyGuidePage from './pages/ContingencyGuidePage.tsx';
import LngIntroductionPage from './pages/LngIntroductionPage.tsx';
import PrintPreviewModal from './components/PrintPreviewModal.tsx';

// Fix: Create a new type to represent form state, allowing empty strings for inputs.
type FormInputs = { [K in keyof CalculationInputs]: CalculationInputs[K] | '' };

const validateInputs = (currentInputs: FormInputs): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    // Check for non-numeric or empty
    // Fix: Replaced for...in loop with Object.keys to ensure type safety for keys.
    (Object.keys(currentInputs) as Array<keyof CalculationInputs>).forEach(key => {
        if (currentInputs[key] === '' || isNaN(Number(currentInputs[key]))) {
            newErrors[key] = 'Must be a valid number.';
        }
    });
    
    // Don't run further checks if basic type is wrong for any field
    if (Object.keys(newErrors).length > 0) return newErrors;

    // Fix: After validation, we can safely cast to CalculationInputs. The redundant conversion loop is removed.
    const inputsAsNumbers = currentInputs as CalculationInputs;

    // Positive value checks
    const positiveChecks: (keyof CalculationInputs)[] = ['pipeLength', 'pipeOD', 'pipeWT', 'cooldownRateLimit', 'insulationThickness', 'insulationKValue', 'initialN2Flow', 'timeStepS', 'flowRampTotalTimeHours', 'flowRampIntermediateTimeHours', 'n2TempStepSizeC', 'n2TempHoldDurationHours'];
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
    if (inputsAsNumbers.flowRampIntermediateTimeHours >= inputsAsNumbers.flowRampTotalTimeHours) {
        newErrors.flowRampIntermediateTimeHours = 'Must be less than Total Ramp Time.';
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

type Page = 'simulation' | 'details' | 'lng' | 'features' | 'guide' | 'contingency';
export type PrintMode = 'full' | 'lng-only';

function App() {
  // Fix: Use the `FormInputs` type for the state to correctly handle empty input fields.
  const [inputs, setInputs] = useState<FormInputs>(initialInputs);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [lngResults, setLngResults] = useState<LngIntroductionResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState(getInitialTheme);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [page, setPage] = useState<Page>('simulation');
  const [printPreviewMode, setPrintPreviewMode] = useState<PrintMode | null>(null);

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
    setLngResults(null); // Reset LNG results on new cooldown calculation
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

  const renderPage = () => {
    switch (page) {
      case 'simulation':
        return (
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
        );
      case 'details':
        return results && <DetailedResultsPage results={results} />;
      case 'lng':
        return results && <LngIntroductionPage 
          cooldownResults={results} 
          theme={theme} 
          lngResults={lngResults} 
          setLngResults={setLngResults} 
          onShowPrintPreview={setPrintPreviewMode}
        />;
      case 'features':
        return <FeatureOverviewPage />;
      case 'guide':
        return <OperatingGuidePage />;
      case 'contingency':
        return <ContingencyGuidePage />;
      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen font-sans">
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
                  onClick={() => setPrintPreviewMode('full')}
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

        <main className="container mx-auto p-4 md:p-8 no-print">
          {renderPage()}
        </main>

        <footer className="text-center py-4 mt-8 text-gray-500 dark:text-slate-400 text-sm no-print">
          <p>&copy; {new Date().getFullYear()} Thai Nippon Steel Engineering and Construction Company Limited. All rights reserved.</p>
        </footer>

      {printPreviewMode && results && (
        <PrintPreviewModal
          mode={printPreviewMode}
          results={results}
          lngResults={lngResults}
          onClose={() => setPrintPreviewMode(null)}
        />
      )}
    </div>
  );
}

export default App;