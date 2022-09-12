import React from 'react';
import ReactDOM from 'react-dom';
import { getText, getParagraph, getSentence } from 'get-selection-more';
import { Popup } from './popup';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { StyledEngineProvider, createTheme, ThemeProvider } from '@mui/material/styles';

let popupDiv = document.createElement('div');
document.body.appendChild(popupDiv);
ReactDOM.render(<Popup></Popup>, popupDiv);

// TODO: shadow dom

// const container = document.createElement('div');
// document.body.appendChild(container);
// const shadowContainer = container.attachShadow({ mode: 'open' });
// const emotionRoot = document.createElement('style');
// const shadowRootElement = document.createElement('div');
// shadowContainer.appendChild(emotionRoot);
// shadowContainer.appendChild(shadowRootElement);

// const cache = createCache({
//     key: 'css',
//     prepend: true,
//     container: emotionRoot
// });

// const shadowTheme = createTheme({
//     components: {
//         MuiPopover: {
//             defaultProps: {
//                 container: shadowRootElement
//             }
//         },
//         MuiPopper: {
//             defaultProps: {
//                 container: shadowRootElement
//             }
//         },
//         MuiModal: {
//             defaultProps: {
//                 container: shadowRootElement
//             }
//         }
//     }
// });

// ReactDOM.render(
//     <React.StrictMode>
//         <CacheProvider value={cache}>
//             <ThemeProvider theme={shadowTheme}>
//                 <Popup />
//             </ThemeProvider>
//         </CacheProvider>
//     </React.StrictMode>,
//     shadowRootElement
// );
