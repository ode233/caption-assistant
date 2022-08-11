import React, { useState, useEffect, useRef, MutableRefObject } from 'react';
import ReactDOM from 'react-dom';
import {
    processSubtitle,
    getSubtitleByTime,
    getPrevSubtitleTime,
    getNextSubtitleTime
} from './subtitle';
import styled from 'styled-components';

const WITHOUT_CONTROLLER_BOTTOM = '6%';
const WITH_CONTROLLER_BOTTOM = '8%';

const PREV = 'a';
const NEXT = 'd';

let hasSubtitle = true;
let nowSubTitleIndex = 0;

const SubtitleWrapper = styled.div(
    () => `
    position: absolute;
    font-size: xxx-large;
    width: fit-content;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    bottom: ${WITHOUT_CONTROLLER_BOTTOM};
`
);

const scriptId = 'subtitle-assistant-script';
if (document.getElementById(scriptId)) {
    location.reload();
}
console.log('inject');
let s = document.createElement('script');
s.id = 'subtitle-assistant-script';
s.src = chrome.runtime.getURL('inject.js');
(document.head || document.documentElement).appendChild(s);
window.addEventListener('getSubtitle', processSubtitle);

const observerConfig = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
};

const videoObserver = new MutationObserver((mutations, observer) => {
    let video = document.querySelectorAll('video')[0];
    if (video) {
        observer.disconnect();
        console.log('processVideo');
        processVideo(video);
    }
});

videoObserver.observe(document, observerConfig);

function processVideo(video: HTMLVideoElement) {
    window.dispatchEvent(
        new CustomEvent('getVideoPlayer', {
            detail: { site: 'netflix' }
        })
    );

    let originSubtitleElement = document.getElementsByClassName('player-timedtext')[0];
    originSubtitleElement.parentElement!.removeChild(originSubtitleElement);
    document.body.style.userSelect = 'text';
    let mountElement = document.getElementsByClassName('watch-video--player-view')[0];
    ReactDOM.render(
        <SubtitleContainer video={video} mountElement={mountElement}></SubtitleContainer>,
        document.body.appendChild(document.createElement('div'))
    );

    const subtitleContainer = mountElement.lastElementChild as HTMLElement;

    const videoControllerObserver = new MutationObserver((mutations, observer) => {
        let videoController = mountElement.getElementsByClassName(
            'watch-video--bottom-controls-container'
        )[0];
        if (videoController) {
            subtitleContainer.style.bottom = WITH_CONTROLLER_BOTTOM;
        } else {
            subtitleContainer.style.bottom = WITHOUT_CONTROLLER_BOTTOM;
        }
    });

    videoControllerObserver.observe(
        document.getElementsByClassName('watch-video--player-view')[0],
        observerConfig
    );

    mountElement.addEventListener('keydown', (event) => {
        let keyEvent = event as KeyboardEvent;
        switch (keyEvent.key.toLowerCase()) {
            case PREV: {
                const time = getPrevSubtitleTime(nowSubTitleIndex, hasSubtitle);
                if (!time) {
                    break;
                }
                window.dispatchEvent(
                    new CustomEvent('setVideoTime', {
                        detail: { site: 'netflix', time: time * 1000 }
                    })
                );
                break;
            }
            case NEXT: {
                const time = getNextSubtitleTime(nowSubTitleIndex);
                if (!time) {
                    break;
                }
                window.dispatchEvent(
                    new CustomEvent('setVideoTime', {
                        detail: { site: 'netflix', time: time * 1000 }
                    })
                );
                break;
            }
            default:
                break;
        }
        if (keyEvent.key === 'a') {
            return;
        }
    });
}

interface SubtitleContainerProps {
    video: HTMLVideoElement;
    mountElement: Element;
}

function SubtitleContainer({ video, mountElement }: SubtitleContainerProps) {
    const [subtitleElementString, setSubtitleElementString] = useState<string>('');

    video.ontimeupdate = () => {
        let subtitle = getSubtitleByTime(video.currentTime);
        if (subtitle === null) {
            setSubtitleElementString('');
            nowSubTitleIndex = -1;
            hasSubtitle = false;
        } else if (video.currentTime > subtitle.end) {
            setSubtitleElementString('');
            nowSubTitleIndex = parseInt(subtitle.element.getAttribute('index')!, 10);
            hasSubtitle = false;
        } else {
            setSubtitleElementString(subtitle.element.outerHTML);
            nowSubTitleIndex = parseInt(subtitle.element.getAttribute('index')!, 10);
            hasSubtitle = true;
        }
    };

    let handleClick = (e: any) => {
        window.dispatchEvent(
            new CustomEvent('pauseVideo', {
                detail: { site: 'netflix' }
            })
        );
    };

    return ReactDOM.createPortal(
        <SubtitleWrapper
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: subtitleElementString }}
        ></SubtitleWrapper>,
        mountElement
    );
}
