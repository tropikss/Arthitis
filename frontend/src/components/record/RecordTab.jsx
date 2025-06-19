import RecordButton from "./RecordButton";
import { useState } from "react";
import RecordSubject from "./RecordSubject";
import DisplayRecordTags from "./DisplayRecordTags";
import { useBluetooth } from '../bluetooth/useBluetooth';
import TestsListComponent from "../tests/TestsListComponent";
import DifferentTestComponent from "./DifferentTestComponent";

function RecordTab() {
    const [differentTest, setDifferentTest] = useState(null);
    const { isConnected, sendCommand, startRecordingCommand, stopRecordingCommand, isRecording, recordingState } = useBluetooth();
    const [recordingSubject, setRecordingSubject] = useState(null);
    const [recordingTags, setRecordingTags] = useState({
        inclinaison: null,
        speed: null,
        weighted: null
    });

    const verifyTags = () => {
        return Object.values(recordingTags).every(v => v !== null);
    }
            
    const handleButtonClick = () => {
        if (!recordingSubject || !verifyTags()) {
            console.log("Please select a subject and fill all tags before recording.");
            return;
        }

        if (!isRecording) {
            handleRecord();
        } else {
            handleStopRecording();
        }
    };

    const handleRecord = () => {
        startRecordingCommand(recordingSubject, recordingTags);
        console.log("Asked record start");
    }
    const handleStopRecording = () => {
        stopRecordingCommand();
        console.log("Asked record stop");
    }
return (
    <>
        <div className="flex flex-col h-full justify-center">
            <div className="basis-1/4 p-1 flex-col justify-center items-center space-y-1 rounded bg-gradient-to-b from-color5 to-color4 p-2">
                <div className="flex flex-row items-center space-x-2 w-full">
                    <RecordButton onClick={handleButtonClick} recordingState={recordingState} />
                    <RecordSubject isRecording={isRecording} recordingSubject={recordingSubject} setRecordingSubject={setRecordingSubject} />
                    <DifferentTestComponent differentTest={differentTest} />
                </div>
                    <div className='flex flex-row space-x-2'>
                    <div className='w-1/2'>
                        <DisplayRecordTags isRecording={isRecording} onChange={setRecordingTags} recordingTags={recordingTags} />
                    </div>
                    <div classname="w-1/2">
                        <div className='rounded bg-color3 p-2 text-center text-white h-full w-full' >
                            <TestsListComponent recordingSubject={recordingSubject} setDifferentTest={setDifferentTest}/> 
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
);
}

export default RecordTab;