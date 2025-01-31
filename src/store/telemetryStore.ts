import { atom } from 'nanostores';
import type { TelemetryRecord } from '../telemetry';

export type LiftPeriod = {
    start: number;
    end: number;
}

export type RecordSelection = {
    start: number;
    end: number;
};

export const $telemetryRecords = atom<TelemetryRecord[]>([]);
export const $liftRecords = atom<LiftPeriod[]>([]);
export const $recordSelection = atom<RecordSelection | null>(null);

// Returns a chartjs dataset to show lifty periods on a graph
export function liftRecordsDataset(liftRecords: LiftPeriod[]) {
    const liftyDataset: {x: number, y: number}[] = [];
    liftRecords.forEach(lift => {
        liftyDataset.push({
            x: lift.start,
            y: 1,
        });
        liftyDataset.push({
            x: lift.end,
            y: 0,
        });
    });
    return liftyDataset;
}

export function setTelemertryRecords(records: TelemetryRecord[]) {
    $telemetryRecords.set(records);
    $recordSelection.set(null);

    // Calculate lift periods
    const liftRecords: LiftPeriod[] = [];
    let currentLift: LiftPeriod | null = null;

    for (let i = 0; i < records.length; i++) {
        const record = records[i];

        if(record.climbRate == undefined) {
            continue;
        }

        // If we're not in a climb, and there's no lift in progress, skip
        if(record.climbRate <= 0 && !currentLift) {
            continue;
        }

        // If there's no lift in progress, start a new one
        if(!currentLift) {
            currentLift = { start: record.micros!, end: record.micros! };
        }

        // If we're no longer in a climb, end the lift record
        if(record.climbRate <= 0) {
            currentLift.end = record.micros;
            liftRecords.push(currentLift);
            currentLift = null;
        }
    }

    // Update the store
    $liftRecords.set(liftRecords);
}

