import React, { useEffect, useState } from "react";
import { useTests } from "../../api/test";
import { useBluetooth } from "../bluetooth/useBluetooth";
import IdList from "./IdList";

export default function SdDbDifferenceList() {
    const { sdRecords, sendDeleteCommand, startGetAllSdRecords } = useBluetooth();
    const { compareRecordIds, fetchTests, deleteTestByRecordId } = useTests();
    const [notInDb, setNotInDb] = useState([]);
    const [notOnSd, setNotOnSd] = useState([]);

    useEffect(() => {
        async function fetchDifferences() {
            const differences = await compareRecordIds(sdRecords);
            setNotInDb(differences.notInDb);
            setNotOnSd(differences.notOnSd);
        }
        fetchDifferences();
    }, [sdRecords]);

    const cleanNotInDb = async () => {
        console.log("Cleaning not in DB records");
        for (const id of notInDb) {
            await sendDeleteCommand(`${id}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        await startGetAllSdRecords();
    }

    const cleanNotInSd = async () => {
        console.log("Cleaning not on SD records");
        for (const id of notOnSd) {
            await deleteTestByRecordId(`${id}`);
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        await fetchTests();
    }

    return (
        <div className="flex justify-center h-full">
            <div className="basis-1/2 rounded-lg border p-3 m-1 h-full">
                <div className="font-bold text mb-1 flex justify-center">
                    <div className="w-3/4">
                        Not in DB
                    </div>
                    <div className ="w-1/4 flex justify-end"> 
                        <button type="button" onClick={cleanNotInDb} className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                            Clean
                        </button>
                    </div>
                </div>
                <IdList ids={notInDb} onClick={(id) => console.log(`Action for ${id}`)} />
            </div>
            <div className="basis-1/2 rounded-lg border p-3 m-1 h-full">
                <div className="font-bold text mb-1 flex justify-center">
                   <div className='3/4'>
                        Not in SD
                   </div> 
                    <div className ="w-1/4 flex justify-end"> 
                        <button type="button" onClick={cleanNotInSd} className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">
                            Clean
                        </button>
                    </div>
                </div>
                <IdList ids={notOnSd} onClick={(id) => console.log(`Action for ${id}`)} />
            </div>
        </div> 
    );
}