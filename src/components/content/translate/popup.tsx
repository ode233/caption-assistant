import React, { MouseEventHandler, useEffect, useRef } from 'react';
import { useState } from 'react';
import styled from 'styled-components';
import { getText, getSentence } from 'get-selection-more';
import { BsVolumeUpFill, BsXLg } from 'react-icons/bs';
import { BiExport } from 'react-icons/bi';
import { css } from '@emotion/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import { render } from 'react-dom';
import { display } from '@mui/system';

const dictPopupWidth = 400;
const dictPopupHeight = 300;

const ankiPopupWidth = 500;
const ankiPopupHeight = 800;

interface DictPopupProps {
    display: string;
    left: number;
    top: number;
    text: string;
    phonetic: string;
    textTranslate: string;
    textVoiceUrl: string;
    sentence: string;
    sentenceTranslate: string;
    sentenceVoiceUrl: string;
    onClickExportToAnki: MouseEventHandler;
}

const DictPopup = ({
    display,
    left,
    top,
    text,
    phonetic,
    textTranslate,
    textVoiceUrl,
    sentence,
    sentenceTranslate,
    sentenceVoiceUrl,
    onClickExportToAnki
}: DictPopupProps) => {
    return (
        <div
            css={css`
                overflow: auto;
                position: absolute;
                background-color: #fefefe;
                margin: auto;
                padding: 20px;
                border: 1px solid rgba(0, 0, 0, 0.12);
                width: ${dictPopupWidth + 'px'};
                height: ${dictPopupHeight + 'px'};
                z-index: 10001;
                display: ${display};
                left: ${left + 'px'};
                top: ${top + 'px'};
            `}
        >
            <div>
                <Text style={{ marginTop: '0px' }}>
                    {text}&nbsp;&nbsp;&nbsp;&nbsp;{phonetic}&nbsp;&nbsp;&nbsp;&nbsp;
                    <BsVolumeUpFill
                        style={{ fontSize: 'larger', verticalAlign: 'bottom' }}
                        onClick={() => {
                            let audio = new Audio(textVoiceUrl);
                            audio.play();
                        }}
                    />
                </Text>
                <Text>{textTranslate}</Text>
                <BiExport
                    style={{
                        top: '20px',
                        right: '20px',
                        position: 'absolute',
                        fontSize: 'larger',
                        verticalAlign: 'bottom'
                    }}
                    onClick={onClickExportToAnki}
                />
            </div>
            <Divider />
            <div>
                <Text>
                    {sentence}&nbsp;&nbsp;&nbsp;&nbsp;
                    <BsVolumeUpFill
                        style={{ fontSize: 'larger', verticalAlign: 'text-bottom' }}
                        onClick={() => {
                            let audio = new Audio(sentenceVoiceUrl);
                            audio.play();
                        }}
                    />
                </Text>
                <Text style={{ marginBottom: '0px' }}>{sentenceTranslate}</Text>
            </div>
        </div>
    );
};

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
    margin: 18px 0px;
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
            setPhonetic('');
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
                    console.log('event.pageX < leftRef');
                    return 'none';
                }
                return display;
            });
        });
    }, []);

    let onClickExportToAnki = () => {
        console.log('onClickExportToAnki');

        setDictDisplay('none');
        setAnkiDisplay('block');
    };

    return (
        <div>
            <DictPopup
                display={dictDisplay}
                left={left}
                top={top}
                text={text}
                phonetic={phonetic}
                textTranslate={textTranslate}
                textVoiceUrl={textVoiceUrl}
                sentence={sentence}
                sentenceTranslate={sentenceTranslate}
                sentenceVoiceUrl={sentenceVoiceUrl}
                onClickExportToAnki={onClickExportToAnki}
            ></DictPopup>
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
