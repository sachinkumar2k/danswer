import React, { useEffect, useState } from 'react';
import { ClipboardCheckIcon, DownloadIcon, TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { CardFooter } from '@/components/ui/card';
import { ClickupIcon, DexpandTwoIcon, DownloadCSVIcon, ExpandTwoIcon, OpenIcon, PaintingIcon, PaintingIconSkeleton } from '@/components/icons/icons';
import { CustomTooltip, TooltipGroup } from '@/components/tooltip/CustomTooltip';
import { Modal } from '@/components/Modal';
import { ChartDataPoint, Data, PlotData } from './types';
// Assuming the JSON file is in the public folder



export function ModalChartWrapper({ children, plotDataJson }: { children: JSX.Element, plotDataJson: Data }) {

    const [expanded, setExpanded] = useState(false)
    const expand = () => {
        setExpanded(expanded => !expanded)
    }


    return (

        <>
            {expanded ?
                <Modal onOutsideClick={() => setExpanded(false)} className='animate-all ease-in !p-0'>
                    <ChartWrapper expand={expand} expanded={expanded} plotDataJson={plotDataJson}>
                        {/* <LineChartDisplay plotDataJson={plotDataJson} /> */}
                        {children}
                    </ChartWrapper>
                </Modal>
                :

                <ChartWrapper expand={expand} expanded={expanded} plotDataJson={plotDataJson}>
                    {/* <LineChartDisplay plotDataJson={plotDataJson} /> */}
                    {children}

                </ChartWrapper>
                // <CsvSection close={close} expanded={expanded} expand={expand} csvFileDescriptor={csvFileDescriptor} />
            }
        </>

    )
}
export function ChartWrapper({ expanded, children, plotDataJson, expand }: { expanded: boolean, children: JSX.Element, plotDataJson: Data, expand: () => void }) {
    return (
        <div className="bg-background-50 mt-24 rounded-lg shadow-md ">
            <div className="p-4">
                <div className='flex pb-2 items-center justify-between'>

                    <h2 className="text-xl font-semibold mb-2">{(plotDataJson).title}</h2>
                    <div className='flex gap-x-2'>
                        <TooltipGroup>
                            <CustomTooltip showTick line position='top' content="Download file">
                                <button
                                // onClick={() => downloadFile()}
                                >
                                    <DownloadCSVIcon className='cursor-pointer transition-colors duration-300 hover:text-neutral-800 h-6 w-6 text-neutral-400' />
                                </button>
                            </CustomTooltip>
                            <CustomTooltip line position='top' content={expanded ? "Minimize" : "Full screen"}>
                                <button onClick={() => expand()}>
                                    {!expanded ?
                                        <ExpandTwoIcon className='transition-colors duration-300 ml-4 hover:text-neutral-800 h-6 w-6 cursor-pointer text-neutral-400' />
                                        :
                                        <DexpandTwoIcon className='transition-colors duration-300 ml-4 hover:text-neutral-800 h-6 w-6 cursor-pointer text-neutral-400' />
                                    }
                                </button>
                            </CustomTooltip>
                            <CustomTooltip line position='top' content="No vis">
                                <button onClick={() => close()}>
                                    <OpenIcon className='transition-colors duration-300 ml-4 hover:text-neutral-800 h-6 w-6 cursor-pointer text-neutral-400' />
                                </button>
                            </CustomTooltip>
                        </TooltipGroup>

                        {/* <button className='group'>
                            <PaintingIconSkeleton className='h-4 w-4 group-hover:text-neutral-800 text-neutral-600' />
                        </button>
                        <button className='group'>
                            <DownloadCSVIcon className='h-4 w-4 group-hover:text-neutral-800 text-neutral-600' />
                        </button>
                        <button className='group'>
                            <ExpandTwoIcon className='h-4 w-4 group-hover:text-neutral-800 text-neutral-600' />
                        </button> */}

                    </div>
                </div>

                {/* <p className="text-sm text-gray-500 mb-4">{(plotDataJson).xlabel}</p> */}

                {children}
            </div>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">
                    Data from Matplotlib plot <TrendingUp className="h-4 w-4" />
                </div>
            </CardFooter>
        </div>

    )
}



export function LineChartDisplay({ plotDataJson }: { plotDataJson: PlotData }) {
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [chartConfig, setChartConfig] = useState<ChartConfig>({});

    useEffect(() => {
        const transformedData: ChartDataPoint[] = (plotDataJson as PlotData).data[0].x.map((x, index) => ({
            x: x,
            y: (plotDataJson as PlotData).data[0].y[index]
        }));

        setChartData(transformedData);

        const config: ChartConfig = {
            y: {
                label: (plotDataJson as PlotData).data[0].label,
                color: (plotDataJson as PlotData).data[0].color,
            }
        };

        setChartConfig(config);
    }, []);

    return (

        <div className="w-full h-full">
            <ChartContainer config={chartConfig}>
                <LineChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="x"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value: number) => value.toFixed(2)}
                    />
                    <YAxis
                        dataKey="y"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value: number) => value.toFixed(2)}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                        dataKey="y"
                        type="natural"
                        stroke={chartConfig.y?.color || "var(--chart-1)"}
                        strokeWidth={2}
                        dot={false}
                    />
                </LineChart>
            </ChartContainer>
        </div>

    )
}