import type { BaseTelemetryRecord } from "../telemetry";
import type { AdditionDataSource } from "./additionDataSource";

/*
    Function is an implementation of the barometric altitude calculation
    in baro.cpp as of 2025-01-31.
*/
export function CalcBaroPressure(records: BaseTelemetryRecord[]): AdditionDataSource {
    // First find the latest baro calibration record
    const calibrationRecordEntry = records.findLast((record) => record.baroSensorCalibrations);
    if (!calibrationRecordEntry) {
        console.log("Error, no baro calibration record found");
        return [];
    }
    const calibrationRecord = calibrationRecordEntry.baroSensorCalibrations!;

    let D2_T = 0; // Last temperature reading

    const pressureReadings: AdditionDataSource = [];

    // For each record with baroPressure, calculate the altitude
    records.forEach((record) => {
        // Update the temperature recording if one is available
        if (record.baroTemp?.d2_t) {
            D2_T = record.baroTemp.d2_t;
        }

        // Skip records without baroPressure
        if (!record.baroPressureRaw) {
            return;
        }

        // Last Baro pressure reading
        const D1_P = record.baroPressureRaw.d1;

        // calculate temperature (in 100ths of degrees C, from -4000 to 8500)
        const dT = D2_T - calibrationRecord.c_tref * 256;
        let TEMP = 2000 + (dT * calibrationRecord.c_tempsens) / Math.pow(2, 23);

        // calculate sensor offsets to use in pressure & altitude calcs
        let OFF1 = calibrationRecord.c_off * Math.pow(2, 16) + (calibrationRecord.c_tco * dT) / Math.pow(2, 7);
        let SENS1 = calibrationRecord.c_sens * Math.pow(2, 15) + (calibrationRecord.c_tcs * dT) / Math.pow(2, 8);

        // low temperature compensation adjustments
        let TEMP2 = 0;
        let OFF2 = 0;
        let SENS2 = 0;
        if (TEMP < 2000) {
            TEMP2 = Math.pow(dT, 2) / Math.pow(2, 31);
            OFF2 = 5 * Math.pow((TEMP - 2000), 2) / 2;
            SENS2 = 5 * Math.pow((TEMP - 2000), 2) / 4;
        }
        // very low temperature compensation adjustments
        if (TEMP < -1500) {
            OFF2 = OFF2 + 7 * Math.pow((TEMP + 1500), 2);
            SENS2 = SENS2 + 11 * Math.pow((TEMP + 1500), 2) / 2;
        }
        TEMP = TEMP - TEMP2;
        OFF1 = OFF1 - OFF2;
        SENS1 = SENS1 - SENS2;

        // Filter Temp if necessary due to noise in values
        // baro.temp = TEMP;  // TODO: actually filter if needed

        // calculate temperature compensated pressure (in 100ths of mbars)
        const pressure = (D1_P * SENS1 / Math.pow(2, 21) - OFF1) / Math.pow(2, 15);
        pressureReadings.push({ x: record.micros, y: pressure })
    });

    return pressureReadings;
}