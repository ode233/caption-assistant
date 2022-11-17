import { Video } from '../../../../definition/watchVideoDefinition';
import videojs from 'video.js';

class LocalVideo implements Video {
    private video: HTMLVideoElement;
    private player: videojs.Player;

    public constructor(video: HTMLVideoElement, player: videojs.Player) {
        this.video = video;
        this.player = player;
    }

    public seek(time: number): void {
        this.player.currentTime(time);
    }
    public play(): void {
        this.player.play();
    }
    public pause(): void {
        this.player.pause();
    }
    public getCurrentTime(): number {
        return this.player.currentTime();
    }
    public setOntimeupdate(f: any): void {
        this.video.ontimeupdate = f;
    }
}

export { LocalVideo };
