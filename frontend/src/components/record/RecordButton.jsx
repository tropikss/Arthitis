import { useState } from "react";
import RecordAnimation from "./RecordAnimation";

function RecordButton({ onClick, recordingState }) {
  // Helper booleans for clarity
  const isAllocating = recordingState === "ALLOCATING";
  const isRecording = recordingState === "RECORDING_STARTED";
  const isStopped = recordingState === "RECORDING_STOPPED";
  const isSaved = recordingState === "RECORD_SAVED";

  return (
    <div className="flex items-center space-x-4">
      <button
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow disabled:opacity-50"
        onClick={onClick}
        disabled={isAllocating || isStopped}
      >
        {isAllocating && (
          <span className="flex items-center">
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
            Allocation...
          </span>
        )}
        {isRecording && "Stop"}
        {isStopped && "Saving..."}
        {isSaved && "Record"}
        {!isAllocating && !isRecording && !isStopped && !isSaved && "Record"}
      </button>
      {(isRecording || isStopped) && (
        <RecordAnimation paused={isStopped} />
      )}
      {isSaved && (
        <span className="text-green-600 font-medium ml-2">Recording saved!</span>
      )}
    </div>
  );
}

export default RecordButton;