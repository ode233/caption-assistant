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
                    new CustomEvent('getSubtitleNodeList', {
                        detail: { xml: this.response }
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

window.addEventListener('getVideoPlayer', (e: any) => {
    videoPlayer = (window as any).netflix.appContext.state.playerApp.getAPI().videoPlayer;
    const allSessionIds = videoPlayer.getAllPlayerSessionIds();
    videoPlayer = videoPlayer.getVideoPlayerBySessionId(allSessionIds[0]);
    console.log('found netflix videoPlay');
});

window.addEventListener('videoSeek', (e: any) => {
    const { time } = e.detail;
    videoPlayer.seek(time);
});

window.addEventListener('videoPlay', (e: any) => {
    videoPlayer.play();
});

window.addEventListener('videoPause', (e: any) => {
    videoPlayer.pause();
});
