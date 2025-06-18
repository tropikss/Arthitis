import ExplorerToolbar from "./ExplorerToolbar";
import { useBluetooth } from "../bluetooth/useBluetooth";
import ListSubject from "./ListSubject";

function SubjectTab() {
    const {isConnected} = useBluetooth();
return (
    <div className='rounded-xl bg-gradient-to-b from-color5 to-color4 w-full h-full flex flex-col'>
        <div className='h-1/9 p-2'>
            <ExplorerToolbar />
        </div>
        <div className='divider'></div>
        <div className='flex-1 flex items-start justify-center overflow-auto max-h-full'>
            {isConnected ? (
                <div className='w-full'>
                    <ListSubject />
                </div>
            ) : (
                <div className='text-3xl font-bold h-30'>No connected device</div>
            )}
        </div>
    </div>
);
}

export default SubjectTab;