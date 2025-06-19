# ble_service.py
import asyncio
import bluetooth
from aioble import aioble
from ble_commands import handle_command_wrapper

class BLEFileService:
    def __init__(self, on_success=None, sd=None, start_recording=None, stop_recording=None):
        self.connected = False
        self.conn = None
        self.sd = sd
        self.start_recording = start_recording
        self.stop_recording = stop_recording
        self.filename = None

        self.service_uuid = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef0")
        self.command_uuid = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef1")
        self.record_out_uuid = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef2")
        self.status_uuid = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef3")
        self.filesystem_uuid = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef4")

        self.service = aioble.Service(self.service_uuid)
        self.char_command = aioble.Characteristic(self.service, self.command_uuid, write=True, notify=True, capture=True)
        self.char_record_out = aioble.Characteristic(self.service, self.record_out_uuid, notify=True)
        self.char_status = aioble.Characteristic(self.service, self.status_uuid, notify=True)
        self.char_filesystem = aioble.Characteristic(self.service, self.filesystem_uuid, read=True, write=True, notify=True)

        aioble.register_services(self.service)

        self.on_ble_connected = None
        self.on_ble_disconnected = None
        self.on_ble_transfer = None

        asyncio.create_task(self.advertise())

        if on_success:
            on_success()

    def set_connection_callbacks(self, on_ble_connected, on_ble_disconnected, on_ble_transfer):
        self.on_ble_connected = on_ble_connected
        self.on_ble_disconnected = on_ble_disconnected
        self.on_ble_transfer = on_ble_transfer

    async def advertise(self):
        while True:
            try:
                async with await aioble.advertise(100_000, name="ESP32_Mathis", services=[self.service_uuid]) as connection:
                    print("Client connecte:", connection.device)
                    self.conn = connection
                    self.connected = True
                    if self.on_ble_connected:
                        self.on_ble_connected()

                    task = asyncio.create_task(self.handle_connection(connection))
                    await connection.disconnected()
                    print("Client deconnecte:", connection.device)
                    if self.on_ble_disconnected:
                        self.on_ble_disconnected()
                    task.cancel()
                    try:
                        await task
                    except asyncio.CancelledError:
                        pass
            except Exception as e:
                print("Erreur advertise:", e)
            await asyncio.sleep_ms(100)

    async def handle_connection(self, connection):
        try:
            self.connected = True
            while self.connected:
                try:
                    cmd = await self.read_full_command()
                    print("Commande recue:", cmd)
                    await handle_command_wrapper(self, connection, cmd)
                except Exception as e:
                    print("Erreur handle_connection_command:", e)
        except Exception as e:
            print("Erreur handle_connection:", e)
            self.connected = False
            if self.on_ble_disconnected:
                self.on_ble_disconnected()

    async def read_full_command(self):
        buffer = b""
        print("Attente de commande...")
        while True:
            conn, data = await self.char_command.written()
            buffer += data
            print("Fragment recu:", data)

            if b'|END' in buffer:
                command = buffer.replace(b'|END', b'')
                print("Commande complete:", command)
                return command.decode().strip()
