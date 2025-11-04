import React from 'react';
import { CalculationResults, TimeSeriesProfilePoint } from '../types.ts';
import { Area, AreaChart, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface CooldownPrintResultsProps {
  results: CalculationResults;
  theme: 'light' | 'dark';
}

const formatNumber = (num: number | undefined, digits = 2) => {
    if (num === undefined || isNaN(num)) return 'N/A';
    return num.toLocaleString(undefined, { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const CustomTooltip = ({ active, payload, label, yAxisLabel, xAxisLabel }: any) => {
    if (active && payload && payload.length) {
        const unit = yAxisLabel.match(/\(([^)]+)\)/)?.[1] || '';
        const xUnit = xAxisLabel.match(/\(([^)]+)\)/)?.[1] || '';
        return (
            <div className="p-2 bg-white/80 border border-gray-300 rounded-md shadow-lg backdrop-blur-sm">
                <p className="label text-sm text-gray-700 font-semibold">{`${xAxisLabel.split(' ')[0]}: ${formatNumber(label, 2)} ${xUnit}`}</p>
                {payload.map((entry: any, index: number) => (
                  <p key={`item-${index}`} className="intro text-sm" style={{ color: entry.color }}>
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
    // Dark theme is kept for reference but not used in print
    dark: { 
        temperature: '#818CF8', n2Flow: '#F472B6', n2Accumulated: '#34D399', 
        heatRemovedAccumulated: '#4ADE80', heatAddedAccumulated: '#FB923C', 
        q_accumulation: '#F87171', pressure_bar: '#F0ABFC', q_removed: '#67E8F9', 
        q_convection: '#7DD3FC', q_radiation: '#FDBA74',
        heatAddedConvectionAccumulated: '#7DD3FC', heatAddedRadiationAccumulated: '#FDBA74'
    }
}

const SingleMetricChart: React.FC<{
    data: any[];
    dataKey: keyof typeof chartColors['light'];
    title: string;
    yAxisLabel: string;
    referenceLine?: { y: number; label: string };
    totalTime: number;
}> = ({ data, dataKey, title, yAxisLabel, referenceLine, totalTime }) => {
    const gridStrokeColor = '#E2E8F0';
    const textColor = '#374151';
    const strokeColor = chartColors['light'][dataKey] || '#8884d8';
    const refLineColor = '#EF4444';
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
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">{title}</h3>
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
                        <Line type="monotone" dataKey={dataKey} name={lineName} stroke={strokeColor} dot={false} strokeWidth={2} isAnimationActive={false} />
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
    pipeLength: number;
}> = ({ data, targetTemp, title, pipeLength }) => {
    const gridStrokeColor = '#E2E8F0';
    const textColor = '#374151';
    const refLineColor = '#EF4444';
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
        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
            <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">{title}</h3>
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
                            domain={[0, pipeLength]}
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
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
                            isAnimationActive={false}
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

const CooldownPrintResults: React.FC<CooldownPrintResultsProps> = ({ results }) => {
    const MetricCard: React.FC<{ title: string; value: string; unit: string; valueClassName?: string; small?: boolean }> = ({ title, value, unit, valueClassName, small = false }) => (
        <div className="bg-gray-100/50 p-4 rounded-lg shadow-sm">
            <h3 className={`${small ? 'text-sm' : 'text-md'} font-medium text-gray-600`}>{title}</h3>
            <p className={`${small ? 'text-2xl' : 'text-3xl'} font-bold ${valueClassName || 'text-gray-900'}`}>
                {value} <span className="text-base font-normal text-gray-500">{unit}</span>
            </p>
        </div>
    );
    
    const N2ConsumptionMetricCard: React.FC<{ title: string; value: string; unit: string; }> = ({ title, value, unit }) => (
        <div className="bg-gray-100/50 p-3 rounded-lg text-center">
            <h3 className="text-sm font-medium text-gray-600">{title}</h3>
            <p className="text-xl font-bold text-gray-900">
                {value} <span className="text-sm font-normal text-gray-500">{unit}</span>
            </p>
        </div>
    );

    const peakRate = results.peakCooldownRate;
    const cooldownRateLimit = results.inputs.cooldownRateLimit;
    const isRateSafe = peakRate <= cooldownRateLimit;
    const cooldownRateColorClass = isRateSafe ? 'text-green-600' : 'text-red-500';

    return (
        <div className="space-y-12">
            <div className="space-y-8 print-block">
                <h2 className="text-2xl font-bold text-gray-800">Overview Summary</h2>
                <div className="grid grid-cols-2 gap-6">
                    <MetricCard title="Cooldown Time" value={formatNumber(results.totalTimeHours)} unit="hours" />
                    <MetricCard 
                      title="Peak Cooldown Rate" 
                      value={formatNumber(peakRate, 1)} 
                      unit="°C/hr" 
                      valueClassName={cooldownRateColorClass}
                    />
                </div>
            </div>
      
            <div className="space-y-8 print-block">
                <h2 className="text-2xl font-bold text-gray-800">N₂ Consumption Breakdown</h2>
                <div className="grid grid-cols-4 gap-4">
                   <N2ConsumptionMetricCard title="N₂ for Purge" value={formatNumber(results.n2ForPurgeNm3, 0)} unit="Nm³" />
                   <N2ConsumptionMetricCard title="N₂ for Cooldown" value={formatNumber(results.n2ForCooldownNm3, 0)} unit="Nm³" />
                   <N2ConsumptionMetricCard title="N₂ for Hold Periods" value={formatNumber(results.n2ForHoldsNm3, 0)} unit="Nm³" />
                   <N2ConsumptionMetricCard title="N₂ for Preservation" value={formatNumber(results.n2ForPreservationNm3, 0)} unit="Nm³" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                    <MetricCard title="Sub-Total N₂" value={formatNumber(results.subTotalN2Nm3, 0)} unit="Nm³" />
                    <MetricCard title="Operational Margin" value={formatNumber(results.operationalMarginNm3, 0)} unit={`Nm³ (${results.inputs.operationalMarginPercent}%)`} />
                </div>
                <div className="bg-indigo-100 p-4 rounded-lg border border-indigo-200">
                   <MetricCard 
                      title="Grand Total N₂ Consumption" 
                      value={formatNumber(results.grandTotalN2Nm3, 0)} 
                      unit="Nm³" 
                      valueClassName="text-indigo-600"
                  />
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 print-block">
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Heat Ingress Summary</h2>
                    <MetricCard title="Total Heat Ingress" value={formatNumber(results.totalHeatIngressMJ)} unit="MJ" small />
                    <MetricCard title="Convective Ingress" value={formatNumber(results.totalHeatIngressConvectionMJ)} unit="MJ" small />
                    <MetricCard title="Radiative Ingress" value={formatNumber(results.totalHeatIngressRadiationMJ)} unit="MJ" small />
                </div>
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">N₂ Cooldown Heat Removal</h2>
                    <MetricCard title="Total Heat Removed" value={formatNumber(results.totalHeatRemovedMJ)} unit="MJ" small />
                    <MetricCard title="Peak Cooling Power" value={formatNumber(results.peakHeatRemovalkW)} unit="kW" small />
                </div>
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-800">Pipe Summary</h2>
                    <MetricCard title="Pipe Mass" value={formatNumber(results.pipeMass, 0)} unit="kg" small />
                    <MetricCard title="Pipeline Volume" value={formatNumber(results.pipeVolume)} unit="m³" small />
                    <MetricCard title="Pipe Cross-Section Area" value={formatNumber(results.pipeCrossSectionArea * 10000, 1)} unit="cm²" small />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8 pt-8">
                <div className="print-block">
                    <DynamicProfileChart 
                        data={results.timeSeriesProfile}
                        targetTemp={results.targetTemp}
                        title="Dynamic Cooldown Temperature Profile"
                        pipeLength={results.pipeLength}
                    />
                </div>
                <div className="print-block">
                    <SingleMetricChart 
                        data={results.chartData}
                        dataKey="temperature"
                        title="Pipe Wall Skin Temperature vs. Time"
                        yAxisLabel="Temperature (°C)"
                        totalTime={results.totalTimeHours}
                    />
                </div>
                <div className="print-block">
                     <SingleMetricChart 
                        data={results.chartData}
                        dataKey="n2Flow"
                        title="Nitrogen Flow Rate vs. Time"
                        yAxisLabel="N₂ Flow (Nm³/h)"
                        referenceLine={{ y: results.maxN2Flow, label: `Max: ${results.maxN2Flow}` }}
                        totalTime={results.totalTimeHours}
                    />
                </div>
                <div className="print-block">
                     <SingleMetricChart 
                        data={results.chartData}
                        dataKey="n2Accumulated"
                        title="Accumulated N₂ Consumption vs. Time"
                        yAxisLabel="Total N₂ (Nm³)"
                        totalTime={results.totalTimeHours}
                    />
                </div>
                 <div className="print-block">
                    <SingleMetricChart 
                        data={results.chartData}
                        dataKey="pressure_bar"
                        title="Pipeline Inlet Pressure vs. Time"
                        yAxisLabel="Inlet Pressure (bara)"
                        totalTime={results.totalTimeHours}
                    />
                </div>
                <div className="print-block">
                    <SingleMetricChart 
                        data={results.chartData}
                        dataKey="heatRemovedAccumulated"
                        title="Accumulated Heat Removed by N₂ vs. Time"
                        yAxisLabel="Energy (MJ)"
                        totalTime={results.totalTimeHours}
                    />
                </div>
                <div className="print-block">
                    <SingleMetricChart 
                        data={results.chartData}
                        dataKey="heatAddedAccumulated"
                        title="Accumulated Heat Ingress vs. Time"
                        yAxisLabel="Energy (MJ)"
                        totalTime={results.totalTimeHours}
                    />
                </div>
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner print-block">
                    <h3 className="text-md font-semibold text-gray-800 mb-4 text-center">Accumulated Heat Ingress Components vs. Time</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={results.chartData} margin={{ top: 5, right: 20, left: 25, bottom: 25 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis 
                                    type="number"
                                    dataKey="time" 
                                    stroke="#374151" 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => formatNumber(value, 1)}
                                    label={{ value: "Time (hr)", position: 'insideBottom', dy: 10, fill: "#374151", fontSize: 14 }}
                                    domain={[0, results.totalTimeHours]}
                                    allowDataOverflow={true}
                                />
                                <YAxis 
                                    label={{ value: "Energy (MJ)", angle: -90, position: 'insideLeft', fill: "#374151", fontSize: 14 }} 
                                    stroke="#374151" 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => typeof value === 'number' ? formatNumber(value, 1) : value}
                                />
                                <Tooltip
                                    content={<CustomTooltip yAxisLabel={"Energy (MJ)"} xAxisLabel={"Time (hr)"} />}
                                />
                                <Legend verticalAlign="top" height={36} wrapperStyle={{fontSize: "14px"}}/>
                                <Area 
                                    type="monotone" 
                                    dataKey="heatAddedConvectionAccumulated" 
                                    name="Convective" 
                                    stackId="1" 
                                    stroke={chartColors['light'].q_convection} 
                                    fill={chartColors['light'].q_convection} 
                                    fillOpacity={0.6}
                                    isAnimationActive={false}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="heatAddedRadiationAccumulated" 
                                    name="Radiative" 
                                    stackId="1" 
                                    stroke={chartColors['light'].q_radiation} 
                                    fill={chartColors['light'].q_radiation}
                                    fillOpacity={0.6}
                                    isAnimationActive={false}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CooldownPrintResults;