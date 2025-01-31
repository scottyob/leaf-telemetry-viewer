import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $telemetryRecords, $liftRecords, $recordSelection } from '../store/telemetryStore';

import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    annotationPlugin,
);

// No idea why 'mouseDown' is firing multiple times.
// Keep track of the last time the mouse was up to prevent another mouseDown
// until a second after the last mouseUp
let lastMouseUp: number | null = null;

const LiftTimeline: React.FC = () => {
    const telemetryRecords = useStore($telemetryRecords);
    const liftRecords = useStore($liftRecords);

    const records = telemetryRecords.filter((record) => record.climbRate !== undefined);

    const [p1, setP1] = useState<number | undefined>(undefined);
    const [highlightedMin, setHighlightedMin] = useState<number | undefined>(undefined);
    const [highlightedMax, setHighlightedMax] = useState<number | undefined>(undefined);

    const annotations = liftRecords.map((lift) => {

        // Lift.start and lift.end are in microseconds
        // Work out the index of the start and end points
        const startIndex = records.findIndex((record) => record.micros >= lift.start);
        const endIndex = records.findIndex((record) => record.micros >= lift.end);

        return {
            type: 'box' as "box",
            xMin: startIndex,
            xMax: endIndex,
            backgroundColor: 'rgba(255, 99, 132, 0.25)',
            borderColor: 'transparent',

        }
    });

    if (highlightedMax && highlightedMin) {
        annotations.push({
            type: "box" as "box",
            xMin: highlightedMin,
            xMax: highlightedMax,
            backgroundColor: 'rgba(0, 255, 0, 0.4)',
            borderColor: 'transparent',

        });
    }

    return (
        <div className='h-[100px]'>
            <Line
                width="100%"
                height={30}
                data={{
                    labels: records.map((record) => record.micros),
                    datasets: [
                        {
                            data: records.map((record) => ((record.climbRate as number) / 100)),
                            pointRadius: 0,
                            borderColor: 'gray'
                        },
                    ],
                }}

                options={{
                    maintainAspectRatio: false,
                    animation: false,
                    events: ['mouseup', 'mousemove', 'mousedown'],
                    onHover: (event, chartElement, chart) => {
                        if (event.type == 'mousedown' && !p1) {
                            // Only work on a mouseDown after a second of the last mouse up
                            if (lastMouseUp && Date.now() - lastMouseUp < 100) {
                                return;
                            }

                            console.log('mousedown');
                            setP1(chart.scales.x.getValueForPixel(event.x as number));
                            setHighlightedMax(undefined);
                            setHighlightedMin(undefined);
                        } else if (event.type == 'mousemove' && p1) {
                            const p2 = (chart.scales.x.getValueForPixel(event.x as number));
                            // p1 and p2 should go into highlightedMin and highlightedMax
                            if (p2 && p2 > p1) {
                                setHighlightedMin(p1);
                                setHighlightedMax(p2);
                            } else {
                                setHighlightedMin(p2);
                                setHighlightedMax(p1);
                            }

                        } else if (event.type == 'mouseup') {
                            lastMouseUp = Date.now();
                            setP1(undefined);

                            if(highlightedMin == highlightedMax) {
                                console.log('clearing');
                                $recordSelection.set(null);
                                return;
                            }

                            // Find the us start and end of the highlighted region
                            const usStart = records[highlightedMin as number].micros;
                            const usEnd = records[highlightedMax as number].micros;

                            // Find the indexes that correspond to this in the telemetryRecords array
                            const startIndex = telemetryRecords.findIndex((record) => record.micros >= usStart);
                            const endIndex = telemetryRecords.findIndex((record) => record.micros >= usEnd);
                            
                            $recordSelection.set({ start: telemetryRecords[startIndex].micros, end: telemetryRecords[endIndex].micros });
                        }
                    },
                    // hover: {
                    //     mode: "nearest",
                    //     intersect: false,                        
                    // },
                    interaction: {
                        mode: 'index'
                    },
                    plugins: {
                        tooltip: {
                            enabled: false,
                        },
                        legend: {
                            display: false,
                        },
                        title: {
                            display: true,
                            text: 'Climb Rate (m/s)'
                        },
                        annotation: {
                            annotations: annotations
                        },

                    },
                    scales: {
                        x: {
                            ticks: {
                                display: false
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            grid: {
                                display: true,
                                color: (context) => context.tick.value === 0 ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.1)',
                            }
                        }
                    }
                }}
            />
        </div>
    );
};

export default LiftTimeline;