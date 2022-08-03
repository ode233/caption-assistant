class Subtitle {
    public begin: number;
    public end: number;
    public elementStr: string;

    public constructor(begin: number, end: number, elementStr: string) {
        this.begin = begin;
        this.end = end;
        this.elementStr = elementStr;
    }
}

const subtitleList: Subtitle[] = [];

function processSubtile(e: any) {
    const { type, data } = e.detail;
    if (type === 'netflix') {
        const parser = new DOMParser();
        const subtitlesXml = parser.parseFromString(data, 'text/xml');
        const subtitleElementList = subtitlesXml.getElementsByTagName('p');
        for (let subtitleElement of subtitleElementList) {
            const beginStr = subtitleElement.getAttribute('begin')?.replace('t', '');
            const begin = Number(beginStr) / 10 ** 7;
            const endStr = subtitleElement.getAttribute('end')?.replace('t', '');
            const end = Number(endStr) / 10 ** 7;
            let subtitle = new Subtitle(begin, end, subtitleElement.outerHTML);
            subtitleList.push(subtitle);
        }
    }
}

function getSubtitleElementStrByTime(time: number) {
    return binarySearch(0, subtitleList.length - 1, time);
}

function binarySearch(i: number, j: number, target: number): string {
    if (i > j) {
        return '';
    }
    let mid = Math.floor(i + (j - i) / 2);
    let subtitle = subtitleList[mid];
    if (target >= subtitle.begin && target < subtitle.end) {
        return subtitle.elementStr;
    } else if (target < subtitle.begin) {
        return binarySearch(i, mid - 1, target);
    } else {
        return binarySearch(mid + 1, j, target);
    }
}

export { processSubtile, getSubtitleElementStrByTime };
