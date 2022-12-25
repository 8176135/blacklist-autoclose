import type { BlacklistSitesACEntry, CloseTarget } from "./models";

export function MatchSearch({ rule, url }: CloseTarget): boolean {
    if (rule.regexSearch) {
        if ((new RegExp(rule.url, "i")).test(url)) {
            return true;
        }
    }
    else {
        let regString = escapeRegexp(rule.url).replace(/\\\*/g, ".*");
        regString = "^".concat(regString).concat("$");
        if ((new RegExp(regString, "i")).test(url)) {
            return true;
        }
    }
    return false
}

function escapeRegexp(s: string): string {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
}