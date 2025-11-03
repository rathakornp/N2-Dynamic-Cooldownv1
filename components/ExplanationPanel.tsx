import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from '@google/ai/generative-ai';
import { CalculationResults } from '../types';

interface ExplanationPanelProps {
  results: CalculationResults;
  theme: 'light' | 'dark';
}

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ results, theme }) => {
  const [explanation, setExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateExplanation = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setExplanation('');

    const prompt = `
      Act as an expert process engineer analyzing a pipeline cooldown simulation.
      The model is a 1D segmented simulation showing temperature profiles along the pipe at hourly intervals.
      Based on the following summary, provide a concise, easy-to-understand explanation of the cooldown process.
      
      1.  **Overall Dynamics & Control Strategy**: Start with the big picture. The cooldown took ${results.totalTimeHours.toFixed(2)} hours and consumed ${results.totalN2Nm3.toFixed(0)} Nm³ of nitrogen. Crucially, this was a highly controlled process. The simulation models a realistic operator strategy where the N₂ inlet temperature was gradually ramped down from an initial ${results.initialN2InletTemp}°C to a final ${results.finalN2InletTemp}°C over ${results.n2TempRampDownHours} hours. Explain that this, combined with controlling the flow rate to respect a ${results.cooldownRateLimit}°C/hr limit, ensures a safe, shock-free cooldown.

      2.  **Initial Cooldown & The Mixing Zone (Hours 1-${results.n2TempRampDownHours})**: This is the most critical phase. Explain that the gentle temperature drop at the pipe inlet during these first hours is a direct result of the N₂ temperature ramp-down. Simultaneously, a "thermal front" forms where the incoming cold N₂ mixes with the resident warm gas (${results.pipeVolumeInNm3.toFixed(1)} Nm³), which must be displaced. Explain how this mixing and the gentle temperature ramp create the smooth, realistic temperature profiles seen in the first few hours.

      3.  **Temperature Profile Evolution (The "Cold Wave")**: After the initial phase, describe how this thermal front, or "wave of cold," progresses down the pipeline in the hourly snapshots. Explain why the inlet is always coldest and the outlet is warmest. This is the core of the 1D model: as the nitrogen flows, it absorbs heat from the pipe wall and warms up, making it progressively less effective at cooling the pipe further downstream. This creates the characteristic temperature gradient seen in the chart.

      4.  **Inlet Pressure**: The model calculates the required pipeline INLET pressure based on the N₂ flow rate and friction losses, assuming the outlet vents to the atmosphere. Explain why this pressure fluctuates (it should correlate with the N₂ flow rate chart needed to maintain the cooldown rate and push the gas through the increasingly dense, cold pipe).

      Keep the entire analysis to 3-4 clear paragraphs.

      Key Simulation Results:
      - Total Cooldown Time: ${results.totalTimeHours.toFixed(2)} hours
      - Total Nitrogen Consumed: ${results.totalN2Nm3.toFixed(0)} Nm³
      - Final Inlet Temperature: ${results.temperatureProfile[0]?.temperature.toFixed(1)} °C
      - Final Outlet Temperature: ${results.temperatureProfile[results.temperatureProfile.length - 1]?.temperature.toFixed(1)} °C
      - Peak Cooldown Rate (at outlet): ${results.peakCooldownRate.toFixed(1)} °C/hr
      - Total Heat Removed by N₂: ${results.totalHeatRemovedMJ.toFixed(1)} MJ
      - Total Heat Ingress from Environment: ${results.totalHeatIngressMJ.toFixed(1)} MJ
    `;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setExplanation(response.text);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to generate explanation: ${e.message}`);
      } else {
        setError('An unknown error occurred while contacting the AI service.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [results]);
  
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2">
        AI-Powered Analysis
      </h2>
      <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-slate-700">
        {!explanation && !isLoading && !error && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 dark:text-slate-200 text-sm">
              Get an expert analysis of these results. The AI will break down the key factors of the simulation, explaining the "why" behind the numbers.
            </p>
            <button
              onClick={generateExplanation}
              className="w-full sm:w-auto bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition-colors duration-200 flex items-center justify-center dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Explain Results
            </button>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center space-x-3">
             <svg className="animate-spin h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-700 dark:text-slate-200">Generating analysis...</span>
          </div>
        )}

        {error && (
            <div className="text-red-500 dark:text-red-400">
                <p><strong>Analysis Error:</strong> {error}</p>
            </div>
        )}

        {explanation && (
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-slate-100">
            <p style={{ whiteSpace: 'pre-wrap' }}>{explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplanationPanel;
