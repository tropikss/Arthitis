from machine import I2S, Pin
import ustruct, uos, time
import uasyncio as asyncio
from sd_manager import get_sd_free_space
import os

SCK_PIN_LEFT = 32 
WS_PIN_LEFT = 25 
SD_PIN_LEFT = 33 

SCK_PIN_RIGHT = 16
WS_PIN_RIGHT = 17 
SD_PIN_RIGHT = 21

SAMPLE_RATE = 16000
BITS_PER_SAMPLE = 16
NUM_CHANNELS = 2 # ← stéréo
BYTES_PER_SAMPLE = BITS_PER_SAMPLE // 8
CHUNK_SIZE = 1024  # en nombre de frames (une frame = L + R)
audio_start_pos = 44

audio_in_right, audio_in_left = None, None
record_file_right, record_file_left = None, None
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

audio_in_left, audio_in_right = None, None

async def start_recording(conn=None, filename=None, f_allocating=None, f_recording=None):
    global audio_in_left, audio_in_right, record_file_right, record_file_left, recording

    now = time.localtime()
    filename_R = filename+'_R'+'.wav'
    filename_L = filename+'_L'+'.wav'
    print("Demarrage de l'enregistrement :", filename_R, filename_L)

    audio_in_left = I2S(
        0,
        sck=Pin(SCK_PIN_LEFT),
        ws=Pin(WS_PIN_LEFT),
        sd=Pin(SD_PIN_LEFT),
        mode=I2S.RX,
        bits=BITS_PER_SAMPLE,
        format=I2S.MONO,
        rate=SAMPLE_RATE,
        ibuf=2048
    )

    audio_in_right = I2S(
        1,
        sck=Pin(SCK_PIN_RIGHT),
        ws=Pin(WS_PIN_RIGHT),
        sd=Pin(SD_PIN_RIGHT),
        mode=I2S.RX,
        bits=BITS_PER_SAMPLE,
        format=I2S.MONO,
        rate=SAMPLE_RATE,
        ibuf=2048
    )


    free_space = get_sd_free_space()
    max_size = min(int(free_space * 0.9), 256 * 1024 * 80)

    record_file_left = open("/sd/" + filename_L, "wb")
    record_file_right = open("/sd/" + filename_R, "wb")

    record_file_left.write(create_wav_header(SAMPLE_RATE, BITS_PER_SAMPLE, 1))
    record_file_right.write(create_wav_header(SAMPLE_RATE, BITS_PER_SAMPLE, 1))
    
    record_file_right.write(create_wav_header(SAMPLE_RATE, BITS_PER_SAMPLE, 1))
    record_file_right.seek(max_size - 1)
    record_file_right.write(b"\0")
    record_file_right.flush()
    record_file_right.seek(audio_start_pos)

    record_file_left.write(create_wav_header(SAMPLE_RATE, BITS_PER_SAMPLE, NUM_CHANNELS))
    record_file_left.seek(max_size - 1)
    record_file_left.write(b"\0")
    record_file_left.flush()
    record_file_left.seek(audio_start_pos)

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
    global recording, record_file_left, record_file_right, audio_in_right, audio_in_left

    buf = bytearray(CHUNK_SIZE * BYTES_PER_SAMPLE * NUM_CHANNELS)

    while recording:
        num_bytes = audio_in_right.readinto(buf)
        if num_bytes:
            record_file_right.write(buf[:num_bytes])

        num_bytes = audio_in_left.readinto(buf)
        if num_bytes:
            record_file_left.write(buf[:num_bytes])
        await asyncio.sleep_ms(1)

async def stop_recording(filename="record.wav", conn=None, f_stopping=None, f_saved=None):
    global recording, record_file_right, record_file_left, audio_in_right, audio_in_left
    filename_R = filename + '_R'+'.wav'
    filename_L = filename + '_L'+'.wav'

    if f_stopping:
        print('f_stopping')
        await f_stopping(conn)
    else:
        print('No f_stopping function provided')
    
    recording = False
    time.sleep_ms(100)

    if audio_in_left:
        audio_in_left.deinit()
        audio_in_left = None

    if audio_in_right:
        audio_in_right.deinit()
        audio_in_right = None
    print('deinit audio_in')

    if record_file_right and record_file_left:
        size_R = record_file_right.tell()
        size_L = record_file_left.tell()

        print('record_file size:', size_R, size_L)
        record_file_right.close()
        record_file_left.close()

    original_path = '/sd/' + filename_R
    tmp_path = '/sd/tmp_' + filename_R
    print('writing WAV R header for', original_path)

    # Patch le header WAV en place
    try:
        with open(original_path, "r+b") as f:
            f.seek(4)
            f.write(ustruct.pack('<I', size_R - 8))
            f.seek(40)
            f.write(ustruct.pack('<I', size_R - 44))
    except Exception as e:
        print('err wav :',e)
    print('WAV header written')

    # Copie vers un fichier temporaire
    with open(original_path, "rb") as fsrc:
        with open(tmp_path, "wb") as fdst:
            remaining = size_R
            bufsize = 4096
            while remaining > 0:
                chunk = fsrc.read(min(bufsize, remaining))
                if not chunk:
                    break
                fdst.write(chunk)
                remaining -= len(chunk)
    os.remove(original_path)
    os.rename(tmp_path, original_path)
    print("Fichier nettoye :", filename_R)

    print('writing WAV  L header')
    original_path = '/sd/' + filename_L
    tmp_path = '/sd/tmp_' + filename_L

    # Patch le header WAV en place
    with open(original_path, "r+b") as f:
        f.seek(4)
        f.write(ustruct.pack('<I', size_L - 8))
        f.seek(40)
        f.write(ustruct.pack('<I', size_L - 44))

    with open(original_path, "rb") as fsrc:
        with open(tmp_path, "wb") as fdst:
            remaining = size_L
            bufsize = 4096
            while remaining > 0:
                chunk = fsrc.read(min(bufsize, remaining))
                if not chunk:
                    break
                fdst.write(chunk)
                remaining -= len(chunk)
    os.remove(original_path)
    os.rename(tmp_path, original_path)
    print("Fichier nettoye :", filename_L)

    if f_saved:
        print('f_saved')
        await f_saved(conn, filename_L)
    else:
        print('No f_saved function provided')
