import { css } from '@emotion/react';
import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { delay } from '../utils/utils';
import { ContextFromVideo } from '../components/content/translate/popup';
import { SUBTITLE_WRAPPER_ID } from '../constants/watchVideoConstants';

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

const BEFORE_SUBTITLE_BEGIN_INDEX = -1;
const AFTER_SUBTITLE_END_INDEX = -2;
const NOT_MATCH_SUBTITLE_INDEX = -3;

class SubtitleIndexMatchResult {
    public isMatch: boolean;
    // represents the previous index if not match
    public index: number;

    public constructor(isMatch: boolean, index: number) {
        this.isMatch = isMatch;
        this.index = index;
    }
}

class Subtitle {
    public subtitleNodeList: Array<SubtitleNode> = [];

    public nowSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;
    public prevSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;

    public subtitleBeginTime = 0;
    public subtitleEndTime = 0;

    public constructor(subtitleNodeList: Array<SubtitleNode>) {
        this.subtitleNodeList = subtitleNodeList;
        this.subtitleBeginTime = subtitleNodeList[0].begin;
        this.subtitleEndTime = subtitleNodeList[subtitleNodeList.length - 1].end;
    }

    public getSubtitleIndexByTime(time: number) {
        return this.binarySearch(0, this.subtitleNodeList.length - 1, time);
    }

    public getNowSubtitleNode() {
        if (this.nowSubTitleIndex < 0) {
            return null;
        }
        return this.subtitleNodeList[this.nowSubTitleIndex];
    }

    public getNextSubtitleTime(): number | null {
        switch (this.nowSubTitleIndex) {
            case BEFORE_SUBTITLE_BEGIN_INDEX: {
                return this.subtitleNodeList[0].begin;
            }
            case AFTER_SUBTITLE_END_INDEX: {
                return null;
            }
            case NOT_MATCH_SUBTITLE_INDEX: {
                return this.subtitleNodeList[this.prevSubTitleIndex + 1].begin;
            }
            case this.subtitleNodeList.length - 1: {
                return null;
            }
            default: {
                return this.subtitleNodeList[this.nowSubTitleIndex + 1].begin;
            }
        }
    }

    public getPrevSubtitleTime(): number | null {
        switch (this.nowSubTitleIndex) {
            case BEFORE_SUBTITLE_BEGIN_INDEX: {
                return null;
            }
            case AFTER_SUBTITLE_END_INDEX: {
                return this.subtitleNodeList[this.subtitleNodeList.length - 1].begin;
            }
            case NOT_MATCH_SUBTITLE_INDEX: {
                return this.subtitleNodeList[this.prevSubTitleIndex].begin;
            }
            case 0: {
                return null;
            }
            default: {
                return this.subtitleNodeList[this.nowSubTitleIndex - 1].begin;
            }
        }
    }

    private binarySearch(i: number, j: number, target: number): SubtitleIndexMatchResult {
        if (i > j) {
            return new SubtitleIndexMatchResult(true, j);
        }
        let mid = Math.floor(i + (j - i) / 2);
        let subtitle = this.subtitleNodeList[mid];
        if (target >= subtitle.begin && target <= subtitle.end) {
            return new SubtitleIndexMatchResult(true, mid);
        } else if (target < subtitle.begin) {
            return this.binarySearch(i, mid - 1, target);
        } else {
            return this.binarySearch(mid + 1, j, target);
        }
    }
}

abstract class Video {
    // all time unit is second
    public seekAndPlay(time: number | null) {
        if (!time) {
            return;
        }
        this.seek(time);
        this.play();
    }
    public abstract seek(time: number): void;
    public abstract play(): void;
    public abstract pause(): void;
    public abstract getCurrentTime(): number;
    public abstract setOntimeupdate(f: any): void;
}

function SubtitleContainer({ video, subtitle, mountElement }: SubtitleContainerProps) {
    const subtitleWrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        video.setOntimeupdate(() => {
            if (subtitleWrapperRef.current?.style.display === 'none') {
                return;
            }
            updateSubtitle();
        });

        function updateSubtitle() {
            const currentTime = video.getCurrentTime();
            let nowSubTitleIndex;
            let nowSubtitleElementString = '';
            if (currentTime < subtitle.subtitleBeginTime) {
                nowSubTitleIndex = BEFORE_SUBTITLE_BEGIN_INDEX;
            } else if (currentTime > subtitle.subtitleEndTime) {
                nowSubTitleIndex = AFTER_SUBTITLE_END_INDEX;
            } else {
                let subtitleIndexMatchResult = subtitle.getSubtitleIndexByTime(currentTime);
                if (subtitleIndexMatchResult.isMatch) {
                    nowSubTitleIndex = subtitleIndexMatchResult.index;
                    nowSubtitleElementString = subtitle.subtitleNodeList[nowSubTitleIndex].element.outerHTML;
                } else {
                    nowSubTitleIndex = NOT_MATCH_SUBTITLE_INDEX;
                    subtitle.prevSubTitleIndex = subtitleIndexMatchResult.index;
                }
            }

            subtitle.nowSubTitleIndex = nowSubTitleIndex;
            subtitleWrapperRef.current!.innerHTML = nowSubtitleElementString;
        }

        mountElement.ondblclick = (event) => {
            let mouseEvent = event;
            let center = mountElement.offsetWidth / 2;
            let offset = 200;
            if (mouseEvent.offsetX < center - offset) {
                setTimeout(() => {
                    playPrev();
                }, 10);
            } else if (mouseEvent.offsetX > center + offset) {
                setTimeout(() => {
                    playNext();
                }, 10);
            } else {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else {
                    document.documentElement.requestFullscreen();
                }
            }
        };

        let startX = 0;
        let mousedown = false;
        let dragged = false;
        mountElement.onmousedown = (event: MouseEvent) => {
            startX = event.offsetX;
            mousedown = true;
        };
        mountElement.onmousemove = (event: MouseEvent) => {
            if (mousedown) {
                dragged = true;
            }
        };
        mountElement.onmouseup = (event: MouseEvent) => {
            let offset = 10;
            if (dragged) {
                if (event.offsetX < startX - offset) {
                    setTimeout(() => {
                        playPrev();
                    }, 10);
                } else if (event.offsetX > startX + offset) {
                    setTimeout(() => {
                        playNext();
                    }, 10);
                }
            }
            mousedown = false;
            dragged = false;
        };

        document.addEventListener('keydown', (event) => {
            let keyEvent = event as KeyboardEvent;
            let key = keyEvent.key;
            if (key === 'a' || key === 'A' || key === 'ArrowLeft') {
                playPrev();
            } else if (key === 'd' || key === 'D' || key === 'ArrowRight') {
                playNext();
            }
        });

        function playNext() {
            const time = subtitle.getNextSubtitleTime();
            video.seekAndPlay(time);
        }

        function playPrev() {
            const time = subtitle.getPrevSubtitleTime();
            video.seekAndPlay(time);
        }

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
            subtitleWrapperRef.current!.style.display = 'none';
            video.pause();
            contextFromVideo.imgDataUrl = await captureVisibleTab(nowSubtitleNode);
            contextFromVideo.videoSentenceVoiceDataUrl = await captureAudio(nowSubtitleNode, stream);
            subtitleWrapperRef.current!.style.display = 'block';
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
            ref={subtitleWrapperRef}
            css={css`
                display: 'block';
            `}
            onClick={(e: any) => {
                video.pause();
            }}
            id={SUBTITLE_WRAPPER_ID}
        ></SubtitleWrapper>,
        mountElement
    );
}

export { SubtitleNode, Subtitle, Video, SubtitleContainer, SUBTITLE_WRAPPER_ID };
