/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import fs from "node:fs/promises";
import path from "node:path";

import { THEMES_DIR } from "@main/utils/constants";
import { shell } from "electron";

const WALLPAPERS_DIR = path.join(THEMES_DIR, "WallpaperFree");

function mapError(message: string, error: any): Error {
    return new Error(`${message}: ${error instanceof Error ? error.message : String(error)}`);
}

export async function openLocalWallpapersDirectory(_): Promise<void> {
    try {
        await shell.openPath(WALLPAPERS_DIR);
    } catch (error) {
        throw mapError("Opening WallpaperFree directory failed", error);
    }
}

export async function listLocalWallpapers(_): Promise<string[]> {
    try {
        await fs.mkdir(WALLPAPERS_DIR, { recursive: true });
        const files = await fs.readdir(WALLPAPERS_DIR);
        return files.map(filename => `vencord:///themes/WallpaperFree/${filename}`);
    } catch (error) {
        throw mapError("Listing wallpapers error", error);
    }
}
