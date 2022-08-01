import React, { useState, useEffect, useRef } from 'react';
import { render } from 'react-dom';

var s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function () {
    s.remove();
};
(document.head || document.documentElement).appendChild(s);

console.log("video");

const [video, setVideo] = useState<HTMLVideoElement>();

const getVideoInterval = setInterval(getVideo, 200);

function getVideo() {
    setVideo(document.querySelectorAll('video')[0])
    console.log(video);
    if (!video) {
        return;
    }
    clearInterval(getVideoInterval);
    processVideo();
}

function processVideo() {
    if(!video){
        return
    }
    video.ontimeupdate = () => {
        console.log(video.currentTime);
    }
    console.log("player-timedtext");
    let subtitleContainer = document.getElementsByClassName('player-timedtext')[0];
    console.log(subtitleContainer);
    let parentElement = subtitleContainer.parentElement!;
    parentElement.removeChild(subtitleContainer);
    let newSubtitleContainer = document.createElement('div');
    newSubtitleContainer.style.cssText = "position: absolute; display: block; direction: ltr; text-size-adjust: none; \
     -webkit-font-smoothing: antialiased; user-select: none; cursor: none; pointer-events: auto; white-space: nowrap; \
     text-align: center; letter-spacing: 0!important; font-size: 19px; line-height: normal; color: #ffffff; \
     text-shadow: #000000 0px 0px 7px; font-family: Netflix Sans,Helvetica Nueue,Helvetica,Arial,sans-serif; font-weight: bolder;";
    parentElement.appendChild(newSubtitleContainer);
    render(<span>{video.currentTime}</span>, newSubtitleContainer);
}

const processSubtile = (e: any) => {
    const { type, data } = e.detail;
    if (type === "netflix") {
        console.log(data);
    }
}

window.addEventListener('get_subtitle', processSubtile);

