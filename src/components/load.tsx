import { useRef } from 'react';
import { parseTelemetryRecords } from '../telemetry';
import { setTelemertryRecords } from '../store/telemetryStore';

export default function LoadButton() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <button
                type="button"
                onClick={handleButtonClick}
                className="m-auto text-slate-200 bg-blue-900 border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-1 py-2 me-2 mb-1 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="#00ff03" d="M8 12h4V6h3l-5-5l-5 5h3zm11.338 1.532c-.21-.224-1.611-1.723-2.011-2.114A1.5 1.5 0 0 0 16.285 11h-1.757l3.064 2.994h-3.544a.27.27 0 0 0-.24.133L12.992 16H7.008l-.816-1.873a.28.28 0 0 0-.24-.133H2.408L5.471 11H3.715c-.397 0-.776.159-1.042.418c-.4.392-1.801 1.891-2.011 2.114c-.489.521-.758.936-.63 1.449l.561 3.074c.128.514.691.936 1.252.936h16.312c.561 0 1.124-.422 1.252-.936l.561-3.074c.126-.513-.142-.928-.632-1.449" /></svg>
            </button>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(event) => {
                    if (event.target.files) {
                        const file = event.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const result = e.target?.result as ArrayBuffer;
                            const records = parseTelemetryRecords(result as ArrayBuffer);
                            console.log(records);

                            // Set the records in the store
                            setTelemertryRecords(records);
                        };
                        reader.readAsArrayBuffer(file);
                    }
                }}
            />
        </>
    );
}