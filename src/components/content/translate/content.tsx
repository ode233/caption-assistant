import React from 'react';
import ReactDOM from 'react-dom';
import { Popup } from './popup';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const container = document.createElement('div');
document.body.appendChild(container);
const shadowContainer = container.attachShadow({ mode: 'open' });
const emotionRoot = document.createElement('style');
const shadowRootElement = document.createElement('div');
shadowContainer.appendChild(emotionRoot);
shadowContainer.appendChild(shadowRootElement);

const cache = createCache({
    key: 'translate-popup-component',
    container: emotionRoot
});

const shadowTheme = createTheme({
    components: {
        MuiPopover: {
            defaultProps: {
                container: shadowRootElement
            }
        },
        MuiPopper: {
            defaultProps: {
                container: shadowRootElement
            }
        },
        MuiModal: {
            defaultProps: {
                container: shadowRootElement
            }
        }
    },
    typography: {
        allVariants: {
            fontSize: 16
        }
    }
});

ReactDOM.render(
    <React.StrictMode>
        <CacheProvider value={cache}>
            <ThemeProvider theme={shadowTheme}>
                <Popup />
            </ThemeProvider>
        </CacheProvider>
    </React.StrictMode>,
    shadowRootElement
);
