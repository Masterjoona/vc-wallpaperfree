/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button, Paragraph } from "@components/index";
import { makeCodeblock } from "@utils/text";
import { RenderModalProps } from "@vencord/discord-types";
import { GuildStore, Modal, openModal, Parser } from "@webpack/common";

import { settings } from "..";
import { ViewLocalWallpapers } from "./local";
import { SetWallpaperModal } from "./modal";

function GlobalDefaultComponent() {
    const setGlobal = (url: string | undefined) => settings.store.globalDefaultURL = url ?? "";

    return (
        <>
            <Button onClick={() => {
                openModal(props => <SetWallpaperModal props={props} onSelect={setGlobal} initialUrl={settings.store.globalDefaultURL} />);
            }}>Set a global wallpaper</Button>

            <Button
                variant="dangerPrimary"
                onClick={() => setGlobal(void 0)}
            >Remove global default wallpaper</Button>

            <Button
                variant="dangerPrimary"
                onClick={() => {
                    settings.store.channelRecord = {};
                    settings.store.guildRecord = {};
                    settings.store.globalDefaultURL = "";
                }}
            >Reset wallpaper data</Button>

            {!IS_WEB &&
                <Button
                    onClick={() => openModal(props => <ViewLocalWallpapers props={props}/>)}
                >View local Wallpapers</Button>
            }
        </>
    );
}

function ViewAllWallpapers({ props }: { props: RenderModalProps }) {
    const { channelRecord, guildRecord } = settings.use(["channelRecord", "guildRecord"]);

    return (
        <Modal
            {...props}
            title="All Wallpapers"
            size="lg"
        >
            {[
                ...Object.entries(channelRecord)
                    .filter(([, url]) => !!url)
                    .map(([id, url]) => ({ key: `c-${id}`, line: `<#${id}>: ${url}`, url })),
                ...Object.entries(guildRecord)
                    .filter(([, url]) => !!url)
                    .map(([id, url]) => ({ key: `g-${id}`, line: `${GuildStore.getGuild(id)?.name ?? id}: ${url}`, url }))
            ].map(({ key, line, url }) => (
                <div key={key} style={{ marginBottom: 10 }}>
                    <Paragraph>{Parser.parse(line)}</Paragraph>
                    <img
                        src={url}
                        style={{
                            display: "block",
                            width: "100%",
                            height: "auto",
                            objectFit: "cover",
                            borderRadius: 8
                        }}
                    />
                </div>
            ))}
        </Modal>
    );
}

function ViewAllWallpapersButton() {
    return (
        <Button
            onClick={() => openModal(props => <ViewAllWallpapers props={props} />)}>
            View all Wallpapers
        </Button>
    );
}

const tipText = `
.vc-wpfree-wp-container {
    transform: scaleX(-1); /* flip it horizontally */
    filter: blur(4px); /* apply a blur */
    opacity: 0.7; /* self-explanatory */
}

/* If you don't like embeds being transparent */

[class*=embedFull__] {
    background: var(--background-surface-high) !important;
}

/* the same for codeblocks (or use ShikiCodeblocks) */

.hljs {
    background-color: var(--background-base-lowest) !important;
}`;

function TipsComponent() {
    return (
        <div style={{ userSelect: "text" }}>
            {!IS_WEB && (
                <>
                    <Paragraph>
                        You can use local files by having them in the vencord theme directory, and using the url <code>vencord:///themes/filename.ext</code>.
                    </Paragraph>
                    <Paragraph>
                        In order to use the local previewer, save your local files in the <code>WallpaperFree/</code> subdirectory in the vencord theme directory.
                    </Paragraph>
                    <Button onClick={() => VencordNative.themes.openFolder()}>
                        Open Theme Directory
                    </Button>
                </>
            )}
            {Parser.parse(makeCodeblock(tipText, "css"))}
            <Button onClick={() => VencordNative.quickCss.openEditor()}>
                Open QuickCSS
            </Button>
        </div>
    );
}

export function Buttons() {
    return (
        <>
            <GlobalDefaultComponent />
            <TipsComponent />
            <ViewAllWallpapersButton />
        </>
    );
}
