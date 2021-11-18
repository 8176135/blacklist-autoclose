RegExp.escape = function(s)
{
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

// Setup enabled at the start
browser.storage.sync.get('autoCloseEnabled').then((item) => {
	if( !item.autoCloseEnabled && item.autoCloseEnabled !== false ) {
		browser.storage.sync.set(
        {
            autoCloseEnabled: true
        });
	}
});

function newNavigation(details) {

	var gettingEnabled = browser.storage.sync.get('autoCloseEnabled');
	gettingEnabled.then((isEnabled) =>
	{
		if (!isEnabled.autoCloseEnabled) {
			return;
		}
		var gettingItem = browser.storage.sync.get('blacklistSitesAutoClose');
		gettingItem.then((res) =>
		{
			if (!res.blacklistSitesAutoClose)
			{
				return;
			}
			if (details.url == "moz-extension://7d31354f-becc-4991-9c37-6218b5097adf/options.html") { // Hey its our options page
				return;
			}

			var parsed = JSON.parse(res.blacklistSitesAutoClose);
			for (var i = 0; i < parsed.length; i++)
			{
				if (parsed[i].regexSearch)
				{
					if ((new RegExp(parsed[i].url, "i")).test(details.url))
					{
						CloseTab(details.tabId, details.url, parsed[i].url);
					}
				}
				else
				{
					var regString = RegExp.escape(parsed[i].url).replace(/\\\*/g, ".*");
					regString = "^".concat(regString).concat("$");
					if ((new RegExp(regString, "i")).test(details.url))
					{
						CloseTab(details.tabId, details.url, parsed[i].url);
					}
				}
			}
		});
	});
}


function CloseTab(tabId, url, regex) {
	
	var delayEnabledItem = browser.storage.sync.get(["closeDelayEnabled","closeDelayTime", "closeHistory"]);
	delayEnabledItem.then((res) => {

		if (!res.closeHistory) {
			res.closeHistory = { historyLength: 25, historyStore: [] }
		}
		res.closeHistory.historyStore.push({url: url, regex: regex});
		while (res.closeHistory.historyStore.length > res.closeHistory.historyLength) {
			res.closeHistory.historyStore.shift();
		}
		browser.storage.sync.set({closeHistory: res.closeHistory});

		if (res.closeDelayEnabled && res.closeDelayTime != null) {
			console.log(tabId);
			console.log(res.closeDelayTime);
			setTimeout(browser.tabs.remove, res.closeDelayTime, tabId);
		} else {
			browser.tabs.remove(tabId);
		}
	});
}

browser.webNavigation.onBeforeNavigate.addListener(newNavigation)