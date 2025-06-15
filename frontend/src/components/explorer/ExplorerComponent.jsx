import ExplorerToolbar from "./ExplorerToolbar";
import { useBluetooth } from "../bluetooth/useBluetooth";
import ListSubject from "./ListSubject";

function ExplorerComponent() {
    const {isConnected} = useBluetooth();
return (
    <div className='rounded-xl bg-gradient-to-b from-color5 to-color4 w-full h-full'>
        <div className='h-1/6 p-2'>
            <ExplorerToolbar />
        </div>
        <div className='divider'></div>
        <div className='h-5/6 flex items-center justify-center'>
            <div>
                {!isConnected ? (
                    <ListSubject />
                ) : (
                    <div className='text-3xl font-bold h-30'>No connected device</div>
                )}
            </div>
        </div>
    </div>
);
}

export default ExplorerComponent;