export type BaseTelemetryRecord = {
    micros: number;
    gpsPosition?: {
        altitude: number;
        latitude: number;
        longitude: number;
    };
    temperatureHumidity?: {
        temperature: number;
        humidity: number;
    };
    baroPressureRaw?: {
        d1: number;
    };
    baroTemp?: {
        d2_t: number;
    };
    baroSensorCalibrations?: {
        c_sens: number;
        c_off: number;
        c_tcs: number;
        c_tco: number;
        c_tref: number;
        c_tempsens: number;
    };
    climbRate?: number;
    imuOrientation?: {
        q1: number;
        q2: number;
        q3: number;
        accuracy: number;
    };
    imuAcceleration?: {
        x: number;
        y: number;
        z: number;
        accuracy: number;
    };
};

export function parseTelemetryRecords(buffer: ArrayBuffer): BaseTelemetryRecord[] {
    const dataView = new DataView(buffer);
    let offset = 0;
    const records: BaseTelemetryRecord[] = [];

    const version = dataView.getUint32(offset, true);
    offset += 4;

    while (offset < buffer.byteLength) {
        const payloadHeader = dataView.getUint32(offset, true);
        offset += 4;

        const record: BaseTelemetryRecord = { micros: 0 };

        if (payloadHeader & (1 << 0)) {
            record.micros = dataView.getUint32(offset, true);
            offset += 4;
        }

        if (payloadHeader & (1 << 1)) {
            record.gpsPosition = {
                altitude: dataView.getInt32(offset, true),
                latitude: dataView.getFloat64(offset + 4, true),
                longitude: dataView.getFloat64(offset + 12, true),
            };
            offset += 20;
        }

        if (payloadHeader & (1 << 2)) {
            record.temperatureHumidity = {
                temperature: dataView.getInt32(offset, true),
                humidity: dataView.getInt32(offset + 4, true),
            };
            offset += 8;
        }

        if (payloadHeader & (1 << 3)) {
            record.baroPressureRaw = {
                d1: dataView.getInt32(offset, true),
            };
            offset += 4;
        }

        if (payloadHeader & (1 << 4)) {
            record.baroTemp = {
                d2_t: dataView.getInt32(offset, true),
            };
            offset += 4;
        }

        if (payloadHeader & (1 << 5)) {
            record.baroSensorCalibrations = {
                c_sens: dataView.getUint16(offset, true),
                c_off: dataView.getUint16(offset + 2, true),
                c_tcs: dataView.getUint16(offset + 4, true),
                c_tco: dataView.getUint16(offset + 6, true),
                c_tref: dataView.getUint16(offset + 8, true),
                c_tempsens: dataView.getUint16(offset + 10, true),
            };
            offset += 12;
        }

        if (payloadHeader & (1 << 6)) {
            record.climbRate = dataView.getInt32(offset, true);
            offset += 4;
        }

        if (payloadHeader & (1 << 7)) {
            record.imuOrientation = {
                q1: dataView.getFloat64(offset, true),
                q2: dataView.getFloat64(offset + 8, true),
                q3: dataView.getFloat64(offset + 16, true),
                accuracy: dataView.getInt16(offset + 24, true),
            };
            offset += 26;
        }

        if (payloadHeader & (1 << 8)) {
            record.imuAcceleration = {
                x: dataView.getInt16(offset, true),
                y: dataView.getInt16(offset + 2, true),
                z: dataView.getInt16(offset + 4, true),
                accuracy: dataView.getInt8(offset + 6),
            };
            offset += 7;
        }

        records.push(record);
    }

    return records;
}