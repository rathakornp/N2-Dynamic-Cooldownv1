import React from 'react';

const ContingencyGuidePage: React.FC = () => {
  
  const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-300 dark:border-slate-600 pb-2">
        {title}
      </h2>
      <div className="prose prose-slate dark:prose-invert max-w-none">
        {children}
      </div>
    </section>
  );

  const SubSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200">
            {title}
        </h3>
        {children}
    </div>
  );

  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg mx-auto"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      <div className="p-12 space-y-12">
        <div className="text-center border-b border-gray-300 dark:border-slate-600 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Contingencies & Operational Margins
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-slate-300">
                Translating Simulation Results to a Real-World Operational Plan
            </p>
        </div>

        <p className="text-lg text-gray-700 dark:text-slate-200">
            The calculated <strong>"Total N₂ Consumed"</strong> from the simulator represents a near-perfect, ideal scenario. In practice, you will always need more nitrogen. This guide explains the critical contingencies and margins you must add to create a robust, reliable operational plan.
        </p>

        <Section title="1. Process & Environmental Contingencies">
            <p>These are factors related to the environment and the initial state of the pipeline that can increase the thermal load beyond the simulation's assumptions.</p>
            <ul>
                <li><strong>Residual Moisture & Hydrocarbons:</strong> This is the single most significant variable. The simulation assumes the pipe is perfectly dry. Any residual water, ice, or liquid hydrocarbons will create a massive additional heat load. The nitrogen must first provide the latent heat to vaporize these substances before it can cool the pipe wall, dramatically increasing N₂ consumption.</li>
                <li><strong>Weather Variability:</strong> Higher ambient temperatures, direct solar gain on a sunny day, or higher wind speeds will all increase the rate of heat ingress from the environment, requiring more N₂ to overcome.</li>
                <li><strong>Inaccurate Initial Conditions:</strong> The actual average temperature of the pipeline might be warmer than the value entered, especially if parts of it were recently in the sun. This represents a higher initial thermal mass to be removed.</li>
            </ul>
        </Section>

        <Section title="2. Operational & Equipment Margins">
            <p>These are buffers to account for the inefficiencies and realities of executing a procedure in the field.</p>
             <ul>
                <li><strong>Initial Purge Inefficiency:</strong> The model assumes a perfect "plug flow." In reality, significant mixing occurs, and operations often require an extended initial purge to ensure all oxygen and moisture are removed before the main cooldown begins. This consumes N₂ that isn't directly cooling the pipe wall.</li>
                <li><strong>Vaporizer Performance Deviation:</strong> The N₂ vaporizer might not perform exactly as simulated. It could take longer to reach the final cryogenic temperature or its output could fluctuate, meaning more N₂ volume is needed to achieve the same total cooling energy.</li>
                <li><strong>Hold & Soak Periods:</strong> The operational plan may include intentional "hold" or "soak" periods to let temperatures equalize or to check for leaks. During these periods, you must still flow N₂ to combat environmental heat ingress, consuming nitrogen without making progress toward the target temperature.</li>
                <li><strong>Emergency & Unplanned Events:</strong> This is the classic "safety margin." You need a buffer to handle unforeseen events like equipment failure, instrument issues, or a process upset that requires you to pause, slow down, or extend the cooldown.</li>
            </ul>
        </Section>

        <Section title="Final Recommendation: Applying the Margin">
            <p>It is not practical to model every variable. The standard engineering practice is to apply a percentage-based margin to the final calculated value.</p>
            
            <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg text-center">
                 <code className="text-lg font-mono text-gray-800 dark:text-slate-100">
                    Final N₂ Volume = (Calculated N₂ Consumption) x (1 + Margin)
                 </code>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-bold text-lg text-green-800 dark:text-green-300">Standard Margin (15%)</h4>
                    <p className="mt-2 text-sm">Use for well-understood, clean, and dry pipelines in predictable weather. Provides a basic buffer for minor operational deviations.</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <h4 className="font-bold text-lg text-amber-800 dark:text-amber-300">Robust Margin (20-25%)</h4>
                    <p className="mt-2 text-sm"><strong>This is the most common and recommended range.</strong> It provides a solid buffer for potential residual moisture, weather variability, and minor operational holds.</p>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-lg">
                    <h4 className="font-bold text-lg text-red-800 dark:text-red-300">Conservative Margin (30%+)</h4>
                    <p className="mt-2 text-sm">Use for a first-time cooldown, a pipeline with known contamination, or in highly unpredictable weather. Ensures you can handle significant unforeseen challenges.</p>
                </div>
            </div>

            <p className="mt-6">For your final operating procedure, you should explicitly state the calculated baseline consumption from this tool and the margin you have chosen to add, justifying it based on the risk factors identified above.</p>
        </Section>
      </div>
    </div>
  );
};

export default ContingencyGuidePage;