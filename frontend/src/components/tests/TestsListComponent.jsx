
import { useEffect } from "react";
import { useTests } from "../../api/test"
import TestComponent from "./TestComponent";
import { useState } from "react";
import DeleteTestConfirmation from "./DeleteTestConfirmation";
import { useBluetooth } from '../bluetooth/useBluetooth';

export default function TestsListComponent({recordingSubject, setDifferentTest}) {
    const { deleteTest } = useTests();
    const [toDeleteTest, setToDeleteTest] = useState(false);
    const { fetchTestsBySubject, selectedSubjectTests } = useTests();
    const { recordingState } = useBluetooth();

    const updateTests = async() => {
        if (recordingSubject) {
            fetchTestsBySubject(recordingSubject.id);
        }
    }

    useEffect(() => {
        updateTests();
    }, [recordingState]);

    useEffect(() => {
        updateTests();
    }, [recordingSubject]);

    useEffect(() => {
        setDifferentTest(countDifferentTests);
    }, [selectedSubjectTests]);

    const countDifferentTests = () => {
        if (!selectedSubjectTests) return 0;

        const seen = [];

        for (let i = 0; i < selectedSubjectTests.length; i++) {
            const current = selectedSubjectTests[i].tags;

            const alreadyExists = seen.some(t =>
                t.inclinaison === current.inclinaison &&
                t.weighted === current.weighted &&
                t.speed === current.speed
            );

            if (!alreadyExists) {
                seen.push(current);
            }
        }
        return seen.length;
    };


    const handleDeleteTest = async() => {
        await deleteTest(toDeleteTest.id)
        setToDeleteTest(false);
        updateTests();
    }

    return (
        <>
        {recordingSubject ? (
            <div className="relative overflow-x-auto overflow-y-auto max-h-90">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-4 py-3">
                                Inclinaison (%)
                            </th>
                            <th scope="col" className="px-4 py-3">
                                Vitesse (km/h)
                            </th>
                            <th scope="col" className="px-4 py-3">
                                Lesté
                            </th>
                            <th scope="col" className="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                    {selectedSubjectTests && selectedSubjectTests.length > 0 ? (
                        selectedSubjectTests.map((test) => (
                            <TestComponent key={test.id} test={test} onDelete={setToDeleteTest}/>
                        ))
                    
                    ) : (
                        <tr>
                            <th className="px-6 py-4">
                                No tests available for this subject
                            </th>
                        </tr>
                        )}
                    </tbody>
                </table> 
            </div>
        ) : (
            <div className="text-center text-gray-500">No subject selected</div>
        )}
        {toDeleteTest != false && (
            <DeleteTestConfirmation 
                subject={toDeleteTest} 
                onCancel={() => setToDeleteTest(false)} 
                onConfirm={() => {
                    handleDeleteTest();
                }} 
            />
        )}
        </>
    );
}