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
        FullURL,
        MainURL,
    }

    function OpenOptionsMenu() {
        browser.runtime.openOptionsPage();
    }

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
                case AddBlacklistType.Domain:
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
                case AddBlacklistType.MainURL:
                    target = {
                        url: `${url.protocol}//${url.hostname}${url.pathname}*`,
                        regexSearch: false,
                    };
                case AddBlacklistType.FullURL:
                    target = {
                        url: tab.url,
                        regexSearch: false,
                    };
                default:
                    throw "Unexpected enum type";
            }
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
    <div style="display: flex; flex-direction: column; gap: 10px;">
        <button
            type="button"
            on:click={() => AddCurrentToBlacklist(AddBlacklistType.FullURL)}
            class="btn">Add current full url to blacklist</button
        >
        <button
            type="button"
            on:click={() => AddCurrentToBlacklist(AddBlacklistType.MainURL)}
            class="btn"
            id="addCWebDomain">Add url without queries to blacklist</button
        >
        <button
            type="button"
            on:click={() => AddCurrentToBlacklist(AddBlacklistType.Domain)}
            class="btn"
            id="addCWebDomain">Add (sub)domain to blacklist</button
        >
        <button
            type="button"
            class="btn"
            on:click={OpenOptionsMenu}
            id="openOptions">Open options menu</button
        >
    </div>
</div>
