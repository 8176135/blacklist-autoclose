var newSiteVal = document.getElementById("newSiteVal");
var displayList = document.getElementById("blSiteList");
var submitBtn = document.getElementById("submitBtn");
var removeBtn = document.getElementById("removeItemBtn");
var editBtn = document.getElementById("editItemBtn");
var searchTypeLst = document.getElementById("searchTypeSel");
var delayEnabledChk = document.getElementById("timerEnabled");
var delayMilli = document.getElementById("delayMilli");
var closeDelayEnabled = document.getElementById("closeDelayEnabled");

delayMilli.addEventListener('input', SomethingChanged);
submitBtn.addEventListener('click', AddNewToBlacklist);
removeBtn.addEventListener('click', RemoveSelectedItem);
editBtn.addEventListener('click', EditSelItem);
delayEnabledChk.addEventListener('click', ToggleDelayEnable);

UpdateList();

RegExp.escape = function(s)
{
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function AddNewToBlacklist()
{
    let gettingItem = browser.storage.local.get('blacklistSitesAutoClose');
    gettingItem.then((res) =>
    {
        let temp;
        if (!res.blacklistSitesAutoClose)
        {
            temp = [];
        }
        else
        {
            temp = JSON.parse(res.blacklistSitesAutoClose);
        }
        let regSearch;
        if (searchTypeLst.value == 0)
        {
            regSearch = false;
        }
        else
        {
            regSearch = true;
        }
        temp.push(
        {
            url: newSiteVal.value,
            regexSearch: regSearch
        });

        let regString;

        if (temp[temp.length - 1].regexSearch)
        {
            regString = (new RegExp(temp[temp.length - 1].url, "i"))
        }
        else
        {
            regString = RegExp.escape(temp[temp.length - 1].url).replace(/\\\*/g, ".*");
            regString = new RegExp("^".concat(regString).concat("$"), "i");
        }

        if (regString.test("about:addons") || regString.test("about:newtab") || regString.test("about:blank"))
        {
            alert("This expression would block about:addons, about:newtab, or about:blank, can't allow that! (since you can't go back in and remove it if you did.)");
            return;
        }

        newSiteVal.value = "";
        var outVal = JSON.stringify(temp);
        var settingItem = browser.storage.local.set(
        {
            blacklistSitesAutoClose: outVal
        });
        settingItem.then(function()
        {
            UpdateList();
        });
    });
}

function EditSelItem()
{
    var gettingItem = browser.storage.local.get('blacklistSitesAutoClose');
    gettingItem.then((res) =>
    {
        var parsed = JSON.parse(res.blacklistSitesAutoClose);
        if (displayList.value)
        {
            var splicedObj = parsed.splice(displayList.value, 1)[0];
            newSiteVal.value = splicedObj.url;
            if (splicedObj.regexSearch)
            {
                searchTypeLst.selectedIndex = 1;
            }
            else
            {
                searchTypeLst.selectedIndex = 0;
            }

            var outVal = JSON.stringify(parsed);
            var settingItem = browser.storage.local.set(
            {
                blacklistSitesAutoClose: outVal
            });
            settingItem.then(function()
            {
                UpdateList();
            });
        }
    });
}

function RemoveSelectedItem()
{
    var gettingItem = browser.storage.local.get('blacklistSitesAutoClose');
    gettingItem.then((res) =>
    {
        var parsed = JSON.parse(res.blacklistSitesAutoClose);
        if (displayList.value)
        {
            parsed.splice(displayList.value, 1);
            var outVal = JSON.stringify(parsed);
            var settingItem = browser.storage.local.set(
            {
                blacklistSitesAutoClose: outVal
            });
            settingItem.then(function()
            {
                UpdateList();
            });
        }
    });
}

function SomethingChanged(e) {
    browser.storage.local.set(
    {
        closeDelayTime: parseInt(e.target.value)
    });
}

function ToggleDelayEnable() {
    let temp = browser.storage.local.set(
    {
        closeDelayEnabled: delayEnabledChk.checked,
        closeDelayTime: parseInt(delayMilli.value)
    });
    delayMilli.disabled = !delayEnabledChk.checked;
    closeDelayEnabled.innerText = delayEnabledChk.checked ? "Enabled" : "Disabled";
}

function UpdateList()
{
    var delayEnableItem = browser.storage.local.get(['closeDelayEnabled', 'closeDelayTime']);
    delayEnableItem.then((res) => {
        delayEnabledChk.checked = res.closeDelayEnabled;
        delayMilli.disabled = !delayEnabledChk.checked;
        closeDelayEnabled.innerText = delayEnabledChk.checked ? "Enabled" : "Disabled";
        delayMilli.value = res.closeDelayTime;
    });
    for (var i = displayList.options.length - 1; i >= 0; i--)
    {
        displayList.remove(i);
    }
    var gettingItem = browser.storage.local.get('blacklistSitesAutoClose');
    gettingItem.then((res) =>
    {
        var parsed = JSON.parse(res.blacklistSitesAutoClose);
        for (var i = 0; i < parsed.length; i++)
        {
            var option = document.createElement("option");
            option.text = parsed[i].url + " --- Regex: " + parsed[i].regexSearch;
            option.value = i;
            option.className = "entry"
            displayList.add(option);
        }
    });
}