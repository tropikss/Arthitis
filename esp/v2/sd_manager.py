import uos, machine
from oled_display import update_sd_icon
import re

sd_card = machine.SDCard(slot=2, sck=18, miso=19, mosi=23, cs=5, freq=1_000_000)


def init_sd():
    try:
        uos.mount(sd_card, "/sd")
        update_sd_icon(True)
        print("SD card mounted successfully")
        return True
    except Exception:
        update_sd_icon(False)
        print("Failed to mount SD card")
        return False

def get_sd_free_space():
    stats = uos.statvfs("/sd")
    return stats[0] * stats[3]

def get_all_wav():
    try:
        files = uos.listdir("/sd")
        wav_files = []
        for f in files:
            if f.endswith(".wav") and len(f) == 42:  # UUID + ".wav"
                parts = f[:-6].split('-')
                if len(parts) == 5 and all(len(p) == l for p, l in zip(parts, [8, 4, 4, 4, 12])):
                    wav_files.append(f)
        return wav_files
    except Exception as e:
        print("Error listing WAV files:", e)
        return []