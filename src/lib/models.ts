import browser from "webextension-polyfill"

export const ACEnabledKey = "autoCloseEnabled"
export const ACSitesKey = "blacklistSitesAutoClose"
export const CloseDelayEnabledKey = "closeDelayEnabled"
export const CloseDelayTimeKey = "closeDelayTime"
export const StoreVersionKey = "storeVersion"

const MAX_STORE_SIZE = 8192 - 92; // -92 just to be safe

export class BlacklistSitesAC {
  static readonly MAX_KEY_COUNT = 10;
  static readonly KEYS: string[] = 
    Array.from(Array(BlacklistSitesAC.MAX_KEY_COUNT).keys()).map((_, i) => BlacklistSitesAC.idx(i));

  constructor(record?: Record<string, any>) {
    if (!record) {
      return;
    }

    for (const key of BlacklistSitesAC.KEYS) {
      let current = record[key];
      if (current != null && current instanceof Array) {
        this.data.push(...current);
      }
    }
  }

  data: BlacklistSitesACEntry[] = [];

  SplitToSize(): Record<string, BlacklistSitesACEntry[]> {
    let ans: Record<string, BlacklistSitesACEntry[]> = 
      Object.fromEntries(BlacklistSitesAC.KEYS.map(c => [c, []]));
    let save_idx = 0;
    for (let i = 0; i < this.data.length; i++) {
      let target = ans[BlacklistSitesAC.idx(save_idx)] ?? [];
      target.push(this.data[i]);
      const len = JSON.stringify({[BlacklistSitesAC.idx(save_idx)]: target}).length;
      if (len > MAX_STORE_SIZE) {
        target.pop();
        save_idx++;
        i--;
        if (target.length == 0) {
          alert("Failed to save, too much on one line.");
          throw new Error("Failed to save, too much on one line");
        }
      }
    }

    if (save_idx >= BlacklistSitesAC.MAX_KEY_COUNT) {
      alert("Failed to save, too much data.");
      throw new Error("Failed to save, too much data.");
    }
    return ans;
  }

  private static idx(idx: number): string {
    return ACSitesKey + "_" + idx;
  }
}

export interface BlacklistSitesACEntry {
  url: string,
  regexSearch: boolean,
}

export interface CloseTarget {
  url: string,
  rule: BlacklistSitesACEntry,
}

export class CloseHistory {

  static readonly KEY: string = "closeHistory"

  historyLength: number = 25
  historyStore: CloseTarget[] = []

  /**
   * Attempt to load from record, if not construct default
   */
  constructor(record?: Record<string, any>) {
    if (!record) {
      return;
    }
    const extractedElem = record[CloseHistory.KEY];
    if (extractedElem
      && Object.hasOwn(extractedElem, "historyLength")
      && Object.hasOwn(extractedElem, "historyStore")) {
      Object.assign(this, extractedElem);
    } // If not this object or null, just return default
  }

  UpdateHistory(target: CloseTarget) {
    this.historyStore.push(target);
    while (this.historyStore.length > this.historyLength) {
      this.historyStore.shift();
    }
  }

  ToString(): string {
    return this.historyStore.map((c) => c.url + " --- Rule: " + c.rule.url).join("\n")
  }
}

export enum SearchType {
  Standard,
  Regex,
}