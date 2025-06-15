import { useBluetooth } from '../bluetooth/useBluetooth';

function BLEConnectedBadge({}) {
    const {isConnected} = useBluetooth();
    return (
        <p>{isConnected ? 
            <span className="rounded-full bg-green-700 px-3 py-1 text-sm font-medium text-white">Connected</span>
            :<span className="rounded-full bg-red-800 px-3 py-1 text-sm font-medium text-white">Disconnected</span>}</p>
    );
}

export default BLEConnectedBadge;