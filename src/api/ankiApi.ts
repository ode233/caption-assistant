import { PopupProps } from '../components/content/translate/popup';
import { ANKI_DECK_NAME, ANKI_MODEL_NAME } from '../constants/ankiConstants';

const ankiBaseUrl = 'http://localhost:8765';

export const getDeckNames = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'deckNames',
            version: 6
        })
    });
    return response.json();
};

export const createDeck = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'createDeck',
            version: 6,
            params: {
                deck: ANKI_DECK_NAME
            }
        })
    });
    return response.json();
};

export const getModelNames = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'modelNames',
            version: 6
        })
    });
    return response.json();
};

const frontHTML = `
<section>{{cloze:SentenceCloze}}<section>

<section>{{type:cloze:SentenceCloze}}</section>

<section>{{TextTranslate}}</section>

<section>{{SentenceTranslate}}</section>

<section>TextVoice: {{TextVoice}} {{TextPhonetic}}</section>

<section>SentenceVoice: {{SentenceVoice}}</section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section class="source">
<hr />
<img src="{{PageIcon}}" />
<a href="{{PageUrl}}">{{PageTitle}}</a>
</section>

<section class="srcImg">
{{Img}}
<section>
`;

const backHTML = `
<section>{{cloze:SentenceCloze}}<section>

<section>{{type:cloze:SentenceCloze}}</section>

<section>{{TextTranslate}}</section>

<section>{{SentenceTranslate}}</section>

<section>TextVoice: {{TextVoice}} {{TextPhonetic}}</section>

<section>SentenceVoice: {{SentenceVoice}}</section>

{{#Remark}}
    <section>{{Remark}}<section>
{{/Remark}}

<section class="source">
<hr />
<img src="{{PageIcon}}" />
<a href="{{PageUrl}}">{{PageTitle}}</a>
</section>

<section class="srcImg">
{{Img}}
<section>
`;

// eslint-disable-next-line spellcheck/spell-checker
const css = `
.card {
    font-family: arial;
    font-size: 20px;
    text-align: center;
    color: #333;
    background-color: white;
  }
  
  a {
    color: #5caf9e;
  }
  
  input {
    border: 1px solid #eee;
  }
  
  section {
    margin: 1em 0;
  }
  
  .trans {
    border: 1px solid #eee;
    padding: 0.5em;
  }
  
  .trans_title {
    display: block;
    font-size: 0.9em;
    font-weight: bold;
  }
  
  .trans_content {
    margin-bottom: 0.5em;
  }
  
  .cloze {
    font-weight: bold;
    color: #f9690e;
  }
  
  .source {
    position: relative;
    font-size: .8em;
  }
  
  .source img {
    height: .7em;
  }
  
  .source a {
    text-decoration: none;
  }
  
  .typeGood {
    color: #fff;
    background: #1EBC61;
  }
  
  .typeBad {
    color: #fff;
    background: #F75C4C;
  }
  
  .typeMissed {
    color: #fff;
    background: #7C8A99;
  }

  .source img {
    width: inherit;
  }
`;

export const createModel = async () => {
    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'createModel',
            version: 6,
            params: {
                modelName: ANKI_MODEL_NAME,
                inOrderFields: [
                    'Timestamp',
                    'Text',
                    'TextPhonetic',
                    'TextVoice',
                    'TextTranslate',
                    'Sentence',
                    'SentenceVoice',
                    'SentenceTranslate',
                    'Remark',
                    'PageIcon',
                    'PageTitle',
                    'PageUrl',
                    'Img',
                    'SentenceCloze'
                ],
                isCloze: true,
                css: css,
                cardTemplates: [
                    {
                        Name: 'Card',
                        Front: frontHTML,
                        Back: backHTML
                    }
                ]
            }
        })
    });
    return response.json();
};

export const addNote = async (popupProps: PopupProps) => {
    let timestamp = Date.now().toString();
    let sentenceCloze = popupProps.sentence.replaceAll(popupProps.text, `{{c1::${popupProps.text}}}`);
    let textVoice = {
        url: popupProps.textVoiceUrl,
        filename: `${timestamp}_textVoice.mp3`,
        fields: ['TextVoice']
    };
    let sentenceVoice;
    if (popupProps.videoSentenceVoiceDataUrl) {
        let voiceData = popupProps.videoSentenceVoiceDataUrl.split(',')[1];
        sentenceVoice = {
            data: voiceData,
            filename: `${timestamp}_sentenceVoice.mp3`,
            fields: ['SentenceVoice']
        };
    } else {
        sentenceVoice = {
            url: popupProps.sentenceVoiceUrl,
            filename: `${timestamp}_sentenceVoice.mp3`,
            fields: ['SentenceVoice']
        };
    }
    let imgData = popupProps.imgDataUrl.split(',')[1];
    let img = {
        data: imgData,
        filename: `${timestamp}_img.jpeg`,
        fields: ['Img']
    };

    const response = await fetch(ankiBaseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action: 'addNote',
            version: 6,
            params: {
                note: {
                    deckName: ANKI_DECK_NAME,
                    modelName: ANKI_MODEL_NAME,
                    fields: {
                        Text: popupProps.text,
                        TextPhonetic: popupProps.textPhonetic,
                        TextTranslate: popupProps.textTranslate,
                        Sentence: popupProps.sentence,
                        SentenceTranslate: popupProps.sentenceTranslate,
                        Remark: popupProps.remark,
                        PageIcon: popupProps.pageIconUrl,
                        PageTitle: popupProps.pageTitle,
                        PageUrl: popupProps.pageUrl,
                        SentenceCloze: sentenceCloze,
                        Timestamp: timestamp
                    },
                    audio: [textVoice, sentenceVoice],
                    picture: [img],
                    options: {
                        allowDuplicate: false,
                        duplicateScope: 'deck'
                    }
                }
            }
        })
    });
    return response.json();
};
