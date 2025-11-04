import React from 'react';
import { LngIntroductionResults, TimeSeriesProfilePoint, PressureTimeSeriesPoint } from '../types.ts';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import LngCalculationBasisPanel from './LngCalculationBasisPanel.tsx';

const formatNumber = (num: number | undefined, digits = 2) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const MetricCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
    <div className="bg-gray-100 p-4 rounded-lg text-left">
        <h3 className="text-md font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">
            {value} <span className="text-base font-normal text-gray-500">{unit}</span>
        </p>
    </div>
);

const DYNAMIC_CHART_PALETTE = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FED766', '#726DA8', '#F7B801', '#5B5F97', '#FFC154',
  '#A6D854', '#FFD92F', '#E78AC3', '#66C2A5', '#FC8D62', '#8DA0CB', '#E5C494', '#B3B3B3'
];

const StaticProfileChart: React.FC<{
    data: TimeSeriesProfilePoint[] | PressureTimeSeriesPoint[];
    yDataKey: 'temperature' | 'pressure_bar';
    title: string;
    yAxisLabel: string;
    pipeLength: number;
    referenceLine?: { y: number; label: string };
}> = ({ data, yDataKey, title, yAxisLabel, pipeLength, referenceLine }) => {
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
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div style={{width: '100%', height: '30rem'}}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pivotedData} margin={{ top: 5, right: 30, left: 25, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" dataKey="length_m" stroke="#374151" tick={{ fontSize: 12 }} label={{ value: "Pipeline Length (m)", position: 'insideBottom', dy: 10, fill: "#374151" }} domain={[0, pipeLength]} />
                        <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: "#374151", dx: -10 }} stroke="#374151" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                        {timeKeys.map((key, index) => (
                          <Line key={key} type="monotone" dataKey={key} name={key}
                            stroke={DYNAMIC_CHART_PALETTE[index % DYNAMIC_CHART_PALETTE.length]}
                            dot={false} strokeWidth={1.5} isAnimationActive={false} />
                        ))}
                         {referenceLine && <ReferenceLine y={referenceLine.y} label={{ value: referenceLine.label, position: 'insideTopRight', fill: '#EF4444' }} stroke="#EF4444" strokeDasharray="4 4" />}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


const LngSingleMetricChart: React.FC<{
    data: any[];
    dataKey: string;
    lineName: string;
    strokeColor: string;
    title: string;
    yAxisLabel: string;
    referenceLine?: { y: number; label: string };
}> = ({ data, dataKey, lineName, strokeColor, title, yAxisLabel, referenceLine }) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">{title}</h3>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: 25, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis type="number" dataKey="time" stroke="#374151" tick={{ fontSize: 12 }} label={{ value: "Time (hr)", position: 'insideBottom', dy: 10, fill: "#374151" }} domain={[0, 'dataMax']} />
                        <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft', fill: "#374151" }} stroke="#374151" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend verticalAlign="top" height={36}/>
                        <Line type="monotone" dataKey={dataKey} name={lineName} stroke={strokeColor} dot={false} strokeWidth={2} isAnimationActive={false} />
                        {referenceLine && <ReferenceLine y={referenceLine.y} label={{ value: referenceLine.label, position: 'right', fill: '#EF4444' }} stroke="#EF4444" strokeDasharray="4 4" />}
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


interface LngPrintResultsProps {
  results: LngIntroductionResults;
  theme: 'light' | 'dark'; 
}

const LngPrintResults: React.FC<LngPrintResultsProps> = ({ results }) => {
    return (
        <div className="space-y-8">
            <LngCalculationBasisPanel cooldownResults={results.cooldownResults} lngInputs={results.inputs} />
            
            <div className="print-block">
                <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">3. LNG Filling Summary</h2>
                <div className="grid grid-cols-3 gap-4 mt-4">
                    <MetricCard title="Total Filling Time" value={formatNumber(results.totalFillingTimeHours)} unit="hours" />
                    <MetricCard title="Total LNG Volume" value={formatNumber(results.totalLngVolume_m3)} unit="m³" />
                    <MetricCard title="Total LNG Mass" value={formatNumber(results.totalLngMass_kg, 0)} unit="kg" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 gap-8 pt-4">
                <div className="print-block">
                     <StaticProfileChart 
                        data={results.tempTimeSeriesProfile}
                        yDataKey="temperature"
                        title="Pipe Wall Skin Temperature vs Pipeline Length"
                        yAxisLabel="Temperature (°C)"
                        pipeLength={results.cooldownResults.inputs.pipeLength}
                        referenceLine={{ y: results.inputs.lngTemperature, label: `LNG Temp: ${results.inputs.lngTemperature}°C`}}
                    />
                </div>
                <div className="print-block">
                     <StaticProfileChart 
                        data={results.pressureTimeSeries}
                        yDataKey="pressure_bar"
                        title="Dynamic Pressure Profile vs. Pipeline Length"
                        yAxisLabel="Pressure (bara)"
                        pipeLength={results.cooldownResults.inputs.pipeLength}
                    />
                </div>
                <div className="print-block">
                    <LngSingleMetricChart data={results.chartData} dataKey="lngVelocity" lineName="LNG Velocity" strokeColor="#0ea5e9" title="LNG Velocity vs. Time" yAxisLabel="Velocity (m/s)" referenceLine={{ y: results.inputs.maxLngVelocity, label: `Max: ${results.inputs.maxLngVelocity} m/s`}} />
                </div>
                <div className="print-block">
                    <LngSingleMetricChart data={results.chartData} dataKey="lngFlowRate" lineName="LNG Flow Rate" strokeColor="#10b981" title="LNG Flow Rate vs. Time" yAxisLabel="Flow Rate (m³/h)" />
                </div>
                 <div className="print-block">
                    <LngSingleMetricChart data={results.chartData} dataKey="inletPressure" lineName="Inlet Pressure" strokeColor="#f43f5e" title="Required Inlet Pressure vs. Time" yAxisLabel="Pressure (bara)" />
                </div>
                <div className="print-block">
                    <LngSingleMetricChart data={results.chartData} dataKey="n2VentRate" lineName="N₂ Vent Rate" strokeColor="#8b5cf6" title="N₂ Venting Rate vs. Time" yAxisLabel="Vent Rate (Nm³/h)" />
                </div>
            </div>
        </div>
    );
};

export default LngPrintResults;