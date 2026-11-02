#!/usr/bin/env python3
"""Generate Pandlens-branded WordPress.org banner and icon PNGs."""
from __future__ import annotations

import struct
import zlib
from pathlib import Path

TEAL = (0x0D, 0x9B, 0x8C)
DARK = (0x0B, 0x12, 0x1A)
WHITE = (0xF5, 0xF7, 0xFA)
ACCENT = (0x14, 0xB8, 0xA6)


def png_from_rgb_grid(pixels: list[list[tuple[int, int, int]]], path: Path) -> None:
    h = len(pixels)
    w = len(pixels[0])

    def chunk(tag: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    raw = b"".join(b"\x00" + bytes(channel for pixel in row for channel in pixel) for row in pixels)
    ihdr = struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)
    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(data)


def lerp(a: int, b: int, t: float) -> int:
    return int(a + (b - a) * t)


def gradient(w: int, h: int) -> list[list[tuple[int, int, int]]]:
    out: list[list[tuple[int, int, int]]] = []
    for y in range(h):
        row: list[tuple[int, int, int]] = []
        t = y / max(h - 1, 1)
        for x in range(w):
            base = (
                lerp(DARK[0], TEAL[0], t * 0.55),
                lerp(DARK[1], TEAL[1], t * 0.55),
                lerp(DARK[2], TEAL[2], t * 0.55),
            )
            row.append(base)
        out.append(row)
    return out


def fill_rect(grid, x0, y0, x1, y1, color):
    h, w = len(grid), len(grid[0])
    for y in range(max(0, y0), min(h, y1)):
        for x in range(max(0, x0), min(w, x1)):
            grid[y][x] = color


def draw_pin(grid, cx, cy, r):
    fill_rect(grid, cx - r // 3, cy - r, cx + r // 3, cy, ACCENT)
    for y in range(cy, cy + r):
        for x in range(cx - (y - cy), cx + (y - cy) + 1):
            if 0 <= y < len(grid) and 0 <= x < len(grid[0]):
                grid[y][x] = ACCENT


def draw_banner(w: int, h: int) -> list[list[tuple[int, int, int]]]:
    grid = gradient(w, h)
    pin_r = max(18, h // 8)
    draw_pin(grid, w // 5, h // 2 - pin_r // 2, pin_r)
    # Title block
    tx = w // 5 + pin_r + 24
    ty = h // 2 - 18
    fill_rect(grid, tx, ty, tx + min(420, w - tx - 20), ty + 36, TEAL)
    fill_rect(grid, tx + 4, ty + 4, tx + min(416, w - tx - 24), ty + 32, DARK)
    # Simplified wordmark bars for "Pandlens"
    bx = tx + 20
    by = ty + 12
    for i, width in enumerate([28, 42, 22, 36, 18, 34, 26, 30]):
        fill_rect(grid, bx, by, bx + width, by + 8, WHITE)
        bx += width + 10
        if bx > tx + 360:
            break
    return grid


def draw_icon(size: int) -> list[list[tuple[int, int, int]]]:
    grid = gradient(size, size)
    draw_pin(grid, size // 2, size // 2 - size // 10, size // 3)
    return grid


def main() -> None:
    out = Path(__file__).resolve().parent / "pandlens-adresgegevens" / "assets" / "wordpress-org"
    out.mkdir(parents=True, exist_ok=True)
    png_from_rgb_grid(draw_banner(772, 250), out / "banner-772x250.png")
    png_from_rgb_grid(draw_banner(1544, 500), out / "banner-1544x500.png")
    png_from_rgb_grid(draw_icon(128), out / "icon-128x128.png")
    png_from_rgb_grid(draw_icon(256), out / "icon-256x256.png")
    print("Wrote brand assets to", out)


if __name__ == "__main__":
    main()
