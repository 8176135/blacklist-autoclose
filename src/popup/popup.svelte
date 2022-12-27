<script lang="ts">
    import browser from "webextension-polyfill";
    import "~/app.css";
    import {
        ACEnabledKey,
        BlacklistSitesAC,
        type BlacklistSitesACEntry,
    } from "~/lib/models";

    enum AddBlacklistType {
        Domain,
        SubDomain,
        FullURL,
        MainURL,
    }

    function OpenOptionsMenu() {
        browser.runtime.openOptionsPage();
    }
    
    let lastAddTarget: BlacklistSitesACEntry | null = null;
    let autoCloseEnabled = true;

    async function UpdateButton() {
        autoCloseEnabled =
            (await browser.storage.sync.get(ACEnabledKey)).autoCloseEnabled ??
            true;
        if (autoCloseEnabled) {
            browser.browserAction.setIcon({
                path: "/assets/icon/cross48.png",
            });
            autoCloseEnabled = true;
        } else {
            browser.browserAction.setIcon({
                path: "/assets/icon/cross48Disabled.png",
            });
            autoCloseEnabled = false;
        }
    }

    function ToggleEnabled() {
        browser.storage.sync.set({
            [ACEnabledKey]: !autoCloseEnabled,
        });
    }

    async function AddCurrentToBlacklist(type: AddBlacklistType) {
        let acSites = new BlacklistSitesAC(await browser.storage.sync.get(BlacklistSitesAC.KEYS));
        const activeTabs = await browser.tabs.query({
            currentWindow: true,
            active: true,
        });
        for (const tab of activeTabs) {
            if (!tab.url) {
                continue;
            }
            if (tab.url.startsWith("about:") || tab.url.includes("815c07b3-087f-492c-9ebc-f0ea9539933a")) {
                alert(
                    'Sorry, can\'t let you add an "about:" page (since you might not be able to go back in and remove it if you did.)'
                );
                return;
            }
            let target: BlacklistSitesACEntry;
            let url = new window.URL(tab.url);
            switch (type) {
                case AddBlacklistType.SubDomain:
                    if (url.protocol != "http:" && url.protocol != "https:") {
                        alert(
                            "Only support http/https urls for automatic domain blacklist, please add your domain manually."
                        );
                        return;
                    }
                    target = {
                        url: `^https?\:\/\/${url.hostname}\/`,
                        regexSearch: true,
                    };
                    break;
                case AddBlacklistType.Domain:
                    if (url.protocol != "http:" && url.protocol != "https:") {
                        alert(
                            "Only support http/https urls for automatic domain blacklist, please add your domain manually."
                        );
                        return;
                    }
                    let toAdd = url.hostname.split(".");
                    target = {
                        url: `^https?\:\/\/${toAdd[toAdd.length - 2]}.${toAdd[toAdd.length - 1]}\/`,
                        regexSearch: true,
                    };
                    break;
                case AddBlacklistType.MainURL:
                    target = {
                        url: `${url.protocol}//${url.hostname}${url.pathname}*`,
                        regexSearch: false,
                    };
                    break;
                case AddBlacklistType.FullURL:
                    target = {
                        url: tab.url,
                        regexSearch: false,
                    };
                    break;
                default:
                    throw "Unexpected enum type " + type;
            }
            lastAddTarget = target;
            acSites.data.push(target);
        }
        browser.storage.sync.set(acSites.SplitToSize());
    }

    browser.storage.sync.onChanged.addListener((changes) => {
        if (changes[ACEnabledKey]) {
            UpdateButton();
        }
    });

    UpdateButton();
</script>

{#if lastAddTarget != null}
<div class="overlay center" style="background-color: rgba(0.8, 0.8, 0.8, 0.7); font-size: 14pt; flex-direction: column;">
    <p>Added</p><code>{lastAddTarget.url}</code><p>to blacklist.</p>
</div>
{/if}
<div style="margin: 15px 10px;">
    <div
        style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"
    >
        <span style="font-size: 16pt; font-weight: bold;">AutoClose</span>
        <input
            type="checkbox"
            class="switch"
            id="autocloseEnabled"
            name="autocloseEnabled"
            checked={autoCloseEnabled}
            on:input={ToggleEnabled}
        /><label class="switch" for="autocloseEnabled">Toggle</label>
    </div>
    <div style="display: grid; gap: 10px; grid-template-columns: 50% 50%;">
        <button
            type="button"
            on:click={() => AddCurrentToBlacklist(AddBlacklistType.FullURL)}
            class="btn">Blacklist current full url</button
        >
        <button
            type="button"
            on:click={() => AddCurrentToBlacklist(AddBlacklistType.MainURL)}
            class="btn"
            id="addCWebDomain">Blacklist url without queries</button
        >
        <button
            type="button"
            on:click={() => AddCurrentToBlacklist(AddBlacklistType.SubDomain)}
            class="btn"
            id="addCWebDomain">Blacklist subdomain</button
        >
        <button
            type="button"
            on:click={() => AddCurrentToBlacklist(AddBlacklistType.Domain)}
            class="btn"
            id="addCWebDomain">Blacklist base domain</button
        >
        <button
            type="button"
            class="btn"
            style="grid-column: 1/3"
            on:click={OpenOptionsMenu}
            id="openOptions">Open options menu</button
        >
    </div>
</div>
