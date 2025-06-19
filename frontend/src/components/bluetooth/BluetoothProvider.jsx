import React, { createContext, useContext, useState } from 'react';
import { useTests } from '../../api/test';

export const BluetoothContext = createContext();

export function BluetoothProvider({ children }) {
  const { tests, loading, fetchTests, addTest, deleteTest, updateTest } = useTests();
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [commandChar, setCommandChar] = useState(null);
  const [serviceChar, setServiceChar] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingState, setRecordingState] = useState({});
  const [sdRecords, setSdRecords] = useState([]);
  const [getAllSdRecords, setGetAllSdRecords] = useState(false); 

  const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
  const COMMAND_UUID = '12345678-1234-5678-1234-56789abcdef1';
  const RECORD_UUID = '12345678-1234-5678-1234-56789abcdef2';
  const STATUS_UUID = '12345678-1234-5678-1234-56789abcdef3';
  const FILESYSTEM_UUID = '12345678-1234-5678-1234-56789abcdef4';

  const connect = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'ESP' }
        ],
        optionalServices: ['device_information', SERVICE_UUID, COMMAND_UUID]
      });

    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE_UUID);
    const characteristic = await service.getCharacteristic(COMMAND_UUID);
    const recordChar = await service.getCharacteristic(RECORD_UUID);
    const statusChar = await service.getCharacteristic(STATUS_UUID);
    const filesystemChar = await service.getCharacteristic(FILESYSTEM_UUID);

    recordChar.startNotifications();
    recordChar.addEventListener('characteristicvaluechanged', (event) => {
      const value = new TextDecoder().decode(event.target.value);
      console.log('Données entrantes RECORD_UUID :', value);
      switch (value) {
        case 'RECORDING_STARTED':
          setRecordingState('RECORDING_STARTED');
          setIsRecording(true);
          console.log('Enregistrement démarré');
          break;
        case 'RECORDING_STOPPED':
          setRecordingState('RECORDING_STOPPED');
          setIsRecording(false);
          console.log('Enregistrement arrêté');
          break;
        case 'RECORD_SAVED':
          setRecordingState('RECORD_SAVED');
          console.log('Enregistrement sauvegardé');
          break;
        case 'ALLOCATING':
          setRecordingState('ALLOCATING');
          console.log('Allocating');
          break;
        case 'ERROR':
          console.error('Erreur lors de l\'enregistrement');
          break;
        default:
          console.log('Commande inconnue :', value);
      }
    });

    filesystemChar.startNotifications();
    filesystemChar.addEventListener('characteristicvaluechanged', (event) => {
      const value = new TextDecoder().decode(event.target.value);
      console.log('Données entrantes FILESYSTEM UUID :', value);

      if (value.startsWith('GET_ALL_RECORD FILE:')) {
        // Extraction du nom de fichier
        let fileName = value.split(':')[1];
        if (fileName.endsWith('.wav')) {
          fileName = fileName.slice(0, -4);
        }
        console.log('Fichier trouvé :', fileName);
        setSdRecords(prevRecords => [...prevRecords, fileName]);
      } else if (value.startsWith('GET_ALL_RECORD START')) {
        setGetAllSdRecords(true);
        setSdRecords([]); 
      } else if (value.startsWith('GET_ALL_RECORD END')) {
        setGetAllSdRecords(false);
      } else if (value.startsWith('GET_ALL_RECORD ERROR')) {
        setGetAllSdRecords(false);
      } else if(value.startsWith('NO_RECORDS')) {
        setGetAllSdRecords(false);
        setSdRecords([]); // Réinitialiser si aucun enregistrement trouvé
        console.log('Aucun enregistrement trouvé sur la carte SD');
      }
      });

    statusChar.startNotifications();
    statusChar.addEventListener('characteristicvaluechanged', (event) => {
      const value = new TextDecoder().decode(event.target.value);
      console.log('Données entrantes STATUS_UUID :', value);
    });

    // Stockage dans les states après récupération
    setDevice(device);
    setIsConnected(device.gatt.connected);
    setServiceChar(service);
    setCommandChar(characteristic);

      // Sauvegarde
      localStorage.setItem('lastDeviceId', device.id);
      localStorage.setItem('lastDeviceName', device.name || 'Appareil inconnu');

    } catch (err) {
      console.error('Erreur de connexion BLE :', err);
    }
  };

  const sendCommand = async (command) => {
    if (!device || !device.gatt.connected) {
      console.warn('Aucun appareil connecté');
      return;
    }

    try {
      const fullCommand = command + '|END'; // Marqueur de fin clair
      const encoder = new TextEncoder();
      const bytes = encoder.encode(fullCommand);

      // Découpe manuelle en tranches de 20
      for (let i = 0; i < bytes.length; i += 20) {
        const chunk = bytes.slice(i, i + 20);
        await commandChar.writeValue(chunk);
        await new Promise(r => setTimeout(r, 10)); // petit délai pour fiabilité
      }

      console.log('Commande envoyée :', fullCommand);
    } catch (err) {
      console.error('Erreur envoi commande BLE :', err);
    }
  };


  const startRecordingCommand = async (recordingSubject, recordingTags) => {
    setRecordingState('ALLOCATING');
    if (!device || !device.gatt.connected) {
      console.warn('Aucun appareil connecté');
      return;
    }
    if (!recordingSubject || !recordingTags) {
      console.error('Sujet d\'enregistrement ou tags manquants');
      return;
    }
    // Ajout du test en bdd
    try {
      var test = await addTest({
        subject_id: recordingSubject.id,
        tags: recordingTags,
      });
    } catch (err) {
      console.error('Erreur ajout test :', err);
      return;
    }
    if (test !== undefined) { 
      console.log(test)
      try {
        await sendCommand('START_RECORDING ' + test.record_id);
      } catch (err) {
        console.error('Erreur démarrage enregistrement :', err);
      }
    }
  };

    const stopRecordingCommand = async () => {
    if (!device || !device.gatt.connected) {
      console.warn('Aucun appareil connecté');
      return;
    }

    try {
      await sendCommand('STOP_RECORDING');
      console.log('Enregistrement démarré');
    } catch (err) {
      console.error('Erreur démarrage enregistrement :', err);
    }
  };

  const startGetAllSdRecords = async () => {
    if (!device || !device.gatt.connected) {
      console.warn('Aucun appareil connecté');
      return;
    }

    try {
      await sendCommand('GET_ALL_RECORDS');
      console.log('Démarrage récupération des enregistrements SD');
    } catch (err) {
      console.error('Erreur démarrage récupération SD :', err);
    }
  };

  const sendDeleteCommand = async(filename) => {
    if(!device || !device.gatt.connected) {
      console.warn('Aucun appareil connecté');
      return;
    }
    try {
      await sendCommand('DELETE ' + filename);
      console.log('Fichier supprimé :', filename);
    } catch (err) {
      console.error('Erreur suppression fichier :', err);
    }
  }

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
      disconnect,
      sendCommand,
      startRecordingCommand,
      stopRecordingCommand,
      isRecording,
      recordingState,
      startGetAllSdRecords,
      sdRecords,
      sendDeleteCommand
    }}>
      {children}
    </BluetoothContext.Provider>
  );
}
