import { SubtitleNode, SUBTITLE_WRAPPER_ID } from '../../../../definition/watchVideoDefinition';
import { createSubtitleElement } from '../../../../utils/subtitle';

let subtitleNodeList: Array<SubtitleNode> = [];

function generateSubtitleNodeList(e: any) {
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
        let subtitleHTML = getSubtitleHTML(subtitleElement);
        if (begin === prevBegin) {
            addSubtitleHTML(prevSubtitleElement!, subtitleHTML);
            continue;
        }
        subtitleElement = createSubtitleElement(subtitleHTML, subtitleNodeList.length);
        subtitleNodeList.push(new SubtitleNode(begin, end, subtitleElement));
        prevBegin = begin;
        prevSubtitleElement = subtitleElement;
    }
}

function getSubtitleHTML(subtitleElement: HTMLParagraphElement) {
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

function addSubtitleHTML(subtitleElement: HTMLParagraphElement, text: string) {
    subtitleElement.innerHTML += '&#10;' + text;
}

export { generateSubtitleNodeList, subtitleNodeList };
