// import { onMessage, sendMessage } from "webext-bridge"
// import type { Tabs } from "webextension-polyfill"
import browser from "webextension-polyfill"
import { BlacklistSitesAC, type CloseTarget, CloseHistory, ACEnabledKey, CloseDelayEnabledKey, CloseDelayTimeKey } from "~/lib/models"
import { MatchSearch } from "~/lib/logic"
import { UpdateToLatestMigration } from "~/lib/migration"

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import("/@vite/client")
  // load latest content script
  import("./contentScriptHMR")
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log("Extension installed");
  UpdateToLatestMigration();
})

browser.storage.sync.get(ACEnabledKey).then((item) => {
  if (!item.autoCloseEnabled && item.autoCloseEnabled !== false) {
    browser.storage.sync.set(
      {
        autoCloseEnabled: true
      });
  }
});

browser.webNavigation.onBeforeNavigate.addListener(CheckURL);
browser.webNavigation.onHistoryStateUpdated.addListener(CheckURL);

async function CheckURL(details: browser.WebNavigation.OnHistoryStateUpdatedDetailsType) {
  const isEnabled = await browser.storage.sync.get(ACEnabledKey);
  if (!isEnabled.autoCloseEnabled) {
    return;
  }

  if (details.url.startsWith("moz-extension://") || details.url.startsWith("about:")) {
    return;
  }

  // TODO: Add some migration code to move this away from JSON parsing.
  const parsed = new BlacklistSitesAC(await browser.storage.sync.get(BlacklistSitesAC.KEYS));
  for (const rule of parsed.data) {
    const target = { url: details.url, rule };
    if (MatchSearch(target)) {
      CloseTab(details.tabId, target);
    }
  }
}

// Finds and closes tabs passed in via regex
async function CloseTab(tabId: number, target: CloseTarget) {
  const { [CloseDelayEnabledKey]: closeDelayEnabled, [CloseDelayTimeKey]: closeDelayTime } =
    await browser.storage.sync.get([CloseDelayEnabledKey, CloseDelayTimeKey]);

  let closeHistory: CloseHistory = new CloseHistory(await browser.storage.local.get(CloseHistory.KEY));
  closeHistory.UpdateHistory(target);
  browser.storage.local.set({ [CloseHistory.KEY]: closeHistory });

  if (closeDelayEnabled && closeDelayTime != null) {
    setTimeout(browser.tabs.remove, closeDelayTime, tabId);
  } else {
    browser.tabs.remove(tabId);
  }
}
