import type { TelemetryRecord } from "../additionalTelemetry";
import type { AdditionDataSource } from "./additionDataSource";

/*
    Function is an implementation of the barometric altitude calculation
    in baro.cpp as of 2025-01-31.
*/
export function DumbUnfilteredClimb(altitudeRecords: AdditionDataSource): AdditionDataSource {
    // We need at least two records to calculate climbs
    if (altitudeRecords.length < 2) {
        return [];
    }

    let ret = [];
    for (let i = 1; i < altitudeRecords.length; i++) {
        // Caluclate the climb rate in m/s, given filteredRecords has baroAltitude in cm
        // and a micros timestamp in microseconds
        const climbRate = ((altitudeRecords[i].y) - (altitudeRecords[i - 1].y)) / (altitudeRecords[i].x - altitudeRecords[i - 1].x) * 100;
        ret.push({
            x: altitudeRecords[i].x,
            y: climbRate,
        });
    }
    return ret;
}
