import { SubtitleNode } from '../definition';

let subtitleNodeList: Array<SubtitleNode> = [];

function getSubtitleNodeList(e: any) {
    const { xml } = e.detail;
    const parser = new DOMParser();
    const subtitleHTML = parser.parseFromString(xml, 'text/xml');
    const subtitleElementList = subtitleHTML.getElementsByTagName('p');
    if (subtitleElementList.length === 0) {
        return;
    }
    for (let i = 0; i < subtitleElementList.length; i++) {
        let subtitleElement = subtitleElementList[i];
        const beginString = subtitleElement.getAttribute('begin')?.replace('t', '');
        const begin = Number(beginString) / 10 ** 7;
        const endString = subtitleElement.getAttribute('end')?.replace('t', '');
        const end = Number(endString) / 10 ** 7;
        subtitleElement = getNewSubtitleElement(subtitleElement, i);
        let subtitle = new SubtitleNode(begin, end, subtitleElement);
        subtitleNodeList.push(subtitle);
    }
}

function getNewSubtitleElement(
    subtitleElement: HTMLParagraphElement,
    index: number
): HTMLParagraphElement {
    let newSubtitleElement = document.createElement('p');
    newSubtitleElement.setAttribute('index', index.toString());

    let newSpan = document.createElement('span');
    newSpan.style.whiteSpace = 'pre-line';
    let text = '';
    for (let node of subtitleElement.childNodes) {
        switch (node.nodeName) {
            case 'span': {
                text += node.textContent;
                break;
            }
            case 'br': {
                text += '&#10;';
                break;
            }
            default:
                break;
        }
    }
    newSpan.innerHTML = text;
    newSubtitleElement.appendChild(newSpan);

    return newSubtitleElement;
}

export { getSubtitleNodeList, subtitleNodeList };
