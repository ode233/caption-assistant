var s = document.createElement('script');
s.src = chrome.runtime.getURL('inject.js');
s.onload = function () {
    s.remove();
};
(document.head || document.documentElement).appendChild(s);

console.log("video");

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
    video.ontimeupdate = () => {
        console.log(video.currentTime);
    }
}

const processSubtile = (e: any) => {
    const {type, data} = e.detail;
    if(type === "netflix") {
        console.log(data);
    }
}

window.addEventListener('get_subtitle', processSubtile);
