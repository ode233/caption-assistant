import React, { useEffect } from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const SUBTITLE_WRAPPER_ID = 'subtitle-assistant-wrapper';

const PREV = 'a';
const NEXT = 'd';

interface SubtitleContainerProps {
    video: Video;
    mountElement: Element;
    subtitle: Subtitle;
}

const SubtitleWrapper = styled.div(
    () => `
    position: absolute;
    font-size: xxx-large;
    width: fit-content;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    bottom: '6%';
`
);

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

    public nowHasSubtitle = false;
    public nowSubTitleIndex = -1;

    public constructor(subtitleNodeList: Array<SubtitleNode>) {
        this.subtitleNodeList = subtitleNodeList;
    }

    public getSubtitleByTime(time: number) {
        return this.binarySearch(0, this.subtitleNodeList.length - 1, time);
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
        let prevIndex = this.nowHasSubtitle ? this.nowSubTitleIndex - 1 : this.nowSubTitleIndex;
        if (prevIndex < 0) {
            return null;
        }
        let subtitle = this.subtitleNodeList[prevIndex];
        return subtitle.begin;
    }

    public SubtitleContainer({ video, mountElement, subtitle }: SubtitleContainerProps) {
        const [subtitleElementString, setSubtitleElementString] = useState<string>('');

        useEffect(() => {
            console.log('SubtitleContainer init');

            video.setOntimeupdate(() => {
                const currentTime = video.getCurrentTime();
                let subtitleNode = subtitle.getSubtitleByTime(currentTime);

                if (subtitleNode === null) {
                    setSubtitleElementString('');
                    subtitle.nowSubTitleIndex = -1;
                    subtitle.nowHasSubtitle = false;
                } else if (currentTime > subtitleNode.end) {
                    setSubtitleElementString('');
                    subtitle.nowSubTitleIndex = parseInt(
                        subtitleNode.element.getAttribute('index')!,
                        10
                    );
                    subtitle.nowHasSubtitle = false;
                } else {
                    setSubtitleElementString(subtitleNode.element.outerHTML);
                    subtitle.nowSubTitleIndex = parseInt(
                        subtitleNode.element.getAttribute('index')!,
                        10
                    );
                    subtitle.nowHasSubtitle = true;
                }
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
        }, []);

        return ReactDOM.createPortal(
            <SubtitleWrapper
                onClick={(e: any) => {
                    video.pause();
                }}
                dangerouslySetInnerHTML={{ __html: subtitleElementString }}
                id={SUBTITLE_WRAPPER_ID}
            ></SubtitleWrapper>,
            mountElement
        );
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
    seek: (time: number) => void;
    play: () => void;
    pause: () => void;
    getCurrentTime: () => number;
    setOntimeupdate: (f: any) => void;
}

export { SubtitleNode, Subtitle, Video, SUBTITLE_WRAPPER_ID };
