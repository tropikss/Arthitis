import React, { useState } from 'react';
import { useEffect } from "react"

export default function OptionSelector({ options = [], onSelect, label, disabled }) {
  const [selected, setSelected] = useState(null);

  const handleClick = (value) => {
    if (disabled) return;
    setSelected(value);
    onSelect?.(value);
  };

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm ${
        disabled ? 'opacity-90 pointer-events-none' : ''
      }`}
    >
      {label && (
        <div className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
          {label}
        </div>
      )}
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleClick(opt.value)}
            className={`px-4 py-2 rounded-lg text-sm border transition
              ${
                selected === opt.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-500 dark:hover:border-blue-400'
              }
            `}
            disabled={disabled}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
