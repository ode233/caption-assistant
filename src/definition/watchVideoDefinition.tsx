import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { delay } from '../utils/utils';
import { ContextFromVideo } from '../components/content/translate/popup';
import { NEXT, PREV, SUBTITLE_WRAPPER_ID } from '../constants/watchVideoConstants';

interface SubtitleContainerProps {
    video: Video;
    subtitle: Subtitle;
    mountElement: HTMLElement;
}

const SubtitleWrapper = styled.div`
    position: absolute;
    font-size: xxx-large;
    width: fit-content;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    bottom: 6%;
`;

//
let stream: MediaStream;

class SubtitleNode {
    // second
    public begin: number;
    public end: number;
    public element: HTMLParagraphElement;

    public constructor(begin: number, end: number, element: HTMLParagraphElement) {
        this.begin = begin;
        this.end = end;
        this.element = element;
    }
}

class Subtitle {
    public subtitleNodeList: Array<SubtitleNode> = [];

    public nowSubtitleElementString = '';
    public nowSubTitleIndex = -1;

    public constructor(subtitleNodeList: Array<SubtitleNode>) {
        this.subtitleNodeList = subtitleNodeList;
    }

    public getSubtitleByTime(time: number) {
        return this.binarySearch(0, this.subtitleNodeList.length - 1, time);
    }

    public getNowSubtitleNode() {
        if (this.nowSubTitleIndex < 0) {
            return null;
        }
        return this.subtitleNodeList[this.nowSubTitleIndex];
    }

    public getNextSubtitleTime(): number | null {
        let nextIndex = this.nowSubTitleIndex + 1;
        if (nextIndex >= this.subtitleNodeList.length) {
            return null;
        }
        let subtitle = this.subtitleNodeList[nextIndex];
        return subtitle.begin;
    }

    public getPrevSubtitleTime(): number | null {
        let prevIndex = this.nowSubtitleElementString ? this.nowSubTitleIndex - 1 : this.nowSubTitleIndex;
        if (prevIndex < 0) {
            return null;
        }
        let subtitle = this.subtitleNodeList[prevIndex];
        return subtitle.begin;
    }

    private binarySearch(i: number, j: number, target: number): SubtitleNode | null {
        if (i > j) {
            let prevIdx = i - 1;
            if (prevIdx < 0) {
                return null;
            }
            let prevSubtitle = this.subtitleNodeList[prevIdx];
            return prevSubtitle;
        }
        let mid = Math.floor(i + (j - i) / 2);
        let subtitle = this.subtitleNodeList[mid];
        if (target >= subtitle.begin && target < subtitle.end) {
            return subtitle;
        } else if (target < subtitle.begin) {
            return this.binarySearch(i, mid - 1, target);
        } else {
            return this.binarySearch(mid + 1, j, target);
        }
    }
}

interface Video {
    // all time unit is second
    seek: (time: number) => void;
    play: () => void;
    pause: () => void;
    getCurrentTime: () => number;
    setOntimeupdate: (f: any) => void;
}

function SubtitleContainer({ video, subtitle, mountElement }: SubtitleContainerProps) {
    const [subtitleElementString, setSubtitleElementString] = useState('');
    const [display, setDisplay] = useState('block');

    const subtitleElementStringRef = useRef(subtitleElementString);
    const displayRef = useRef(display);

    subtitleElementStringRef.current = subtitleElementString;
    displayRef.current = display;

    useEffect(() => {
        video.setOntimeupdate(() => {
            if (displayRef.current === 'none') {
                return;
            }

            const currentTime = video.getCurrentTime();
            let subtitleNode = subtitle.getSubtitleByTime(currentTime);

            let nowSubTitleIndex;
            let nowSubtitleElementString;

            if (subtitleNode === null) {
                nowSubTitleIndex = -1;
                nowSubtitleElementString = '';
            } else if (currentTime > subtitleNode.end) {
                nowSubTitleIndex = parseInt(subtitleNode.element.getAttribute('index')!, 10);
                nowSubtitleElementString = '';
            } else {
                nowSubTitleIndex = parseInt(subtitleNode.element.getAttribute('index')!, 10);
                nowSubtitleElementString = subtitleNode.element.outerHTML;
            }

            if (
                subtitle.nowSubTitleIndex === nowSubTitleIndex &&
                subtitle.nowSubtitleElementString === nowSubtitleElementString
            ) {
                return;
            }
            subtitle.nowSubTitleIndex = nowSubTitleIndex;
            subtitle.nowSubtitleElementString = nowSubtitleElementString;
            setSubtitleElementString(nowSubtitleElementString);
        });

        mountElement.addEventListener('keydown', (event) => {
            let keyEvent = event as KeyboardEvent;
            switch (keyEvent.key.toLowerCase()) {
                case PREV: {
                    const time = subtitle.getPrevSubtitleTime();
                    if (!time) {
                        break;
                    }
                    video.seek(time);
                    video.play();
                    break;
                }
                case NEXT: {
                    const time = subtitle.getNextSubtitleTime();
                    if (!time) {
                        break;
                    }
                    video.seek(time);
                    video.play();
                    break;
                }
                default:
                    break;
            }
        });

        async function getContextFromVideo(sendResponse: Function) {
            let contextFromVideo: ContextFromVideo = {
                videoSentenceVoiceDataUrl: '',
                imgDataUrl: ''
            };
            let nowSubtitleNode = subtitle.getNowSubtitleNode();
            if (!nowSubtitleNode) {
                sendResponse(contextFromVideo);
                return;
            }
            let stream = await getStream();
            if (!stream) {
                sendResponse(contextFromVideo);
                return;
            }
            setDisplay('none');
            video.pause();
            contextFromVideo.imgDataUrl = await captureVisibleTab(nowSubtitleNode);
            contextFromVideo.videoSentenceVoiceDataUrl = await captureAudio(nowSubtitleNode, stream);
            setDisplay('block');
            video.pause();
            sendResponse(contextFromVideo);
        }

        /**
         *
         * @returns stream only audio
         */
        async function getStream() {
            if (stream && stream.getAudioTracks().length > 0) {
                return stream;
            }
            try {
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: true
                });
            } catch (e) {
                window.alert('请分享系统音频');
                return null;
            }
            if (!stream || stream.getAudioTracks().length === 0) {
                window.alert('请分享系统音频');
                return null;
            }
            for (let track of stream.getVideoTracks()) {
                track.stop();
                stream.removeTrack(track);
            }
            return stream;
        }

        async function captureVisibleTab(nowSubtitleNode: SubtitleNode) {
            // hide subtitle
            await delay(100);
            video.seek(nowSubtitleNode.begin);
            return new Promise<string>((resolve) => {
                chrome.runtime.sendMessage({ queryBackground: 'captureVisibleTab' }, (imgDataUrl) => {
                    resolve(imgDataUrl);
                });
            });
        }

        async function captureAudio(nowSubtitleNode: SubtitleNode, stream: MediaStream) {
            let chunks: Array<Blob> = [];
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = (e) => {
                chunks.push(e.data);
            };

            let mediaRecorderOnStopPromise = new Promise<Blob>((resolve) => {
                mediaRecorder.addEventListener('stop', () => {
                    const blob = new Blob(chunks);
                    resolve(blob);
                });
            });

            const timeExtend = 200;
            const duration = (nowSubtitleNode.end - nowSubtitleNode.begin) * 1000 + timeExtend;
            mediaRecorder.start();
            video.play();
            setTimeout(() => {
                mediaRecorder.stop();
            }, duration);

            let blob = await mediaRecorderOnStopPromise;
            let reader = new window.FileReader();
            let promise = new Promise<string>((resolve) => {
                reader.addEventListener('loadend', () => {
                    let base64 = reader.result?.toString();
                    if (!base64) {
                        base64 = '';
                    }
                    resolve(base64);
                });
            });
            reader.readAsDataURL(blob);
            return promise;
        }

        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            switch (request.queryTab) {
                case 'getContextFromVideo': {
                    getContextFromVideo(sendResponse);
                    return true;
                }
                case 'playVideo': {
                    mountElement.focus();
                    video.play();
                    return;
                }
            }
        });
    }, []);

    return ReactDOM.createPortal(
        <SubtitleWrapper
            css={css`
                display: ${display};
            `}
            onClick={(e: any) => {
                video.pause();
            }}
            dangerouslySetInnerHTML={{ __html: subtitleElementString }}
            id={SUBTITLE_WRAPPER_ID}
        ></SubtitleWrapper>,
        mountElement
    );
}

export { SubtitleNode, Subtitle, Video, SubtitleContainer, SUBTITLE_WRAPPER_ID };
