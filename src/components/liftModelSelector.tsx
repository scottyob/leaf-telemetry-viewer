import { useStore } from "@nanostores/react";
import { $climbRateAttribute, setClimbRateAttribute } from "../stores/telemetryStore";

const ATTRIBUTE_TO_NAME = {
    "climbRate": "Hardware Telemetry Climb Rate",
    "dumbUnfilteredClimb": "Unfiltered Climb Rate (Dumb)",
}

export default function LiftModelSelector() {
    const climbRate = useStore($climbRateAttribute);

    return (
        <div>
            <label>Climb Rate Algorithm:</label>
            <select defaultValue={climbRate} style={{ padding: '8px', borderRadius: '4px' }} onChange={
                (e) => {
                    setClimbRateAttribute(e.target.value);
                }
            }>
                <option value="climbRate">Hardware Telemetry Climb Rate</option>
                <option value="dumbUnfilteredClimb">Dumb Unfiltered</option>
            </select>
        </div>
    );
}
