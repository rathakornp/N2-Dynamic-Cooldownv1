import React from 'react';

const Section: React.FC<{ id: string; title: string, children: React.ReactNode }> = ({ id, title, children }) => (
    <section id={id} className="space-y-4 pt-8">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-300 dark:border-slate-600 pb-2">
        {title}
      </h2>
      <div className="prose prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-slate-300">
        {children}
      </div>
    </section>
);

const StepCard: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="mt-6 p-5 bg-indigo-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-indigo-400 dark:border-indigo-500 relative">
        <div className="absolute -left-5 top-5 w-8 h-8 bg-white dark:bg-slate-800 border-2 border-indigo-500 text-indigo-500 rounded-full flex items-center justify-center font-bold text-lg ring-4 ring-white dark:ring-slate-800">
          {number}
        </div>
        <h3 className="text-xl font-semibold text-gray-800 dark:text-slate-100 ml-6">
            {title}
        </h3>
        <div className="mt-3 ml-6 text-base">
            {children}
        </div>
    </div>
);

const WarningCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/40 rounded-lg border border-amber-300 dark:border-amber-700">
        <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-6 w-6 text-amber-500 dark:text-amber-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.001-1.742 3.001H4.42c-1.532 0-2.492-1.667-1.742-3.001l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </div>
            <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-200">{title}</h4>
                <div className="mt-2 prose prose-sm max-w-none text-amber-700 dark:text-amber-300">
                    {children}
                </div>
            </div>
        </div>
    </div>
);

const SubStep: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg border dark:border-slate-700">
        <h4 className="font-semibold text-gray-800 dark:text-slate-100">{title}</h4>
        <div className="mt-2 prose prose-sm max-w-none text-gray-600 dark:text-slate-300">
            {children}
        </div>
    </div>
);

const OperatingGuidePage: React.FC = () => {
  return (
    <div 
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg mx-auto"
      style={{ width: '210mm', minHeight: '297mm' }}
    >
      <div className="p-12 space-y-12">
        <div className="text-center border-b border-gray-300 dark:border-slate-600 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Operating Guide
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-slate-300">
                A Step-by-Step Guide for Cooldown and LNG Introduction
            </p>
        </div>

        <p className="!text-lg text-gray-700 dark:text-slate-200">
            This guide provides a comprehensive workflow for using the calculator to plan a complete pipeline preparation procedure, from the initial N₂ cooldown to the final introduction of LNG.
        </p>

        <Section id="part-1" title="Part I: N₂ Cooldown Simulation">
            <StepCard number={1} title="Define Your System">
                <p>Start by accurately describing your physical system and the ambient conditions.</p>
                <ul>
                    <li><strong>Pipeline Properties:</strong> Enter the Length, Outer Diameter (OD), Wall Thickness (WT), and internal roughness of your pipeline.</li>
                    <li><strong>Process Conditions:</strong> Set the pipe's Initial Temperature, your final Target Temperature, and the surrounding Ambient Temperature.</li>
                </ul>
            </StepCard>

            <StepCard number={2} title="Configure the N₂ Cooldown Strategy">
                <p>This is the most critical part of the simulation. You will define two independent control strategies: one for the N₂ flow rate and one for the N₂ inlet temperature. This mimics a real-world, controlled injection procedure.</p>
                <SubStep title="Part A: N₂ Flow Profile (Two-Stage Linear Ramp)">
                    <ol className="list-decimal list-inside space-y-2">
                        <li><strong>Initial N₂ Flow:</strong> Set the low, starting flow rate to begin displacing resident gas without causing a rapid temperature drop.</li>
                        <li>
                            <strong>First Ramp Stage (Initial to Intermediate):</strong>
                            <ul>
                                <li>Set the <strong>Intermediate Flow Ramp Time</strong> (e.g., 4 hours).</li>
                                <li>Set the <strong>Intermediate N₂ Flow</strong> (e.g., 3000 Nm³/h).</li>
                                <li><strong>Result:</strong> The simulation will linearly increase the flow from your <em>Initial</em> rate to this <em>Intermediate</em> rate over the first 4 hours.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Second Ramp Stage (Intermediate to Maximum):</strong>
                             <ul>
                                <li>Set the <strong>End Flow Ramp Time</strong> (e.g., 8 hours). This is the total duration of the ramp-up phase.</li>
                                <li>Set the <strong>Max N₂ Flow</strong> (e.g., 5000 Nm³/h), limited by your vaporizer capacity.</li>
                                <li><strong>Result:</strong> From hour 4 to hour 8, the simulation will ramp the flow from the <em>Intermediate</em> rate (3000) to the <em>Max</em> rate (5000).</li>
                            </ul>
                        </li>
                    </ol>
                </SubStep>

                <SubStep title="Part B: N₂ Inlet Temperature Profile (Step & Hold)">
                    <p>This models a realistic, manual cooldown where an operator incrementally lowers the temperature. It is controlled by two inputs:</p>
                     <ul>
                        <li><strong>Temp Step Size (°C):</strong> The amount the temperature is lowered at each step.</li>
                        <li><strong>Temp Hold Duration (hours):</strong> How long the N₂ inlet is held at that new, lower temperature before the next step down.</li>
                     </ul>
                     <p className="mt-3 font-semibold">Example:</p>
                     <p>With an initial N₂ temp of 15°C, a step size of 30°C, and a hold duration of 1 hour, the simulation will run the following inlet temperature profile:</p>
                     <ul className="list-none mt-2 space-y-1 text-sm font-mono bg-white dark:bg-slate-800 p-2 rounded">
                         <li><strong>0-1 hr:</strong> Hold at 15°C</li>
                         <li><strong>1-2 hr:</strong> Step down to -15°C and hold</li>
                         <li><strong>2-3 hr:</strong> Step down to -45°C and hold</li>
                         <li>...and so on, until it reaches the <strong>Final N₂ Inlet Temperature</strong>.</li>
                     </ul>
                      <p className="mt-3">The <strong>Temp Hold Duration</strong> is your primary control over the cooldown's pace. A <strong>longer duration</strong> results in a slower, gentler cooldown with a lower peak rate, while a <strong>shorter duration</strong> makes it faster and more aggressive.</p>
                </SubStep>
            </StepCard>
            
            <StepCard number={3} title="Set Safety and Operational Constraints">
                <p>Define the heat transfer properties and the primary safety control for the simulation.</p>
                <ul>
                    <li><strong>Heat Transfer Properties:</strong> Enter the details of your Insulation (Thickness and k-value) and other environmental factors (Convection Coeff., Emissivity).</li>
                    <li><strong>Cooldown Rate Limit:</strong> This is your most important safety input. It defines the maximum allowable rate of temperature change (e.g., 10 °C/hr) to prevent thermal shock and material embrittlement.</li>
                </ul>
            </StepCard>

            <StepCard number={4} title="Define Full Service Scope & Margin">
                 <p>To create a complete operational plan, define all phases of the N₂ service in the <strong>"Purge, Preservation & Margin"</strong> section. This allows you to account for all nitrogen consumption from start to finish.</p>
                 <div className="space-y-4 mt-4">
                    <SubStep title="Number of Purge Volumes">
                        <p><strong>Procedure:</strong> The initial step to displace the resident gas (air/nitrogen) and ensure an inert, dry atmosphere before cooldown. Typically 3 to 5 volumes are used.</p>
                        <p className="text-xs mt-2 font-mono"><strong>Calculation Basis:</strong> <code>N₂ for Purge = (Pipeline Gas Volume [Nm³]) x (Number of Purge Volumes)</code></p>
                    </SubStep>
                    <SubStep title="Hold Periods (for Operational Pauses)">
                        <p><strong>Procedure:</strong> Planned pauses in the cooldown (e.g., for flange leak checks) where the cryogenic temperature must be maintained against environmental heat ingress.</p>
                        <p className="text-xs mt-2 font-mono"><strong>Calculation Basis:</strong> The calculator finds the "make-up" N₂ flow needed to counteract heat leak at the target temperature. <code>N₂ for Hold = (Make-up Flow Rate) x (Number of Holds) x (Duration of Each Hold)</code></p>
                    </SubStep>
                     <SubStep title="Preservation">
                        <p><strong>Procedure:</strong> Long-term, static preservation of the pipeline under a slight positive N₂ pressure to prevent corrosion from air/moisture ingress after the main operation is complete.</p>
                        <p className="text-xs mt-2 font-mono"><strong>Calculation Basis:</strong> Makes up for small system leaks over time. <code>N₂ for Preservation = (Pipeline Gas Volume) x (Leak Rate %/day) x (Preservation Duration)</code></p>
                    </SubStep>
                     <SubStep title="Operational Margin">
                        <p><strong>Procedure:</strong> A critical safety and planning buffer added to the sub-total of all calculated N₂ volumes. This accounts for real-world inefficiencies and unforeseen events. Refer to the "Contingency & Margin" page for detailed guidance on selecting a percentage.</p>
                    </SubStep>
                 </div>
            </StepCard>

             <StepCard number={5} title="Run and Analyze the N₂ Simulation">
                <p>Once all inputs are entered and there are no validation errors, click the <strong>"Calculate Cooldown"</strong> button.</p>
                <WarningCard title="1. Critical Safety Check: Peak Cooldown Rate">
                    <p>
                       After the calculation is complete, immediately check the <strong>"Peak Cooldown Rate"</strong> card in the Overview Summary.
                    </p>
                    <ul>
                        <li><strong className="text-green-700 dark:text-green-400">GREEN VALUE:</strong> Your procedure is safe. The maximum calculated cooldown rate was within the limit you specified.</li>
                        <li><strong className="text-red-700 dark:text-red-400">RED VALUE:</strong> Your procedure is unsafe. The simulation shows that the cooldown rate exceeded your limit at some point.</li>
                    </ul>
                     <p>
                       <strong>Action Required for Red Value:</strong> You must make the cooldown gentler. Go back to Step 2. The best approach is to increase the <strong>Temp Hold Duration</strong> (e.g., from 1 to 1.5 hours) or increase the flow ramp times. Rerun the simulation until the Peak Cooldown Rate is green.
                    </p>
                </WarningCard>
                <SubStep title="2. Review the Full N₂ Service Plan">
                    <p>
                       Once the cooldown rate is safe, review the full N₂ consumption breakdown in the summary. This gives you an auditable trail of the total nitrogen requirement. The final, most important number is the <strong>"Grand Total N₂ Consumption,"</strong> which includes all phases and your operational margin. This is the value you should use for logistics and supply planning.
                    </p>
                </SubStep>
            </StepCard>
        </Section>

         <Section id="part-2" title="Part II: LNG Introduction Simulation">
             <p>Once you have a successful N₂ cooldown simulation, you can proceed to the final step: simulating the introduction of LNG.</p>
             <StepCard number={6} title="Navigate and Verify Basis">
                <p>Click on the <strong>"LNG Introduction"</strong> tab in the navigation bar. The "Calculation Basis" panel on the left will automatically be populated with key results from your cooldown simulation (e.g., pipeline volume, final temperature), which serve as the starting point for this new calculation.</p>
            </StepCard>
             <StepCard number={7} title="Configure LNG Filling Parameters">
                <p>Define the procedure for introducing LNG into the now-cold pipeline. The goal is a slow, controlled fill to prevent static electricity buildup and pressure surges.</p>
                 <ul>
                    <li><strong>Initial Filling Rate:</strong> The low, starting flow rate (e.g., 5 m³/h).</li>
                    <li><strong>Max Filling Velocity:</strong> The critical safety constraint. This is the maximum allowable fluid velocity in the pipe, typically kept very low (e.g., 0.1 m/s) in the initial phase. The calculator will determine the maximum flow rate that respects this limit.</li>
                    <li><strong>Filling Ramp-Up Time:</strong> The time over which the flow will ramp from the initial rate to the calculated maximum rate.</li>
                    <li><strong>LNG Density & Vent Backpressure:</strong> Enter the properties of your LNG and the pressure of the vent system where the N₂ will be displaced.</li>
                </ul>
            </StepCard>
            <StepCard number={8} title="Run and Analyze the LNG Simulation">
                <p>Click the <strong>"Calculate LNG Filling"</strong> button.</p>
                <SubStep title="1. Review Key Metrics">
                    <p>
                      Check the "LNG Filling Summary" for the primary results: <strong>Total Filling Time</strong>, <strong>Total LNG Volume</strong> (which should match your pipe volume), and <strong>Total LNG Mass</strong>.
                    </p>
                </SubStep>
                <WarningCard title="2. Critical Safety Check: LNG Velocity">
                    <p>
                      Review the <strong>"LNG Velocity vs. Time"</strong> chart. The most important check is to ensure that the velocity curve never exceeds the red "Max Velocity" reference line you specified. If it does, there is an issue. If it stays below, your procedure is safe from a velocity perspective.
                    </p>
                </WarningCard>
                 <SubStep title="3. Interact with the Visualizer">
                    <p>
                      Use the "Play" button and the slider on the interactive pipeline visualizer to watch the LNG front progress down the pipe. This provides an intuitive, real-time understanding of the filling process.
                    </p>
                </SubStep>
            </StepCard>
             <StepCard number={9} title="Generate Final Reports">
                <p>You now have a complete, end-to-end simulation. You have two reporting options:</p>
                <ul>
                    <li>Click the <strong>"Save to PDF report"</strong> button on the LNG page to generate a standalone report for just the LNG introduction phase.</li>
                    <li>Click the main <strong>"Print Report"</strong> button in the header to generate a comprehensive, combined report that includes all results for both the N₂ Cooldown and the LNG Introduction, with professional page breaks between major sections.</li>
                </ul>
            </StepCard>
        </Section>
      </div>
    </div>
  );
};

export default OperatingGuidePage;
