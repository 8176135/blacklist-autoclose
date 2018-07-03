var openOptionsBtn = document.getElementById("openOptions");
var addCurrentPageBtn = document.getElementById("addCWeb");
var toggleBtn = document.getElementById("autocloseEnabled");
toggleBtn.addEventListener('click', Toggle);
openOptionsBtn.addEventListener('click', OpenOptionsMenu);
addCurrentPageBtn.addEventListener('click', AddCurrentToBlacklist);
UpdateButton();

function OpenOptionsMenu()
{
    browser.runtime.openOptionsPage();
}

function UpdateButton()
{
    var gettingItem = browser.storage.local.get('autoCloseEnabled');
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
    var gettingItem = browser.storage.local.get('autoCloseEnabled');
    gettingItem.then((res) =>
    {
        var settingVar = browser.storage.local.set(
        {
            autoCloseEnabled: toggleBtn.checked
        });
        settingVar.then(function()
        {
            UpdateButton();
        });
    });
}

function AddCurrentToBlacklist()
{
    var gettingItem = browser.storage.local.get('blacklistSitesAutoClose');
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
                if (tab.url.startsWith("about:addons"))
                {
                    alert("Sorry, can't let you add the about:addons page (since you can't go back in and remove it if you did.)");
                    return;
                }
                temp.push(
                {
                    url: tab.url,
                    regexSearch: false
                });
                var outVal = JSON.stringify(temp);
                var settingItem = browser.storage.local.set(
                {
                    blacklistSitesAutoClose: outVal
                });
            }
        });

    });
}