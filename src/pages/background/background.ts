console.log('background');
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.status === 'loading' && tab.url?.match('https://www.netflix.com/watch/')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['netflix/content.js', 'vendor.js']
        });
    }
});
