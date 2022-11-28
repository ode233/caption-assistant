import ReactDOM from 'react-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { AiFillPlayCircle } from 'react-icons/ai';
import { css } from '@emotion/react';

console.log('popup');

const Popup = () => {
    const onClickPlayLocalVideo = () => {
        chrome.tabs.create({
            url: 'watchVideo/local/localVideoPlayer.html'
        });
    };

    return (
        <Box
            css={css`
                width: max-content;
            `}
        >
            <List>
                <ListItem disablePadding>
                    <ListItemButton onClick={onClickPlayLocalVideo}>
                        <ListItemIcon
                            css={css`
                                font-size: x-large;
                                min-width: 0;
                                margin-right: 1rem;
                            `}
                        >
                            <AiFillPlayCircle />
                        </ListItemIcon>
                        <ListItemText primary="Play local video" />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );
};

const root = document.getElementById('root');

ReactDOM.render(<Popup></Popup>, root);
