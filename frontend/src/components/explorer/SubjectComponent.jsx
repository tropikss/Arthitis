import { useState } from "react";
import DeleteConfirmation from "./DeleteConfirmation";

function SubjectComponent({ subject, onAskDelete, onAskEdit }) {

    return (
        <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {subject.name || 'Unknown Subject'}
            </th>
            <td className="px-6 py-4">{subject.age || 'N/A'}</td>
            <td className="px-6 py-4">{subject.height || 'N/A'}</td>
            <td className="px-6 py-4">{subject.weight || 'N/A'}</td>
            <td className="px-6 py-4">{subject.sport || 'N/A'}</td>
            <td className="px-2 py-4 text-right">
                <a href="#" onClick={e => { e.preventDefault(); onAskEdit(); }} className="font-medium text-blue-600 dark:text-blue-500 hover:underline p-4">Edit</a>
                <a href="#" onClick={e => { e.preventDefault(); onAskDelete(); }} className="font-medium text-blue-600 dark:text-red-500 hover:underline p-4">Delete</a>
            </td>
        </tr>
    );
}

export default SubjectComponent;