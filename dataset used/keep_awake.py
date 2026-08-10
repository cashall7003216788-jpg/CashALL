"""
Keep Awake Script for Windows
Prevents Windows from entering sleep mode or turning off the display
while the Cashify scraper process is active.
"""
import time
import ctypes
import os
import sys

ES_CONTINUOUS       = 0x80000000
ES_SYSTEM_REQUIRED  = 0x00000001
ES_DISPLAY_REQUIRED = 0x00000002

def prevent_sleep():
    try:
        # SetThreadExecutionState prevents system sleep & display timeout
        res = ctypes.windll.kernel32.SetThreadExecutionState(
            ES_CONTINUOUS | ES_SYSTEM_REQUIRED | ES_DISPLAY_REQUIRED
        )
        if res:
            print("System and display sleep prevention ACTIVE.", flush=True)
    except Exception as e:
        print(f"Could not set execution state: {e}", flush=True)

if __name__ == "__main__":
    print("=== KEEP AWAKE PROCESS STARTED ===", flush=True)
    prevent_sleep()
    
    # Keep loop running to maintain continuous active state
    while True:
        prevent_sleep()
        time.sleep(30)
