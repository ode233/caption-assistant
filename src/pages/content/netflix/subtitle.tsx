import { SubtitleNode } from '../definition';

let subtitleNodeList: Array<SubtitleNode> = [];

function getSubtitleNodeList(e: any) {
    const { xml } = e.detail;
    const parser = new DOMParser();
    const subtitleHTML = parser.parseFromString(xml, 'text/xml');
    const subtitleElementList = subtitleHTML.getElementsByTagName('p');
    console.log('subtitleElementList', subtitleElementList);
    if (subtitleElementList.length === 0) {
        return;
    }
    for (let i = 0; i < subtitleElementList.length; i++) {
        let subtitleElement = subtitleElementList[i];
        const beginString = subtitleElement.getAttribute('begin')?.replace('t', '');
        const begin = Number(beginString) / 10 ** 7;
        const endString = subtitleElement.getAttribute('end')?.replace('t', '');
        const end = Number(endString) / 10 ** 7;
        subtitleElement.setAttribute('index', i.toString());
        let subtitle = new SubtitleNode(begin, end, subtitleElement);
        subtitleNodeList.push(subtitle);
    }
}

export { getSubtitleNodeList, subtitleNodeList };
