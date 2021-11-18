var openOptionsBtn = document.getElementById("openOptions");
var addCurrentPageBtn = document.getElementById("addCWeb");
var addCurrentDomainBtn = document.getElementById("addCWebDomain");
var toggleBtn = document.getElementById("autocloseEnabled");
toggleBtn.addEventListener('click', Toggle);
openOptionsBtn.addEventListener('click', OpenOptionsMenu);
addCurrentPageBtn.addEventListener('click', AddCurrentPageToBlacklist);
addCurrentDomainBtn.addEventListener('click', AddCurrentDomainToBlacklist);
UpdateButton();

function OpenOptionsMenu()
{
    browser.runtime.openOptionsPage();
}

function UpdateButton()
{
    var gettingItem = browser.storage.sync.get('autoCloseEnabled');
    gettingItem.then((res) =>
    {
        if (res.autoCloseEnabled == null || res.autoCloseEnabled)
        {
            browser.browserAction.setIcon(
            {
                path: "icon/cross48.png"
            });
            toggleBtn.checked = true;
        }
        else
        {
            browser.browserAction.setIcon(
            {
                path: "icon/cross48Disabled.png"
            });
            toggleBtn.checked = false;
        }
    });
}

function Toggle()
{
    var gettingItem = browser.storage.sync.get('autoCloseEnabled');
    gettingItem.then((res) =>
    {
        var settingVar = browser.storage.sync.set(
        {
            autoCloseEnabled: toggleBtn.checked
        });
        settingVar.then(function()
        {
            UpdateButton();
        });
    });
}

function AddCurrentToBlacklist(isDomain)
{
    var gettingItem = browser.storage.sync.get('blacklistSitesAutoClose');
    gettingItem.then((res) =>
    {
        var temp;
        if (!res.blacklistSitesAutoClose)
        {
            temp = [];
        }
        else
        {
            temp = JSON.parse(res.blacklistSitesAutoClose);
        }
        var gettingCurrent = browser.tabs.query(
        {
            currentWindow: true,
            active: true
        });
        gettingCurrent.then((tabs) =>
        {
            for (tab of tabs)
            {
                if (tab.url.startsWith("about:"))
                {
                    alert("Sorry, can't let you add an \"about:\" page (since you might not be able to go back in and remove it if you did.)");
                    return;
                }
                let target = "";
                let regexSearch;
                if (isDomain) {
                    var matches = tab.url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
                    var domain = matches && matches[1];  // domain will be null if no match is found
                    console.log(domain);
                    if (domain == null) {
                        alert("Only support http/https urls for automatic domain blacklist, please add your domain manually.");
                        return;
                    }
                    target = `^https?\:\/\/${domain}\/`;
                    regexSearch = true;
                } else {
                    target = tab.url;
                    regexSearch = false;
                }

                temp.push(
                {
                    url: target,
                    regexSearch: regexSearch
                });
                var outVal = JSON.stringify(temp);
                var settingItem = browser.storage.sync.set(
                {
                    blacklistSitesAutoClose: outVal
                });
            }
        });

    });
}

function AddCurrentPageToBlacklist() {
    AddCurrentToBlacklist(false);
}

function AddCurrentDomainToBlacklist() {
    AddCurrentToBlacklist(true);
}

