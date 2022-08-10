console.log('background');
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // read changeInfo data and do something with it (like read the url)
    console.log('changeInfo.url', changeInfo.url);
    if (changeInfo.url?.match('https://www.netflix.com/watch/')) {
        chrome.tabs.sendMessage(tabId, {
            message: 'findVideo!',
            url: changeInfo.url
        });
    }
});
