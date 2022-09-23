import 'regenerator-runtime/runtime.js';
import { addNote, createDeck, createModel, getDeckNames, getModelNames } from '../../api/ankiApi';
import { getPhonetic } from '../../api/translateApi';
import { ANKI_DECK_NAME, ANKI_MODEL_NAME } from '../../constants/ankiConstants';
import { WATCH_NETFLIX_URL } from '../../constants/watchVideoConstants';
import { CaiyunTranslator, Translator, YoudaoFreeTranslator } from '../../definition/translatorDefinition';
import { getUserConfig } from '../../definition/userConfigDefinition';

console.log('background');

let translator: Translator<any>;

init();

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
    switch (request.queryBackground) {
        case 'applyUserConfig': {
            applyUserConfig();
            return;
        }
        case 'getPhonetic': {
            getPhonetic(request.text)
                .then((data) => {
                    let phonetic;
                    try {
                        phonetic = data[0].phonetic;
                    } catch (e) {
                        console.log('getPhonetic err', e, data);
                    }
                    if (!phonetic) {
                        phonetic = '';
                    }
                    sendResponse(phonetic);
                })
                .catch((e) => {
                    console.log('getPhonetic err', e);
                    sendResponse('');
                });
            return true; // Will respond asynchronously.
        }
        case 'translate': {
            // TODO: package custom translate to Translator class, unify translate invoke
            translator.translate(request.content).then((tgt) => {
                sendResponse(tgt);
            });
            return true;
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

function init() {
    checkAnkiConfig();
    applyUserConfig();
}

async function checkAnkiConfig() {
    let deckNames: [string] = (await getDeckNames()).result;
    if (!deckNames.includes(ANKI_DECK_NAME)) {
        await createDeck();
    }
    let modelNames: [string] = (await getModelNames()).result;
    if (!modelNames.includes(ANKI_MODEL_NAME)) {
        await createModel();
    }
}

async function applyUserConfig() {
    let userConfig = await getUserConfig();
    if (!userConfig) {
        translator = new YoudaoFreeTranslator();
        return;
    }
    if (userConfig.caiyunToken) {
        translator = new CaiyunTranslator({ token: userConfig.caiyunToken });
    } else {
        translator = new YoudaoFreeTranslator();
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
