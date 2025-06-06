/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ModalContent, ModalHeader, ModalProps, ModalRoot, ModalSize, openModal } from "@utils/modal";
import { relaunch } from "@utils/native";
import { PluginNative } from "@utils/types";
import { Alerts, Button, Text, TextInput, useEffect, useState } from "@webpack/common";

const Native = VencordNative.pluginHelpers.WallpaperFree as PluginNative<typeof import("../native")>;

interface Props {
    props: ModalProps;
    onSelect: (url: string) => void;
}

export function SetWallpaperModal({ props, onSelect }: Props) {
    const [url, setUrl] = useState("");
    const [cspError, setCspError] = useState(false);

    useEffect(() => {
        const handler = (event: SecurityPolicyViolationEvent) => {
            if (event.effectiveDirective !== "img-src" || !event.blockedURI) return;
            setCspError(true);
        };

        window.addEventListener("securitypolicyviolation", handler);

        return () => {
            window.removeEventListener("securitypolicyviolation", handler);
        };
    }, []);

    return (
        <ModalRoot {...props} size={ModalSize.SMALL}>
            <ModalHeader>
                <Text variant="heading-lg/normal" style={{ marginBottom: 8 }}>
                    Set wallpaper
                </Text>
            </ModalHeader>
            <ModalContent>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Text>The image url</Text>
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

                            <Text style={{ color: "var(--text-danger)" }}>
                                "Uh oh! The image URL you provided is not allowed by the Content Security Policy."
                            </Text>
                            <Button
                                onClick={() => openModal(props => <AddDomainModal props={props} />)}
                            >
                                Add to CSP
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
                                border: "1px solid var(--background-modifier-accent)",
                                borderRadius: 8
                            }}
                        />
                    )}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <Button onClick={props.onClose}>Cancel</Button>
                        <Button
                            color={Button.Colors.BRAND}
                            onClick={() => {
                                onSelect(url);
                                props.onClose();
                            }}
                            disabled={!url || cspError}
                        >Apply</Button>
                    </div>
                </div>
            </ModalContent>
        </ModalRoot >
    );
}


export function AddDomainModal({ props }: { props: ModalProps; }) {
    const [url, setUrl] = useState("");

    return (
        <ModalRoot {...props} size={ModalSize.SMALL}>
            <ModalHeader>
                <Text variant="heading-lg/normal" style={{ marginBottom: 8 }}>
                    Add a domain to csp
                </Text>
            </ModalHeader>
            <ModalContent>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Text>The domain to add (direct url to an image will suffice as well)</Text>
                    <TextInput
                        placeholder="https://example.com/"
                        value={url}
                        onChange={setUrl}
                        autoFocus
                    />
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                        <Button onClick={props.onClose}>Cancel</Button>
                        <Button
                            color={Button.Colors.BRAND}
                            onClick={async () => {
                                props.onClose();
                                const result = await Native.showDialog(url);
                                if (result.error) {
                                    Alerts.show({
                                        title: "Error",
                                        body: result.error,
                                    });
                                    return;
                                }
                                Alerts.show({
                                    title: "Success",
                                    body: `Domain ${result.domain} was added to the list of whitelisted domains. You'll need to restart for it to take effect.`,
                                    confirmText: "Restart",
                                    cancelText: "Later",
                                    onConfirm: relaunch
                                });
                            }}
                            disabled={!url}
                        >Add</Button>
                    </div>
                </div>
            </ModalContent>
        </ModalRoot>
    );
}
