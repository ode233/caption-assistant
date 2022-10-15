import { SubtitleNode, SUBTITLE_WRAPPER_ID } from '../../../../definition/watchVideoDefinition';

let subtitleNodeList: Array<SubtitleNode> = [];

function getSubtitleNodeList(e: any) {
    let subtitleWrapper = document.getElementById(SUBTITLE_WRAPPER_ID);
    if (subtitleWrapper) {
        return;
    }
    const { xml } = e.detail;
    const parser = new DOMParser();
    const subtitleHTML = parser.parseFromString(xml, 'text/xml');
    const subtitleElementList = subtitleHTML.getElementsByTagName('p');
    if (subtitleElementList.length === 0) {
        return;
    }
    subtitleNodeList = [];
    let prevBegin = -1;
    let prevSubtitleElement: HTMLParagraphElement;
    for (let subtitleElement of subtitleElementList) {
        const beginString = subtitleElement.getAttribute('begin')?.replace('t', '');
        const begin = Number(beginString) / 10 ** 7;
        const endString = subtitleElement.getAttribute('end')?.replace('t', '');
        const end = Number(endString) / 10 ** 7;
        let text = getText(subtitleElement);
        if (begin === prevBegin) {
            addText(prevSubtitleElement!, text);
            continue;
        }
        subtitleElement = createSubtitleElement(text, subtitleNodeList.length);
        subtitleNodeList.push(new SubtitleNode(begin, end, subtitleElement));
        prevBegin = begin;
        prevSubtitleElement = subtitleElement;
    }
}

function getText(subtitleElement: HTMLParagraphElement) {
    let text = '';
    for (let node of subtitleElement.childNodes) {
        switch (node.nodeName) {
            case 'br': {
                text += '&#10;';
                break;
            }
            default:
                text += node.textContent;
                break;
        }
    }
    return text;
}

function addText(subtitleElement: HTMLParagraphElement, text: string) {
    subtitleElement.innerHTML += '&#10;' + text;
}

function createSubtitleElement(text: string, index: number): HTMLParagraphElement {
    let newSubtitleElement = document.createElement('p');
    newSubtitleElement.setAttribute('index', index.toString());
    newSubtitleElement.style.whiteSpace = 'pre-line';
    newSubtitleElement.innerHTML = text;
    return newSubtitleElement;
}

export { getSubtitleNodeList, subtitleNodeList };
