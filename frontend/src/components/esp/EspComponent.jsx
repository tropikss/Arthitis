import GetAllRecordButton from "./GetAllRecordButton";
import SdRecordsList from "./SdRecordsList";
import SdDbDifferenceList from "./SdDbDifferenceList";
import { useEffect } from "react";
import { useBluetooth } from "../bluetooth/useBluetooth";

export default function EspComponent({}) {
  const { startGetAllSdRecords, isConnected } = useBluetooth();
  useEffect(() => {
    startGetAllSdRecords();
  }, []);
  return (
    <>
      {isConnected ? (
      <div>
        {/* <GetAllRecordButton /> */}
        <SdDbDifferenceList /> 
        <SdRecordsList />
      </div>) : (
      <div>
        <div className="font-bold text-xl mb-4 flex justify-center ">No connected device</div>
      </div>
      )}
    </>
  );
}