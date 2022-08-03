import React, { useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';
import { processSubtile, getSubtitleElementStrByTime } from './subtitle';

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
    console.log(subtitleContainer);
    let parentElement = subtitleContainer.parentElement!;
    parentElement.removeChild(subtitleContainer);
    let newSubtitleContainer = document.createElement('div');
    newSubtitleContainer.style.cssText =
        'position: absolute; display: block; direction: ltr; text-size-adjust: none; webkit-font-smoothing: antialiased; user-select: none; cursor: none; pointer-events: auto; white-space: nowrap; text-align: center; letter-spacing: 0!important; font-size: 19px; line-height: normal; color: #ffffff; text-shadow: #000000 0px 0px 7px; font-family: Netflix Sans,Helvetica Nueue,Helvetica,Arial,sans-serif; font-weight: bolder;';
    parentElement.appendChild(newSubtitleContainer);
    render(<SubtitleElement video={video}></SubtitleElement>, newSubtitleContainer);
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
    return <div dangerouslySetInnerHTML={{ __html: subtitleElementStr }}></div>;
}
