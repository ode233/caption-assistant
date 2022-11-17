import ReactDOM from 'react-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { ChangeEvent, useEffect, useRef } from 'react';
import './localVideoPlayer.scss';
import { css } from '@emotion/react';
import { parse, NodeList, Node, parseSync } from 'subtitle';
import { Readable } from 'stream';
import { generateSubtitleNodeList } from './subtitle';
import { Subtitle, SubtitleContainer, SUBTITLE_WRAPPER_ID } from '../../../../definition/watchVideoDefinition';
import { LocalVideo } from './video';

console.log('localVideoPlayer');

const localVideoPlayerId = 'local-video-player';
const videoInputId = 'video-input';
const subtitleInputId = 'subtitle-input';

const videoJsOptions = {
    // sources: [
    //     {
    //         src: 'https://vjs.zencdn.net/v/oceans.mp4',
    //         type: 'video/mp4'
    //     }
    // ]
};

const initialOptions: videojs.PlayerOptions = {
    autoplay: true,
    controls: true,
    fill: true,
    controlBar: {
        volumePanel: {
            inline: false
        },
        children: [
            'playToggle',
            'volumePanel',
            'progressControl',
            'remainingTimeDisplay',
            'selectVideo',
            'selectSubtitle',
            'fullscreenToggle',
            'subsCapsButton'
        ]
    }
};

let VideoJsButton = videojs.getComponent('Button');

class SelectVideo extends VideoJsButton {
    public constructor(player: videojs.Player, options = {}) {
        super(player, options);
        this.setup();
    }

    public setup() {
        this.addClass('vjs-select-video');
        this.controlText('Select video');
    }

    public handleClick() {
        document.getElementById(videoInputId)?.click();
    }
}

class SelectSubtitle extends VideoJsButton {
    public constructor(player: videojs.Player, options = {}) {
        super(player, options);
        this.setup();
    }

    public setup() {
        this.addClass('vjs-select-subtitle');
        this.controlText('Select subtitle');
    }

    public handleClick() {
        document.getElementById(subtitleInputId)?.click();
    }
}

const LocalVideoPlayer = () => {
    const videoNode = useRef<HTMLVideoElement>(null);
    const player = useRef<videojs.Player>();

    useEffect(() => {
        videojs.registerComponent('selectVideo', SelectVideo);
        videojs.registerComponent('selectSubtitle', SelectSubtitle);

        player.current = videojs(videoNode.current!, {
            ...initialOptions,
            ...videoJsOptions
        });

        player.current.controls(true);

        return () => {
            if (player.current) {
                player.current.dispose();
            }
        };
    });

    function videoInputOnChange(event: ChangeEvent<HTMLInputElement>) {
        if (!player.current) {
            return;
        }
        let file = event.target.files![0];
        document.title = file.name;

        let fileURL = URL.createObjectURL(file);
        player.current.src({ src: fileURL, type: file.type });
    }

    async function subtitleInputOnChange(event: ChangeEvent<HTMLInputElement>) {
        if (!player.current) {
            return;
        }
        let file = event.target.files![0];
        let text = await file.text();
        let nodes = parseSync(text);
        console.log(nodes);

        let subtitleNodeList = generateSubtitleNodeList(nodes);
        let subtitle = new Subtitle(subtitleNodeList);
        let localVideo = new LocalVideo(videoNode.current!, player.current);
        let mountElement = document.getElementById(localVideoPlayerId);

        let subtitleWrapper = document.getElementById(SUBTITLE_WRAPPER_ID);
        if (subtitleWrapper) {
            subtitleWrapper.remove();
        }

        ReactDOM.render(
            <SubtitleContainer video={localVideo} subtitle={subtitle} mountElement={mountElement!}></SubtitleContainer>,
            document.body.appendChild(document.createElement('div'))
        );
    }

    return (
        <div
            css={css`
                box-sizing: border-box;
                height: 100%;
                width: 100%;
                left: 0;
                margin: 0;
                overflow: hidden;
                padding: 0;
                position: absolute;
                top: 0;
            `}
        >
            <video ref={videoNode} className="video-js vjs-big-play-centered" id={localVideoPlayerId} />
            <input
                type="file"
                accept=".mp4"
                id={videoInputId}
                css={css`
                    display: none;
                `}
                onChange={videoInputOnChange}
            />
            <input
                type="file"
                accept=".srt"
                id={subtitleInputId}
                css={css`
                    display: none;
                `}
                onChange={subtitleInputOnChange}
            />
        </div>
    );
};

const root = document.getElementById('root');

ReactDOM.render(<LocalVideoPlayer></LocalVideoPlayer>, root);
