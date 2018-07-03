RegExp.escape = function(s)
{
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function handleUpdated(tabId, changeInfo, tabInfo)
{
	var gettingEnabled = browser.storage.local.get('autoCloseEnabled');
	gettingEnabled.then((isEnabled) =>
	{
		if (!isEnabled.autoCloseEnabled) {
			return;
		}
		var gettingItem = browser.storage.local.get('blacklistSitesAutoClose');
		gettingItem.then((res) =>
		{
			if (!res.blacklistSitesAutoClose)
			{
				return;
			}
			var parsed = JSON.parse(res.blacklistSitesAutoClose);
			for (var i = 0; i < parsed.length; i++)
			{
				if (parsed[i].regexSearch)
				{
					if ((new RegExp(parsed[i].url, "i")).test(changeInfo.url))
					{
						CloseTab(tabId);
					}
				}
				else
				{
					var regString = RegExp.escape(parsed[i].url).replace(/\\\*/g, ".*");
					regString = "^".concat(regString).concat("$");
					if ((new RegExp(regString, "i")).test(changeInfo.url))
					{
						CloseTab(tabId);
					}
				}
			}
		});
	});
}

function CloseTab(tabId) {
	var delayEnabledItem = browser.storage.local.get(["closeDelayEnabled","closeDelayTime"]);
	delayEnabledItem.then((res) => {
		if (res.closeDelayEnabled && res.closeDelayTime != null) {
			console.log(tabId);
			console.log(res.closeDelayTime);
			setTimeout(browser.tabs.remove, res.closeDelayTime, tabId);
		} else {
			browser.tabs.remove(tabId);
		}
	});
}
browser.tabs.onUpdated.addListener(handleUpdated);