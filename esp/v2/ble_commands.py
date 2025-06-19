# ble_commands.py
import os
import uos
import uasyncio as asyncio
from sd_manager import get_all_wav

def is_binary_file(filepath):
    ext = filepath.rsplit('.', 1)[-1].lower()
    return ext in ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'mp3', 'wav', 'bin']

async def handle_command_wrapper(service, conn, cmd):
    if cmd.startswith("LIST PATH:"):
        await handle_LIST(service, conn, cmd[10:])
    elif cmd.startswith("GET PATH:"):
        await handle_GET(service, conn, cmd[9:])
    elif cmd.startswith("START_RECORDING"):
        filename = cmd[len("START_RECORDING "):].strip()
        await handle_start_recording(service, conn, filename)
    elif cmd.startswith("STOP_RECORDING"):
        await handle_stop_recording(service, conn)
    elif cmd.startswith("DELETE"):
        await handle_DELETE(service, conn, cmd[7:])
    elif cmd.startswith("GET_ALL_RECORD"):
        await handle_GET_ALL_RECORD(service, conn)
    else:
        await send_status(service, conn, "CMD_NOT_FOUND")

async def send_record(service, conn, msg):
    try:
        if isinstance(msg, str):
            msg = msg.encode()
        await service.char_record_out.write(msg, send_update=True)
    except:
        pass

async def send_status(service, conn, msg):
    try:
        if isinstance(msg, str):
            msg = msg.encode()
        await service.char_status.write(msg, send_update=True)
    except:
        pass

async def send_filesystem(service, conn, msg):
    try:
        print("Filesystem ->", msg)
        if isinstance(msg, str):
            msg = msg.encode()
        await service.char_filesystem.write(msg, send_update=True)
    except Exception as e:
        pass

async def handle_LIST(service, conn, path):
    full_path = "/sd/" + path.strip("/")
    try:
        os.stat(full_path)
        await send_data(service, conn, "LIST START")
        for fname in uos.listdir(full_path):
            fpath = full_path + '/' + fname
            try:
                stat = os.stat(fpath)
                ext = "DIR" if stat[0] & 0x4000 else fname.rsplit('.', 1)[-1]
                await send_data(service, conn, f"LIST EXT:{ext} PATH:{path.strip('/')}/{fname}")
            except:
                continue
        await send_data(service, conn, "LIST END")
        await send_status(service, conn, "OK")
    except Exception as e:
        await send_data(service, conn, "LIST ERROR")
        await send_status(service, conn, "ERR:" + str(e))

async def handle_GET(service, conn, filepath):
    filepath = "/sd/" + filepath.strip("/")
    try:
        stat = os.stat(filepath)
        if stat[0] & 0x4000:
            await send_data(service, conn, "GET ERROR")
            await send_status(service, conn, "ERR: Is directory")
            return
        mode = 'rb' if is_binary_file(filepath) else 'r'
        with open(filepath, mode) as f:
            if 'b' in mode:
                while True:
                    chunk = f.read(512)
                    if not chunk:
                        break
                    await send_data(service, conn, chunk)
                    await asyncio.sleep_ms(50)
            else:
                for line in f:
                    await send_data(service, conn, line.strip())
                    await asyncio.sleep_ms(50)
        await send_data(service, conn, "GET END")
        await send_status(service, conn, "OK")
    except Exception as e:
        await send_data(service, conn, "GET ERROR")
        await send_status(service, conn, "ERR:" + str(e))

async def handle_start_recording(service, conn, filename):
    service.filename = await service.start_recording(conn, filename, lambda c: send_record(service, c, "ALLOCATING"), lambda c: send_record(service, c, "RECORDING_STARTED"))

async def handle_stop_recording(service, conn):
    if service.filename is None:
        await send_record(service, conn, "ERR: No recording in progress")
        return
    await service.stop_recording(service.filename, conn, lambda c: send_record(service, c, "RECORDING_STOPPED"), lambda c, f: send_record(service, c, "RECORD_SAVED"))
    service.filename = None

async def handle_DELETE(service, conn, path):
    full_path = "/sd/" + path.strip("/")
    try:
        st = os.stat(full_path)
        if st[0] & 0o170000 == 0o040000:
            os.rmdir(full_path)
        else:
            os.remove(full_path)
        await send_status(service, conn, "DELETED " + path.strip("/"))
    except Exception as e:
        await send_status(service, conn, "ERR:" + str(e))

async def handle_GET_ALL_RECORD(service, conn):
    try:
        wav_files = get_all_wav()
        if not wav_files:
            await send_filesystem(service, conn, "NO_RECORDS")
            return
        print("WAV files found:", wav_files)
        await send_filesystem(service, conn, "GET_ALL_RECORD START")
        for fname in wav_files:
            await send_filesystem(service, conn, f"GET_ALL_RECORD FILE:{fname}")
        await asyncio.sleep_ms(50)
        await send_filesystem(service, conn, "GET_ALL_RECORD END")
        await send_status(service, conn, "OK")
    except Exception as e:
        print("Error in GET_ALL_RECORD:", e)
        await send_filesystem(service, conn, "GET_ALL_RECORD ERROR")
        await send_status(service, conn, "ERR:" + str(e))