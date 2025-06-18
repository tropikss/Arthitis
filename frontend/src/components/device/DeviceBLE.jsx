import BLEConnectedBadge from "./BLEConnectedBadge";
import BLESearchButton from "./BLESearchButton";
import DeviceLast from "./DeviceLast";

function DeviceState({}) {
    return (
      <>
        <div className='rounded-xl bg-color2 p-2'>
          <div className="h-1/4 flex justify-center items-center">BLE</div>
          <div className="h-3/4 flex">
            <div className="w-1/2 flex justify-center items-center"><BLEConnectedBadge /></div>
            <div className="w-1/2 flex justify-center items-center"><BLESearchButton /></div>
          </div>
        </div>
      </>
    );
}

export default DeviceState;