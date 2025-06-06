/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { NativeSettings } from "@main/settings";
import { BrowserWindow, dialog, IpcMainInvokeEvent } from "electron";

const vencordWhiteListedDomains: string[] = [];
const customWhitelistedDomains: string[] = [];
let cspEnabled = false;

// @ts-ignore
import("@main/csp").then(({ CspPolicies }: { CspPolicies: Record<string, string[]>; }) => {
    cspEnabled = true;

    for (const [domain, policy] of Object.entries(CspPolicies)) {
        if (policy.includes("img-src")) {
            vencordWhiteListedDomains.push(domain);
        }
    }

    const pluginSettings = NativeSettings.store.plugins!.WallpaperFree ??= {
        customDomainsForCSP: []
    };

    for (const domain of pluginSettings.customDomainsForCSP) {
        if (vencordWhiteListedDomains.includes(domain) || customWhitelistedDomains.includes(domain)) continue;
        CspPolicies[domain] = ["img-src"];
        customWhitelistedDomains.push(domain);
    }
}).catch(() => {
    cspEnabled = false;
});

export function getCSPInfo(_: IpcMainInvokeEvent) {
    return { customWhitelistedDomains, vencordWhiteListedDomains, cspEnabled };
}

export async function removeDomain(_: IpcMainInvokeEvent, domain: string) {
    const pluginSettings = NativeSettings.store.plugins!.WallpaperFree ??= {
        customDomainsForCSP: []
    };
    const index = pluginSettings.customDomainsForCSP.indexOf(domain);
    if (index === -1) {
        return { error: "Domain not found" };
    }
    pluginSettings.customDomainsForCSP.splice(index, 1);
    return { success: true };
}

export async function showDialog(_: IpcMainInvokeEvent, url: string) {
    let domain: string;
    try {
        domain = new URL(url).hostname;
    } catch (e) {
        return { error: "Invalid URL" };
    }

    const win = BrowserWindow.getFocusedWindow();
    if (!win) {
        return { error: "thats not good" };
    }
    const dialogResult = await dialog.showMessageBox(win, {
        type: "question",
        buttons: ["Yes", "No"],
        defaultId: 0,
        cancelId: 1,
        title: "Allow CSP",
        message: `Do you want to add ${domain} to the list of whitelisted domains?`,
        detail: "This will allow images from this domain to be loaded"
    });

    if (dialogResult.response !== 0) {
        return { error: "User declined" };
    }

    const pluginSettings = NativeSettings.store.plugins!.WallpaperFree ??= {
        customDomainsForCSP: []
    };
    pluginSettings.customDomainsForCSP.push(domain);
    return { success: true, domain };
}
