/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { THEMES_DIR } from "@main/utils/constants";
import { shell } from "electron";

const WALLPAPERS_DIR = path.join(THEMES_DIR, "WallpaperFree");

function sanitizeFilename(name: string): string {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

function getFilenameFromResponse(url: string, response: Response): string {
    const cd = response.headers.get("content-disposition");

    if (cd) {
        const match = cd.match(/filename(?:=|\*=UTF-8'')"?([^";]+)"?/i);

        if (match?.[1]) {
            return sanitizeFilename(decodeURIComponent(match[1]));
        }
    }

    const { pathname } = new URL(url);
    const base = path.posix.basename(pathname);

    if (base && base !== "/" && base !== ".") {
        return sanitizeFilename(base);
    }

    return `${randomUUID()}.bin`;
}

function mapError(message: string, error: any) {
    return `${message}: ${error instanceof Error ? error.message : String(error)}`;
}

export async function ensureLocalWallpapersDirectory(_): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.mkdir(WALLPAPERS_DIR, { recursive: true })
            .then(() => resolve())
            .catch(error => reject(mapError("Creating wallpaper directory failed", error)));
    });
}

export async function openLocalWallpapersDirectory(_): Promise<void> {
    return new Promise((resolve, reject) => {
        shell
            .openPath(WALLPAPERS_DIR)
            .then(failure => failure ? reject(failure) : resolve())
            .catch(error => reject(mapError("Opening WallpaperFree directory failed", error)));
    });
}

export async function downloadWallpaper(_, url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        (async () => {
            if (url.startsWith("vencord:///"))
                return url;

            if (!url.startsWith("http"))
                throw new Error("Invalid URL");

            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`${response.status} HTTP error: ${response.statusText}`);

            const buffer = Buffer.from(await response.arrayBuffer());
            const filename = getFilenameFromResponse(url, response);

            await fs.mkdir(WALLPAPERS_DIR, { recursive: true });
            await fs.writeFile(path.join(WALLPAPERS_DIR, filename), buffer);

            return `vencord:///themes/WallpaperFree/${filename}`;
        })()
            .then(value => resolve(value))
            .catch(error => reject(mapError("Wallpaper download failed", error)));
    });
}

export async function deleteWallpaper(_, filename: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs
            .rm(path.join(WALLPAPERS_DIR, filename))
            .then(value => resolve(value))
            .catch(error => reject(mapError("Wallpaper deletion failed", error)));
    });
}

export async function listLocalWallpapers(_): Promise<string[]> {
    return new Promise((resolve, reject) => {
        (async () => {
            await fs.mkdir(WALLPAPERS_DIR, { recursive: true });
            return await fs.readdir(WALLPAPERS_DIR);
        })()
            .then(value => resolve(value))
            .catch(error => reject(mapError("Listing wallpapers error", error)));
    });
}
