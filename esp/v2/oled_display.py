from machine import Pin, I2C
import framebuf
import ssd1306
from icons import wifi_on, wifi_searching, wifi_off, sd_on, sd_off, bluetooth_on, bluetooth_off, device_on, device_off, battery_full, battery_3, battery_2, battery_1, battery_empty, battery_full_charging
from battery import read_battery_voltage, battery_percent, battery_charging

i2c = I2C(0, scl=Pin(22), sda=Pin(21))
oled = ssd1306.SSD1306_I2C(128, 32, i2c)

wifi = False
sd = False
bluetooth = False
device = False
battery_blink = False

def update_wifi_icon():
    global wifi
    icon = wifi_on if wifi else wifi_searching if wifi is None else wifi_off
    fb = framebuf.FrameBuffer(icon, 12, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 0, 0)
    oled.show()

def update_sd_icon(state=None):
    global sd
    if state is not None:
        sd = state
    icon = sd_on if sd else sd_off
    fb = framebuf.FrameBuffer(icon, 12, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 12+1, 0)
    oled.show()

def update_bluetooth_icon(state=None):
    global bluetooth
    if state is not None:
        bluetooth = state
    icon = bluetooth_on if bluetooth else bluetooth_off
    fb = framebuf.FrameBuffer(icon, 12, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 24+2, 0)
    oled.show()

def update_device_icon(state=None):
    global device
    if state is not None:
        device = state
    icon = device_on if device else device_off
    fb = framebuf.FrameBuffer(icon, 12, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 36+3, 0)
    oled.show()

def update_battery_icon(percent=-1):
    global battery_blink
    if percent == -1:
        voltage = read_battery_voltage()
        percent = battery_percent(voltage)

    if battery_charging():
        if battery_blink:
            icon = battery_empty if percent >= 90 else battery_3 if percent >= 75 else battery_2 if percent >= 50 else battery_1 if percent >= 25 else battery_empty
        else:
            icon = battery_full_charging if percent >= 90 else battery_full if percent >= 75 else battery_3 if percent >= 50 else battery_2 if percent >= 25 else battery_1
        battery_blink = not battery_blink
    else:
        icon = battery_full if percent >= 90 else battery_3 if percent >= 75 else battery_2 if percent >= 50 else battery_1 if percent >= 25 else battery_empty

    fb = framebuf.FrameBuffer(icon, 24, 12, framebuf.MONO_HLSB)
    oled.blit(fb, 128-24, 0)
    oled.show()

def update_icons():
    update_battery_icon()
    update_wifi_icon()
    update_sd_icon()
    update_bluetooth_icon()
    update_device_icon()

def create_progress_bar(percentage, width=128, height=8, show_text=True):
    buffer = bytearray(width * height // 8)
    fb = framebuf.FrameBuffer(buffer, width, height, framebuf.MONO_HLSB)

    percentage = max(0, min(percentage, 100))
    fb.fill(0)
    fill_width = int((percentage / 100) * width)
    fb.fill_rect(0, 0, fill_width, height, 1)

    if show_text:
        label = f"{percentage:.0f}%"
        char_width = 8
        text_width = len(label) * char_width
        text_x = max(0, (width - text_width) // 2)
        text_y = max(0, (height - 8) // 2)
        fb.text(label, text_x, text_y, 0 if fill_width > text_x + text_width else 1)

    return fb
