import React, { useEffect } from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';

const SUBTITLE_CONTAINER_ID = 'subtitle-assistant-container';

const PREV = 'a';
const NEXT = 'd';

interface SubtitleContainerProps {
    video: Video;
    mountElement: Element;
    subtitles: Subtitles;
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

class Subtitle {
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

class Subtitles {
    public subtitleList: Array<Subtitle> = [];

    public hasSubtitle = true;
    public nowSubTitleIndex = 0;

    public constructor(subtitleList: Array<Subtitle>) {
        this.subtitleList = subtitleList;
    }

    public getSubtitleByTime(time: number) {
        return this.binarySearch(0, this.subtitleList.length - 1, time);
    }

    public getNextSubtitleTime(): number | null {
        let nextIndex = this.nowSubTitleIndex + 1;
        if (nextIndex >= this.subtitleList.length) {
            return null;
        }
        let subtitle = this.subtitleList[nextIndex];
        return subtitle.begin;
    }

    public getPrevSubtitleTime(): number | null {
        let prevIndex = this.hasSubtitle ? this.nowSubTitleIndex - 1 : this.nowSubTitleIndex;
        if (prevIndex < 0) {
            return null;
        }
        let subtitle = this.subtitleList[prevIndex];
        return subtitle.begin;
    }

    public SubtitleContainer({ video, mountElement, subtitles }: SubtitleContainerProps) {
        const [subtitleElementString, setSubtitleElementString] = useState<string>('');

        useEffect(() => {
            console.log('SubtitleContainer init');

            video.setOntimeupdate(() => {
                const currentTime = video.getCurrentTime();
                let subtitle = subtitles.getSubtitleByTime(currentTime);

                if (subtitle === null) {
                    setSubtitleElementString('');
                    subtitles.nowSubTitleIndex = -1;
                    subtitles.hasSubtitle = false;
                } else if (currentTime > subtitle.end) {
                    setSubtitleElementString('');
                    subtitles.nowSubTitleIndex = parseInt(
                        subtitle.element.getAttribute('index')!,
                        10
                    );
                    subtitles.hasSubtitle = false;
                } else {
                    setSubtitleElementString(subtitle.element.outerHTML);
                    subtitles.nowSubTitleIndex = parseInt(
                        subtitle.element.getAttribute('index')!,
                        10
                    );
                    subtitles.hasSubtitle = true;
                }
            });

            mountElement.addEventListener('keydown', (event) => {
                let keyEvent = event as KeyboardEvent;
                switch (keyEvent.key.toLowerCase()) {
                    case PREV: {
                        const time = subtitles.getPrevSubtitleTime();
                        if (!time) {
                            break;
                        }
                        video.seek(time);
                        video.play();
                        break;
                    }
                    case NEXT: {
                        const time = subtitles.getNextSubtitleTime();
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
            ></SubtitleWrapper>,
            mountElement
        );
    }

    private binarySearch(i: number, j: number, target: number): Subtitle | null {
        if (i > j) {
            let prevIdx = i - 1;
            if (prevIdx < 0) {
                return null;
            }
            let prevSubtitle = this.subtitleList[prevIdx];
            return prevSubtitle;
        }
        let mid = Math.floor(i + (j - i) / 2);
        let subtitle = this.subtitleList[mid];
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

export { Subtitle, Subtitles, Video };
