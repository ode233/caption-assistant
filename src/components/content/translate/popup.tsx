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
import {
    CircularProgress,
    InputAdornment,
    InputLabel,
    Link,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import { WATCH_URL_LIST } from '../../../constants/watchVideoConstants';
import { dataUrlToBlob } from '../../../api/translateApi';
import {
    DICT_POPUP_WIDTH,
    DICT_POPUP_HEIGHT,
    YOUDAO_VOICE_URL,
    LEFT_CLICK,
    ANKI_POPUP_HEIGHT,
    ANKI_POPUP_WIDTH
} from '../../../constants/translateConstants';
import { delay } from '../../../utils/utils';

const DictPopupWrapper = styled.div``;

const AnkiPopupWrapper = styled.div``;

const Text = styled.h3`
    font-size: large;
    font-weight: normal;
    font-family: sans-serif;
    margin: 18px 0px;
`;

class PopupProps {
    public dictLoading = true;
    public dictDisplay = 'none';
    public dictLeft = 0;
    public dictTop = 0;
    public text = '';
    public textPhonetic = '';
    public textVoiceUrl = '';
    public textTranslate = '';
    public sentence = '';
    public sentenceVoiceUrl = '';
    public videoSentenceVoiceDataUrl = '';
    public sentenceTranslate = '';
    public remark = '';
    public pageIconUrl = '';
    public pageTitle = '';
    public pageUrl = '';
    public imgDataUrl = '';
    public ankiOpen = false;
    public isLoadingAnki = false;
}

interface ContextFromVideo {
    videoSentenceVoiceDataUrl: string;
    imgDataUrl: string;
}

const Popup = () => {
    const [popupProps, setPopupProps] = useState(new PopupProps());

    const popupPropsRef = useRef(popupProps);
    const isWatchVideoRef = useRef(false);

    useEffect(() => {
        popupPropsRef.current = popupProps;
    });

    useEffect(() => {
        async function setTranslationAndPhonetic(popupProps: PopupProps) {
            let promises = [];
            promises.push(
                getTranslation(popupProps.text),
                getTranslation(popupProps.sentence)
                // getPhonetic(popupProps.text)
            );

            await Promise.all(promises).then((values) => {
                popupProps.textTranslate = values[0];
                popupProps.sentenceTranslate = values[1];
                // popupProps.textPhonetic = values[2];
            });
        }

        // TODO: need lighter and faster phonetic api
        function getPhonetic(text: string) {
            return new Promise<string>((resolve) => {
                if (!isEnWord(text)) {
                    resolve('');
                    return;
                }
                chrome.runtime.sendMessage({ queryBackground: 'getPhonetic', text: text }, (phonetic) => {
                    resolve(phonetic);
                });
            });
        }

        function getTranslation(content: string) {
            return new Promise<string>((resolve) => {
                chrome.runtime.sendMessage({ queryBackground: 'translate', content: content }, (tgt) => {
                    resolve(tgt);
                });
            });
        }

        document.addEventListener('mouseup', async (event: MouseEvent) => {
            if (popupPropsRef.current.dictDisplay === 'block') {
                return;
            }
            if (popupPropsRef.current.isLoadingAnki) {
                return;
            }
            let text = getText();
            if (!isEnWordGroup(text)) {
                return;
            }

            let popupProps = new PopupProps();
            let sentence = getSentence();

            let clientWidth = document.documentElement.clientWidth;
            let clientHeight = document.documentElement.clientHeight;
            let offset = 10;

            let dictLeft = event.clientX + offset;
            let dictTop = event.clientY + offset;
            if (dictLeft + DICT_POPUP_WIDTH > clientWidth) {
                let newDictLeft = event.clientX - DICT_POPUP_WIDTH - offset;
                if (newDictLeft >= 0) {
                    dictLeft = newDictLeft;
                }
            }
            if (dictTop + DICT_POPUP_HEIGHT > clientHeight) {
                let newDictTop = event.clientY - DICT_POPUP_HEIGHT - offset;
                if (newDictTop >= 0) {
                    dictTop = newDictTop;
                }
            }

            // display loading page
            popupProps.dictLoading = true;
            popupProps.dictDisplay = 'block';
            popupProps.dictLeft = dictLeft;
            popupProps.dictTop = dictTop;
            popupProps.text = text;
            popupProps.textVoiceUrl = YOUDAO_VOICE_URL + text;
            popupProps.sentence = sentence;
            popupProps.sentenceVoiceUrl = YOUDAO_VOICE_URL + sentence;
            popupProps.pageIconUrl = window.location.origin + '/favicon.ico';
            popupProps.pageTitle = document.title;
            popupProps.pageUrl = document.URL;
            setPopupProps({ ...popupProps });

            // fetch value
            await setTranslationAndPhonetic(popupProps);
            popupProps.dictLoading = false;
            setPopupProps({ ...popupProps });
        });

        document.addEventListener('mousedown', (event: MouseEvent) => {
            if (
                popupPropsRef.current.dictDisplay === 'block' &&
                event.button === LEFT_CLICK &&
                (event.clientX < popupPropsRef.current.dictLeft ||
                    event.clientX > popupPropsRef.current.dictLeft + DICT_POPUP_WIDTH ||
                    event.clientY < popupPropsRef.current.dictTop ||
                    event.clientY > popupPropsRef.current.dictTop + DICT_POPUP_HEIGHT)
            ) {
                window.getSelection()?.removeAllRanges();
                popupPropsRef.current.dictDisplay = 'none';
                setPopupProps({ ...popupPropsRef.current });
            }
        });
    }, []);

    const onClickOpenAnkiPopup = async () => {
        window.getSelection()?.removeAllRanges();
        popupProps.isLoadingAnki = true;
        popupProps.dictDisplay = 'none';
        setPopupProps({ ...popupProps });
        for (let watchUrl of WATCH_URL_LIST) {
            if (popupProps.pageUrl.match(watchUrl)) {
                isWatchVideoRef.current = true;
                break;
            }
        }
        if (isWatchVideoRef.current) {
            chrome.runtime.sendMessage({ queryBackground: 'getContextFromVideo' }, (data: ContextFromVideo) => {
                if (!data.imgDataUrl) {
                    alert('getContextFromVideo err');
                    popupProps.isLoadingAnki = false;
                    setPopupProps({ ...popupProps });
                    return;
                }
                popupProps.videoSentenceVoiceDataUrl = data.videoSentenceVoiceDataUrl;
                popupProps.imgDataUrl = data.imgDataUrl;
                popupProps.ankiOpen = true;
                setPopupProps({ ...popupProps });
            });
        } else {
            popupProps.ankiOpen = true;
            setPopupProps({ ...popupProps });
        }
    };

    const onClickCloseAnki = async () => {
        popupProps.isLoadingAnki = false;
        popupProps.ankiOpen = false;
        setPopupProps({ ...popupProps });
        if (isWatchVideoRef.current) {
            await delay(100);
            chrome.runtime.sendMessage({ queryBackground: 'playVideo' });
        }
    };

    const onClickExportAnki = async () => {
        chrome.runtime.sendMessage({ queryBackground: 'ankiExport', content: popupProps }, async (data) => {
            if (data.error) {
                alert(`ankiExport err, ${data.error}`);
                return;
            }
            popupProps.isLoadingAnki = false;
            popupProps.ankiOpen = false;
            setPopupProps({ ...popupProps });
            if (isWatchVideoRef.current) {
                await delay(100);
                chrome.runtime.sendMessage({ queryBackground: 'playVideo' });
            }
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
        <div
            css={css`
                all: initial;
            `}
        >
            <DictPopupWrapper
                css={css`
                    box-sizing: border-box;
                    overflow: auto;
                    position: fixed;
                    background-color: #fefefe;
                    margin: auto;
                    padding: 20px;
                    border: 1px solid rgba(0, 0, 0, 0.12);
                    width: ${DICT_POPUP_WIDTH + 'px'};
                    height: ${DICT_POPUP_HEIGHT + 'px'};
                    z-index: 10001;
                    display: ${popupProps.dictDisplay};
                    left: ${popupProps.dictLeft + 'px'};
                    top: ${popupProps.dictTop + 'px'};
                `}
            >
                {popupProps.dictLoading && (
                    <CircularProgress
                        css={css`
                            position: absolute;
                            top: 0;
                            right: 0;
                            bottom: 0;
                            left: 0;
                            margin: auto;
                        `}
                    />
                )}
                {!popupProps.dictLoading && (
                    <div>
                        <BiExport
                            css={css`
                                top: 20px;
                                right: 20px;
                                position: absolute;
                                font-size: larger;
                                vertical-align: bottom;
                            `}
                            onClick={onClickOpenAnkiPopup}
                        />
                        <div>
                            <Text style={{ marginTop: '0px' }}>
                                {popupProps.text}&nbsp;&nbsp;&nbsp;&nbsp;
                                {popupProps.textPhonetic && (
                                    <span>{popupProps.textPhonetic}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                )}
                                <BsVolumeUpFill
                                    style={{ fontSize: 'larger', verticalAlign: 'bottom' }}
                                    onClick={() => {
                                        chrome.runtime.sendMessage({
                                            queryBackground: 'playAudio',
                                            voiceUrl: popupProps.textVoiceUrl
                                        });
                                    }}
                                />
                            </Text>
                            <Text>{popupProps.textTranslate}</Text>
                        </div>
                        <Divider />
                        <div>
                            <Text>
                                {popupProps.sentence}&nbsp;&nbsp;&nbsp;&nbsp;
                                <BsVolumeUpFill
                                    style={{ fontSize: 'larger', verticalAlign: 'text-bottom' }}
                                    onClick={() => {
                                        chrome.runtime.sendMessage({
                                            queryBackground: 'playAudio',
                                            voiceUrl: popupProps.sentenceVoiceUrl
                                        });
                                    }}
                                />
                            </Text>
                            <Text style={{ marginBottom: '0px' }}>{popupProps.sentenceTranslate}</Text>
                        </div>
                    </div>
                )}
            </DictPopupWrapper>
            <AnkiPopupWrapper>
                <Dialog
                    open={popupProps.ankiOpen}
                    maxWidth={false}
                    css={css`
                        bottom: 200px;
                    `}
                >
                    <DialogContent
                        css={css`
                            overflow: auto;
                            width: ${ANKI_POPUP_WIDTH + 'px'};
                            height: ${ANKI_POPUP_HEIGHT + 'px'};
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
                                                chrome.runtime.sendMessage({
                                                    queryBackground: 'playAudio',
                                                    voiceUrl: popupProps.textVoiceUrl
                                                });
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
                                            onClick={async () => {
                                                let url;
                                                if (popupProps.videoSentenceVoiceDataUrl) {
                                                    let blob = await dataUrlToBlob(
                                                        popupProps.videoSentenceVoiceDataUrl
                                                    );
                                                    url = window.URL.createObjectURL(blob);
                                                } else {
                                                    url = popupProps.sentenceVoiceUrl;
                                                }
                                                if (!url) {
                                                    return;
                                                }
                                                chrome.runtime.sendMessage({
                                                    queryBackground: 'playAudio',
                                                    voiceUrl: url
                                                });
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
                                        height: 20px;
                                        min-width: 0;
                                        margin-right: 10px;
                                        align-self: center;
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
                                        width: inherit;
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

let isEnWordRegex = /^[a-zA-Z]+$/;
let isEnWordGroupRegex = /^[a-zA-Z ]+$/;

function isEnWord(text: string): boolean {
    if (!text) {
        return false;
    }
    if (isEnWordRegex.test(text)) {
        return true;
    }
    return false;
}

function isEnWordGroup(sentence: string): boolean {
    if (!sentence) {
        return false;
    }
    let newSentence = sentence.trim();
    if (isEnWordGroupRegex.test(newSentence)) {
        return true;
    }
    return false;
}

export { PopupProps, Popup, ContextFromVideo };
