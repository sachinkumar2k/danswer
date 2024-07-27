import React, { useEffect, useState } from 'react';
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

interface BarPlotData {
    data: Array<{
        [key: string]: number | string;
    }>;
    title: string;
    xLabel: string;
    yLabel: string;
    config: {
        [key: string]: {
            label: string;
            color: string;
        };
    };
}


export function BarChartDisplay({ barPlotJson }: { barPlotJson: BarPlotData }) {
    const [chartData, setChartData] = useState<any[]>([]);
    const [chartConfig, setChartConfig] = useState<ChartConfig>({});

    useEffect(() => {
        setChartData(barPlotJson.data);
        setChartConfig(barPlotJson.config);
    }, []);

    const dataKeys = Object.keys(chartConfig);

    return (

        <CardContent>
            <ChartContainer config={chartConfig}>
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey={barPlotJson.xLabel.toLowerCase()}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value: number) => value.toFixed(0)}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent />}
                    />
                    {dataKeys.map((key, index) => (
                        <Bar
                            key={index}
                            dataKey={key}
                            fill={chartConfig[key].color}
                            radius={[4, 4, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ChartContainer>
        </CardContent>



    );
}

export default BarChartDisplay;