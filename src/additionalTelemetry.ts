import { CalcBaroPressure } from './dataSources/baroPressure';
import { DumbUnfilteredClimb } from './dataSources/dumbUnfilteredClimb';
import type { BaseTelemetryRecord } from './telemetry';

// This file is to process any additional telemetry records that are not logged by hardware.
// Useful for implementing new algorithms

export type TelemetryRecord = BaseTelemetryRecord & {
    // 100ths of mbars
    baroPressure?: number,

    // Altitude in cm
    baroAltitude?: number

    // ### Additional climb rate attributes
    
    // In m/s
    dumbUnfilteredClimb?: number
};

export function GetTelemetry(hardwareRecords: BaseTelemetryRecord[]): TelemetryRecord[] {
    const baroPressureRecords = CalcBaroPressure(hardwareRecords);

    // calculate altitude in cm
    const baroAltitude = baroPressureRecords.map(r => ({
        x: r.x,
        y: 4433100.0 * (1.0 - Math.pow(r.y / 101325.0,
            (.190264)))
    }));

    return [
        ...hardwareRecords, 
        ...baroAltitude.map(a => ({ micros: a.x, baroAltitude: a.y })),
        ...baroPressureRecords.map(a => ({ micros: a.x, baroPressure: a.y })),
        ...DumbUnfilteredClimb(baroAltitude).map(r => ({ micros: r.x, dumbUnfilteredClimb: r.y })),
    ].sort((a, b) => a.micros - b.micros);
} 