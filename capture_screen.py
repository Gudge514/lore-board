import mss
import mss.tools

with mss.mss() as sct:
    # Capture the entire screen
    monitor = sct.monitors[1]
    screenshot = sct.grab(monitor)
    
    # Save to PNG
    output_path = "D:/openclaw-workspace/projects/lore-board/loreboard-screenshot.png"
    mss.tools.to_png(screenshot.rgb, screenshot.size, output=output_path)
    print(f"Screenshot saved to {output_path}")
