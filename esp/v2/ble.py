from ble_server import BLEFileService
from recorder import start_recording, stop_recording
from oled_display import update_icons, update_battery_icon, update_device_icon, update_bluetooth_icon

def ble_ready():
    print("BLE pret !")
    update_bluetooth_icon(True)

def on_ble_transfer(prctg):
    print('transfer :',prctg)
    progress = create_progress_bar(prctg)
    fb = framebuf.FrameBuffer(progress, 128, 8, framebuf.MONO_HLSB)
    oled.blit(fb, 0, 24)
    oled.show()

def on_ble_connected():
    print("BLE connecte")
    update_device_icon(True)

def on_ble_disconnected():
    print("BLE deconnecte")
    update_device_icon(False)

def ble_init():
    ble = BLEFileService(
    on_success=ble_ready,
    sd=None,
    start_recording=start_recording,
    stop_recording=stop_recording
    )
    ble.set_connection_callbacks(on_ble_connected, on_ble_disconnected, on_ble_transfer)