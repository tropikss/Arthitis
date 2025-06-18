import { useEffect, useState } from 'react'
import { useSubjects } from '../../api/subjects';
import SubjectComponent from './SubjectComponent';
import DeleteConfirmation from './DeleteConfirmation';
import EditSubjectForm from './EditSubjectForm';
import FormWindow from './FormWindow';
import SubjectForm from './SubjectForm';


function ListSubject({}) {
    const [deleteModalSubject, setDeleteModalSubject] = useState(null);
    const [editModalSubject, setEditModalSubject] = useState(null);
    const { subjects, loading, deleteSubject, fetchSubjects } = useSubjects();

    useEffect(() => {
        fetchSubjects();
    }, [])

    return(
    <div className="relative overflow-x-auto max-h-[400px] overflow-y-auto">
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
            <SubjectComponent key={s.id} subject={s} onAskDelete={() => setDeleteModalSubject(s)} onAskEdit={() => setEditModalSubject(s)} />
            ))}
      </tbody>
        </table>
        {deleteModalSubject && (
            <DeleteConfirmation
                subject={deleteModalSubject}
                onCancel={() => setDeleteModalSubject(null)}
                onConfirm={() => {
                deleteSubject(deleteModalSubject.id).then(() => {
                    setDeleteModalSubject(null);
                    fetchSubjects();
                });
            }}
            />
        )}
        {editModalSubject && (
            <FormWindow key={editModalSubject?.id} onClose={() => setEditModalSubject(false)}>
                <EditSubjectForm key={editModalSubject?.id} subject={editModalSubject} onClose={() => {setEditModalSubject(false); fetchSubjects();console.log(subjects.map(s => s.id));
}}/>
            </FormWindow>
        )}
    </div>
    );
}

export default ListSubject;