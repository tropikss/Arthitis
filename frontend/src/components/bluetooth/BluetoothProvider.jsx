import React, { createContext, useContext, useState } from 'react';

export const BluetoothContext = createContext();

export function BluetoothProvider({ children }) {
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const connect = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'ESP' }
        ],
        optionalServices: ['device_information']
      });

      const server = await device.gatt.connect();

      // Mise à jour de l’état
      setDevice(device);
      setIsConnected(device.gatt.connected);

      // Sauvegarde
      localStorage.setItem('lastDeviceId', device.id);
      localStorage.setItem('lastDeviceName', device.name || 'Appareil inconnu');

    } catch (err) {
      console.error('Erreur de connexion BLE :', err);
    }
  };

  const disconnect = () => {
    if (device && device.gatt.connected) {
      device.gatt.disconnect();
      setIsConnected(false);
      setDevice(null);
    }
  };

  return (
    <BluetoothContext.Provider value={{
      device,
      isConnected,
      connect,
      disconnect
    }}>
      {children}
    </BluetoothContext.Provider>
  );
}
