import React from 'react';

const FeatureOverviewPage: React.FC = () => {
  
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
                N₂ Pipeline Cooldown Calculator
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-slate-300">
                Feature Overview & Validity Statement
            </p>
        </div>

        <p className="text-lg text-gray-700 dark:text-slate-200">
            This tool is a specialized, rate-controlled simulator for planning and analyzing the cooldown of industrial pipelines using gaseous nitrogen. It is built on a robust transient energy balance model.
        </p>

        <Section title="I. Core Simulation Engine">
            <p>The heart of the calculator is a <strong>1D transient heat transfer and fluid dynamics model</strong>. It discretizes the pipeline into 50 distinct segments and solves the energy balance for each segment over small time steps.</p>
            <ul>
                <li><strong>Transient Thermal Analysis:</strong> The model calculates how temperatures change over time, not just a final steady state. This is crucial for understanding the entire cooldown process.</li>
                <li><strong>Comprehensive Heat Transfer Model:</strong> It accounts for all primary modes of heat transfer: internal convection (Dittus-Boelter correlation), conduction through the pipe and insulation, and external convection and radiation (Stefan-Boltzmann law).</li>
                <li><strong>Fluid Dynamics & Pressure Drop:</strong> It models the required pipeline <strong>inlet pressure (bara)</strong> by calculating the pressure drop along the entire pipe length using the Haaland and Darcy-Weisbach equations.</li>
                <li><strong>Temperature-Dependent Properties:</strong> The simulation is highly realistic as it dynamically recalculates the physical properties of both the steel (SS304) and the nitrogen gas (density, viscosity, specific heat) as their temperatures change.</li>
                <li><strong>Stall Condition Detection:</strong> The calculator intelligently monitors the energy balance at the pipe outlet and will stop the simulation if it detects a "stall condition" where cooling power is less than heat ingress.</li>
            </ul>
        </Section>

        <Section title="II. Key User-Configurable Inputs">
            <p>The tool provides extensive control over the simulation parameters, allowing for detailed "what-if" analysis.</p>
             <ul>
                <li><strong>Pipeline Geometry:</strong> Define the exact physical dimensions of the pipe, including Length, Outer Diameter, Wall Thickness, and internal roughness.</li>
                <li><strong>Process Conditions:</strong> Set the key thermal parameters, including the pipe's Initial Temperature, the final Target Temperature, and the Ambient Temperature.</li>
                <li><strong>Multi-Stage N₂ Flow Profile:</strong> Define a sophisticated, multi-stage linear ramp with Initial, Intermediate, and Max N₂ Flow rates, and Intermediate and End Ramp Times.</li>
                <li><strong>N₂ Inlet Temperature Ramp:</strong> Simulate a vaporizer's performance by defining a linear ramp-down of the N₂ inlet temperature.</li>
                <li><strong>Heat Transfer Properties:</strong> Control the Insulation Thickness, Insulation k-value, External Convection Coefficient, and Surface Emissivity.</li>
                <li><strong>Safety & Operational Constraints:</strong> The most critical input is the <strong>Cooldown Rate Limit (°C/hr)</strong>, which enforces the maximum allowable thermal shock on the pipeline.</li>
                <li><strong>Full Scope N₂ Service Planning:</strong> Model the entire N₂ service from start to finish. This includes inputs for initial <strong>Purge Volumes</strong>, planned operational <strong>Hold Periods</strong> (number and duration), long-term <strong>Preservation</strong> needs (duration and leak rate), and a final <strong>Operational Margin (%)</strong> to ensure a robust plan.</li>
            </ul>
        </Section>

        <Section title="III. Comprehensive Simulation Outputs & Visualizations">
            <p>The results are presented in a clear, multi-faceted format designed for engineers.</p>
            <ul>
                <li><strong>Key Performance Indicators (KPIs):</strong> The "Overview Summary" provides a complete, auditable breakdown of nitrogen consumption for each phase (Purge, Cooldown, Holds, Preservation), a Sub-Total, the applied Operational Margin, and a final Grand Total for planning. It also includes total cooldown time and a critical, color-coded Peak Cooldown Rate.</li>
                <li><strong>Detailed Charts:</strong> A suite of interactive charts visualizes the entire process, including a unique Dynamic Temperature Profile, time-series plots for key parameters, and accumulated energy charts.</li>
                <li><strong>Detailed Calculation Outputs:</strong> A separate page provides a full breakdown of calculated physical and thermal properties.</li>
            </ul>
        </Section>

        <Section title="IV. User Interface & Reporting Features">
             <ul>
                <li><strong>Multi-Page Layout:</strong> A clean interface separates the main Simulation Results from Detailed Calculation Outputs and this Features overview.</li>
                <li><strong>Real-time Input Validation:</strong> The input form provides immediate feedback to prevent erroneous calculations.</li>
                <li><strong>Light & Dark Mode:</strong> A theme toggle for user comfort.</li>
                <li><strong>Professional PDF Report Generation:</strong> A "Print Report" function generates a clean, multi-page, A4-formatted report combining all results into a single professional document.</li>
            </ul>
        </Section>

        <Section title="V. Validity for Use & Engineering Considerations">
            <SubSection title="Intended Use">
                 <ul>
                    <li><strong>Feasibility Studies:</strong> Estimating cooldown times and nitrogen consumption for new projects.</li>
                    <li><strong>Procedural Optimization:</strong> Running "what-if" scenarios to find the optimal N₂ flow profile.</li>
                    <li><strong>Sensitivity Analysis:</strong> Understanding how changes in ambient temperature, insulation, or vaporizer capacity will impact the cooldown process.</li>
                    <li><strong>Training & Visualization:</strong> Helping engineers and operators visualize the complex thermal dynamics of a pipeline cooldown.</li>
                </ul>
            </SubSection>
            <SubSection title="Assumptions & Limitations">
                 <ul>
                    <li>The model is <strong>one-dimensional (1D)</strong>, assuming uniform temperature around the pipe's circumference.</li>
                    <li>The model assumes a straight pipeline and does not account for additional pressure drops from bends, valves, or elevation changes.</li>
                    <li>The nitrogen is modeled as an <strong>ideal gas</strong>, a valid assumption for these low-pressure conditions.</li>
                    <li>The simulation does not model phase changes (e.g., condensation of residual moisture).</li>
                </ul>
            </SubSection>
            <div className="mt-6 p-4 bg-amber-100 dark:bg-amber-900/40 border-l-4 border-amber-500 rounded-r-lg">
                <p className="font-bold text-amber-800 dark:text-amber-200">Crucial Validity Statement</p>
                <p className="mt-2 text-amber-700 dark:text-amber-300">
                    This calculator is an <strong>engineering simulation tool</strong> and is intended for guidance and preliminary design purposes. The results are based on established theoretical models and physical constants. However, it is <strong>not a substitute for detailed engineering design, formal safety reviews (e.g., HAZOP), or real-world operational validation.</strong> All procedures derived from this tool should be thoroughly reviewed and approved by qualified personnel before implementation.
                </p>
            </div>
        </Section>
      </div>
    </div>
  );
};

export default FeatureOverviewPage;