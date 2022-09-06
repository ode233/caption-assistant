import * as React from 'react';
import { MouseEventHandler, useEffect, useRef } from 'react';
import { useState } from 'react';
import styled from '@emotion/styled';
import { getText, getSentence } from 'get-selection-more';
import { BsVolumeUpFill, BsXLg } from 'react-icons/bs';
import { BiExport } from 'react-icons/bi';
import { css } from '@emotion/react';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import { Box, InputAdornment } from '@mui/material';

const leftClick = 0;

const dictPopupWidth = 420;
const dictPopupHeight = 320;

const ankiPopupWidth = 500;
const ankiPopupHeight = 800;

const DictPopupWrapper = styled.div``;

const AnkiPopupWrapper = styled.div``;

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

    const [ankiOpen, setAnkiOpen] = useState(false);

    const leftRef = useRef(left);
    const topRef = useRef(top);

    const ankiOpenRef = useRef(ankiOpen);

    console.log('render');

    useEffect(() => {
        leftRef.current = left;
        topRef.current = top;
        ankiOpenRef.current = ankiOpen;
    });

    useEffect(() => {
        document.addEventListener('mouseup', (event: MouseEvent) => {
            if (ankiOpenRef.current) {
                return;
            }
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

            setLeft(event.clientX + 10);
            setTop(event.clientY + 10);
            setDictDisplay('block');
        });

        document.addEventListener('mousedown', (event: MouseEvent) => {
            setDictDisplay((display) => {
                if (
                    (event.clientX < leftRef.current ||
                        event.clientX > leftRef.current + dictPopupWidth ||
                        event.clientY < topRef.current ||
                        event.clientY > topRef.current + dictPopupHeight) &&
                    display === 'block' &&
                    event.button === leftClick
                ) {
                    window.getSelection()?.removeAllRanges();
                    console.log('event.pageX', event.pageX, leftRef.current, leftRef.current + dictPopupWidth);
                    console.log('event.pageY', event.pageY, topRef.current, topRef.current + dictPopupHeight);
                    return 'none';
                }
                return display;
            });
        });
    }, []);

    let onClickOpenAnkiPopup = () => {
        setDictDisplay('none');
        setAnkiOpen(true);
    };

    let onClickCloseAnki = () => {
        setAnkiOpen(false);
    };

    const onTextTranslateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTextTranslate(event.target.value);
    };

    const onSentenceTranslateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSentenceTranslate(event.target.value);
    };

    return (
        <div>
            <DictPopupWrapper
                css={css`
                    box-sizing: border-box;
                    overflow: auto;
                    position: fixed;
                    background-color: #fefefe;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    width: ${dictPopupWidth + 'px'};
                    height: ${dictPopupHeight + 'px'};
                    z-index: 10001;
                    display: ${dictDisplay};
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
                        onClick={onClickOpenAnkiPopup}
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
            </DictPopupWrapper>
            <AnkiPopupWrapper>
                <Dialog
                    open={ankiOpen}
                    css={css`
                        bottom: 200px;
                    `}
                >
                    <DialogContent
                        css={css`
                            overflow: auto;
                            width: ${ankiPopupWidth + 'px'};
                            height: ${ankiPopupHeight + 'px'};
                            display: flex;
                            flex-direction: column;
                            gap: 1rem;
                        `}
                    >
                        <TextField
                            fullWidth
                            label="单词"
                            value={text}
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <BsVolumeUpFill
                                            onClick={() => {
                                                let audio = new Audio(textVoiceUrl);
                                                audio.play();
                                            }}
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            fullWidth
                            label="翻译"
                            value={textTranslate}
                            onChange={onTextTranslateChange}
                            variant="standard"
                        />
                        <TextField
                            fullWidth
                            label="上下文"
                            multiline
                            maxRows={3}
                            value={sentence}
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <BsVolumeUpFill
                                            onClick={() => {
                                                let audio = new Audio(sentenceVoiceUrl);
                                                audio.play();
                                            }}
                                        />
                                    </InputAdornment>
                                )
                            }}
                        />
                        <TextField
                            fullWidth
                            label="翻译"
                            multiline
                            maxRows={3}
                            value={sentenceTranslate}
                            onChange={onSentenceTranslateChange}
                            variant="standard"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClickCloseAnki}>关闭</Button>
                        <Button onClick={onClickCloseAnki}>导出至Anki</Button>
                    </DialogActions>
                </Dialog>
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
