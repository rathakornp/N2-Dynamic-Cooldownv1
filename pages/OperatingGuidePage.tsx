import React from 'react';

const OperatingGuidePage: React.FC = () => {
  
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

  const Step: React.FC<{ number?: number; title: string; children: React.ReactNode, isRef?: boolean }> = ({ number, title, children, isRef = false }) => (
    <div className="mt-6 flex items-start gap-4">
        {!isRef && (
            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                {number}
            </div>
        )}
        <div className="flex-grow">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-slate-200">
                {title}
            </h3>
            <div className="mt-2 text-gray-600 dark:text-slate-300">
                 {children}
            </div>
        </div>
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
                Operating Guide
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-slate-300">
                Step-by-Step Instructions for the N₂ Pipeline Cooldown Calculator
            </p>
        </div>

        <p className="text-lg text-gray-700 dark:text-slate-200">
            This guide will walk you through the process of setting up and running a simulation to plan a safe and efficient pipeline cooldown. The key to a successful simulation is a well-defined N₂ ramp rate that respects the pipeline's thermal stress limits.
        </p>

        <Section title="Simulation Workflow">
            <Step number={1} title="Define Your System">
                <p>Start by accurately describing your physical system and the ambient conditions.</p>
                <ul>
                    <li><strong>Pipeline Properties:</strong> Enter the Length, Outer Diameter (OD), Wall Thickness (WT), and internal roughness of your pipeline.</li>
                    <li><strong>Process Conditions:</strong> Set the pipe's Initial Temperature, your final Target Temperature, and the surrounding Ambient Temperature.</li>
                </ul>
            </Step>

            <Step number={2} title="Configure the N₂ Cooldown Strategy">
                <p>This is the most critical part of the simulation. You will define a multi-stage ramp to mimic a real-world, controlled injection procedure. This avoids shocking the system with a sudden, high flow of cryogenic gas.</p>
                
                <div className="mt-4 p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-gray-800 dark:text-slate-100">The N2 Ramp Rate Adjustment Section:</h4>
                    <ol className="list-decimal list-inside mt-2 space-y-2">
                        <li><strong>Initial N₂ Flow:</strong> Set the low, starting flow rate. This is used to begin purging the warm resident gas from the pipeline without causing a rapid temperature drop.</li>
                        <li>
                            <strong>First Ramp Stage (Initial to Intermediate):</strong>
                            <ul>
                                <li>Set the <strong>Intermediate Ramp Time</strong> (e.g., 4 hours).</li>
                                <li>Set the <strong>Intermediate N₂ Flow</strong> (e.g., 3000 Nm³/h).</li>
                                <li><strong>Result:</strong> The simulation will linearly increase the flow from your <em>Initial</em> rate to this <em>Intermediate</em> rate over the first 4 hours. This creates a gentle start to the cooldown.</li>
                            </ul>
                        </li>
                        <li>
                            <strong>Second Ramp Stage (Intermediate to Maximum):</strong>
                             <ul>
                                <li>Set the <strong>End Ramp Time</strong> (e.g., 8 hours). This is the total duration of the ramp-up phase.</li>
                                <li>Set the <strong>Max N₂ Flow</strong> (e.g., 5000 Nm³/h).</li>
                                <li><strong>Result:</strong> From hour 4 to hour 8, the simulation will ramp the flow from the <em>Intermediate</em> rate (3000) to the <em>Max</em> rate (5000). After 8 hours, it will hold the flow at the maximum rate.</li>
                            </ul>
                        </li>
                    </ol>
                </div>
                <p className="mt-4">Also configure the <strong>N₂ Inlet Temperature</strong> ramp. This simulates the vaporizer gradually getting colder, which is a more realistic model than assuming a constant cryogenic temperature from the start.</p>
            </Step>
            
            <Step number={3} title="Set Safety and Operational Constraints">
                <p>Define the heat transfer properties and the primary safety control for the simulation.</p>
                <ul>
                    <li><strong>Heat Transfer Properties:</strong> Enter the details of your Insulation (Thickness and k-value) and other environmental factors (Convection Coeff., Emissivity).</li>
                    <li><strong>Cooldown Rate Limit:</strong> This is your most important safety input. It defines the maximum allowable rate of temperature change (e.g., 10 °C/hr) to prevent thermal shock and material embrittlement.</li>
                </ul>
            </Step>

            <Step number={4} title="Define Full Service Scope & Margin">
                 <p>To create a complete operational plan, define all phases of the N₂ service in the <strong>"Purge, Preservation & Margin"</strong> section. This allows you to account for all nitrogen consumption from start to finish.</p>
                 <div className="space-y-4 mt-4">
                    <div className="p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100">Number of Purge Volumes</h4>
                        <p className="text-sm mt-1"><strong>Procedure:</strong> The initial step to displace the resident gas (air/nitrogen) and ensure an inert, dry atmosphere before cooldown. Typically 3 to 5 volumes are used.</p>
                        <p className="text-xs mt-2 font-mono"><strong>Calculation Basis:</strong> <code>N₂ for Purge = (Pipeline Gas Volume [Nm³]) x (Number of Purge Volumes)</code></p>
                    </div>
                    <div className="p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100">Hold Periods (for Operational Pauses)</h4>
                        <p className="text-sm mt-1"><strong>Procedure:</strong> Planned pauses in the cooldown (e.g., for flange leak checks) where the cryogenic temperature must be maintained against environmental heat ingress.</p>
                        <p className="text-xs mt-2 font-mono"><strong>Calculation Basis:</strong> The calculator finds the "make-up" N₂ flow needed to counteract heat leak at the target temperature. <code>N₂ for Hold = (Make-up Flow Rate) x (Number of Holds) x (Duration of Each Hold)</code></p>
                    </div>
                     <div className="p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100">Preservation</h4>
                        <p className="text-sm mt-1"><strong>Procedure:</strong> Long-term, static preservation of the pipeline under a slight positive N₂ pressure to prevent corrosion from air/moisture ingress after the main operation is complete.</p>
                        <p className="text-xs mt-2 font-mono"><strong>Calculation Basis:</strong> Makes up for small system leaks over time. <code>N₂ for Preservation = (Pipeline Gas Volume) x (Leak Rate %/day) x (Preservation Duration)</code></p>
                    </div>
                     <div className="p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-slate-100">Operational Margin</h4>
                        <p className="text-sm mt-1"><strong>Procedure:</strong> A critical safety and planning buffer added to the sub-total of all calculated N₂ volumes. This accounts for real-world inefficiencies and unforeseen events. Refer to the "Contingency & Margin" page for detailed guidance on selecting a percentage.</p>
                    </div>
                 </div>
            </Step>

             <Step number={5} title="Run and Analyze the Simulation">
                <p>Once all inputs are entered and there are no validation errors, click the <strong>"Calculate Cooldown"</strong> button.</p>
                <div className="mt-4 p-4 bg-amber-100 dark:bg-amber-900/40 border-l-4 border-amber-500 rounded-r-lg">
                    <h4 className="font-bold text-amber-800 dark:text-amber-200">1. Critical Safety Check: Peak Cooldown Rate</h4>
                    <p className="mt-2 text-amber-700 dark:text-amber-300">
                       After the calculation is complete, immediately check the <strong>"Peak Cooldown Rate"</strong> card in the Overview Summary.
                    </p>
                    <ul className="list-disc list-inside mt-2 text-amber-700 dark:text-amber-300">
                        <li><strong className="text-green-700 dark:text-green-400">GREEN VALUE:</strong> Your procedure is safe. The maximum calculated cooldown rate was within the limit you specified.</li>
                        <li><strong className="text-red-700 dark:text-red-400">RED VALUE:</strong> Your procedure is unsafe. The simulation shows that the cooldown rate exceeded your limit at some point.</li>
                    </ul>
                     <p className="mt-2 text-amber-700 dark:text-amber-300">
                       <strong>Action Required for Red Value:</strong> You must make the cooldown gentler. Go back to Step 2 and increase your ramp times (e.g., change the End Ramp Time from 8 to 10 hours) or reduce the Max N₂ Flow. Rerun the simulation until the Peak Cooldown Rate is green.
                    </p>
                </div>
                 <div className="mt-6 p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg">
                    <h4 className="font-bold text-gray-800 dark:text-slate-100">2. Review the Full N₂ Service Plan</h4>
                    <p className="mt-2 text-gray-700 dark:text-slate-200">
                       Once the cooldown rate is safe, review the full N₂ consumption breakdown in the summary. This gives you an auditable trail of the total nitrogen requirement. The final, most important number is the <strong>"Grand Total N₂ Consumption,"</strong> which includes all phases and your operational margin. This is the value you should use for logistics and supply planning.
                    </p>
                </div>
            </Step>

            <Step number={6} title="Generate Your Report">
                <p>Once you have a successful simulation with a safe (green) cooldown rate, you can generate a complete professional report.</p>
                <ul>
                    <li>Navigate to the <strong>Detailed Calculation Output</strong> page to review all underlying numbers.</li>
                    <li>Click the <strong>"Print Report"</strong> button in the header to generate a clean, multi-page A4 PDF containing all summary metrics, charts, and detailed data for your records.</li>
                </ul>
            </Step>

            <Step isRef={true} title="Step 7: Reference Guideline - Preservation Leak Rates">
                <p>Choosing the right leak rate is crucial for accurately planning nitrogen logistics for a long-term preservation effort. The value can vary significantly based on the condition and complexity of the pipeline system. Here is a breakdown of typical leak rates to help you select an appropriate value for the calculator.</p>
                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-slate-200 uppercase bg-gray-100 dark:bg-slate-700">
                            <tr>
                                <th scope="col" className="px-4 py-2">Case</th>
                                <th scope="col" className="px-4 py-2">Leak Rate (% Vol/Day)</th>
                                <th scope="col" className="px-4 py-2">System Condition & Characteristics</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b dark:border-slate-700">
                                <td className="px-4 py-2 font-medium">Standard / Good</td>
                                <td className="px-4 py-2 font-mono">0.1% - 0.25%</td>
                                <td className="px-4 py-2"><strong>Very Tight System.</strong> Typical for new construction that has just passed a formal leak test. Characterized by high-quality gaskets, properly torqued flanges, and new valve packings.</td>
                            </tr>
                            <tr className="border-b dark:border-slate-700">
                                <td className="px-4 py-2 font-medium">Typical / Average</td>
                                <td className="px-4 py-2 font-mono">0.5% - 1.0%</td>
                                <td className="px-4 py-2"><strong>Realistic for Existing Systems.</strong> A practical planning value for a pipeline that has been in service. It accounts for minor weeping from older gaskets, valve stems, and instrument fittings. <strong>For most planning, starting with 1% is a robust and common choice.</strong></td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-medium">Worst Case / Poor</td>
                                <td className="px-4 py-2 font-mono">2.0% - 5.0%</td>
                                <td className="px-4 py-2"><strong>Problematic System.</strong> For an old pipeline, a system with many flanges, or one with a history of sealing issues. This high rate would likely warrant maintenance action, but it should be used for planning if system integrity is uncertain.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <h4 className="text-lg font-semibold mt-6">Factors That Influence the Leak Rate</h4>
                <ul>
                    <li><strong>Age and Condition:</strong> New pipelines are much tighter than older ones that have undergone thermal cycling.</li>
                    <li><strong>Number of Fittings:</strong> A long, welded pipeline has a lower leak rate than a complex system with hundreds of flanges, valves, and instrument take-offs.</li>
                    <li><strong>Type and Quality of Gaskets:</strong> Modern spiral-wound gaskets offer far superior sealing performance.</li>
                    <li><strong>Quality of Workmanship:</strong> Properly cleaned, aligned, and torqued flanges are the most important factor for minimizing leaks.</li>
                    <li><strong>Thermal History:</strong> Significant temperature swings can cause gaskets to lose sealing stress.</li>
                </ul>

                <h4 className="text-lg font-semibold mt-6">Practical Recommendation for the Calculator</h4>
                <ul>
                    <li>If you have recent leak test data for the system, use that as your primary basis.</li>
                    <li>If you are unsure of the system's condition, <strong>start with a "Typical" value of 1% per day.</strong> This is a reasonably conservative and realistic figure for most industrial systems.</li>
                    <li>If you are planning for a very old system or have reason to suspect its integrity, use a "Worst Case" value of 2% or higher to ensure your N₂ logistics plan is sufficiently robust.</li>
                </ul>
            </Step>

        </Section>
      </div>
    </div>
  );
};

export default OperatingGuidePage;