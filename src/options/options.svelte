<script lang="ts">
    import browser from "webextension-polyfill";
    import "~/app.css";
    import { MatchSearch } from "~/lib/logic";
    import {
        BlacklistSitesAC,
        CloseDelayEnabledKey,
        CloseDelayTimeKey,
        CloseHistory,
        SearchType,
        type BlacklistSitesACEntry,
    } from "../lib/models";

    let closeDelayEnabled = false;
    // Delay time in milliseconds
    let closeDelayMilli = false;
    let closeHistory: string = "";
    let acSites: BlacklistSitesAC = new BlacklistSitesAC;
    let searchType = SearchType.Standard;
    let newSiteVal = "";
    let selectedIndex = -1;

    let removeConfirm = false;

    async function UpdateList() {
        const records = await browser.storage.sync.get([
            CloseDelayEnabledKey,
            CloseDelayTimeKey,
            ...BlacklistSitesAC.KEYS,
        ]);
        closeDelayEnabled = records[CloseDelayEnabledKey] ?? false;
        closeDelayMilli = records[CloseDelayTimeKey] ?? 0;
        acSites = new BlacklistSitesAC(records);
        removeConfirm = false;
    }

    async function UpdateHistory() {
        closeHistory = new CloseHistory(
            await browser.storage.local.get(CloseHistory.KEY)
        ).ToString();
    }

    async function AddNewToBlacklist() {
        let newEntry: BlacklistSitesACEntry = {
            url: newSiteVal,
            regexSearch: searchType == SearchType.Regex,
        };

        if (
            MatchSearch({ rule: newEntry, url: "about:addons" }) ||
            MatchSearch({ rule: newEntry, url: "about:newtab" }) ||
            MatchSearch({ rule: newEntry, url: "about:blank" })
        ) {
            alert(
                "This expression would block either about:addons, about:newtab, or about:blank, can't allow that! (since you can't go back in and remove it if you did.)"
            );
            return;
        }

        newSiteVal = "";
        acSites.data.push(newEntry);
        browser.storage.sync.set(acSites.SplitToSize());
    }

    async function RemoveSelected() {
        if (selectedIndex == null || selectedIndex < 0) {
            return;
        }
        if (removeConfirm) {
            acSites.data.splice(selectedIndex, 1);
            browser.storage.sync.set(acSites.SplitToSize());
            removeConfirm = false;
        } else {
            removeConfirm = true;
        }
    }

    function EditSelectedItem() {
        var splicedObj = acSites.data.splice(selectedIndex, 1)[0];
        newSiteVal = splicedObj.url;
        searchType = splicedObj.regexSearch
            ? SearchType.Regex
            : SearchType.Standard;

        browser.storage.sync.set(acSites.SplitToSize());
    }

    function ToggleDelayEnable() {
        browser.storage.sync.set({
            [CloseDelayEnabledKey]: !closeDelayEnabled,
        });
    }

    function CloseDelayTimeChanged() {
        browser.storage.sync.set({
            [CloseDelayTimeKey]: closeDelayMilli,
        });
    }

    async function ClearHistory() {
        let closeHistoryObj = new CloseHistory(
            await browser.storage.local.get(CloseHistory.KEY)
        );
        closeHistoryObj.historyStore = [];
        browser.storage.local.set({
            [CloseHistory.KEY]: closeHistoryObj,
        });
    }

    browser.storage.sync.onChanged.addListener((_) => {
        UpdateList();
    });

    browser.storage.local.onChanged.addListener((_) => {
        UpdateHistory();
    });

    UpdateList();
    UpdateHistory();
</script>

<div class="full-body-wrapper">
    <h2 style="flex: 0 1 auto">Blacklisted Sites</h2>
    <div class="wrapper" style="">
        <div style="grid-column: 1/3; grid-row: 1;">
            <!-- <label for="filter"><b>Filter: </b></label> -->
            <!-- <input type="text" name="filter" id="filter" /> -->
        </div>

        <select
            style="grid-column: 1/3; grid-row: 2 / 3;"
            size="6"
            bind:value={selectedIndex}
            on:change={() => (removeConfirm = false)}
        >
            {#each acSites.data as entry, i}
                <option
                    style="display:flex; justify-content: space-between;"
                    value={i}
                >
                    <span>{entry.url}</span>
                    <span
                        ><b
                            >{entry.regexSearch
                                ? "Regex Search"
                                : "Standard Search"}</b
                        ></span
                    >
                </option>
            {/each}
        </select>
        <div class="controlDiv" style="grid-column: 3 / 4; grid-row: 2/3;">
            <button type="button" on:click={EditSelectedItem} class="fill btn"
                >Edit Selected</button
            ><br />
            <button
                type="button"
                on:click={RemoveSelected}
                class="fill btn"
                disabled={selectedIndex < 0 || selectedIndex >= acSites.data.length}
            >
                {#if removeConfirm}
                    Click again to confirm removal
                {:else}
                    Remove Selected
                {/if}
            </button>
        </div>

        <!-- <div style="margin: 5px 0; flex: 0 0 auto; display: flex; justify-content: space-between; "> -->
        <input
            type="text"
            name="siteToAdd"
            bind:value={newSiteVal}
            style="grid-column: 1/2; grid-row: 3/4;"
        />
        <select
            class="searchTypeSel"
            name=""
            size="1"
            style="grid-column: 2/3; grid-row: 3/4;"
            bind:value={searchType}
        >
            <option value={SearchType.Standard}
                >Standard (exact match with * as wildcard)</option
            >
            <option value={SearchType.Regex}>Regex</option>
        </select>
        <button
            type="button"
            class="btn"
            on:click={AddNewToBlacklist}
            style="grid-column: 3 / 4; grid-row: 3 / 4;"
        >
            Submit
        </button>
        <!-- </div> -->
    </div>

    <h3>Tips</h3>
    <div class="faq" id="faq" style="font-size: 10pt">
        <ul>
            <li>
                Add * at the start of a standard search means you won't need to
                add "https://..." etc. in front of urls.
            </li>
            <li>
                Regular expressions (Regex) can be tested here: <a
                    href="https://regex101.com">regex101.com</a
                > (select the javascript flavor)
            </li>
            <li>
                Putting ^ at the start of a regex search, and $ at the end to do
                an exact match.
            </li>
        </ul>
    </div>
    <div style="margin: 5px 0; font-size: 16pt; font-weight: bolder">
        <span>Close Delay: </span><span id="closeDelayEnabled" />
    </div>
    <div class="closeDelayWrapper">
        <input
            type="number"
            id="delayMilli"
            name="delayMilli"
            placeholder="Delay in milliseconds"
            min="0"
            max="1000000"
            bind:value={closeDelayMilli}
            on:change={CloseDelayTimeChanged}
            disabled={!closeDelayEnabled}
        />
        <label
            style="margin-left: 3px; margin-right: 20px; margin-top: 1px; vertical-align: center;"
            for="delayMilli"
        >
            ms
        </label>
        <input
            type="checkbox"
            class="switch"
            id="timerEnabled"
            name="timerEnabled"
            on:input={ToggleDelayEnable}
            checked={closeDelayEnabled}
        /><label class="switch" for="timerEnabled">Toggle</label>
    </div>

    <h3>Recently closed sites (Most recent first)</h3>
    <textarea class="history-list" readonly style="width: 100%;" value={closeHistory} />
    <button class="btn" on:click={ClearHistory}>Clear History</button>
</div>

<style>
    .full-body-wrapper {
        flex-direction: column;
        -moz-user-select: none;
        user-select: none;
        margin: 10px 5px;
    }

    .faq {
        user-select: text;
        -moz-user-select: text;
    }

    input {
        border: black solid 1px;
        padding: 5px !important;
    }

    button {
        font-weight: bold;
    }

    label {
        margin-right: 5px;
    }

    .wrapper {
        /*    display: flex;
  flex-direction: row;*/
        display: grid;
        width: 100%;
        height: 50%;
        grid-template-columns: 5fr minmax(80px, 1fr) minmax(130px, 1.5fr);
        grid-row-gap: 10px;
        grid-column-gap: 10px;
        grid-template-rows: 40px 1fr 40px;
    }

    .lastUsedRegex {
        background-color: lightblue;
    }

    #history-list {
        height: 300px;
    }

    .fill {
        width: 100%;
    }

    .closeDelayWrapper {
        display: flex;
    }
</style>
