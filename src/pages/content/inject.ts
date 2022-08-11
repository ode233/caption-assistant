let isLoad = false;

function injectXMLHttpRequest(open: any) {
    XMLHttpRequest.prototype.open = function () {
        if (
            arguments[1]?.includes('nflxvideo.net/?o=1') &&
            !arguments[1]?.includes('&random=') &&
            location.href.match('https://www.netflix.com/watch/') &&
            !isLoad
        ) {
            this.addEventListener('load', () => {
                window.dispatchEvent(
                    new CustomEvent('getSubtitle', {
                        detail: { site: 'netflix', data: this.response }
                    })
                );
            });
            isLoad = true;
        }
        open.apply(this, arguments);
    };
}

injectXMLHttpRequest(XMLHttpRequest.prototype.open);

let videoPlayer: any = null;

window.addEventListener('getVideoPlayer', getVideoPlayer);

function getVideoPlayer(e: any) {
    const { site } = e.detail;
    if (site === 'netflix') {
        videoPlayer = (window as any).netflix.appContext.state.playerApp.getAPI().videoPlayer;
        const allSessionIds = videoPlayer.getAllPlayerSessionIds();
        videoPlayer = videoPlayer.getVideoPlayerBySessionId(allSessionIds[0]);
        console.log('found netflix videoPlay');
    }
}

window.addEventListener('setVideoTime', setVideoTime);

function setVideoTime(e: any) {
    const { site, time } = e.detail;
    if (site === 'netflix') {
        videoPlayer.seek(time);
        videoPlayer.play();
    }
}

window.addEventListener('pauseVideo', pauseVideo);

function pauseVideo(e: any) {
    const { site } = e.detail;
    if (site === 'netflix') {
        videoPlayer.pause();
    }
}
