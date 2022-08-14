import React from 'react';
import ReactDOM from 'react-dom';
import { Subtitle } from '../definition';
import { getSubtitleNodeList, subtitleNodeList } from './subtitle';
import { NetflixVideo } from './video';

const WITHOUT_CONTROLLER_BOTTOM = '6%';
const WITH_CONTROLLER_BOTTOM = '8%';

const scriptId = 'subtitle-assistant-script';
if (document.getElementById(scriptId)) {
    location.reload();
}
console.log('inject');
let s = document.createElement('script');
s.id = 'subtitle-assistant-script';
s.src = chrome.runtime.getURL('netflix/inject.js');
(document.head || document.documentElement).appendChild(s);

window.addEventListener('getSubtitleNodeList', getSubtitleNodeList);

const observerConfig = {
    attributes: false,
    childList: true,
    characterData: false,
    subtree: true
};

const videoObserver = new MutationObserver((mutations, observer) => {
    let video = document.querySelectorAll('video')[0];
    if (!video) {
        return;
    }
    observer.disconnect();
    console.log('processVideo');

    // get video player
    window.dispatchEvent(new CustomEvent('getVideoPlayer'));

    // add subtitle container
    let netflixVideo = new NetflixVideo(video);
    let originSubtitleElement = document.getElementsByClassName('player-timedtext')[0];
    originSubtitleElement.parentElement!.removeChild(originSubtitleElement);
    document.body.style.userSelect = 'text';
    let mountElement = document.getElementsByClassName('watch-video--player-view')[0];

    let subtitle = new Subtitle(subtitleNodeList);

    ReactDOM.render(
        <subtitle.SubtitleContainer
            video={netflixVideo}
            mountElement={mountElement}
            subtitle={subtitle}
        ></subtitle.SubtitleContainer>,
        document.body.appendChild(document.createElement('div'))
    );

    // dynamic adjust subtitle container bottom
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
});

videoObserver.observe(document, observerConfig);
