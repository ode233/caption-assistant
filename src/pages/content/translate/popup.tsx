import React, { useEffect, useRef } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { getText, getSentence } from 'get-selection-more';
import { BsVolumeUpFill, BsXLg } from 'react-icons/bs';
import { BiExport } from 'react-icons/bi';

const dictPopupWidth = 400;
const dictPopupHeight = 300;

const ankiPopupWidth = 500;
const ankiPopupHeight = 800;

// eslint-disable-next-line spellcheck/spell-checker
const DictPopupWrapper = styled.div<{ display: string; left: number; top: number }>`
    overflow: auto;
    position: absolute;
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: ${dictPopupWidth + 'px'};
    height: ${dictPopupHeight + 'px'};
    z-index: 10001;
    display: ${(props) => props.display};
    left: ${(props) => props.left + 'px'};
    top: ${(props) => props.top + 'px'};
`;

// eslint-disable-next-line spellcheck/spell-checker
const AnkiPopupWrapper = styled.div<{ display: string }>`
    overflow: auto;
    position: absolute;
    background-color: #fefefe;
    margin: auto;
    padding: 20px;
    border: 1px solid #888;
    width: ${ankiPopupWidth + 'px'};
    height: ${ankiPopupHeight + 'px'};
    z-index: 10001;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    display: ${(props) => props.display};
`;

const Text = styled.h3`
    font-size: large;
    font-weight: normal;
    font-family: sans-serif;
`;

const Popup = () => {
    const [dictDisplay, setDictDisplay] = useState<string>('none');
    const [left, setLeft] = useState<number>(0);
    const [top, setTop] = useState<number>(0);

    const [text, setText] = useState<string>('');
    const [textTranslate, setTextTranslate] = useState<string>('');
    const [textVoiceUrl, setTextVoiceUrl] = useState<string>('');
    const [phonetic, setPhonetic] = useState<string>('');
    const [sentence, setSentence] = useState<string>('');
    const [sentenceTranslate, setSentenceTranslate] = useState<string>('');
    const [sentenceVoiceUrl, setSentenceVoiceUrl] = useState<string>('');

    const [ankiDisplay, setAnkiDisplay] = useState<string>('none');

    const leftRef = useRef(left);
    const topRef = useRef(top);

    useEffect(() => {
        leftRef.current = left;
        topRef.current = top;
    });

    useEffect(() => {
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
            setLeft(event.pageX + 10);
            setTop(event.pageY + 10);
            setDictDisplay('block');
        });

        document.addEventListener('mousedown', (event: MouseEvent) => {
            setDictDisplay((display) => {
                if (
                    (event.pageX < leftRef.current ||
                        event.pageX > leftRef.current + dictPopupWidth ||
                        event.pageY < topRef.current ||
                        event.pageY > topRef.current + dictPopupHeight) &&
                    display === 'block'
                ) {
                    window.getSelection()?.removeAllRanges();
                    return 'none';
                }
                return display;
            });
        });
    }, []);

    let onClickExportToAnki = () => {
        setDictDisplay('none');
        setAnkiDisplay('block');
    };

    return (
        <div>
            <DictPopupWrapper display={dictDisplay} left={left} top={top}>
                <Text>
                    {text}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    {phonetic}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <BsVolumeUpFill
                        style={{ fontSize: 'larger', verticalAlign: 'text-bottom' }}
                        onClick={() => {
                            let audio = new Audio(textVoiceUrl);
                            audio.play();
                        }}
                    />
                    <BiExport
                        style={{
                            right: 0,
                            marginRight: '30px',
                            position: 'absolute',
                            fontSize: 'larger',
                            verticalAlign: 'text-bottom'
                        }}
                        onClick={onClickExportToAnki}
                    />
                </Text>
                <Text style={{ marginTop: '15px' }}>{textTranslate}</Text>
                <hr style={{ marginTop: '20px', marginBottom: '20px', borderBottom: '1px solid black' }} />
                <Text>
                    {sentence}
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <BsVolumeUpFill
                        style={{ fontSize: 'larger', verticalAlign: 'text-bottom' }}
                        onClick={() => {
                            let audio = new Audio(sentenceVoiceUrl);
                            audio.play();
                        }}
                    />
                </Text>
                <Text style={{ marginTop: '15px' }}>{sentenceTranslate}</Text>
            </DictPopupWrapper>
            <AnkiPopupWrapper display={ankiDisplay}>
                <BsXLg
                    style={{ right: 0, marginRight: '20px', position: 'absolute', fontSize: 'larger' }}
                    onClick={() => {
                        setAnkiDisplay('none');
                    }}
                />
            </AnkiPopupWrapper>
        </div>
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
