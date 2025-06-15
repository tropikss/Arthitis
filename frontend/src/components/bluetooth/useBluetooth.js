import { useContext } from 'react';
import { BluetoothContext } from './BluetoothProvider';

export function useBluetooth() {
  return useContext(BluetoothContext);
}
