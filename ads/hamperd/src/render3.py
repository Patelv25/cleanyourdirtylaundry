#!/usr/bin/env python3
"""Render reel3.html (fitted-sheet edition) to stills or MP4."""
import subprocess, sys, time
from pathlib import Path
from playwright.sync_api import sync_playwright

S = Path(__file__).parent
FF = "/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2"
CHROMIUM = "/opt/pw-browsers/chromium"
PAGE = "reel3.html"

def launch(p):
    browser = p.chromium.launch(
        executable_path=CHROMIUM,
        args=["--allow-file-access-from-files", "--force-device-scale-factor=1",
              "--hide-scrollbars", "--disable-lcd-text", "--font-render-hinting=none"],
    )
    page = browser.new_page(viewport={"width": 1080, "height": 1920})
    page.goto(f"file://{S}/{PAGE}")
    page.wait_for_function("window.READY === true", timeout=60000)
    return browser, page

def stills(times):
    out = S / "stills3"; out.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser, page = launch(p)
        for t in times:
            page.evaluate(f"seek({t})")
            page.screenshot(path=str(out / f"still_{t:05.2f}.png"))
        browser.close()
    print("stills done:", [f"{t:.2f}" for t in times])

def movie(outname="hamperd-reel3.mp4"):
    fps = 30
    t0 = time.time()
    with sync_playwright() as p:
        browser, page = launch(p)
        total = page.evaluate("TOTAL")
        n = int(round(total * fps))
        ff = subprocess.Popen(
            [FF, "-y", "-f", "image2pipe", "-framerate", str(fps), "-i", "-",
             "-c:v", "libx264", "-preset", "medium", "-crf", "18",
             "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(S / outname)],
            stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for i in range(n):
            page.evaluate(f"seek({i / fps})")
            ff.stdin.write(page.screenshot(type="png"))
            if i % 90 == 0:
                print(f"frame {i}/{n} ({time.time()-t0:.0f}s)", flush=True)
        browser.close()
        ff.stdin.close(); ff.wait()
    print(f"encoded {outname} in {time.time()-t0:.0f}s")

if __name__ == "__main__":
    if sys.argv[1:] and sys.argv[1] == "movie":
        movie()
    else:
        stills([1.70, 5.10, 8.50, 11.70, 16.00])
