import React from 'react';
import DeviceLast from './DeviceLast';
import DeviceBLE from './DeviceBLE';
import logo from './logo.png';
import DbConnection from './DbConnection';

function DeviceComponent({ }) {
    return (
        <div className='bg-color4 rounded-xl  p-1 flex flex-row items-center max-w-full overflow-hidden'>
            <div className='flex items-center justify-between w-full'>
                <div className="w-2/7">
                    <DeviceBLE />
                    {/* <DeviceLast /> */}
                </div>
                <div className="w-1/4">
                    <DbConnection />
                </div>
                <div className="w-1/4"></div>
                <div className="w-1/4"></div>
            </div>
            <div className="flex items-center justify-end w-1/4">
                <img
                    src={logo}
                    alt="Device"
                    className="rounded-xl"
                    style={{ maxHeight: '80px', objectFit: 'contain' }}
                />
            </div>
        </div>
    );
}

export default DeviceComponent;