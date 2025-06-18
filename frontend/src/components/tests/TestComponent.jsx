
export default function TestComponent({test, onDelete}) {
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200">
        <th className="px-6 py-4">
            {`${test.tags.inclinaison}%`}
        </th>
        <th className="px-6 py-4">
            {`${test.tags.speed} km/h`}
        </th>
        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
            {test.tags.weighted ? "Yes" : "No"}
        </th>
        <th className="px-6 py-4">
            <button type='button' onClick={() => onDelete(test)}>
                Delete
            </button>
        </th>
    </tr>
);
}