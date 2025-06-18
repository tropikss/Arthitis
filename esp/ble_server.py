import os
import uos
import uasyncio as asyncio
from machine import Pin, SPI
import sdcard
from aioble import aioble
import bluetooth

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
        self.data_out_uuid = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef2")
        self.status_uuid = bluetooth.UUID("12345678-1234-5678-1234-56789abcdef4")

        self.service = aioble.Service(self.service_uuid)
        self.char_command = aioble.Characteristic(self.service, self.command_uuid, write=True, notify=True, capture=True)
        self.char_data_out = aioble.Characteristic(self.service, self.data_out_uuid, notify=True)
        self.char_status = aioble.Characteristic(self.service, self.status_uuid, notify=True)

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
                    print("Client connecté :", connection.device)
                    self.conn = connection
                    self.connected = True
                    if self.on_ble_connected:
                        self.on_ble_connected()

                    task = asyncio.create_task(self.handle_connection(connection))
                    await connection.disconnected()
                    print("Client déconnecté :", connection.device)
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

    async def send_status(self, conn, msg):
        try:
            await self.char_status.write(('STATUS ' + msg).encode(), send_update=True)
        except Exception as e:
            return
    async def send_data(self, conn, msg):
        try:
            if isinstance(msg, str):
                msg = msg.encode()
            await self.char_data_out.write(msg, send_update=True)
        except Exception as e:
            return

    async def read_full_command(self):
        conn, data = await self.char_command.written()
        return data.decode().strip()

    async def handle_connection(self, connection):
        try:
            self.connected = True
            while self.connected:
                try:
                    cmd = await self.read_full_command()
                    print("Commande recue:", cmd)
                    await self.handle_command(connection, cmd)
                except Exception as e:
                    print("Erreur handle_connection_command:", e)
        except Exception as e:
            print("Erreur handle_connection:", e)
            self.connected = False
            if self.on_ble_disconnected:
                self.on_ble_disconnected()

    async def handle_command(self, conn, cmd):
        if cmd.startswith("LIST PATH:"):
            await self.handle_LIST(conn, cmd[10:])
        elif cmd.startswith("GET PATH:"):
            await self.handle_GET(conn, cmd[9:])
        elif cmd.startswith("START_RECORDING"):
            await self.handle_start_recording(conn)
        elif cmd.startswith("STOP_RECORDING"):
            await self.handle_stop_recording(conn)
        elif cmd.startswith("DELETE"):
            await self.handle_DELETE(conn, cmd[7:])
        else:
            await self.send_status(conn, "CMD_NOT_FOUND")

    async def handle_LIST(self, conn, path):
        full_path = "/sd/" + path.strip("/")
        try:
            if not os.stat(full_path):
                raise Exception("Path does not exist")

            await self.send_data(conn, "LIST START")

            for fname in uos.listdir(full_path):
                fpath = full_path +'/'+ fname
                print(fpath)
                try:
                    stat = os.stat(fpath)
                    print('hfhhihihi')
                    if stat[0] & 0x4000:
                        ext = "DIR"
                    else:
                        ext = str(fname).rsplit('.', 1)[1]
                    print(ext, fpath)
                    await self.send_data(conn, f"LIST EXT:{ext} PATH:{path.strip('/')}/{fname}")
                except:
                    print(fname, 'error')
                    continue

            await self.send_data(conn, "LIST END")
            await self.send_status(conn, "OK")
        except Exception as e:
            await self.send_data(conn, "LIST ERROR")
            await self.send_status(conn, "ERR:" + str(e))

    async def handle_GET(self, conn, filepath):
        print('GET ',filepath)
        filepath = "/sd" + '/' + filepath
        try:
            stat = os.stat(filepath)
            if stat[0] & 0x4000:
                await self.send_data(conn, "GET ERROR")
                await self.send_status(conn, "ERR: Is directory")
                return

            ext = str(filepath).rsplit('.', 1)[1]
            is_binary = ext.lower() in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'mp3', 'wav', 'bin']
            mode = 'rb' if is_binary else 'r'

            with open(filepath, mode) as f:
                if is_binary:
                    while True:
                        chunk = f.read(512)
                        if not chunk:
                            break
                        await self.send_data(conn, chunk)
                        await asyncio.sleep_ms(50)
                else:
                    for line in f:
                        await self.send_data(conn, line.strip())
                        await asyncio.sleep_ms(50)

            await self.send_data(conn, "GET END")
            await self.send_status(conn, "OK")
        except Exception as e:
            print("GET error:", e)
            await self.send_data(conn, "GET ERROR")
            await self.send_status(conn, "ERR:" + str(e))

    async def allocating_status(self, conn):
        print("allocating_status")
        await self.send_status(conn, "ALLOCATING")

    async def recording_status(self, conn):
        print("recording_status")
        await self.send_status(conn, "RECORDING_STARTED")

    async def stop_recording_status(self, conn):
        await self.send_status(conn, "RECORDING_STOPPED")

    async def saved_status(self, conn, filename):
        await self.send_status(conn, f"RECORDING_SAVED:{filename}")

    async def handle_start_recording(self, conn):
        self.filename = await self.start_recording(
            conn, 
            self.allocating_status, 
            self.recording_status
        )

    async def handle_stop_recording(self, conn):
        if self.filename is None:
            await self.send_status(conn, "ERR: No recording in progress")
            return

        await self.stop_recording(
            self.filename,
            conn,
            self.stop_recording_status,
            self.saved_status
        )
        self.filename = None
    
    async def handle_DELETE(self, conn, path):
        full_path = "/sd/" + path.strip("/")
        try:
            st = os.stat(full_path)  # Vérifie si le fichier existe
            # Si c'est un répertoire : S_ISDIR(st[0])
            if st[0] & 0o170000 == 0o040000:  # DIR
                os.rmdir(full_path)
            else:
                os.remove(full_path)

            await self.send_status(conn, "DELETED " + path.strip("/"))
        except Exception as e:
            await self.send_status(conn, "ERR:" + str(e))
