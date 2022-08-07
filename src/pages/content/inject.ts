function injectXMLHttpRequest(open: any) {
    XMLHttpRequest.prototype.open = function () {
        if (arguments[1]?.includes('nflxvideo.net/?o=1')) {
            this.addEventListener('load', () => {
                window.dispatchEvent(
                    new CustomEvent('getSubtitle', {
                        detail: { site: 'netflix', data: this.response }
                    })
                );
            });
        }
        open.apply(this, arguments);
    };
}

injectXMLHttpRequest(XMLHttpRequest.prototype.open);

let videoPlayer: any = null;

let findVideoPlayer = setInterval(() => {
    videoPlayer = (window as any).netflix.appContext.state.playerApp.getAPI().videoPlayer;
    const allSessionIds = videoPlayer.getAllPlayerSessionIds();
    videoPlayer = videoPlayer.getVideoPlayerBySessionId(allSessionIds[0]);
    if (!videoPlayer) {
        return;
    }
    clearInterval(findVideoPlayer);
}, 200);

window.addEventListener('setVideoTime', setVideoTime);

function setVideoTime(e: any) {
    const { site, time } = e.detail;
    if (site === 'netflix') {
        videoPlayer.seek(time);
    }
}
