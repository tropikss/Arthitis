import { useEffect, useState } from 'react'
import { useSubjects } from '../../api/subjects';
import RecordSubjectComponent from './RecordSubjectComponent';


export default function RecordListSubject({onClose, onSelect}) {
    const { subjects, loading, deleteSubject, fetchSubjects } = useSubjects();

    useEffect(() => {
        fetchSubjects();
    }, [])

    return(
    <div className="relative overflow-x-auto max-h-[400px] overflow-y-auto ">
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">
                    Name
                </th>
                <th scope="col" className="px-6 py-3">
                    Age 
                </th>
                <th scope="col" className="px-6 py-3">
                    Height (cm)
                </th>
                <th scope="col" className="px-6 py-3">
                    Weight (kg)
                </th>
                <th scope="col" className="px-6 py-3">
                    Sport (0-5)
                </th>
                <th scope="col" className="px-6 py-3">
                    {/* Button */}
                </th>
            </tr>
        </thead>
        <tbody>
            {subjects.map(s => (
            <RecordSubjectComponent key={s.id} subject={s} onAskSelect={onSelect} onClose={onClose} />
            ))}
      </tbody>
        </table>
    </div>
    );
}

