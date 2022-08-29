import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { getText, getSentence } from 'get-selection-more';
import { BsVolumeUpFill } from 'react-icons/bs';

const popupId = 'popup-id-866699#$%114';
const popupWidth = 400;
const popupHeight = 300;

// eslint-disable-next-line spellcheck/spell-checker
const DictPopupWrapper = styled.div<{ display: string; left: number; top: number }>`
    overflow: auto;
    position: absolute;
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: ${popupWidth + 'px'};
    height: ${popupHeight + 'px'};
    z-index: 10001;
    display: ${(props) => props.display};
    left: ${(props) => props.left + 'px'};
    top: ${(props) => props.top + 'px'};
`;

const Popup = () => {
    const [display, setDisplay] = useState<string>('none');
    const [left, setLeft] = useState<number>(0);
    const [top, setTop] = useState<number>(0);

    const [text, setText] = useState<string>('');
    const [textTranslate, setTextTranslate] = useState<string>('');
    const [textVoiceUrl, setTextVoiceUrl] = useState<string>('');
    const [phonetic, setPhonetic] = useState<string>('');
    const [sentence, setSentence] = useState<string>('');
    const [sentenceTranslate, setSentenceTranslate] = useState<string>('');
    const [sentenceVoiceUrl, setSentenceVoiceUrl] = useState<string>('');

    const leftRef = useRef(left);
    const topRef = useRef(top);

    useEffect(() => {
        leftRef.current = left;
        topRef.current = top;
    });

    useEffect(() => {
        let targetElement: EventTarget | null;
        document.addEventListener('mouseup', (event: MouseEvent) => {
            let text = getText();
            if (!text) {
                return;
            }
            if (isWord(text)) {
                fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`)
                    .then((response) => {
                        if (response.ok) {
                            return response.json();
                        }
                    })
                    .then((data) => {
                        if (!data) {
                            return;
                        }
                        setPhonetic(data[0].phonetic);
                    });
            }
            chrome.runtime.sendMessage({ contentScriptQuery: 'youdaoTranslate', content: text }, (tgt) => {
                setTextTranslate(tgt);
            });
            let sentence = getSentence();
            chrome.runtime.sendMessage({ contentScriptQuery: 'youdaoTranslate', content: sentence }, (tgt) => {
                setSentenceTranslate(tgt);
            });

            setText(text);
            setTextVoiceUrl(`https://dict.youdao.com/dictvoice?type=0&audio=${text}`);
            setSentence(sentence);
            setSentenceVoiceUrl(`https://dict.youdao.com/dictvoice?type=0&audio=${sentence}`);
            setLeft(event.pageX);
            setTop(event.pageY);
            setDisplay('block');
        });

        document.addEventListener('mousedown', (event: MouseEvent) => {
            setDisplay((display) => {
                if (
                    (event.pageX < leftRef.current ||
                        event.pageX > leftRef.current + popupWidth ||
                        event.pageY < topRef.current ||
                        event.pageY > topRef.current + popupHeight) &&
                    display === 'block'
                ) {
                    window.getSelection()?.removeAllRanges();
                    return 'none';
                }
                return display;
            });
        });
    }, []);

    return (
        <DictPopupWrapper id={popupId} display={display} left={left} top={top}>
            <h3>
                {text}
                &nbsp;&nbsp;&nbsp;&nbsp;
                {phonetic}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <BsVolumeUpFill
                    onClick={() => {
                        let audio = new Audio(textVoiceUrl);
                        audio.play();
                    }}
                />
            </h3>
            <h3 style={{ marginTop: '10px' }}>{textTranslate}</h3>
            <hr style={{ marginTop: '20px', marginBottom: '20px' }} />
            <h3>
                {sentence}
                &nbsp;&nbsp;&nbsp;&nbsp;
                <BsVolumeUpFill
                    onClick={() => {
                        let audio = new Audio(sentenceVoiceUrl);
                        audio.play();
                    }}
                />
            </h3>
            <h3 style={{ marginTop: '10px' }}>{sentenceTranslate}</h3>
        </DictPopupWrapper>
    );
};

function isWord(text: string): boolean {
    let regex = /^[a-zA-Z]+$/;
    if (regex.test(text)) {
        return true;
    }
    return false;
}

export { Popup };
