import uasyncio as asyncio
from machine import Pin, ADC

adc = ADC(Pin(34))
adc.atten(ADC.ATTN_11DB)
adc.width(ADC.WIDTH_12BIT)

detect_pin = Pin(35, Pin.IN, Pin.PULL_DOWN)


def read_battery_voltage():
    raw = adc.read()
    voltage_adc = (raw / 4095.0) * 3.3
    battery_voltage = voltage_adc * 2
    return round(battery_voltage, 2)

def battery_percent(voltage):
    if voltage >= 4.2:
        return 100
    elif voltage <= 2.5:
        return -1
    elif voltage <= 3.0:
        return 0
    else:
        return int(((voltage - 3.0) / (4.2 - 3.0)) * 100)

def battery_charging():
    return detect_pin.value() > 0

async def battery_loop(callback):
    while True:
        callback()
        await asyncio.sleep(1)
