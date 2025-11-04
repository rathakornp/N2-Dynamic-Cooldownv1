import React from 'react';
import { LngIntroductionResults, CalculationResults, LngIntroductionInputs, TimeSeriesProfilePoint, PressureTimeSeriesPoint } from '../types.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PrintMode } from '../App.tsx';
import LngPrintButton from './LngPrintButton.tsx';
import LngCalculationBasisPanel from './LngCalculationBasisPanel.tsx';

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
    light: { lngVelocity: '#0EA5E9', lngFlowRate: '#10B981', n2VentRate: '#8B5CF6', inletPressure: '#F43F5E' },
    dark: { lngVelocity: '#7DD3FC', lngFlowRate: '#34D399', n2VentRate: '#C4B5FD', inletPressure: '#F9A8D4' }
};

const DYNAMIC_CHART_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#726DA8', '#F7B801', '#5B5F97', '#FFC154',
  '#A6D854', '#FFD92F', '#E78AC3', '#66C2A5', '#FC8D62', '#8DA0CB', '#E5C494', '#B3B3B3'
];

const LngSingleMetricChart: React.FC<{
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

const DynamicProfileChart: React.FC<{
    data: TimeSeriesProfilePoint[] | PressureTimeSeriesPoint[];
    yDataKey: 'temperature' | 'pressure_bar';
    title: string;
    yAxisLabel: string;
    pipeLength: number;
    theme: 'light' | 'dark';
    referenceLine?: { y: number; label: string };
}> = ({ data, yDataKey, title, yAxisLabel, pipeLength, theme, referenceLine }) => {
    const gridStrokeColor = theme === 'dark' ? '#475569' : '#E2E8F0';
    const textColor = theme === 'dark' ? '#E2E8F0' : '#374151';
    const refLineColor = theme === 'dark' ? '#F87171' : '#EF4444';
    const xAxisLabel = "Pipeline Length (m)";

    const [pivotedData, timeKeys] = React.useMemo(() => {
        if (!data || data.length === 0) return [[], []];
        const pivotedMap: Map<number, any> = new Map();
        const timeKeys = new Set<string>();
        data.forEach(({ time, profile }) => {
            const timeKey = `${time.toFixed(1)} HR`;
            timeKeys.add(timeKey);
            profile.forEach((point) => {
                const length_m = point.length_m;
                if (!pivotedMap.has(length_m)) {
                    pivotedMap.set(length_m, { length_m });
                }
                const pivotedPoint = pivotedMap.get(length_m);
                pivotedPoint[timeKey] = (point as any)[yDataKey];
            });
        });
        const sortedData = Array.from(pivotedMap.values()).sort((a, b) => a.length_m - b.length_m);
        return [sortedData, Array.from(timeKeys)];
    }, [data, yDataKey]);

    return (
        <div className="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 dark:text-slate-100 mb-4 text-center">{title}</h3>
            <div style={{width: '100%', height: '32rem'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pivotedData} margin={{ top: 5, right: 30, left: 25, bottom: 60 }}>
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
                        <Tooltip contentStyle={{ backgroundColor: theme === 'dark' ? 'rgba(40, 50, 70, 0.8)' : 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', border: `1px solid ${gridStrokeColor}` }} />
                        <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                        {timeKeys.map((key, index) => (
                          <Line key={key} type="monotone" dataKey={key} name={key}
                            stroke={DYNAMIC_CHART_PALETTE[index % DYNAMIC_CHART_PALETTE.length]}
                            dot={false} strokeWidth={1.5} />
                        ))}
                         {referenceLine && <ReferenceLine y={referenceLine.y} label={{ value: referenceLine.label, position: 'insideTopRight', fill: refLineColor, fontSize: 12 }} stroke={refLineColor} strokeDasharray="4 4" />}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


// --- Main Panel Component ---

const MetricCard: React.FC<{ title: string; value: string; unit: string; valueClassName?: string }> = ({ title, value, unit, valueClassName }) => (
    <div className="bg-white dark:bg-slate-700/50 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
        <h3 className="text-md font-medium text-gray-600 dark:text-slate-200">{title}</h3>
        <p className={`text-3xl font-bold ${valueClassName || 'text-gray-900 dark:text-slate-100'}`}>
            {value} <span className="text-base font-normal text-gray-500 dark:text-slate-200">{unit}</span>
        </p>
    </div>
);

interface LngResultsPanelProps {
  results: LngIntroductionResults | null;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
  cooldownResults: CalculationResults;
  lngInputs: LngIntroductionInputs | null;
  onShowPrintPreview: (mode: PrintMode) => void;
}

const LngResultsPanel: React.FC<LngResultsPanelProps> = ({ results, isLoading, error, theme, cooldownResults, lngInputs, onShowPrintPreview }) => {
    
    if (isLoading) {
        return (
          <div className="p-12 h-full flex items-center justify-center min-h-[500px]">
            <div className="flex items-center space-x-3">
              <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-xl text-gray-700 dark:text-slate-200">Running LNG simulation...</span>
            </div>
          </div>
        );
    }

    if (error) {
        return (
          <div className="p-12 h-full flex items-center justify-center min-h-[500px]">
            <div className="bg-red-50 dark:bg-red-900/40 border-l-4 border-red-400 p-6 rounded-r-lg">
              <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Calculation Error</h3>
              <p className="mt-2 text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        );
    }

    if (!results || !lngInputs) {
        return (
          <div className="p-12 h-full flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-slate-300">Awaiting LNG Calculation</h2>
              <p className="mt-2 text-gray-500 dark:text-slate-400">Enter LNG parameters and click "Calculate LNG Filling" to see the results.</p>
            </div>
          </div>
        );
    }
    
    const maxVelocity = lngInputs.maxLngVelocity;
    
    return (
        <div className="p-8 space-y-12">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">LNG Introduction Simulation</h1>
                    <p className="text-md text-gray-600 dark:text-slate-300">A simulation of the pipeline filling process.</p>
                </div>
                <div>
                    <LngPrintButton onClick={() => onShowPrintPreview('lng-only')} disabled={!results} />
                </div>
            </div>

            <LngCalculationBasisPanel cooldownResults={cooldownResults} lngInputs={lngInputs} />

            <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2">3. LNG Filling Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                    <MetricCard title="Total Filling Time" value={formatNumber(results.totalFillingTimeHours)} unit="hours" />
                    <MetricCard title="Total LNG Volume" value={formatNumber(results.totalLngVolume_m3)} unit="m³" />
                    <MetricCard title="Total LNG Mass" value={formatNumber(results.totalLngMass_kg, 0)} unit="kg" />
                </div>
            </div>
            
            <div className="space-y-4 pt-8">
                <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 border-b border-gray-200 dark:border-slate-700 pb-2">4. Simulation Charts</h2>
                <div className="grid grid-cols-1 gap-8 pt-2">
                    <DynamicProfileChart 
                        data={results.tempTimeSeriesProfile}
                        yDataKey="temperature"
                        title="Pipe Wall Skin Temperature vs Pipeline Length"
                        yAxisLabel="Temperature (°C)"
                        pipeLength={cooldownResults.inputs.pipeLength}
                        theme={theme}
                        referenceLine={{ y: lngInputs.lngTemperature, label: `LNG Temp: ${lngInputs.lngTemperature}°C`}}
                    />
                    <DynamicProfileChart 
                        data={results.pressureTimeSeries}
                        yDataKey="pressure_bar"
                        title="Dynamic Pressure Profile vs. Pipeline Length"
                        yAxisLabel="Pressure (bara)"
                        pipeLength={cooldownResults.inputs.pipeLength}
                        theme={theme}
                    />
                    <LngSingleMetricChart data={results.chartData} dataKey="lngVelocity" title="LNG Velocity vs. Time" yAxisLabel="Velocity (m/s)" theme={theme} referenceLine={{ y: maxVelocity, label: `Max: ${maxVelocity} m/s`}} />
                    <LngSingleMetricChart data={results.chartData} dataKey="lngFlowRate" title="LNG Flow Rate vs. Time" yAxisLabel="Flow Rate (m³/h)" theme={theme} />
                    <LngSingleMetricChart data={results.chartData} dataKey="inletPressure" title="Required Inlet Pressure vs. Time" yAxisLabel="Pressure (bara)" theme={theme} />
                    <LngSingleMetricChart data={results.chartData} dataKey="n2VentRate" title="N₂ Venting Rate vs. Time" yAxisLabel="Vent Rate (Nm³/h)" theme={theme} />
                </div>
            </div>
        </div>
    );
};

export default LngResultsPanel;