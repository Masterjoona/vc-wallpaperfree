/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { openModal } from "@utils/modal";
import { ChannelStore, Menu } from "@webpack/common";

import { settings } from "..";
import { SetWallpaperModal } from "./modal";


const addWallpaperMenu = (channelId?: string, guildId?: string) => {
    const setWallpaper = (url?: string) => {
        if (channelId) {
            settings.store.channelRecord = {
                ...settings.store.channelRecord,
                [channelId]: url ?? ""
            };
        } else if (guildId) {
            settings.store.guildRecord = {
                ...settings.store.guildRecord,
                [guildId]: url ?? ""
            };
        }
    };

    const initialUrl = settings.store.channelRecord[channelId ?? ""] || settings.store.guildRecord[guildId ?? ""];

    return (
        <Menu.MenuItem label="WallpaperFree" key="vc-wpfree-menu" id="vc-wpfree-menu">
            <Menu.MenuItem
                label="Set Wallpaper"
                id="vc-wpfree-set-wallpaper"
                action={() => openModal(props => <SetWallpaperModal props={props} onSelect={setWallpaper} initialUrl={initialUrl} />)}
            />
            <Menu.MenuSeparator />
            <Menu.MenuItem
                label="Remove Wallpaper"
                id="vc-wpfree-remove-wallpaper"
                color="danger"
                disabled={!initialUrl}
                action={() => setWallpaper(void 0)}
            />
        </Menu.MenuItem>
    );
};

const UserContextPatch: NavContextMenuPatchCallback = (children, args) => {
    if (!args.user) return;
    const dmChannelId = ChannelStore.getDMFromUserId(args.user.id);
    children.push(addWallpaperMenu(dmChannelId));
};

const ChannelContextPatch: NavContextMenuPatchCallback = (children, args) => {
    if (!args.channel) return;
    children.push(addWallpaperMenu(args.channel.id));
};

const GuildContextPatch: NavContextMenuPatchCallback = (children, args) => {
    if (!args.guild) return;
    children.push(addWallpaperMenu(void 0, args.guild.id));
};

export { ChannelContextPatch, GuildContextPatch, UserContextPatch };
