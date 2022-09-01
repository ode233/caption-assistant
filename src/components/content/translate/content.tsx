import React from 'react';
import ReactDOM from 'react-dom';
import { getText, getParagraph, getSentence } from 'get-selection-more';
import { Popup } from './popup';

console.log('translate');

let popupDiv = document.createElement('div');
document.body.appendChild(popupDiv);
ReactDOM.render(<Popup></Popup>, document.body.appendChild(document.createElement('div')));
