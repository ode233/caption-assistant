import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import styled from '@emotion/styled';
import { getText, getSentence } from 'get-selection-more';
import { BsVolumeUpFill } from 'react-icons/bs';
import { BiExport } from 'react-icons/bi';
import { css } from '@emotion/react';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import { InputAdornment, InputLabel, Link, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import './popup.scss';
import { WATCH_URL_LIST } from '../../common/constants/watchVideoConstants';

const leftClick = 0;

const dictPopupWidth = 420;
const dictPopupHeight = 320;

const ankiPopupWidth = 600;
const ankiPopupHeight = 800;

const youdaoVoiceUrl = 'https://dict.youdao.com/dictvoice?type=0&audio=';

const DictPopupWrapper = styled.div``;

const AnkiPopupWrapper = styled.div``;

const Text = styled.h3`
    font-size: large;
    font-weight: normal;
    font-family: sans-serif;
    margin: 18px 0px;
`;

interface PopupProps {
    dictDisplay: string;
    dictLeft: number;
    dictTop: number;
    text: string;
    textPhonetic: string;
    textVoiceUrl: string;
    textTranslate: string;
    sentence: string;
    sentenceVoiceUrl: string;
    sentenceTranslate: string;
    remark: string;
    pageIconUrl: string;
    pageTitle: string;
    pageUrl: string;
    imgDataUrl: string;
    ankiOpen: boolean;
}

interface ContextFromVideo {
    sentenceVoiceUrl: string;
    imgDataUrl: string;
}

const Popup = () => {
    const [popupProps, setPopupProps] = useState<PopupProps>({
        dictDisplay: 'none',
        dictLeft: 0,
        dictTop: 0,
        text: '',
        textPhonetic: '',
        textVoiceUrl: '',
        textTranslate: '',
        sentence: '',
        sentenceVoiceUrl: '',
        sentenceTranslate: '',
        remark: '',
        pageIconUrl: '',
        pageTitle: '',
        pageUrl: '',
        imgDataUrl: '',
        ankiOpen: false
    });

    const popupPropsRef = useRef(popupProps);

    console.log('render');

    useEffect(() => {
        popupPropsRef.current = popupProps;
    });

    useEffect(() => {
        document.addEventListener('mouseup', (event: MouseEvent) => {
            if (popupPropsRef.current.ankiOpen) {
                return;
            }
            let text = getText();
            if (!text) {
                return;
            }

            popupProps.textPhonetic = '';
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
                        let phonetic = data[0].phonetic;
                        if (phonetic) {
                            popupProps.textPhonetic = phonetic;
                            setPopupProps({ ...popupProps });
                        }
                    });
            }
            chrome.runtime.sendMessage({ contentScriptQuery: 'youdaoTranslate', content: text }, (tgt) => {
                popupProps.textTranslate = tgt;
                setPopupProps({ ...popupProps });
            });
            let sentence = getSentence();
            chrome.runtime.sendMessage({ contentScriptQuery: 'youdaoTranslate', content: sentence }, (tgt) => {
                popupProps.sentenceTranslate = tgt;
                setPopupProps({ ...popupProps });
            });
            chrome.runtime.sendMessage({ contentScriptQuery: 'captureVisibleTab' }, (imgUrl) => {
                popupProps.imgDataUrl = imgUrl;
                setPopupProps({ ...popupProps });
            });

            popupProps.dictDisplay = 'block';
            popupProps.dictLeft = event.clientX + 10;
            popupProps.dictTop = event.clientY + 10;
            popupProps.text = text;
            popupProps.textVoiceUrl = youdaoVoiceUrl + text;
            popupProps.sentence = sentence;
            popupProps.sentenceVoiceUrl = youdaoVoiceUrl + sentence;
            popupProps.remark = '';
            popupProps.pageIconUrl = window.location.origin + '/favicon.ico';
            popupProps.pageTitle = document.title;
            popupProps.pageUrl = document.URL;
            setPopupProps({ ...popupProps });
        });

        document.addEventListener('mousedown', (event: MouseEvent) => {
            if (
                (event.clientX < popupPropsRef.current.dictLeft ||
                    event.clientX > popupPropsRef.current.dictLeft + dictPopupWidth ||
                    event.clientY < popupPropsRef.current.dictTop ||
                    event.clientY > popupPropsRef.current.dictTop + dictPopupHeight) &&
                popupPropsRef.current.dictDisplay === 'block' &&
                event.button === leftClick
            ) {
                window.getSelection()?.removeAllRanges();
                popupPropsRef.current.dictDisplay = 'none';
                setPopupProps({ ...popupPropsRef.current });
            }
        });
    }, []);

    const onClickOpenAnkiPopup = () => {
        let isWatchVideo = false;
        for (let watchUrl of WATCH_URL_LIST) {
            if (popupProps.pageUrl.match(watchUrl)) {
                isWatchVideo = true;
                break;
            }
        }
        if (isWatchVideo) {
            chrome.runtime.sendMessage({ contentScriptQuery: 'getContextFromVideo' }, (data: ContextFromVideo) => {
                console.log('contextFromVideo', data);
                popupProps.sentenceVoiceUrl = data.sentenceVoiceUrl;
                popupProps.imgDataUrl = data.imgDataUrl;
                popupProps.dictDisplay = 'none';
                popupProps.ankiOpen = true;
                setPopupProps({ ...popupProps });
            });
        } else {
            popupProps.dictDisplay = 'none';
            popupProps.ankiOpen = true;
            setPopupProps({ ...popupProps });
        }
    };

    const onClickCloseAnki = () => {
        popupProps.ankiOpen = false;
        setPopupProps({ ...popupProps });
    };

    const onClickExportAnki = async () => {
        chrome.runtime.sendMessage({ contentScriptQuery: 'ankiExport', content: popupProps }, (data) => {
            if (data.error) {
                console.log('ankiExport err', data);
                return;
            }
            popupProps.ankiOpen = false;
            setPopupProps({ ...popupProps });
        });
    };

    const onTextTranslateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        popupProps.textTranslate = event.target.value;
        setPopupProps({ ...popupProps });
    };

    const onSentenceTranslateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        popupProps.sentenceTranslate = event.target.value;
        setPopupProps({ ...popupProps });
    };

    const onRemarkChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        popupProps.remark = event.target.value;
        setPopupProps({ ...popupProps });
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
                    display: ${popupProps.dictDisplay};
                    left: ${popupProps.dictLeft + 'px'};
                    top: ${popupProps.dictTop + 'px'};
                `}
            >
                <div>
                    <Text style={{ marginTop: '0px' }}>
                        {popupProps.text}&nbsp;&nbsp;&nbsp;&nbsp;{popupProps.textPhonetic}&nbsp;&nbsp;&nbsp;&nbsp;
                        <BsVolumeUpFill
                            style={{ fontSize: 'larger', verticalAlign: 'bottom' }}
                            onClick={() => {
                                let audio = new Audio(popupProps.textVoiceUrl);
                                audio.play();
                            }}
                        />
                    </Text>
                    <Text>{popupProps.textTranslate}</Text>
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
                        {popupProps.sentence}&nbsp;&nbsp;&nbsp;&nbsp;
                        <BsVolumeUpFill
                            style={{ fontSize: 'larger', verticalAlign: 'text-bottom' }}
                            onClick={() => {
                                let audio = new Audio(popupProps.sentenceVoiceUrl);
                                audio.play();
                            }}
                        />
                    </Text>
                    <Text style={{ marginBottom: '0px' }}>{popupProps.sentenceTranslate}</Text>
                </div>
            </DictPopupWrapper>
            <AnkiPopupWrapper>
                <Dialog
                    open={popupProps.ankiOpen}
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
                            gap: 16px;
                        `}
                    >
                        <TextField
                            fullWidth
                            label="单词"
                            value={popupProps.text + '    ' + popupProps.textPhonetic}
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <BsVolumeUpFill
                                            onClick={() => {
                                                let audio = new Audio(popupProps.textVoiceUrl);
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
                            value={popupProps.textTranslate}
                            onChange={onTextTranslateChange}
                            variant="standard"
                        />
                        <TextField
                            fullWidth
                            label="上下文"
                            multiline
                            maxRows={3}
                            value={popupProps.sentence}
                            variant="standard"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="start">
                                        <BsVolumeUpFill
                                            onClick={() => {
                                                let audio = new Audio(popupProps.sentenceVoiceUrl);
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
                            value={popupProps.sentenceTranslate}
                            onChange={onSentenceTranslateChange}
                            variant="standard"
                        />
                        <TextField
                            fullWidth
                            label="备注"
                            value={popupProps.remark}
                            onChange={onRemarkChange}
                            variant="standard"
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                        <div>
                            <InputLabel shrink={true}>来源</InputLabel>
                            <ListItem
                                css={css`
                                    align-items: end;
                                `}
                                disablePadding
                            >
                                <ListItemIcon
                                    css={css`
                                        min-width: 0;
                                        margin-right: 10px;
                                    `}
                                >
                                    <img src={popupProps.pageIconUrl}></img>
                                </ListItemIcon>
                                <ListItemText
                                    css={css`
                                        margin-bottom: 0;
                                    `}
                                    primary={
                                        <Link href={popupProps.pageUrl} underline="none">
                                            {popupProps.pageTitle}
                                        </Link>
                                    }
                                ></ListItemText>
                            </ListItem>
                            <hr></hr>
                        </div>
                        <div>
                            <InputLabel shrink={true}>图片</InputLabel>
                            <ListItem disablePadding>
                                <img
                                    src={popupProps.imgDataUrl}
                                    css={css`
                                        width: ${ankiPopupWidth - 50 + 'px'};
                                    `}
                                ></img>
                            </ListItem>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={onClickCloseAnki}>关闭</Button>
                        <Button onClick={onClickExportAnki}>导出至Anki</Button>
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

export { PopupProps, Popup, ContextFromVideo };
