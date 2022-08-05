import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { processSubtile, getSubtitleElementStrByTime } from './subtitle';
import styled from 'styled-components';

const Container = styled.div`
    position: absolute;
    font-size: xx-large;
    width: fit-content;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
    bottom: 2%;
`;

console.log('inject');
let s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function () {
    s.remove();
};
(document.head || document.documentElement).appendChild(s);

window.addEventListener('get_subtitle', processSubtile);

const getVideoInterval = setInterval(getVideo, 200);

function getVideo() {
    let video = document.querySelectorAll('video')[0];
    console.log(video);
    if (!video) {
        return;
    }
    clearInterval(getVideoInterval);
    processVideo(video);
}

function processVideo(video: HTMLVideoElement) {
    if (!video) {
        return;
    }
    console.log('player-timedtext');
    let subtitleContainer = document.getElementsByClassName('player-timedtext')[0];
    subtitleContainer.parentElement!.removeChild(subtitleContainer);
    document.body.style.userSelect = 'text';
    ReactDOM.render(
        <SubtitleElement video={video}></SubtitleElement>,
        document.body.appendChild(document.createElement('div'))
    );
}

interface SubtitleElementProps {
    video: HTMLVideoElement;
}

function SubtitleElement({ video }: SubtitleElementProps) {
    const [subtitleElementStr, setSubtitleElementStr] = useState<string>('');
    video.ontimeupdate = () => {
        console.log(video.currentTime);
        setSubtitleElementStr(getSubtitleElementStrByTime(video.currentTime));
    };
    return ReactDOM.createPortal(
        <Container dangerouslySetInnerHTML={{ __html: subtitleElementStr }}></Container>,
        document.body
    );
}
