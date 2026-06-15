/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { THEMES_DIR } from "@main/utils/constants";
import { BrowserWindow, dialog, FileFilter, SaveDialogOptions, shell } from "electron";

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

function getExtensionFromString(filename: string): string | null {
    const i = filename.lastIndexOf(".");

    return i > 0 ? filename.substring(i + 1) : null;
}

async function saveWallpaperDialog(defaultName: string): Promise<string> {
    try {
        const window = BrowserWindow.getFocusedWindow();
        const extension = getExtensionFromString(defaultName);

        const filters: FileFilter[] = [{ name: "All", extensions: ["*"] }];

        if (extension) {
            filters.unshift({ name: extension, extensions: [extension] });
        }

        const options: SaveDialogOptions = {
            title: "Save Wallpaper",
            defaultPath: path.join(WALLPAPERS_DIR, defaultName),
            buttonLabel: "Save Wallpaper",
            filters,
        };

        const response = await (window
            ? dialog.showSaveDialog(window, options)
            : dialog.showSaveDialog(options)
        );

        if (response.canceled || !response.filePath) {
            throw new Error("Save canceled by user");
        }

        return response.filePath;
    } catch (error) {
        throw mapError("Saving file dialog failed", error);
    }
}

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

export async function downloadWallpaper(_, url: string): Promise<string> {
    try {
        if (url.startsWith("vencord:///"))
            return url;

        if (!url.startsWith("http"))
            throw new Error("Invalid URL");

        const response = await fetch(url);
        if (!response.ok)
            throw new Error(`${response.status} HTTP error: ${response.statusText}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        const filePath = await saveWallpaperDialog(getFilenameFromResponse(url, response));

        await fs.mkdir(WALLPAPERS_DIR, { recursive: true });
        await fs.writeFile(filePath, buffer);

        return `vencord:///themes/WallpaperFree/${(path.basename(filePath))}`;
    } catch (error) {
        throw mapError("Wallpaper download failed", error);
    }
}

export async function deleteWallpaper(_, filename: string): Promise<void> {
    try {
        await fs.rm(path.join(WALLPAPERS_DIR, filename));
    } catch (error) {
        throw mapError("Wallpaper deletion failed", error);
    }
}

export async function listLocalWallpapers(_): Promise<string[]> {
    try {
        await fs.mkdir(WALLPAPERS_DIR, { recursive: true });
        return await fs.readdir(WALLPAPERS_DIR);
    } catch (error) {
        throw mapError("Listing wallpapers error", error);
    }
}
