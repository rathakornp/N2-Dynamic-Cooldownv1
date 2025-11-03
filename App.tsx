import React, { useState, useCallback, useEffect } from 'react';
import { CalculationInputs, CalculationResults } from './types';
import { runCooldownSimulation } from './services/calculationService';
import InputPanel from './components/InputPanel';
import ResultsPanel from './components/ResultsPanel';
import { initialInputs } from './constants';
import ThemeToggle from './components/ThemeToggle';

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
    const positiveChecks: (keyof CalculationInputs)[] = ['pipeLength', 'pipeOD', 'pipeWT', 'cooldownRateLimit', 'insulationThickness', 'insulationKValue', 'initialN2Flow', 'timeStepS', 'n2TempRampDownHours'];
    positiveChecks.forEach(key => {
        if (inputsAsNumbers[key] <= 0) {
            newErrors[key] = 'Must be greater than 0.';
        }
    });
    
    if (inputsAsNumbers.maxN2Flow < 0) {
        newErrors.maxN2Flow = 'Cannot be negative.';
    }
    if (inputsAsNumbers.extConvectionCoeff < 0) {
        newErrors.extConvectionCoeff = 'Cannot be negative.';
    }

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

    return newErrors;
};


function App() {
  // Fix: Use the `FormInputs` type for the state to correctly handle empty input fields.
  const [inputs, setInputs] = useState<FormInputs>(initialInputs);
  const [results, setResults] = useState<CalculationResults | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') as 'light' | 'dark' || 'light'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark';
    root.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Set initial theme based on system preference if not in localStorage
  useEffect(() => {
      const storedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (!storedTheme && systemPrefersDark) {
          setTheme('dark');
      } else if (storedTheme) {
          setTheme(storedTheme as 'light' | 'dark');
      }
  }, []);

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-sans">
      <header className="bg-white dark:bg-slate-800 shadow-md dark:shadow-slate-700/50">
        <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-slate-100">
              N2 Pipeline Cooldown Calculator
            </h1>
            <p className="text-gray-600 dark:text-slate-300 mt-1">
              A rate-controlled transient energy balance model for SS304 pipelines.
            </p>
          </div>
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <InputPanel 
              inputs={inputs} 
              onInputChange={handleInputChange} 
              onCalculate={handleCalculate}
              isLoading={isLoading}
              errors={errors}
            />
          </div>
          <div className="lg:col-span-2">
            <ResultsPanel 
              results={results} 
              isLoading={isLoading} 
              error={error} 
              theme={theme}
            />
          </div>
        </div>
      </main>

      <footer className="text-center py-4 mt-8 text-gray-500 dark:text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} N2 Pipeline Cooldown Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
