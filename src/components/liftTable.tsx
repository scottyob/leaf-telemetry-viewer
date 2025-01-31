import React, { useEffect, useState } from 'react';
import { $liftRecords } from '../store/telemetryStore';
import { useStore } from '@nanostores/react';

export default function LiftTable() {
    const liftRecords = useStore($liftRecords);


    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Duration (seconds)</th>
                    </tr>
                </thead>
                <tbody>
                    {liftRecords.map((event, i) => (
                        <tr key={i}>
                            <td>{event.start}</td>
                            <td>{((event.end - event.start) / 1000000.0).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
