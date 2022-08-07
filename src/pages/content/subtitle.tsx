class Subtitle {
    public begin: number;
    public end: number;
    public element: HTMLParagraphElement;

    public constructor(begin: number, end: number, element: HTMLParagraphElement) {
        this.begin = begin;
        this.end = end;
        this.element = element;
    }
}

const subtitleList: Subtitle[] = [];

function processSubtitle(e: any) {
    const { site, data } = e.detail;
    if (site === 'netflix') {
        const parser = new DOMParser();
        const subtitlesXML = parser.parseFromString(data, 'text/xml');
        const subtitleElementList = subtitlesXML.getElementsByTagName('p');
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
}

function getSubtitleElementByTime(time: number) {
    return binarySearch(0, subtitleList.length - 1, time);
}

function binarySearch(i: number, j: number, target: number): HTMLParagraphElement | null {
    if (i > j) {
        return null;
    }
    let mid = Math.floor(i + (j - i) / 2);
    let subtitle = subtitleList[mid];
    if (target >= subtitle.begin && target < subtitle.end) {
        return subtitle.element;
    } else if (target < subtitle.begin) {
        return binarySearch(i, mid - 1, target);
    } else {
        return binarySearch(mid + 1, j, target);
    }
}

function getNextSubtitleTime(nowIndex: number): number | null {
    let nextIndex = nowIndex + 1;
    if (nextIndex >= subtitleList.length) {
        return null;
    }
    let subtitle = subtitleList[nextIndex];
    return subtitle.begin;
}

function getPrevSubtitleTime(nowIndex: number): number | null {
    let prevIndex = nowIndex - 1;
    if (prevIndex < 0) {
        return null;
    }
    let subtitle = subtitleList[prevIndex];
    return subtitle.begin;
}

export { processSubtitle, getSubtitleElementByTime, getNextSubtitleTime, getPrevSubtitleTime };
