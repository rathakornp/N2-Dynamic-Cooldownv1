import React from 'react';

const Section: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
  <section className="space-y-4 print-block">
    <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-300 dark:border-slate-600 pb-2">
      {title}
    </h2>
    <div className="prose prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-slate-300">
      {children}
    </div>
  </section>
);

const ContingencyItem: React.FC<{ title: string; children: React.ReactNode; icon: React.ReactNode }> = ({ title, children, icon }) => (
  <div className="mt-4 p-4 bg-amber-50 dark:bg-slate-800/50 rounded-lg border-l-4 border-amber-400 dark:border-amber-500 flex items-start gap-4">
    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-amber-100 dark:bg-slate-700 flex items-center justify-center text-amber-500 dark:text-amber-400">
      {icon}
    </div>
    <div>
      <h4 className="font-semibold text-base text-gray-800 dark:text-slate-100">{title}</h4>
      <div className="text-sm mt-1">{children}</div>
    </div>
  </div>
);

const MarginCard: React.FC<{ title: string; color: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, color, icon, children }) => {
  const colorClasses = {
    green: {
      bg: 'bg-green-50 dark:bg-green-900/40',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-800 dark:text-green-200',
      iconBg: 'bg-green-100 dark:bg-green-800',
      iconText: 'text-green-600 dark:text-green-400',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-900/40',
      border: 'border-amber-300 dark:border-amber-700',
      text: 'text-amber-800 dark:text-amber-200',
      iconBg: 'bg-amber-100 dark:bg-amber-800',
      iconText: 'text-amber-600 dark:text-amber-400',
    },
    red: {
      bg: 'bg-red-50 dark:bg-red-900/40',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-800 dark:text-red-200',
      iconBg: 'bg-red-100 dark:bg-red-800',
      iconText: 'text-red-600 dark:text-red-400',
    },
  };
  const classes = colorClasses[color as keyof typeof colorClasses] || colorClasses.amber;

  return (
    <div className={`p-5 rounded-lg border ${classes.bg} ${classes.border} shadow-sm`}>
      <div className="flex items-center gap-4">
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${classes.iconBg} ${classes.iconText}`}>
          {icon}
        </div>
        <h4 className={`font-bold text-lg ${classes.text}`}>{title}</h4>
      </div>
      <p className="mt-3 text-base">{children}</p>
    </div>
  );
};


const ContingencyGuidePage: React.FC = () => {
  // SVG Icons for cards
  const waterIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" /></svg>;
  const sunIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.95l.707-.707a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1zM7.172 7.172a1 1 0 010-1.414l.707-.707a1 1 0 111.414 1.414l-.707.707a1 1 0 01-1.414 0z" /></svg>;
  const thermometerIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.343l.97.97a3 3 0 11-1.94 0l.97-.97V3a1 1 0 011-1zM8 12a2 2 0 104 0H8z" clipRule="evenodd" /></svg>;
  const shieldCheckIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
  const exclamationIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.001-1.742 3.001H4.42c-1.532 0-2.492-1.667-1.742-3.001l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
  const shieldExclamationIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2.166A2.166 2.166 0 007.834 0H2.166A2.166 2.166 0 000 2.166v5.668c0 1.158.625 2.222 1.613 2.766 1.132.628 2.053 1.838 2.373 3.296.22 1.01.99 1.774 2.014 1.774h.028a2.169 2.169 0 002.132-1.774c.32-1.458 1.24-2.668 2.373-3.296C13.54 10.054 14.166 8.99 14.166 7.834V2.166A2.166 2.166 0 0012 0h-2v2.166zM10 14.375a.938.938 0 110-1.875.938.938 0 010 1.875zM9.062 5.625a.938.938 0 011.875 0v3.75a.938.938 0 01-1.875 0v-3.75z" clipRule="evenodd" /></svg>;
  const cogIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;
  const pauseIcon = <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" /></svg>;

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

        <p className="!text-lg text-gray-700 dark:text-slate-200">
            The calculated N₂ consumption from the simulator represents a near-perfect, ideal scenario. In practice, you will always need more nitrogen. This guide explains the critical contingencies and margins you must add to create a robust, reliable operational plan.
        </p>

        <Section title="1. Process & Environmental Contingencies">
            <p>These are factors related to the environment and the initial state of the pipeline that can increase the thermal load beyond the simulation's assumptions.</p>
            <ContingencyItem title="Residual Moisture & Hydrocarbons" icon={waterIcon}>
              <p>This is the single most significant variable. The simulation assumes the pipe is perfectly dry. Any residual water, ice, or liquid hydrocarbons will create a massive additional heat load. The nitrogen must first provide the latent heat to vaporize these substances before it can cool the pipe wall, dramatically increasing N₂ consumption.</p>
            </ContingencyItem>
            <ContingencyItem title="Weather Variability" icon={sunIcon}>
              <p>Higher ambient temperatures, direct solar gain on a sunny day, or higher wind speeds will all increase the rate of heat ingress from the environment, requiring more N₂ to overcome.</p>
            </ContingencyItem>
            <ContingencyItem title="Inaccurate Initial Conditions" icon={thermometerIcon}>
              <p>The actual average temperature of the pipeline might be warmer than the value entered, especially if parts of it were recently in the sun. This represents a higher initial thermal mass to be removed.</p>
            </ContingencyItem>
        </Section>
        
        <Section title="2. Operational & Equipment Margins">
             <p>These are buffers to account for the inefficiencies and realities of executing a procedure in the field.</p>
             <ContingencyItem title="Initial Purge Inefficiency" icon={waterIcon}>
                <p>The model assumes a perfect "plug flow." In reality, significant mixing occurs, and operations often require an extended initial purge to ensure all oxygen and moisture are removed before the main cooldown begins. This consumes N₂ that isn't directly cooling the pipe wall.</p>
            </ContingencyItem>
             <ContingencyItem title="Vaporizer Performance Deviation" icon={cogIcon}>
                <p>The N₂ vaporizer might not perform exactly as simulated. It could take longer to reach the final cryogenic temperature or its output could fluctuate, meaning more N₂ volume is needed to achieve the same total cooling energy.</p>
            </ContingencyItem>
            <ContingencyItem title="Hold & Soak Periods" icon={pauseIcon}>
                <p>The operational plan may include intentional "hold" or "soak" periods to let temperatures equalize or to check for leaks. During these periods, you must still flow N₂ to combat environmental heat ingress, consuming nitrogen without making progress toward the target temperature.</p>
            </ContingencyItem>
             <ContingencyItem title="Emergency & Unplanned Events" icon={shieldExclamationIcon}>
                <p>This is the classic "safety margin." You need a buffer to handle unforeseen events like equipment failure, instrument issues, or a process upset that requires you to pause, slow down, or extend the cooldown.</p>
            </ContingencyItem>
        </Section>
        
        <Section title="Final Recommendation: Applying the Margin">
            <p>It is not practical to model every variable. The standard engineering practice is to apply a percentage-based margin to the final calculated value.</p>
            
            <div className="my-6 p-4 bg-gray-100 dark:bg-slate-900/50 rounded-lg text-center shadow-inner">
                 <code className="text-lg font-mono text-gray-800 dark:text-slate-100">
                    Final N₂ Volume = (Calculated Sub-Total N₂) x (1 + Margin %)
                 </code>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <MarginCard title="Standard Margin (15%)" color="green" icon={shieldCheckIcon}>
                    Use for well-understood, clean, and dry pipelines in predictable weather. Provides a basic buffer for minor operational deviations.
                </MarginCard>
                 <MarginCard title="Robust Margin (20-25%)" color="amber" icon={exclamationIcon}>
                    <strong>This is the most common and recommended range.</strong> It provides a solid buffer for potential residual moisture, weather variability, and minor operational holds.
                </MarginCard>
                <MarginCard title="Conservative Margin (30%+)" color="red" icon={shieldExclamationIcon}>
                    Use for a first-time cooldown, a pipeline with known contamination, or in highly unpredictable weather. Ensures you can handle significant unforeseen challenges.
                </MarginCard>
            </div>

            <p className="mt-6 !text-lg">For your final operating procedure, you should explicitly state the calculated baseline consumption from this tool and the margin you have chosen to add, justifying it based on the risk factors identified above.</p>
        </Section>
      </div>
    </div>
  );
};

export default ContingencyGuidePage;
