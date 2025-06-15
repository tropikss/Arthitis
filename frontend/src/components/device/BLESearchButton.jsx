import { useBluetooth } from '../bluetooth/useBluetooth';

function BLESearchButton({}) {
  const {isConnected, connect, disconnect} = useBluetooth();

  return (
    <span className="inline-flex divide-x divide-gray-300 overflow-hidden rounded border border-gray-300 bg-white shadow-sm dark:divide-gray-600 dark:border-gray-600 dark:bg-gray-800">
      <button className="px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900 focus:relative dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white"

        onClick={isConnected ? disconnect : connect}>
        {isConnected ? 'Disconnect' : 'Search'}
      </button>
    </span>
  );
}

export default BLESearchButton;