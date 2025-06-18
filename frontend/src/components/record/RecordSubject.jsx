import { useState } from "react";
import SubjectSelectionModal from "./SubjectSelectionModal";

export default function RecordSubject({ isRecording, recordingSubject, setRecordingSubject }) {
    const [modalOpen, setModalOpen] = useState(false);

    const handleClick = () => {
        if(isRecording) {
            console.log("Cannot change subject while recording");
        } else {
            setModalOpen(true);
            console.log("Open subject selection modal");
        }
    };

    // Define button classes based on whether a subject is selected
    const buttonClass = isRecording 
        ? "opacity-90 text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
        : recordingSubject
            ? "text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            : "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700";

    return (
        <>                 
            <button
                type="button"
                onClick={handleClick}
                className={buttonClass}
                disabled={isRecording}
                style={{ marginLeft: "4px", marginTop: "8px" }}
            >
                {recordingSubject ? recordingSubject.name : "Select Subject"}
            </button>
            {modalOpen && (
                <SubjectSelectionModal
                    onSelect={setRecordingSubject}
                    onClose={() => setModalOpen(false)}
                />
            )}
        </>
    );
}