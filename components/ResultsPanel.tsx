import React from 'react';
import { CalculationResults, TimeSeriesProfilePoint } from '../types.ts';
import N2ConsumptionBreakdownPanel from './N2ConsumptionBreakdownPanel.tsx';
import { Area, AreaChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

// --- Chart Helper Components & Functions ---

const formatNumber = (num: number | undefined, digits = 2) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const CustomTooltip = ({ active, payload, label, yAxisLabel, xAxisLabel, theme }: any) => {
    if (active && payload && payload.length) {
        const unit = yAxisLabel.match(/\(([^)]+)\)/)?.[1] || '';
        const xUnit = xAxisLabel.match(/\(([^)]+)\)/)?.[1] || '';
        const bgColor = theme === 'dark' ? 'rgba(40, 50, 70, 0.8)' : 'rgba(255, 255, 255, 0.8)';
        const borderColor = theme === 'dark' ? '#475569' : '#E2E8F0';
        const textColor = theme === 'dark' ? '#E2E8F0' : '#374151';

        return (
            <div style={{
                padding: '8px',
                backgroundColor: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(5px)',
            }}>
                <p style={{ color: textColor, fontWeight: '600', fontSize: '14px' }}>{`${xAxisLabel.split(' ')[0]}: ${formatNumber(label, 2)} ${xUnit}`}</p>
                {payload.map((entry: any, index: number) => (
                  <p key={`item-${index}`} className="intro text-sm" style={{ color: entry.color, fontSize: '14px' }}>
                      {`${entry.name}: ${formatNumber(entry.value, 2)} ${unit}`}
                  </p>
                ))}
            </div>
        );
    }
    return null;
};

const chartColors = {
    light: {
        temperature: '#4F46E5', n2Flow: '#7C3AED', n2Accumulated: '#059669',
        heatRemovedAccumulated: '#16A34A', heatAddedAccumulated: '#EA580C',
        q_accumulation: '#DC2626', pressure_bar: '#D946EF',
        q_removed: '#0E7490', q_convection: '#38BDF8', q_radiation: '#D97706',
        heatAddedConvectionAccumulated: '#38BDF8', heatAddedRadiationAccumulated: '#D97706',
    },
    dark: { 
        temperature: '#818CF8', n2Flow: '#F472B6', n2Accumulated: '#34D399',
        heatRemovedAccumulated: '#4ADE80', heatAddedAccumulated: '#FB923C',
        q_accumulation: '#F87171', pressure_bar: '#F0ABFC', q_removed: '#67E8F9',
        q_convection: '#7DD3FC', q_radiation: '#FDBA74',
        heatAddedConvectionAccumulated: '#7DD3FC', heatAddedRadiationAccumulated: '#FDBA74'
    }
};

const SingleMetricChart: React.FC<{
    data: any[];
    dataKey: keyof typeof chartColors['light'];
    title: string;
    yAxisLabel: string;
    theme: 'light' | 'dark';
    referenceLine?: { y: number; label: string };
}> = ({ data, dataKey, title, yAxisLabel, theme, referenceLine }) => {
    const gridStrokeColor = theme === 'dark' ? '#475569' : '#E2E8F0';
    const textColor = theme === 'dark' ? '#E2E8F0' : '#374151';
    const strokeColor = chartColors[theme][dataKey] || '#8884d8';
    const refLineColor = theme === 'dark' ? '#F87171' : '#EF4444';
    const lineName = title.split(' vs.')[0];
    const xAxisLabel = "Time (hr)";

    return (
        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 dark:text-slate-100 mb-4 text-center">{title}</h3>
            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 25, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                        <XAxis 
                            type="number" dataKey="time" stroke={textColor} tick={{ fontSize: 12 }}
                            tickFormatter={(value) => formatNumber(value, 1)}
                            label={{ value: xAxisLabel, position: 'insideBottom', dy: 10, fill: textColor, fontSize: 14 }}
                            domain={[0, 'dataMax']} allowDataOverflow={true}
                        />
                        <YAxis 
                            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: textColor, fontSize: 14 }} 
                            stroke={textColor} tick={{ fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} theme={theme} />} />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: "14px", color: textColor}}/>
                        <Line type="monotone" dataKey={dataKey} name={lineName} stroke={strokeColor} dot={false} strokeWidth={2} />
                        {referenceLine && <ReferenceLine y={referenceLine.y} label={{ value: referenceLine.label, position: 'right', fill: refLineColor, fontSize: 12 }} stroke={refLineColor} strokeDasharray="4 4" />}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const DYNAMIC_CHART_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#726DA8', '#F7B801', '#5B5F97', '#FFC154',
  '#A6D854', '#FFD92F', '#E78AC3', '#66C2A5', '#FC8D62', '#8DA0CB', '#E5C494', '#B3B3B3'
];

const DynamicProfileChart: React.FC<{
    data: TimeSeriesProfilePoint[];
    targetTemp: number;
    title: string;
    pipeLength: number;
    theme: 'light' | 'dark';
}> = ({ data, targetTemp, title, pipeLength, theme }) => {
    const gridStrokeColor = theme === 'dark' ? '#475569' : '#E2E8F0';
    const textColor = theme === 'dark' ? '#E2E8F0' : '#374151';
    const refLineColor = theme === 'dark' ? '#F87171' : '#EF4444';
    const yAxisLabel = "Pipe Skin Temperature (°C)";
    const xAxisLabel = "Pipeline Length (m)";

    const [pivotedData, timeKeys] = React.useMemo(() => {
        if (!data || data.length === 0) return [[], []];
        const pivotedMap: Map<number, any> = new Map();
        const timeKeys = new Set<string>();
        data.forEach(({ time, profile }) => {
            const timeKey = `${Math.round(time)} HR`;
            timeKeys.add(timeKey);
            profile.forEach(({ length_m, temperature }) => {
                if (!pivotedMap.has(length_m)) {
                    pivotedMap.set(length_m, { length_m });
                }
                const point = pivotedMap.get(length_m);
                point[timeKey] = temperature;
            });
        });
        const sortedData = Array.from(pivotedMap.values()).sort((a, b) => a.length_m - b.length_m);
        return [sortedData, Array.from(timeKeys)];
    }, [data]);

    return (
        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 dark:text-slate-100 mb-4 text-center">{title}</h3>
            <div style={{width: '100%', height: '40rem'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pivotedData} margin={{ top: 5, right: 30, left: 25, bottom: 120 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                        <XAxis 
                            type="number" dataKey="length_m" stroke={textColor} tick={{ fontSize: 12 }}
                            tickFormatter={(value) => formatNumber(value, 0)}
                            label={{ value: xAxisLabel, position: 'insideBottom', dy: 10, fill: textColor, fontSize: 14 }}
                            domain={[0, pipeLength]}
                        />
                        <YAxis 
                            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: textColor, fontSize: 14, dx: -10 }} 
                            stroke={textColor} tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                             contentStyle={{
                                backgroundColor: theme === 'dark' ? 'rgba(40, 50, 70, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(5px)', border: `1px solid ${gridStrokeColor}`
                             }}
                        />
                        <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                        {timeKeys.map((key, index) => (
                          <Line key={key} type="monotone" dataKey={key} name={key}
                            stroke={DYNAMIC_CHART_PALETTE[index % DYNAMIC_CHART_PALETTE.length]}
                            dot={false} strokeWidth={1.5} />
                        ))}
                         <ReferenceLine y={targetTemp} label={{ value: `Target: ${targetTemp}°C`, position: 'insideTopRight', fill: refLineColor, fontSize: 12 }} stroke={refLineColor} strokeDasharray="4 4" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// --- Main Panel Component ---

interface ResultsPanelProps {
  results: CalculationResults | null;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

const MetricCard: React.FC<{ title: string; value: string; unit: string; valueClassName?: string; small?: boolean }> = ({ title, value, unit, valueClassName, small = false }) => (
    <div className="bg-gray-100/50 dark:bg-slate-700/50 p-4 rounded-lg shadow-sm">
        <h3 className={`${small ? 'text-sm' : 'text-md'} font-medium text-gray-600 dark:text-slate-200`}>{title}</h3>
        <p className={`${small ? 'text-2xl' : 'text-3xl'} font-bold ${valueClassName || 'text-gray-900 dark:text-slate-100'}`}>
            {value} <span className="text-base font-normal text-gray-500 dark:text-slate-200">{unit}</span>
        </p>
    </div>
);

const N2ConsumptionMetricCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <div className="bg-gray-100/50 dark:bg-slate-700/50 p-3 rounded-lg text-center">
        <h3 className="text-sm font-medium text-gray-600 dark:text-slate-200">{title}</h3>
        <p className="text-xl font-bold text-gray-900 dark:text-slate-100">
            {value} <span className="text-sm font-normal text-gray-500 dark:text-slate-200">{unit}</span>
        </p>
    </div>
);


const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, isLoading, error, theme }) => {
  if (isLoading) {
    return (
      <div className="p-12 h-full flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl text-gray-700 dark:text-slate-200">Running simulation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-12 h-full flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/40 border-l-4 border-red-400 p-6 rounded-r-lg">
          <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Calculation Error</h3>
          <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-12 h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-300">Awaiting Calculation</h2>
          <p className="mt-2 text-gray-500 dark:text-slate-400">Enter your pipeline parameters and click "Calculate Cooldown" to see the results.</p>
        </div>
      </div>
    );
  }
  
  const peakRate = results.peakCooldownRate;
  const cooldownRateLimit = results.inputs.cooldownRateLimit;
  const isRateSafe = peakRate <= cooldownRateLimit;
  const cooldownRateColorClass = isRateSafe 
    ? 'text-green-600 dark:text-green-400' 
    : 'text-red-500 dark:text-red-400';

  return (
    <div className="p-8 space-y-12">
      
      {/* --- START: New Summary Dashboard --- */}
      <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            Overview Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard title="Cooldown Time" value={formatNumber(results.totalTimeHours)} unit="hours" />
              <MetricCard 
                title="Peak Cooldown Rate" 
                value={formatNumber(peakRate, 1)} 
                unit={`°C/hr`}
                valueClassName={cooldownRateColorClass}
              />
          </div>
      </div>
      
      <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            N₂ Consumption Breakdown
          </h2>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <N2ConsumptionMetricCard title="N₂ for Purge" value={formatNumber(results.n2ForPurgeNm3, 0)} unit="Nm³" />
               <N2ConsumptionMetricCard title="N₂ for Cooldown" value={formatNumber(results.n2ForCooldownNm3, 0)} unit="Nm³" />
               <N2ConsumptionMetricCard title="N₂ for Hold Periods" value={formatNumber(results.n2ForHoldsNm3, 0)} unit="Nm³" />
               <N2ConsumptionMetricCard title="N₂ for Preservation" value={formatNumber(results.n2ForPreservationNm3, 0)} unit="Nm³" />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MetricCard title="Sub-Total N₂" value={formatNumber(results.subTotalN2Nm3, 0)} unit="Nm³" />
              <MetricCard title="Operational Margin" value={formatNumber(results.operationalMarginNm3, 0)} unit={`Nm³ (${results.inputs.operationalMarginPercent}%)`} />
          </div>
          <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800">
               <MetricCard 
                  title="Grand Total N₂ Consumption" 
                  value={formatNumber(results.grandTotalN2Nm3, 0)} 
                  unit="Nm³" 
                  valueClassName="text-indigo-600 dark:text-indigo-300"
              />
          </div>
      </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Heat Ingress Summary</h2>
                <MetricCard title="Total Heat Ingress" value={formatNumber(results.totalHeatIngressMJ)} unit="MJ" small />
                <MetricCard title="Convective Ingress" value={formatNumber(results.totalHeatIngressConvectionMJ)} unit="MJ" small />
                <MetricCard title="Radiative Ingress" value={formatNumber(results.totalHeatIngressRadiationMJ)} unit="MJ" small />
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">N₂ Cooldown Heat Removal</h2>
                <MetricCard title="Total Heat Removed" value={formatNumber(results.totalHeatRemovedMJ)} unit="MJ" small />
                <MetricCard title="Peak Cooling Power" value={formatNumber(results.peakHeatRemovalkW)} unit="kW" small />
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Pipe Summary</h2>
                <MetricCard title="Pipe Mass" value={formatNumber(results.pipeMass, 0)} unit="kg" small />
                <MetricCard title="Pipeline Volume" value={formatNumber(results.pipeVolume)} unit="m³" small />
                <MetricCard title="Pipe Cross-Section Area" value={formatNumber(results.pipeCrossSectionArea * 10000, 1)} unit="cm²" small />
            </div>
       </div>
       {/* --- END: New Summary Dashboard --- */}
      
      <div className="space-y-4 pt-8">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-4">
            Simulation Charts
        </h2>
        <div className="grid grid-cols-1 gap-8">
            <DynamicProfileChart data={results.timeSeriesProfile} targetTemp={results.targetTemp} title="Dynamic Cooldown Temperature Profile" pipeLength={results.pipeLength} theme={theme} />
            <SingleMetricChart data={results.chartData} dataKey="temperature" title="Pipe Wall Skin Temperature vs. Time" yAxisLabel="Temperature (°C)" theme={theme} />
            <SingleMetricChart data={results.chartData} dataKey="n2Flow" title="Nitrogen Flow Rate vs. Time" yAxisLabel="N₂ Flow (Nm³/h)" theme={theme} referenceLine={{ y: results.maxN2Flow, label: `Max: ${results.maxN2Flow}` }} />
            <SingleMetricChart data={results.chartData} dataKey="n2Accumulated" title="Accumulated N₂ Consumption vs. Time" yAxisLabel="Total N₂ (Nm³)" theme={theme} />
            <SingleMetricChart data={results.chartData} dataKey="pressure_bar" title="Pipeline Inlet Pressure vs. Time" yAxisLabel="Inlet Pressure (bara)" theme={theme} />
            <SingleMetricChart data={results.chartData} dataKey="heatRemovedAccumulated" title="Accumulated Heat Removed by N₂ vs. Time" yAxisLabel="Energy (MJ)" theme={theme} />
            <SingleMetricChart data={results.chartData} dataKey="heatAddedAccumulated" title="Accumulated Heat Ingress vs. Time" yAxisLabel="Energy (MJ)" theme={theme} />
            <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg shadow-inner">
                <h3 className="text-md font-semibold text-gray-800 dark:text-slate-100 mb-4 text-center">Accumulated Heat Ingress Components vs. Time</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={results.chartData} margin={{ top: 5, right: 20, left: 25, bottom: 25 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#475569' : '#E2E8F0'} />
                            <XAxis type="number" dataKey="time" stroke={theme === 'dark' ? '#E2E8F0' : '#374151'} tick={{ fontSize: 12 }} label={{ value: "Time (hr)", position: 'insideBottom', dy: 10, fill: theme === 'dark' ? '#E2E8F0' : '#374151' }} />
                            <YAxis label={{ value: "Energy (MJ)", angle: -90, position: 'insideLeft', fill: theme === 'dark' ? '#E2E8F0' : '#374151' }} stroke={theme === 'dark' ? '#E2E8F0' : '#374151'} tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip yAxisLabel={"Energy (MJ)"} xAxisLabel={"Time (hr)"} theme={theme}/>} />
                            <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: "14px", color: theme === 'dark' ? '#E2E8F0' : '#374151' }}/>
                            <Area type="monotone" dataKey="heatAddedConvectionAccumulated" name="Convective" stackId="1" stroke={chartColors[theme].heatAddedConvectionAccumulated} fill={chartColors[theme].heatAddedConvectionAccumulated} fillOpacity={0.6} />
                            <Area type="monotone" dataKey="heatAddedRadiationAccumulated" name="Radiative" stackId="1" stroke={chartColors[theme].heatAddedRadiationAccumulated} fill={chartColors[theme].heatAddedRadiationAccumulated} fillOpacity={0.6} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPanel;