import React, { useEffect, useState } from 'react';
import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

// Assuming the JSON file is in the public folder
import { ChartDataPoint, PolarChartDataPoint, PolarPlotData } from './types';


export function PolarChartDisplay({ plotDataJson }: { plotDataJson: PolarPlotData }) {
    const [chartData, setChartData] = useState<PolarChartDataPoint[]>([]);
    const [chartConfig, setChartConfig] = useState<ChartConfig>({});

    useEffect(() => {
        // Transform the JSON data to the format expected by the chart
        const transformedData: PolarChartDataPoint[] = (plotDataJson as PolarPlotData).data[0].theta.map((angle, index) => ({
            angle: angle * 180 / Math.PI,  // Convert radians to degrees
            radius: (plotDataJson as PolarPlotData).data[0].r[index]
        }));

        setChartData(transformedData);

        // Create the chart config from the JSON data
        const config: ChartConfig = {
            y: {
                label: plotDataJson.data[0].label,
                color: plotDataJson.data[0].color,
            }
        };

        setChartConfig(config);
    }, []);

    return (

        <CardContent>
            <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={400}>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="angle" type="number" domain={[0, 360]} />
                        <PolarRadiusAxis angle={30} domain={[0, (plotDataJson as PolarPlotData).rmax]} />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Radar
                            name="Polar Plot"
                            dataKey="radius"
                            stroke={chartConfig.y?.color || "var(--chart-1)"}
                            fill={chartConfig.y?.color || "var(--chart-1)"}
                            fillOpacity={0.6}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </ChartContainer>
        </CardContent>

    );
}

export default PolarChartDisplay;