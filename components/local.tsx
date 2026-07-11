/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Flex } from "@components/Flex";
import { Paragraph } from "@components/Paragraph";
import { useAwaiter } from "@utils/react";
import { PluginNative } from "@utils/types";
import { RenderModalProps } from "@vencord/discord-types";
import { Modal, showToast, Toasts } from "@webpack/common";

import { cl } from "..";

const Native = VencordNative.pluginHelpers.WallpaperFree as PluginNative<typeof import("../native")>;

interface Props {
    props: RenderModalProps;
    onSelect?: (url: string) => void;
}

export function ViewLocalWallpapers({ props, onSelect }: Props) {
    const [localWallpapers] = useAwaiter(Native.listLocalWallpapers, {
        onError: e => showToast(String(e), Toasts.Type.FAILURE, { duration: 10_000 }),
        fallbackValue: [],
    });

    return (
        <Modal
            {...props}
            title="Local Wallpapers"
            size="xl"
            actions={[
                {
                    text: "Cancel",
                    variant: "secondary",
                    onClick: props.onClose,
                },
                {
                    text: "Open WallpaperFree Directory",
                    variant: "primary",
                    async onClick() {
                        const error = await Native.openLocalWallpapersDirectory();
                        if (error) showToast(String(error), Toasts.Type.FAILURE, { duration: 10_000 });
                    },
                },
            ]}
        >
            {localWallpapers.length
                ? <div className={cl("grid")}>
                    {localWallpapers.map(wallpaper => (
                        <div
                            className={cl("localwp-container")}
                            key={wallpaper}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                            }}
                        >
                            <img
                                src={wallpaper}
                                style={{
                                    display: "block",
                                    width: "100%",
                                    height: "auto",
                                    objectFit: "cover",
                                    borderRadius: 8,
                                    cursor: onSelect ? "pointer" : undefined,
                                }}
                                onClick={() => {
                                    if (!onSelect) return;

                                    onSelect(wallpaper);
                                    props.onClose();
                                }}
                            />
                        </div>
                    ))}
                </div>
                : <Flex
                    style={{
                        width: "100%",
                        height: "100%",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Paragraph style={{ color: "var(--text-default)" }}>The WallpaperFree directory is empty</Paragraph>
                </Flex>}
        </Modal>
    );
}
