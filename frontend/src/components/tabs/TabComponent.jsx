import { useState } from "react";
import SubjectTab from "../explorer/SubjectTab";
import RecordTab from "../record/RecordTab"; // Assuming you have a RecordTab component

function TabComponent() {
  const [activeTab, setActiveTab] = useState('subjects');

  return (
    <>
      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
        <li className="me-2">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('subjects');
            }}
            className={`inline-block p-4 rounded-t-lg ${
              activeTab === 'subjects'
                ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500'
                : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Subjects
          </a>
        </li>
        <li className="me-2">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('record');
            }}
            className={`inline-block p-4 rounded-t-lg ${
              activeTab === 'record'
                ? 'text-blue-600 bg-gray-100 dark:bg-gray-800 dark:text-blue-500'
                : 'hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300'
            }`}
          >
            Record
          </a>
        </li>
      </ul>

      {activeTab === 'subjects' && <SubjectTab />}
      {activeTab === 'record' && <RecordTab/>}
    </>
  );
}

export default TabComponent;
