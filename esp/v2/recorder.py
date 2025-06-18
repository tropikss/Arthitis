from machine import I2S, Pin
import ustruct, uos, time
import uasyncio as asyncio
from sd_manager import get_sd_free_space
import os

SCK_PIN = 32
WS_PIN = 25
SD_PIN = 33

SAMPLE_RATE = 16000
BITS_PER_SAMPLE = 16
NUM_CHANNELS = 1
BYTES_PER_SAMPLE = BITS_PER_SAMPLE // 8
CHUNK_SIZE = 1024
audio_start_pos = 44

audio_in = None
record_file = None
recording = False

def create_wav_header(sample_rate, bits_per_sample, num_channels):
    datasize = 0xFFFFFFFF
    header = b'RIFF'
    header += ustruct.pack('<I', datasize + 36)
    header += b'WAVEfmt '
    header += ustruct.pack('<I', 16)
    header += ustruct.pack('<H', 1)
    header += ustruct.pack('<H', num_channels)
    header += ustruct.pack('<I', sample_rate)
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    header += ustruct.pack('<I', byte_rate)
    block_align = num_channels * bits_per_sample // 8
    header += ustruct.pack('<H', block_align)
    header += ustruct.pack('<H', bits_per_sample)
    header += b'data'
    header += ustruct.pack('<I', datasize)
    return header

async def start_recording(conn=None, filename=None, f_allocating=None, f_recording=None):
    global audio_in, record_file, recording

    now = time.localtime()
    filename = filename+".wav"
    print("Demarrage de l'enregistrement :", filename)

    audio_in = I2S(
        0,
        sck=Pin(SCK_PIN),
        ws=Pin(WS_PIN),
        sd=Pin(SD_PIN),
        mode=I2S.RX,
        bits=BITS_PER_SAMPLE,
        format=I2S.MONO,
        rate=SAMPLE_RATE,
        ibuf=8000
    )

    free_space = get_sd_free_space()
    max_size = min(int(free_space * 0.9), 256 * 1024 * 80)

    record_file = open("/sd/" + filename, "wb")
    record_file.write(create_wav_header(SAMPLE_RATE, BITS_PER_SAMPLE, NUM_CHANNELS))
    record_file.seek(max_size - 1)
    record_file.write(b"\0")
    record_file.flush()
    record_file.seek(audio_start_pos)

    if f_allocating:
        print('f_allocating')
        await f_allocating(conn)
    else:
        print('No f_allocating function provided')

    recording = True
    asyncio.create_task(handle_recording())

    if f_recording:
        print('f_recording')
        await f_recording(conn)
    else:
        print('No f_recording function provided')        

    return filename

async def handle_recording():
    global recording, record_file, audio_in

    buf = bytearray(CHUNK_SIZE * BYTES_PER_SAMPLE)

    while recording:
        num_bytes = audio_in.readinto(buf)
        if num_bytes:
            record_file.write(buf[:num_bytes])
        await asyncio.sleep_ms(1)

async def stop_recording(filename="record.wav", conn=None, f_stopping=None, f_saved=None):
    global recording, record_file, audio_in

    if f_stopping:
        print('f_stopping')
        await f_stopping(conn)
    else:
        print('No f_stopping function provided')
    
    recording = False
    time.sleep_ms(100)

    if audio_in:
        audio_in.deinit()
        audio_in = None
    print('deinit audio_in')

    if record_file:
        size = record_file.tell()
        print('record_file size:', size)
        record_file.close()

    print('writing WAV header')
    original_path = '/sd/' + filename
    tmp_path = '/sd/tmp_' + filename

    # Patch le header WAV en place
    with open(original_path, "r+b") as f:
        f.seek(4)
        f.write(ustruct.pack('<I', size - 8))
        f.seek(40)
        f.write(ustruct.pack('<I', size - 44))

    print('WAV header written')

    # Copie vers un fichier temporaire
    with open(original_path, "rb") as fsrc:
        with open(tmp_path, "wb") as fdst:
            remaining = size
            bufsize = 4096
            while remaining > 0:
                chunk = fsrc.read(min(bufsize, remaining))
                if not chunk:
                    break
                fdst.write(chunk)
                remaining -= len(chunk)

    # Remplace l'ancien fichier par le propre
    os.remove(original_path)
    os.rename(tmp_path, original_path)
    print("Fichier nettoye :", filename)

    if f_saved:
        print('f_saved')
        await f_saved(conn, filename)
    else:
        print('No f_saved function provided')
