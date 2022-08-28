import React, { useEffect } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { getText, getSentence } from 'get-selection-more';

const popupId = 'popup-id-866699#$%114';

// eslint-disable-next-line spellcheck/spell-checker
const PopupWrapper = styled.div<{ display: string; left: number; top: number }>`
    position: absolute;
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 400px;
    height: 400px;
    z-index: 10001;
    display: ${(props) => props.display};
    left: ${(props) => props.left + 'px'};
    top: ${(props) => props.top + 'px'};
`;

const Popup = () => {
    const [display, setDisplay] = useState<string>('none');
    const [left, setLeft] = useState<number>(0);
    const [top, setTop] = useState<number>(0);

    useEffect(() => {
        document.addEventListener('mouseup', (event: MouseEvent) => {
            let text = getText();
            if (!text) {
                return;
            }
            console.log(text);
            let sentence = getSentence();
            setDisplay('block');
            console.log(event.pageX, event.pageY, event.clientX, event.clientY);

            setLeft(event.pageX);
            setTop(event.pageY);

            let phonetic = '';
            if (isWord(text)) {
                fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`)
                    .then((response) => response.json())
                    .then((data) => {
                        phonetic = data[0].phonetic;
                    });
            }
            let voice = `https://dict.youdao.com/dictvoice?type=0&audio=${sentence}`;
            let translate = '';
            chrome.runtime.sendMessage({ contentScriptQuery: 'youdaoTranslate', sentence: sentence }, (tgt) => {
                translate = tgt;
                console.log(translate);
            });
        });

        document.addEventListener('mousedown', (event: MouseEvent) => {
            setDisplay((display) => {
                if (display === 'block' && (event.target as HTMLElement).id !== popupId) {
                    return 'none';
                }
                return display;
            });
        });
    }, []);
    return <PopupWrapper id={popupId} display={display} left={left} top={top}></PopupWrapper>;
};

function isWord(text: string): boolean {
    let regex = /^[a-zA-Z]+$/;
    if (regex.test(text)) {
        return true;
    }
    return false;
}

export { Popup };
