import 'regenerator-runtime/runtime.js';
import { addNote, createDeck, createModel, getDeckNames, getModelNames } from '../common/api/ankiApi';
import { getPhonetic, getYoudaoTranslate } from '../common/api/translateApi';
import { ANKI_DECK_NAME, ANKI_MODEL_NAME } from '../common/constants/ankiConstants';
import { WATCH_NETFLIX_URL, WATCH_URL_LIST } from '../common/constants/watchVideoConstants';
import { PopupProps } from '../content/translate/popup';

console.log('background');

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    // read changeInfo data and do something with it (like read the url)
    if (changeInfo.status === 'loading' && tab.url?.match(WATCH_NETFLIX_URL)) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['watchVideo/netflix/content.js']
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.contentScriptQuery) {
        case 'getPhonetic': {
            getPhonetic(request.text).then((data) => {
                let phonetic = '';
                try {
                    phonetic = data[0].phonetic;
                } catch (e) {
                    console.log('getPhonetic err', e, data);
                    phonetic = '';
                }
                sendResponse(phonetic);
            });
            return true; // Will respond asynchronously.
        }
        case 'youdaoTranslate': {
            getYoudaoTranslate(request.content).then((data) => {
                let tgt = '';
                try {
                    tgt = data.translateResult[0][0].tgt;
                } catch (e) {
                    console.log('youdaoTranslate err', e, data);
                    tgt = '';
                }
                sendResponse(tgt);
            });
            return true; // Will respond asynchronously.
        }
        case 'captureVisibleTab': {
            chrome.tabs.captureVisibleTab((imgDataUrl: string) => {
                sendResponse(imgDataUrl);
            });
            return true;
        }
        case 'ankiExport': {
            addNote(request.content).then((data) => {
                sendResponse(data);
            });
            return true;
        }
        case 'getContextFromVideo': {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id!, { backgroundQuery: 'getContextFromVideo' }, (data) => {
                    sendResponse(data);
                });
            });
            return true;
        }
    }
});

checkAnkiConfig();

async function checkAnkiConfig() {
    let deckNames: [string] = (await getDeckNames()).result;
    if (!deckNames.includes(ANKI_DECK_NAME)) {
        console.log('createDeck');
        await createDeck();
    }
    let modelNames: [string] = (await getModelNames()).result;
    if (!modelNames.includes(ANKI_MODEL_NAME)) {
        console.log('createModel');
        let resp = await createModel();
    }
}

function saveToFile(blob: Blob, name: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style.display = 'none';
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}
