#!/usr/bin/env python3
"""Render outro.html to outro.mp4 and tag.html to tag.png."""
import subprocess, time
from pathlib import Path
from playwright.sync_api import sync_playwright

S = Path(__file__).parent
FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
CHROMIUM = "/opt/pw-browsers/chromium"

with sync_playwright() as p:
    browser = p.chromium.launch(
        executable_path=CHROMIUM,
        args=["--allow-file-access-from-files", "--force-device-scale-factor=1",
              "--hide-scrollbars", "--disable-lcd-text", "--font-render-hinting=none"])

    # tag png (transparent)
    tp = browser.new_page(viewport={"width": 340, "height": 96})
    tp.goto(f"file://{S}/tag.html")
    tp.wait_for_function("window.READY === true", timeout=30000)
    tp.screenshot(path=str(S / "tag.png"), omit_background=True)
    tp.close()

    # outro movie
    page = browser.new_page(viewport={"width": 1080, "height": 1920})
    page.goto(f"file://{S}/outro.html")
    page.wait_for_function("window.READY === true", timeout=30000)
    fps = 30
    total = page.evaluate("TOTAL")
    n = int(round(total * fps))
    ff = subprocess.Popen(
        [FF, "-y", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
         "-c:v", "libx264", "-preset", "medium", "-crf", "18",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(S / "outro.mp4")],
        stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    t0 = time.time()
    for i in range(n):
        page.evaluate(f"seek({i / fps})")
        ff.stdin.write(page.screenshot(type="png"))
    browser.close()
    ff.stdin.close(); ff.wait()
    print(f"outro.mp4 + tag.png done in {time.time()-t0:.0f}s ({n} frames)")
