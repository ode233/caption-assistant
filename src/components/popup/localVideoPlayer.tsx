import ReactDOM from 'react-dom';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useEffect, useRef } from 'react';
import './localVideoPlayer.scss';

console.log('localVideoPlayer');

const videoJsOptions = {
    sources: [
        {
            src: 'https://vjs.zencdn.net/v/oceans.mp4',
            type: 'video/mp4'
        }
    ]
};

const initialOptions: videojs.PlayerOptions = {
    controls: true,
    fluid: true,
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
}

const LocalVideoPlayer = () => {
    const videoNode = useRef(null);
    const player = useRef<videojs.Player>();

    useEffect(() => {
        videojs.registerComponent('selectVideo', SelectVideo);
        videojs.registerComponent('selectSubtitle', SelectSubtitle);

        player.current = videojs(videoNode.current!, {
            ...initialOptions,
            ...videoJsOptions
        });

        return () => {
            if (player.current) {
                player.current.dispose();
            }
        };
    });

    return <video ref={videoNode} className="video-js vjs-big-play-centered" />;
};

const root = document.getElementById('root');

ReactDOM.render(<LocalVideoPlayer></LocalVideoPlayer>, root);
