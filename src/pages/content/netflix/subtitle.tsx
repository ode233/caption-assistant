import { Subtitle } from '../definition';

let subtitleList: Array<Subtitle> = [];

function getSubtitleList(e: any) {
    const { xml } = e.detail;
    const parser = new DOMParser();
    const subtitlesHTML = parser.parseFromString(xml, 'text/xml');
    const subtitleElementList = subtitlesHTML.getElementsByTagName('p');
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
        let subtitle = new Subtitle(begin, end, subtitleElement);
        subtitleList.push(subtitle);
    }
}

export { getSubtitleList, subtitleList };
