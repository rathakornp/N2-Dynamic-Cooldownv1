import React from 'react';
import { CalculationResults, TimeSeriesProfilePoint } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ResultsPanelProps {
  results: CalculationResults | null;
  isLoading: boolean;
  error: string | null;
  theme: 'light' | 'dark';
}

const formatNumber = (num: number | undefined, digits = 2) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const CustomTooltip = ({ active, payload, label, yAxisLabel, xAxisLabel }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const unit = yAxisLabel.match(/\(([^)]+)\)/)?.[1] || '';
        const xUnit = xAxisLabel.match(/\(([^)]+)\)/)?.[1] || '';
        return (
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 border border-gray-300 dark:border-slate-600 rounded-md shadow-lg backdrop-blur-sm">
                <p className="label text-sm text-gray-700 dark:text-slate-200 font-semibold">{`${xAxisLabel.split(' ')[0]}: ${formatNumber(label, 2)} ${xUnit}`}</p>
                <p className="intro text-sm" style={{ color: data.color }}>
                    {`${data.name}: ${formatNumber(data.value, 2)} ${unit}`}
                </p>
            </div>
        );
    }
    return null;
};


const MetricCard: React.FC<{ title: string; value: string; unit: string; small?: boolean }> = ({ title, value, unit, small = false }) => (
    <div className={`bg-gray-100 dark:bg-slate-700 p-4 rounded-lg ${small ? 'text-center' : ''}`}>
        <h3 className={`${small ? 'text-sm' : 'text-md'} font-medium text-gray-600 dark:text-slate-200`}>{title}</h3>
        <p className={`${small ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-slate-100`}>
            {value} <span className="text-base font-normal text-gray-500 dark:text-slate-200">{unit}</span>
        </p>
    </div>
);

const chartColors = {
    light: {
        temperature: '#4F46E5',
        n2Flow: '#7C3AED',
        n2Accumulated: '#059669',
        q_removed: '#16A34A',
        q_total: '#EA580C',
        q_accumulation: '#DC2626',
        pressure_bar: '#D946EF', // fuchsia-500
    },
    dark: {
        temperature: '#818CF8', // indigo-400
        n2Flow: '#F472B6', // pink-400
        n2Accumulated: '#34D399', // emerald-400
        q_removed: '#4ADE80', // green-400
        q_total: '#FB923C', // orange-400
        q_accumulation: '#F87171', // red-400
        pressure_bar: '#F0ABFC', // fuchsia-300
    }
}

const SingleMetricChart: React.FC<{
    data: any[];
    dataKey: keyof typeof chartColors['light'];
    title: string;
    yAxisLabel: string;
    theme: 'light' | 'dark';
    referenceLine?: { y: number; label: string };
    totalTime: number;
}> = ({ data, dataKey, title, yAxisLabel, theme, referenceLine, totalTime }) => {
    const gridStrokeColor = theme === 'dark' ? '#475569' : '#E2E8F0'; // slate-600 / slate-200
    const textColor = theme === 'dark' ? '#E2E8F0' : '#334155'; // slate-200 / slate-700
    const strokeColor = chartColors[theme][dataKey] || '#8884d8';
    const refLineColor = theme === 'dark' ? '#F87171' : '#EF4444'; // red-400 / red-500
    const lineName = title.split(' vs.')[0];
    const xAxisLabel = "Time (hr)";

    const generateTicks = (maxTime: number) => {
        const ticks = [];
        const roundedMax = Math.ceil(maxTime * 2) / 2;
        for (let i = 0; i <= roundedMax; i += 0.5) { ticks.push(i); }
        if (ticks.length < 2 && roundedMax > 0) { return [0, roundedMax]; }
        if (ticks.length < 2) { return [0, 0.5]; }
        return ticks;
    };
    const xTicks = generateTicks(totalTime);

    return (
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 dark:text-slate-100 mb-4 text-center">{title}</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 25, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                        <XAxis 
                            type="number"
                            dataKey="time" 
                            stroke={textColor} 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => formatNumber(value, 1)}
                            label={{ value: xAxisLabel, position: 'insideBottom', dy: 10, fill: textColor, fontSize: 14 }}
                            domain={[0, totalTime]}
                            allowDataOverflow={true}
                            ticks={xTicks}
                        />
                        <YAxis 
                            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: textColor, fontSize: 14 }} 
                            stroke={textColor} 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => typeof value === 'number' ? formatNumber(value, 1) : value}
                        />
                        <Tooltip
                            content={<CustomTooltip yAxisLabel={yAxisLabel} xAxisLabel={xAxisLabel} />}
                        />
                        <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: "14px"}}/>
                        <Line type="monotone" dataKey={dataKey} name={lineName} stroke={strokeColor} dot={false} strokeWidth={2} />
                        {referenceLine && (
                            <ReferenceLine 
                                y={referenceLine.y} 
                                label={{ value: referenceLine.label, position: 'right', fill: refLineColor, fontSize: 12 }} 
                                stroke={refLineColor} 
                                strokeDasharray="4 4" 
                            />
                        )}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const DYNAMIC_CHART_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#726DA8', '#F7B801', '#5B5F97', '#FFC154',
  '#A6D854', '#FFD92F', '#E78AC3', '#66C2A5', '#FC8D62', '#8DA0CB', '#E5C494', '#B3B3B3',
  '#8DD3C7', '#FFFFB3', '#BEBADA', '#FB8072', '#80B1D3', '#FDB462', '#B3DE69', '#FCCDE5',
  '#BC80BD', '#CCEBC5', '#FFED6F', '#7E57C2', '#26A69A', '#FF7043', '#D4E157', '#5C6BC0'
];

const DynamicProfileChart: React.FC<{
    data: TimeSeriesProfilePoint[];
    targetTemp: number;
    title: string;
    theme: 'light' | 'dark';
}> = ({ data, targetTemp, title, theme }) => {
    const gridStrokeColor = theme === 'dark' ? '#475569' : '#E2E8F0';
    const textColor = theme === 'dark' ? '#E2E8F0' : '#334155';
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
        <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 dark:text-slate-100 mb-4 text-center">{title}</h3>
            <div style={{width: '100%', height: '40rem'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pivotedData} margin={{ top: 5, right: 30, left: 25, bottom: 120 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridStrokeColor} />
                        <XAxis 
                            type="number"
                            dataKey="length_m" 
                            stroke={textColor} 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => formatNumber(value, 0)}
                            label={{ value: xAxisLabel, position: 'insideBottom', dy: 10, fill: textColor, fontSize: 14 }}
                            domain={['dataMin', 'dataMax']}
                        />
                        <YAxis 
                            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: textColor, fontSize: 14, dx: -10 }} 
                            stroke={textColor} 
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => typeof value === 'number' ? formatNumber(value, 0) : value}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                             formatter={(value: number, name: string) => [`${formatNumber(value, 1)} °C`, name]}
                             labelFormatter={(label: number) => `Length: ${formatNumber(label, 0)} m`}
                             contentStyle={{
                                backgroundColor: theme === 'dark' ? 'rgba(40, 50, 70, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                                backdropFilter: 'blur(5px)',
                                border: `1px solid ${gridStrokeColor}`
                             }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: '20px',
                            width: '100%',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                          }}
                        />
                        {timeKeys.map((key, index) => (
                          <Line 
                            key={key}
                            type="monotone" 
                            dataKey={key} 
                            name={key}
                            stroke={DYNAMIC_CHART_PALETTE[index % DYNAMIC_CHART_PALETTE.length]}
                            dot={false}
                            strokeWidth={1.5} 
                          />
                        ))}
                         <ReferenceLine 
                            y={targetTemp} 
                            label={{ value: `Target: ${targetTemp}°C`, position: 'insideTopRight', fill: refLineColor, fontSize: 12 }} 
                            stroke={refLineColor} 
                            strokeDasharray="4 4" 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, isLoading, error, theme }) => {
    
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
                <div className="text-center">
                     <svg className="animate-spin mx-auto h-12 w-12 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-lg font-semibold">Running simulation...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
         return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
                <div className="text-center text-red-500 dark:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold mt-4">Calculation Error</h3>
                    <p className="mt-2">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!results) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg h-full flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-slate-300">Awaiting Calculation</h2>
                    <p className="mt-2 text-gray-500 dark:text-slate-400">Enter your parameters and click "Calculate Cooldown" to see the results.</p>
                </div>
            </div>
        );
    }

    const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <fieldset className="border-t border-gray-200 dark:border-slate-700 pt-4">
            <legend className="text-lg font-semibold text-gray-900 dark:text-slate-100 px-2">{title}</legend>
            <div className="mt-4">
                {children}
            </div>
        </fieldset>
    );

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg space-y-8">
            <div>
                 <div className="grid grid-cols-1 gap-y-4">
                    <Section title="Overview Summary">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard title="Cooldown Time" value={formatNumber(results.totalTimeHours)} unit="hours" />
                            <MetricCard title="Total N₂ Consumed" value={formatNumber(results.totalN2Nm3, 0)} unit="Nm³" />
                            <MetricCard title="Peak Cooldown Rate" value={formatNumber(results.peakCooldownRate, 1)} unit="°C/hr" />
                            <MetricCard title="Total N₂ Mass" value={formatNumber(results.totalN2Kg, 0)} unit="kg" />
                        </div>
                    </Section>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 mt-6">
                    <Section title="Heat Ingress Summary">
                         <div className="grid grid-cols-1 gap-4">
                            <MetricCard title="Total Heat Ingress" value={formatNumber(results.totalHeatIngressMJ)} unit="MJ" small />
                            <MetricCard title="Convective Ingress" value={formatNumber(results.totalHeatIngressConvectionMJ)} unit="MJ" small/>
                            <MetricCard title="Radiative Ingress" value={formatNumber(results.totalHeatIngressRadiationMJ)} unit="MJ" small/>
                        </div>
                    </Section>

                    <Section title="Heat Removal Summary">
                        <div className="grid grid-cols-1 gap-4">
                            <MetricCard title="Total Heat Removed" value={formatNumber(results.totalHeatRemovedMJ)} unit="MJ" small/>
                            <MetricCard title="Peak Cooling Power" value={formatNumber(results.peakHeatRemovalkW)} unit="kW" small/>
                        </div>
                    </Section>
                    
                    <Section title="Pipe Data Summary">
                        <div className="grid grid-cols-1 gap-4">
                            <MetricCard title="Pipe Mass" value={formatNumber(results.pipeMass, 0)} unit="kg" small/>
                            <MetricCard title="Pipe Gas Inventory" value={formatNumber(results.pipeVolumeInNm3, 1)} unit="Nm³" small />
                            <MetricCard title="Pipe Inner Radius" value={formatNumber(results.pipeInnerRadius)} unit="mm" small/>
                            <MetricCard title="Pipe Outer Radius" value={formatNumber(results.pipeOuterRadius)} unit="mm" small/>
                        </div>
                    </Section>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                <DynamicProfileChart 
                    data={results.timeSeriesProfile}
                    targetTemp={results.targetTemp}
                    title="Dynamic Cooldown Temperature Profile"
                    theme={theme}
                />
                <SingleMetricChart 
                    data={results.chartData}
                    dataKey="temperature"
                    title="Pipe Outlet Skin Temperature vs. Time"
                    yAxisLabel="Temperature (°C)"
                    theme={theme}
                    totalTime={results.totalTimeHours}
                />
                 <SingleMetricChart 
                    data={results.chartData}
                    dataKey="n2Flow"
                    title="Nitrogen Flow Rate vs. Time"
                    yAxisLabel="N₂ Flow (Nm³/h)"
                    theme={theme}
                    referenceLine={{ y: results.maxN2Flow, label: `Max: ${results.maxN2Flow}` }}
                    totalTime={results.totalTimeHours}
                />
                 <SingleMetricChart 
                    data={results.chartData}
                    dataKey="n2Accumulated"
                    title="Accumulated N₂ Consumption vs. Time"
                    yAxisLabel="Total N₂ (Nm³)"
                    theme={theme}
                    totalTime={results.totalTimeHours}
                />
                 <SingleMetricChart 
                    data={results.chartData}
                    dataKey="pressure_bar"
                    title="Pipeline Pressure vs. Time"
                    yAxisLabel="Pressure (bar)"
                    theme={theme}
                    totalTime={results.totalTimeHours}
                />
                 <SingleMetricChart 
                    data={results.chartData}
                    dataKey="q_removed"
                    title="N₂ Cooling Power vs. Time"
                    yAxisLabel="Cooling Power (kW)"
                    theme={theme}
                    totalTime={results.totalTimeHours}
                />
                 <SingleMetricChart 
                    data={results.chartData}
                    dataKey="q_total"
                    title="Heat Ingress Rate vs. Time"
                    yAxisLabel="Heat Flow (kW)"
                    theme={theme}
                    totalTime={results.totalTimeHours}
                />
            </div>
        </div>
    );
};

export default ResultsPanel;