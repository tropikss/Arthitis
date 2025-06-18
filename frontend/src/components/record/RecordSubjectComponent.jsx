import { useState } from "react";

export default function RecordSubjectComponent({ subject, onAskSelect, onClose}) {
    const [hovered, setHovered] = useState(false);

    return (
        <tr
            className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {subject.name || 'Unknown Subject'}
            </th>
            <td className="px-6 py-4">{subject.age || 'N/A'}</td>
            <td className="px-6 py-4">{subject.height || 'N/A'}</td>
            <td className="px-6 py-4">{subject.weight || 'N/A'}</td>
            <td className="px-6 py-4">{subject.sport || 'N/A'}</td>
            <td className="px-2 py-4 text-right" style={{ width: "70px" }}>
                <a
                    href="#"
                    onClick={e => { e.preventDefault(); onAskSelect(subject); onClose(); }}
                    className={`
                        transition-opacity duration-150
                        ${hovered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
                        text-white bg-blue-700 hover:bg-blue-800 focus:ring-2 focus:ring-blue-300 font-medium rounded text-xs px-2 py-1
                        dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800
                    `}
                    style={{ minWidth: "48px", minHeight: "28px", display: "inline-block" }}
                >
                    Select
                </a>
            </td>
        </tr>
    );
}
