import 'regenerator-runtime/runtime.js';

console.log('background');
// setTimeout(() => {
//     chrome.tabs.captureVisibleTab((dataUrl: string) => {
//         console.log('dataUrl', dataUrl);
//     });
// }, 1000);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.status === 'loading' && tab.url?.match('https://www.netflix.com/watch/')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['watchVideo/netflix/content.js']
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.contentScriptQuery === 'youdaoTranslate') {
        let url =
            'https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=' + encodeURIComponent(request.sentence);
        fetch(url)
            .then((response) => response.json())
            .then((data) => {
                let tgt = data.translateResult[0][0].tgt;
                sendResponse(tgt);
            });
        return true; // Will respond asynchronously.
    }
});
