/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button, ButtonProps } from "@components/Button";
import { Flex } from "@components/Flex";
import { DeleteIcon } from "@components/Icons";
import { Paragraph } from "@components/Paragraph";
import { IconComponent } from "@utils/types";
import { RenderModalProps } from "@vencord/discord-types";
import { Modal, showToast, Toasts, useEffect, useState } from "@webpack/common";

import { cl, Native } from "..";

function ButtonWithIcon({ children, Icon, ...buttonProps }: ButtonProps & { Icon: IconComponent; }) {
    return (
        <Button {...buttonProps} >
            <Icon />
            {children}
        </Button>
    );
}

interface Props {
    props: RenderModalProps;
    onSelect?: (url: string) => void;
}

export function ViewLocalWallpapers({ props, onSelect }: Props) {
    const [localWallpapers, setLocalWallpapers] = useState<string[] | null>(null);

    useEffect(() => {
        Native
            .listLocalWallpapers()
            .then(setLocalWallpapers)
            .catch(error => showToast(String(error), Toasts.Type.FAILURE, { duration: 10_000 }));
    }, []);

    const formatUrl = (filename: string) => `vencord:///themes/WallpaperFree/${filename}`;

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
                    onClick() {
                        Native
                            .openLocalWallpapersDirectory()
                            .catch(error => showToast(String(error), Toasts.Type.FAILURE, { duration: 10_000 }));
                    },
                },
            ]}
        >
            {localWallpapers && localWallpapers.length
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
                            src={formatUrl(wallpaper)}
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

                                onSelect(formatUrl(wallpaper));
                                props.onClose();
                            }}
                        />
                        <ButtonWithIcon
                            className={cl("remove-button")}
                            variant="dangerPrimary"
                            style={{
                                position: "absolute",
                                top: 5,
                                right: 5,
                                minWidth: "unset",
                                minHeight: "unset",
                                padding: "7px 9.5px",
                            }}
                            onClick={() => {
                                Native
                                    .deleteWallpaper(wallpaper)
                                    .then(() => setLocalWallpapers(localWallpapers.filter(el => el !== wallpaper)))
                                    .catch(error => showToast(String(error), Toasts.Type.FAILURE, { duration: 10_000 }));
                            }}
                            Icon={DeleteIcon}
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
