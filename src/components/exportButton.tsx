import { useStore } from "@nanostores/react";
import { $telemetryRecords } from "../stores/telemetryStore";
import { json2csv } from 'json-2-csv';

export type Props = {
    as: "json" | "csv"
}

const GraphicMap = {
    "json": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M4.998 7V1H19.5L23 4.5V23h-6m1-22v5h5M3 12s1-2 6-2s6 2 6 2v9s-1 2-6 2s-6-2-6-2zm0 5s2 2 6 2s6-2 6-2M3 13s2 2 6 2s6-2 6-2" /></svg>,
    "csv": <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M4.998 9V1H19.5L23 4.5V23H4M18 1v5h5M7 13H5c-1 0-2 .5-2 1.5v3c0 1 1 1.5 2 1.5h2m6.25-6h-2.5c-1.5 0-2 .5-2 1.5s.5 1.5 2 1.5s2 .5 2 1.5s-.5 1.5-2 1.5h-2.5m12.25-7v.5C20.5 13 18 19 18 19h-.5S15 13 15 12.5V12" /></svg>,
}

const Tooltips = {
    "json": "Download as JSON",
    "csv": "Download as CSV",
}

export default function ExportButton(props: Props) {
    const exportAs = props.as;

    const telemetryRecords = useStore($telemetryRecords);

    const handleJsonExport = () => {
        const data = JSON.stringify(telemetryRecords, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export.${exportAs}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleCsvExport = () => {
        const data = json2csv(telemetryRecords, {}).replaceAll("null", "").replaceAll("undefined", "");
        const blob = new Blob([data], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export.${exportAs}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return <button
        title={Tooltips[exportAs]}
        type="button"
        className=" ml-2 m-auto text-slate-200 bg-blue-900 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-1 py-2 me-2 mb-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
        onClick={() => {
            if (exportAs === "csv") {
                handleCsvExport();
            } else if (exportAs === "json") {
                handleJsonExport();
            }
        }}
    >
        {GraphicMap[exportAs]}
    </button>

}