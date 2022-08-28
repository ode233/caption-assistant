import { Video } from '../definition';

class NetflixVideo implements Video {
    private video: HTMLVideoElement;

    public constructor(video: HTMLVideoElement) {
        this.video = video;
    }

    public seek(time: number): void {
        window.dispatchEvent(
            new CustomEvent('videoSeek', {
                detail: { time: time * 1000 }
            })
        );
    }
    public play(): void {
        window.dispatchEvent(new CustomEvent('videoPlay'));
    }
    public pause(): void {
        window.dispatchEvent(new CustomEvent('videoPause'));
    }
    public getCurrentTime(): number {
        return this.video.currentTime;
    }
    public setOntimeupdate(f: any): void {
        this.video.ontimeupdate = f;
    }
}

export { NetflixVideo };
