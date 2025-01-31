import { atom } from 'nanostores';
import type { BaseTelemetryRecord } from '../telemetry';
import { GetTelemetry, type TelemetryRecord } from '../additionalTelemetry';

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

// Attribute to use for showing the Climb Rate
export const $climbRateAttribute = atom<string>('climbRate');

// Returns a chartjs dataset to show lifty periods on a graph
export function liftRecordsDataset(liftRecords: LiftPeriod[]) {
    const liftyDataset: { x: number, y: number }[] = [];
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

function updateLiftPeriods() {
    const allRecords = $telemetryRecords.get();
    const climbRateAttribute = $climbRateAttribute.get() as keyof TelemetryRecord;;
    
    const liftRecords: LiftPeriod[] = [];
    let currentLift: LiftPeriod | null = null;

    // Filter the records that have our attribute
    const records = allRecords.filter(record => record[climbRateAttribute] != undefined);

    for(let i = 1; i < records.length; i++) {
        const record = records[i];
        const prevRecord = records[i - 1];

        const climbRate = record[climbRateAttribute] as number | undefined;

        if (climbRate == undefined) {
            continue;
        }

        if (climbRate > 0) {
            if (!currentLift) {
                currentLift = { start: prevRecord.micros!, end: record.micros! };
            } else {
                currentLift.end = record.micros;
            }
        } else if (currentLift) {
            currentLift.end
            liftRecords.push(currentLift);
            currentLift = null;
        }
    }

    if (currentLift) {
        liftRecords.push(currentLift);
    }

    $liftRecords.set(liftRecords);
}

export function setTelemertryRecords(records: BaseTelemetryRecord[]) {
    $telemetryRecords.set(GetTelemetry(records));
    $recordSelection.set(null);
    updateLiftPeriods();
}

export function setClimbRateAttribute(attribute: string) {
    $climbRateAttribute.set(attribute);
    updateLiftPeriods();
}
