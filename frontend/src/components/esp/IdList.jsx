
export default function IdList({ ids, onClick }) {
    return (
    <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        record_id
                    </th>
                    <th scope="col" className="px-6 py-3">
                    </th>
                </tr>
            </thead>
            <tbody>
                {ids.map((record, idx) => (
                    <tr key={record} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {record}
                        </th>
                        <td className="px-6 py-4">
                            <button
                            className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                            onClick={() => onClick(record)}>
                                Action
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    )
}