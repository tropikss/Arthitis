from machine import I2S, Pin, SDCard
import os, struct

# Init SD
sd = SDCard(slot=2, sck=18, miso=19, mosi=23, cs=5, freq=1_000_000)
os.mount(sd, "/sd")

# Init I2S (stéréo 32-bit)
audio = I2S(
    1,
    sck=Pin(32),
    ws=Pin(25),
    sd=Pin(33),
    mode=I2S.RX,
    bits=32,
    format=I2S.STEREO,
    rate=16000,
    ibuf=2048
)

# WAV params
DURATION = 5
RATE = 16000
NUM_FRAMES = DURATION * RATE
BUF = bytearray(512)

# Fichier WAV
f = open("/sd/audio_stereo.wav", "wb")

def write_wav_header(f, num_frames):
    data_size = num_frames * 2 * 2  # 2 canaux × 2 octets
    f.write(b'RIFF')
    f.write(struct.pack('<I', 36 + data_size))
    f.write(b'WAVEfmt ')
    f.write(struct.pack('<I', 16))
    f.write(struct.pack('<H', 1))      # PCM
    f.write(struct.pack('<H', 2))      # Stéréo
    f.write(struct.pack('<I', RATE))
    f.write(struct.pack('<I', RATE * 4))
    f.write(struct.pack('<H', 4))
    f.write(struct.pack('<H', 16))
    f.write(b'data')
    f.write(struct.pack('<I', data_size))

write_wav_header(f, NUM_FRAMES)

print("Enregistrement...")

frames_written = 0
while frames_written < NUM_FRAMES:
    n = audio.readinto(BUF)
    if n:
        for i in range(0, n, 8):
            l = int.from_bytes(BUF[i:i+4], 'big', True) >> 16
            r = int.from_bytes(BUF[i+4:i+8], 'big', True) >> 16
            f.write(struct.pack('<h', l))
            f.write(struct.pack('<h', r))
            frames_written += 1
            if frames_written >= NUM_FRAMES:
                break

f.close()
audio.deinit()
print("OK : /sd/audio_stereo.wav")
