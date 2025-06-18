import uasyncio as asyncio
from oled_display import update_icons, create_progress_bar
from sd_manager import init_sd
from battery import battery_loop
from oled_display import update_battery_icon
from ble import ble_init

async def setup():
    update_icons()
    init_sd()
    ble_init()
    asyncio.create_task(battery_loop(update_battery_icon))

    while True:
        await asyncio.sleep(60)

asyncio.run(setup())
