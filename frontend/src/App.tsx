import './App.css'
import DeviceComponent from './components/device/DeviceComponent'
import { BluetoothProvider } from './components/bluetooth/BluetoothProvider';
import { useBluetooth } from './components/bluetooth/useBluetooth';
import './index.css';
import SubjectTab from './components/explorer/SubjectTab';
import { SubjectsProvider } from './api/subjects';
import TabComponent from './components/tabs/TabComponent';
import { TestsProvider } from './api/test';

function App() {

  return (
  <>
  <TestsProvider>
  <SubjectsProvider>
  <div className="bg-linear-to-b from-color1 to-color2 text-white min-h-screen">
    <BluetoothProvider>
      <div className="flex flex-col h-full p-4">
        <div className="basis-1/6">
          <DeviceComponent/>
        </div>
        <div className='basis-5/6'>
          <TabComponent/>
        </div>
      </div>
    </BluetoothProvider>
    </div>
    </SubjectsProvider>
   </TestsProvider> 
  </>
  )
}

export default App
