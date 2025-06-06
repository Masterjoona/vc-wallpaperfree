/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { openModal } from "@utils/modal";
import { makeCodeblock } from "@utils/text";
import { Button, FluxDispatcher, Parser, showToast, Text } from "@webpack/common";

import { AddDomainModal, SetWallpaperModal } from "./modal";

export function GlobalDefaultComponent() {
    const setGlobal = (url?: string) => {
        FluxDispatcher.dispatch({
            // @ts-ignore
            type: "VC_WALLPAPER_FREE_CHANGE_GLOBAL",
            url,
        });
    };

    return (
        <>
            <Button onClick={() => {
                openModal(props => <SetWallpaperModal props={props} onSelect={setGlobal} />);
            }}>Set a global wallpaper</Button>

            <Button
                color={Button.Colors.RED}
                onClick={() => setGlobal(void 0)}
            >Remove global default wallpaper</Button>

            <Button
                color={Button.Colors.RED}
                onClick={() => {
                    // @ts-ignore
                    FluxDispatcher.dispatch({ type: "VC_WALLPAPER_FREE_RESET" });
                }}
            >Reset wallpaper data</Button>
        </>
    );
}

export function TipsComponent() {
    const tipText = `
    .vc-wpfree-wp-container {
        transform: scaleX(-1); /* flip it horizontally */
        filter: blur(4px); /* apply a blur */
        opacity: 0.7; /* self-explanatory */
    }`;
    return Parser.parse(makeCodeblock(tipText, "css"));
}

export function CspSettingsComponent() {
    // @ts-ignore
    const domains = Vencord.Plugins.plugins.WallpaperFree.CSPInfo.customWhitelistedDomains;

    const handleRemoveDomain = (domain: string) => {
        // @ts-ignore
        Vencord.Plugins.plugins.WallpaperFree.Native.removeDomain(domain);
        showToast(`Removed ${domain} from the CSP whitelist`);
    };

    return (
        <>
            <Button onClick={() => { openModal(props => <AddDomainModal props={props} />); }}>
                Add domain to CSP
            </Button >

            <div style={{ marginTop: 8 }}>
                <Text variant="heading-md/normal">Custom whitelisted domains</Text>
                <ul style={{ listStyleType: "none", paddingLeft: 0 }}>
                    {domains.map((domain: string) => (
                        <li
                            key={domain}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: 4,
                                gap: 8,
                            }}
                        >
                            <span style={{ color: "var(--text-normal)" }}>{domain}</span>
                            <Button
                                color={Button.Colors.RED}
                                onClick={() => handleRemoveDomain(domain)}
                            >
                                Remove
                            </Button>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

