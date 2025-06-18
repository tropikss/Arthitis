import network, time, urequests
from machine import I2C, Pin, reset, Pin, ADC
import ssd1306
import random
import machine, uos
import sys
from micropython import const
import bluetooth
import struct
import time
from machine import Timer
import framebuf 
from ble_server import BLEFileService
import uasyncio as asyncio
from machine import Pin, I2S
import uos
import time
import struct
from time import localtime
import ustruct


# ------------------------------ GLOBAL -------------------------------

sd = False
wifi = False
bluetooth = False
device = False

# ------------------------------ MIC -------------------------------
SCK_PIN = 32
WS_PIN = 25
SD_PIN = 33

SAMPLE_RATE = 16000
BITS_PER_SAMPLE = 16
NUM_CHANNELS = 1
BYTES_PER_SAMPLE = BITS_PER_SAMPLE // 8
CHUNK_SIZE = 1024

audio_in = None
record_file = None
recording = False
audio_start_pos = 44  # taille fixe de l'en-tête .wav

def get_sd_free_space():
    stats = uos.statvfs("/sd")
    return stats[0] * stats[3]  # block size * blocks available

def create_wav_header(sample_rate, bits_per_sample, num_channels):
    datasize = 0xFFFFFFFF  # Placeholder, updated later
    header = b'RIFF'
    header += ustruct.pack('<I', datasize + 36)
    header += b'WAVEfmt '
    header += ustruct.pack('<I', 16)
    header += ustruct.pack('<H', 1)  # PCM
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

async def start_recording(conn=None, f_allocating=None, f_recording=None):
    now = localtime()
    filename = "rec_{:04d}{:02d}{:02d}_{:02d}{:02d}{:02d}.wav".format(
        now[0], now[1], now[2], now[3], now[4], now[5]
    )
    print("Demarrage de l'enregistrement :", filename)
    global audio_in, record_file, recording

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
    max_size = min(int(free_space * 0.9), 256 * 1024 * 80)  # max 256 Mo
    print(f"Allocation de {max_size // 1024} Ko")

    record_file = open("/sd/" + filename, "wb")
    record_file.write(create_wav_header(SAMPLE_RATE, BITS_PER_SAMPLE, NUM_CHANNELS))
    record_file.seek(max_size - 1)
    record_file.write(b"\0")
    record_file.flush()
    record_file.seek(audio_start_pos)

    if f_allocating:
        print('f_allocating:', f_allocating)
        await f_allocating(conn)

    recording = True
    asyncio.create_task(handle_recording())

    if f_recording:
        print('f_recording')
        await f_recording(conn)

    print("Enregistrement demarre...")
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

    print("Arrêt de l'enregistrement...")
    if f_stopping:
        await f_stopping(conn)
    recording = False
    time.sleep_ms(100)

    if audio_in:
        audio_in.deinit()
        audio_in = None

    if record_file:
        size = record_file.tell()
        record_file.close()

        print("Taille finale reelle :", size, "octets")

        # Corriger l'en-tête WAV
        with open('/sd/'+filename, "r+b") as f:
            f.seek(4)
            f.write(ustruct.pack('<I', size - 8))     # RIFF chunk size
            f.seek(40)
            f.write(ustruct.pack('<I', size - 44))    # data chunk size

        # Copier petit a petit vers un fichier reduit
        newname = "/sd/trimmed_" + filename
        with open('/sd/'+filename, "rb") as fsrc:
            with open(newname, "wb") as fdst:
                remaining = size
                bufsize = 4096
                while remaining > 0:
                    chunk = fsrc.read(min(bufsize, remaining))
                    if not chunk:
                        break
                    fdst.write(chunk)
                    remaining -= len(chunk)

        print("Fichier nettoye : ", newname)
        import os
        os.remove('/sd/' + filename)
        os.rename(newname, '/sd/' + filename)
    if f_saved:
        await f_saved(conn, filename)

async def record_for(seconds=5, filename="test.wav"):
    start_recording(filename)
    asyncio.create_task(handle_recording())
    await asyncio.sleep(seconds)
    stop_recording(filename)

# ------------------------------ SD -------------------------------
sd_card = machine.SDCard(slot=2, sck=18, miso=19, mosi=23, cs=5, freq=1_000_000)

def init_sd():
    global sd
    sd = False
    update_sd_icon()
    print('Init SD card : ', end='')
    try:
        uos.mount(sd_card, "/sd")
        print('OK')
        sd = True
        update_sd_icon()
        return True
    except Exception as e:
        print('ERREUR\nErreur:', e)
        sd = False
        update_sd_icon()
        return False

# ------------------------------ ADC -------------------------------
adc = ADC(Pin(34)) 
adc.atten(ADC.ATTN_11DB)  # Pour lire jusqu'a 3.6 V
adc.width(ADC.WIDTH_12BIT) 

# ------------------------------ OLED -------------------------------
from icons import wifi_on, wifi_searching, wifi_off, sd_on, sd_off, battery_full, battery_3, battery_2, battery_1, battery_empty, bluetooth_on, bluetooth_off, device_on, device_off, battery_full_charging
i2c = I2C(0, scl=Pin(22), sda=Pin(21))
oled = ssd1306.SSD1306_I2C(128, 32, i2c)

def update_wifi_icon():
    global wifi
    if(wifi):
        icon = wifi_on
    elif wifi is None:
        icon = wifi_searching
    else:
        icon = wifi_off
    fb = framebuf.FrameBuffer(icon, 12, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 0, 0)
    oled.show()

def update_sd_icon():
    global sd
    if(sd):
        icon = sd_on
    else:
        icon = sd_off
    fb = framebuf.FrameBuffer(icon, 12, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 12+1, 0)
    oled.show()

def update_bluetooth_icon():
    global bluetooth
    if(bluetooth):
        icon = bluetooth_on
    else:
        icon = bluetooth_off
    fb = framebuf.FrameBuffer(icon, 12, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 24+2, 0)
    oled.show()

def update_device_icon(state = None):
    global device
    if(state is not None):
        device = state
    if state:
        icon = device_on
    else:
        icon = device_off
    fb = framebuf.FrameBuffer(icon, 12, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 36+3, 0)
    oled.show()

battery_blink = False
def update_battery_icon(percent = -1):
    global battery_blink
    if(percent == -1):
        voltage = read_battery_voltage()
        percent = battery_percent(voltage)
    
    if(battery_charging()):
        if(battery_blink):
            if percent >= 90:  
                icon = battery_empty
            elif percent >= 75:
                icon = battery_3
            elif percent >= 50:
                icon = battery_2
            elif percent >= 25:
                icon = battery_1
            else:
                icon = battery_empty
        else:
            if percent >= 90:  
                icon = battery_full_charging
            elif percent >= 75:
                icon = battery_full
            elif percent >= 50:
                icon = battery_3
            elif percent >= 25:
                icon = battery_2
            else:
                icon = battery_1
        battery_blink = not battery_blink
    else:
        if percent >= 90:
            icon = battery_full
        elif percent >= 75:
            icon = battery_3
        elif percent >= 50:
            icon = battery_2
        elif percent >= 25:
            icon = battery_1
        else:
            icon = battery_empty

    fb = framebuf.FrameBuffer(icon, 24, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 128-24, 0)
    oled.show()

def update_icons():
    update_battery_icon()
    update_wifi_icon()
    update_sd_icon()
    update_bluetooth_icon()
    update_device_icon()

# ------------------------------ WIFI -------------------------------
SSID = 'iPhone de Mathis'
PASSWORD = 'mathis1234'

def connect_wifi():
    global wifi
    wifi = False
    update_wifi_icon()

    wlan = network.WLAN(network.STA_IF)
    wlan.active(False)        # ← Reinitialise proprement
    time.sleep(1)
    wlan.active(True)
    wlan.disconnect()         # ← S’assure qu’il ne reste pas connecte

    wifi = None
    update_wifi_icon()
    wlan.connect(SSID, PASSWORD)

    for i in range(20):  # 10s timeout
        if wlan.isconnected():

            wifi = True
            update_wifi_icon()
            return True
        time.sleep(0.5)

    wifi = False
    update_wifi_icon()
    return False

# ------------------------------ BATTERIE -------------------------------
def read_battery_voltage():
    raw = adc.read()
    voltage_adc = (raw / 4095.0) * 3.3  # En volts mesures sur le GPIO
    battery_voltage = voltage_adc * 2  # Corriger le pont diviseur (x2)
    return round(battery_voltage,2)

def battery_percent(voltage):
    if voltage >= 4.2:
        return 100
    elif voltage <= 2.5:
        return -1
    elif voltage <= 3.0:
        return 0
    else:
        return int(((voltage - 3.0) / (4.2 - 3.0)) * 100)

async def battery_loop():
    while True:
        update_battery_icon()
        await asyncio.sleep(1)

detect_pin = Pin(35, Pin.IN, Pin.PULL_DOWN)

def battery_charging():
    voltage = detect_pin.value()
    # Si la tension detectee est superieure a un seuil faible (~0.1V), on considere que ça charge
    # Sur un GPIO digital, value() retourne 0 ou 1, donc on considere 1 = charge detectee
    return voltage > 0

# ------------------------------ BLUETOOTH -------------------------------
def ble_ready():
    print("BLE pret !")
    global bluetooth
    bluetooth = True
    update_bluetooth_icon()

def on_ble_connected():
    print("BLE connecte")
    update_device_icon(True)

def on_ble_disconnected():
    print("BLE deconnecte")
    update_device_icon(False)

def on_ble_transfer(prctg):
    print('transfer :',prctg)
    progress = create_progress_bar(prctg)
    fb = framebuf.FrameBuffer(progress, 128, 8, framebuf.MONO_HLSB)
    oled.blit(fb, 0, 24)
    oled.show()

    if(prctg == 100):
        oled.fill_rect(0, 24, 128, 8, 0)
        oled.text('complete', 40, 24, 1)
        oled.show()
        time.sleep(1)
        oled.fill_rect(0, 24, 128, 8, 0)
        oled.show()

def create_progress_bar(percentage, width=128, height=8, show_text=True):
    import framebuf

    percentage = max(0, min(percentage, 100))

    # Preparer le buffer
    buffer = bytearray(width * height // 8)
    fb = framebuf.FrameBuffer(buffer, width, height, framebuf.MONO_HLSB)

    # Remplir la barre
    fb.fill(0)
    fill_width = int((percentage / 100) * width)
    fb.fill_rect(0, 0, fill_width, height, 1)

    # Afficher le texte centre
    if show_text:
        label = f"{percentage:.0f}%"
        char_width = 8  # approx. monospace, 8 pixels
        text_width = len(label) * char_width
        text_x = max(0, (width - text_width) // 2)
        text_y = max(0, (height - 8) // 2)  # Centre verticalement (si hauteur ≥ 8)
        fb.text(label, text_x, text_y, 0 if fill_width > text_x + text_width else 1)

    return buffer


# ------------------------------ SETUP -------------------------------

async def setup():
    global bluetooth

    update_icons()
    print("Starting setup...")
    init_sd()

    ble = BLEFileService(on_success=ble_ready, sd=None,
                         start_recording=start_recording, stop_recording=stop_recording)
    ble.set_connection_callbacks(on_ble_connected, on_ble_disconnected, on_ble_transfer)

    # Lancer la boucle batterie en tâche parallele
    asyncio.create_task(battery_loop())
    #connect_wifi()

    # Attendre indefiniment pour laisser tourner BLE
    for i in range(0, 100):
        progress = create_progress_bar(i, width=128, height=8)

        time.sleep(0.03)
    while True:
        await asyncio.sleep(60)

asyncio.run(setup())