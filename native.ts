/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { RendererSettings } from "@main/settings";
import { IpcMainInvokeEvent } from "electron";

const whiteListedDomains: string[] = [];

// @ts-ignore
import("@main/csp").then(({ CspPolicies }: { CspPolicies: Record<string, string[]>; }) => {
    const settings = RendererSettings.store.plugins?.WallpaperFree;
    if (settings?.enabled) {
        // @ts-ignore
        import("./csp_domains.txt").then(({ default: domains }: { default: string; }) => {
            for (const domain of domains.split("\n").filter((l: string) => !l.startsWith("#"))) {
                const trimmedDomain = domain.trim();
                if (!trimmedDomain) continue;
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
}).catch(() => { });



export function getWhiteListedDomains(_: IpcMainInvokeEvent) {
    return whiteListedDomains;
}
