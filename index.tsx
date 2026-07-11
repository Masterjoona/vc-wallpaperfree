/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import { classNameFactory } from "@utils/css";
import definePlugin, { OptionType } from "@utils/types";
import { Channel } from "@vencord/discord-types";

import { ChannelContextPatch, GuildContextPatch, UserContextPatch } from "./components/ctxmenu";
import { Buttons } from "./components/util";
import { migrateFromStore } from "./store";

export const cl = classNameFactory("vc-wpfree-");

export const settings = definePluginSettings({
    buttons: {
        description: "Set a global default wallpaper for all channels.",
        type: OptionType.COMPONENT,
        component: Buttons
    },
    channelRecord: {
        description: "",
        type: OptionType.CUSTOM,
        default: {} as Record<string, string>,
    },
    guildRecord: {
        description: "",
        type: OptionType.CUSTOM,
        default: {} as Record<string, string>,
    },
    globalDefaultURL: {
        description: "",
        type: OptionType.STRING,
        default: "",
        hidden: true,
    }
});

function WallpaperState(channel: Channel) {
    const { channelRecord, guildRecord, globalDefaultURL } = settings.use(["channelRecord", "guildRecord", "globalDefaultURL"]);

    const channelUrl = channelRecord[channel.id] ?? channelRecord[channel.parent_id];
    if (channelUrl) return { url: channelUrl, source: channelRecord[channel.id] ? channel.id : channel.parent_id };

    const guildUrl = channel.guild_id ? guildRecord[channel.guild_id] : undefined;
    if (guildUrl) return { url: guildUrl, source: channel.guild_id };

    if (globalDefaultURL) return { url: globalDefaultURL, source: "global" };

    return { url: null, source: null };
}

export default definePlugin({
    name: "WallpaperFree",
    authors: [Devs.Joona],
    description: "Recreation of the old DM wallpaper experiment; Set a background image for any channel, user or server.",
    requiresRestart: !IS_WEB,
    patches: [
        {
            find: ".handleSendMessage,onResize",
            group: true,
            replacement: [
                {
                    match: /keyboardModeEnabled:\(/,
                    replace: "vcWallpaperFree:$self.WallpaperState(arguments[0].channel),$&"
                },
                {
                    match: /}\)]}\)](?=.{1,30}messages-)/,
                    replace: "$&.toSpliced(0,0,$self.Wallpaper(this.props.vcWallpaperFree))"
                }
            ]
        }
    ],
    settings,
    contextMenus: {
        "user-context": UserContextPatch,
        "channel-context": ChannelContextPatch,
        "thread-context": ChannelContextPatch,
        "gdm-context": ChannelContextPatch,
        "guild-context": GuildContextPatch,
    },

    Wallpaper({ url, source }: ReturnType<typeof WallpaperState>) {
        // no we cant place the hook here
        if (!url) return null;

        return <div
            className={cl("wp-container")}
            data-wallpaper-source={source}
            data-wallpaper-url={url}
            style={{ backgroundImage: `url(${url})` }}>
        </div>;
    },

    WallpaperState,

    start() {
        if (Object.keys(settings.store.channelRecord).length > 0
            || Object.keys(settings.store.guildRecord).length > 0
            || settings.store.globalDefaultURL) return;

        const oldData = migrateFromStore();
        if (!oldData) return;

        const { channelRecord, guildRecord, globalDefaultURL } = oldData;
        settings.store.channelRecord = channelRecord;
        settings.store.guildRecord = guildRecord;
        settings.store.globalDefaultURL = globalDefaultURL;
    }
});
