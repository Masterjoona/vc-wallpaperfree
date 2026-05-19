/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Button, Paragraph } from "@components/index";
import { RenderModalProps } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { ConfirmModal, openModal, showToast, TextInput, Toasts, useEffect, useState } from "@webpack/common";

import { Native } from "..";
import { ViewLocalWallpapers } from "./local";

const UserSettingsModal = findByPropsLazy("openUserSettings");

interface Props {
    props: RenderModalProps;
    onSelect: (url: string) => void;
    initialUrl: string | undefined;
}

export function SetWallpaperModal({ props, onSelect, initialUrl }: Props) {
    const [url, setUrl] = useState(initialUrl ?? "");
    const [cspError, setCspError] = useState(false);

    useEffect(() => {
        const handler = (event: SecurityPolicyViolationEvent) => {
            if (event.effectiveDirective !== "img-src" || !event.blockedURI) return;
            setCspError(true);
        };

        document.addEventListener("securitypolicyviolation", handler);

        return () => {
            document.removeEventListener("securitypolicyviolation", handler);
        };
    }, []);

    return (
        <ConfirmModal
            {...props}
            title="Set wallpaper"
            confirmText="Apply"
            variant="primary"
            onConfirm={() => onSelect(url)}
            actionBarInput={!IS_WEB &&
                <Button
                    onClick={() => {
                        Native
                            .downloadWallpaper(url)
                            .then(url => {
                                onSelect(url);
                                props.onClose();
                            })
                            .catch(error => showToast(String(error), Toasts.Type.FAILURE, { duration: 10_000 }));
                    }}
                    disabled={!url}
                    variant="positive"
                >Download & Apply</Button>
            }
        >
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
                <Paragraph>The image url</Paragraph>
                <TextInput
                    value={url}
                    onChange={u => {
                        setUrl(u);
                        setCspError(false);
                    }}
                    autoFocus
                />
                {cspError && (
                    <>

                        <Paragraph style={{ color: "var(--text-feedback-critical, var(--text-default))" }}>
                            Uh oh! The image URL you provided is not allowed by the Content Security Policy. You can allow it in the Vencord Theme settings{!IS_WEB && <> or use the download button</>}!
                        </Paragraph>
                        <Button
                            onClick={() => { props.onClose(); UserSettingsModal.openUserSettings("vencord_themes_panel"); }}
                        >
                            Open Theme Settings
                        </Button>
                    </>
                )}
                {url && !cspError && (
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
                )}
                {!IS_WEB &&
                    <Button
                        onClick={() => openModal(props => <ViewLocalWallpapers onSelect={setUrl} props={props}/>)}
                    >Select from local Wallpapers</Button>
                }
            </div>
        </ConfirmModal>
    );
}
