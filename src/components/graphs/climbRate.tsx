import { Line } from 'react-chartjs-2';
import { $telemetryRecords, $liftRecords, $recordSelection, type LiftPeriod, liftRecordsDataset } from '../../stores/telemetryStore';

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { useStore } from '@nanostores/react';
import zoomPlugin from 'chartjs-plugin-zoom';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    zoomPlugin
);


export default function ClimbRateGraph() {
    const selection = useStore($recordSelection);
    const telemetryRecords = useStore($telemetryRecords);
    const liftRecords = useStore($liftRecords);

    const records = telemetryRecords.filter((record) => record.climbRate !== undefined);

    return <div className='h-[200px]'>
        <Line
            height={100}
            width="100%"
            data={{
                
                datasets: [
                    {
                        data: records.map((record) => ({x: record.micros, y: (record.climbRate as number) / 100})),
                        borderColor: 'gray',
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
                scales: {
                    x: {
                        type: 'linear',
                        position: 'bottom',
                        min: selection?.start,
                        max: selection?.end,
                    },
                    y: {
                        type: 'linear',
                        position: 'left',
                        grid: {
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
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        text: 'Hardware Climb Rate (m/s)',
                        display: true,
                    },
                    zoom: {
                        zoom: {
                            drag: {
                                enabled: true,
                                backgroundColor: 'green',
                            },
                            mode: 'x',
                            onZoomComplete: (event) => {
                                const chart = event.chart;
                                const {min: start, max: end} = chart.scales['x'];
                                $recordSelection.set({start, end});
                            }
                        }
                    }
                },
            }}
        />
    </div>;
}