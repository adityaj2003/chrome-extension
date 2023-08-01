chrome.webNavigation.onHistoryStateUpdated.addListener(getCurrentTab);

async function getCurrentTab() {
    console.log('Getting current tab');
    let queryOptions = { active: true, lastFocusedWindow: true };
    // `tab` will either be a `tabs.Tab` instance or `undefined`.
    let [tab] = await chrome.tabs.query(queryOptions);
    console.log("current tab: ", tab);
    if (tab && isYoutubeUrl(tab.url)) {
        console.log('Youtube URL detected');
        chrome.action.setPopup({ popup: 'hello.html', tabId: tab.id });
       
    }
  }


  function isYoutubeUrl(url) {
    const youtubeUrlPattern = /youtube\.com\/watch/i;
    return youtubeUrlPattern.test(url);
  }
  