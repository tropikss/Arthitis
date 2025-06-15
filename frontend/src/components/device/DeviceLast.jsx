import React from "react";

import { useBluetooth } from "../bluetooth/useBluetooth";

function DeviceLast({  }) {
    const { connect, device, isConnected, disconnect } = useBluetooth();
    
    return (
        <div className="device-last">
        {device ? (
            <div>
            <p>Name: {device.name}</p>
            </div>
        ) : (
            <p>No device connected</p>
        )}
        
        </div>
    );
}

export default DeviceLast;