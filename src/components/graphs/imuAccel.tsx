import { Line } from 'react-chartjs-2';
import { $telemetryRecords, $liftRecords, $recordSelection, type LiftPeriod, liftRecordsDataset } from '../../store/telemetryStore';

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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
);


export default function AccelGraph() {
    const selection = useStore($recordSelection);
    const telemetryRecords = useStore($telemetryRecords);
    const liftRecords = useStore($liftRecords);

    const records = telemetryRecords.filter((record) => record.imuAcceleration !== undefined);

    return <div className='h-[200px]'>
        <Line
            height={100}
            width="100%"
            data={{
                
                datasets: [
                    {
                        label: 'Accel X',
                        data: records.map((record) => ({x: record.micros, y: (record?.imuAcceleration?.x as number) / 100})),
                        borderColor: 'red',
                    },
                    {
                        label: 'Accel Y',
                        data: records.map((record) => ({x: record.micros, y: (record?.imuAcceleration?.y as number) / 100})),
                        borderColor: 'green',
                    },
                    {
                        label: 'Accel Z',
                        data: records.map((record) => ({x: record.micros, y: (record?.imuAcceleration?.z as number) / 100})),
                        borderColor: 'blue',
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
                        text: 'Accelerometer',
                        display: true,
                    }
                },
            }}
        />
    </div>;
}