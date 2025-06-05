/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { RendererSettings } from "@main/settings";
import { IpcMainInvokeEvent } from "electron";

const whiteListedDomains: string[] = [];
let cspEnabled = false;

// @ts-ignore
import("@main/csp").then(({ CspPolicies }: { CspPolicies: Record<string, string[]>; }) => {
    cspEnabled = true;
    const settings = RendererSettings.store.plugins?.WallpaperFree;
    if (settings?.enabled) {
        // @ts-ignore
        import("./csp_domains.txt").then(({ default: domains }: { default: string; }) => {
            for (const domain of domains.split("\n")) {
                const trimmedDomain = domain.trim();
                if (!trimmedDomain || trimmedDomain.startsWith("#")) continue;
                CspPolicies[trimmedDomain] = ["img-src"];
                whiteListedDomains.push(trimmedDomain);
            }
        }).catch(() => { });
    }
    for (const [domain, policy] of Object.entries(CspPolicies)) {
        if (policy.includes("img-src")) {
            whiteListedDomains.push(domain);
        }
    }
}).catch(() => {
    cspEnabled = false;
});



export function getCSPInfo(_: IpcMainInvokeEvent) {
    return { whiteListedDomains, cspEnabled };
}
