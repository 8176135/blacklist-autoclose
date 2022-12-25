import browser from "webextension-polyfill"
import { ACEnabledKey, ACSitesKey, BlacklistSitesAC, CloseDelayEnabledKey, CloseDelayTimeKey, CloseHistory, StoreVersionKey, type CloseTarget } from "./models"
import semver from "semver"

interface Migrations {
    Up: () => void,
    Version: string,
}

const MIGRATIONS: Migrations[] = [
    {
        Version: "2.0.0",
        Up: async () => {
            // Load sites which were JSON and update them to direct objects
            let newSites = new BlacklistSitesAC;
            try {
                let oldSites = (await browser.storage.local.get(ACSitesKey))[ACSitesKey]
                if (oldSites != null) {
                    let newSitesTemp = JSON.parse(oldSites);
                    newSites.data = newSitesTemp;
                }
            } catch (error) {
                console.warn("Migration failed for ACSites", error);
            } finally {
                browser.storage.sync.set(newSites.SplitToSize());
                browser.storage.local.remove(ACSitesKey);
            }

            // Update Close History
            try {

            } catch (error) {
                console.warn("Migration failed for Close History", error);
            } finally {
                browser.storage.local.set({
                    [CloseHistory.KEY]: new CloseHistory(),
                });
            }
            
            let newEnable = true;
            try {
                let oldVal = (await browser.storage.local.get(ACEnabledKey))[ACEnabledKey]
                if (oldVal != null) {
                    newEnable = oldVal;
                }
            } catch (error) {
                console.warn("Migration failed for ACEnabledKey", error);
            } finally {
                browser.storage.sync.set({
                    [ACEnabledKey]: newEnable,
                });
            }

            let newCloseDelayEnabled = true;
            try {
                let oldVal = (await browser.storage.local.get(CloseDelayEnabledKey))[CloseDelayEnabledKey]
                if (oldVal != null) {
                    newCloseDelayEnabled = oldVal;
                }
            } catch (error) {
                console.warn("Migration failed for CloseDelayEnabledKey", error);
            } finally {
                browser.storage.sync.set({
                    [CloseDelayEnabledKey]: newCloseDelayEnabled,
                });
            }

            let newDelayTime = 0;
            try {
                let oldVal = (await browser.storage.local.get(CloseDelayTimeKey))[CloseDelayTimeKey]
                if (oldVal != null) {
                    newDelayTime = oldVal;
                }
            } catch (error) {
                console.warn("Migration failed for CloseDelayTimeKey", error);
            } finally {
                browser.storage.sync.set({
                    [CloseDelayTimeKey]: newDelayTime,
                });
            }
        }
    }
]


export async function UpdateToLatestMigration() {
    const currentStoredVersion: string =
        (await browser.storage.sync.get(StoreVersionKey))[StoreVersionKey] ?? "1.0.0";


    MIGRATIONS.sort((a, b) => semver.compare(a.Version, b.Version));
    let latestApplied = currentStoredVersion;
    for (const migration of MIGRATIONS) {
        if (semver.lte(migration.Version, currentStoredVersion)) {
            continue;
        }
        console.log("Running migration for version: ", migration.Version);
        migration.Up();
        latestApplied = migration.Version;
    }

    browser.storage.sync.set({
        [StoreVersionKey]: latestApplied,
    });
}