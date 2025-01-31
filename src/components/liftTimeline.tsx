import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import { $telemetryRecords, $liftRecords, $recordSelection, liftRecordsDataset } from '../store/telemetryStore';

import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import zoomPlugin from 'chartjs-plugin-zoom';


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
    zoomPlugin

);

// No idea why 'mouseDown' is firing multiple times.
// Keep track of the last time the mouse was up to prevent another mouseDown
// until a second after the last mouseUp
let lastMouseUp: number | null = null;

const LiftTimeline: React.FC = () => {
    const telemetryRecords = useStore($telemetryRecords);
    const liftRecords = useStore($liftRecords);
    const recordedSelection = useStore($recordSelection);

    const records = telemetryRecords.filter((record) => record.climbRate !== undefined);

    // Single click on chart should clear zoom selection
    let mouseStartX: number | null = null;
    let mouseStartY: number | null = null;

    return (
        <div className='h-[100px]'>
            <Line
                width="100%"
                height={30}
                data={{
                    datasets: [
                        {
                            data: records.map((record) => (
                                { y: ((record.climbRate as number) / 100), x: record.micros }
                            )),
                            pointRadius: 0,
                            borderColor: 'gray'
                        },
                        {
                            label: 'climbs',
                            data: liftRecordsDataset(liftRecords),
                            borderColor: 'red',
                            borderWidth: 1,
                            pointRadius: 0,
                            fill: true,
                            backgroundColor: 'rgba(255, 0, 0, 0.2)',
                            yAxisID: "yClimb",
                            stepped: true,
                            showLine: false,

                        }

                    ],
                }}

                options={{
                    maintainAspectRatio: false,
                    animation: false,
                    events: ['mouseup', 'mousemove', 'mousedown', 'click'],
                    onHover: (event, chartElement, chart) => {
                        if(event.type == 'mousedown') {
                            mouseStartX = event.x;
                            mouseStartY = event.y;
                        }
                    },
                    onClick: (event, chartElement, chart) => {
                        if(mouseStartX == event.x && mouseStartY == event.y) {
                            $recordSelection.set(null);
                        }
                    },
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
                            annotations: recordedSelection ? [
                                {
                                    type: 'box',
                                    xMin: recordedSelection.start,
                                    xMax: recordedSelection.end,
                                    backgroundColor: 'rgba(0, 255, 0, 0.4)',
                                    borderColor: 'transparent',
                                }
                            ] : []
                        },
                        zoom: {
                            zoom: {
                                drag: {
                                    enabled: true,
                                    backgroundColor: 'rgba(0, 255, 0, 0.5)',
                                    borderColor: 'transparent',
                                    
                                },
                                mode: 'x',
                                onZoom: (event) => {
                                    const chart = event.chart;
                                    const { min: start, max: end } = chart.scales['x'];
                                    $recordSelection.set({ start, end });
                                    event.chart.resetZoom();
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            min: records[0]?.micros,
                            max: records[records.length - 1]?.micros,
                            ticks: {
                                display: false
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            type: 'linear',
                            grid: {
                                display: true,
                                color: (context) => context.tick.value === 0 ? 'rgba(0, 0, 0, 1)' : 'rgba(0, 0, 0, 0.1)',
                            }
                        },
                        yClimb: {
                            type: 'linear',
                            position: 'right',
                            display: false,
                            title: {
                                display: false,
                                text: 'Lifts',
                            },
                            min: 0,
                            max: 1,
                        }
                    }
                }}
            />
        </div>
    );
};

export default LiftTimeline;