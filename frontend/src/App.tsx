import './App.css'
import DeviceComponent from './components/device/DeviceComponent'
import { BluetoothProvider } from './components/bluetooth/BluetoothProvider';
import { useBluetooth } from './components/bluetooth/useBluetooth';
import './index.css';
import ExplorerComponent from './components/explorer/ExplorerComponent';


function App() {

  return (
  <>
  <div className="bg-linear-to-b from-color1 to-color2 text-white min-h-screen">
    <BluetoothProvider>
      <div className="h-screen flex flex-col p-4">
        <div className="h-1/6">
          <DeviceComponent/>
        </div>
        <div className='h-5/6'>
          <ExplorerComponent/>
        </div>
      </div>
    </BluetoothProvider>
    </div>
  </>
  )
}

export default App
