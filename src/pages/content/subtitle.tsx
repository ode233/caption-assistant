class Subtitle {
    begin: number;
    end: number;
    element: HTMLParagraphElement;

    constructor(begin: number, end: number, element: HTMLParagraphElement) {
        this.begin = begin;
        this.end = end;
        this.element = element
    }
}

const subtitleList: Subtitle[] = [];

function processSubtile(e: any) {
    const { type, data } = e.detail;
    if (type === "netflix") {
        const parser = new DOMParser();
        const subtitlesXml  = parser.parseFromString(data, "text/xml");
        const subtitleElementList = subtitlesXml.getElementsByTagName("p");
        for(let subtitleElement of subtitleElementList) {
            const beginStr = subtitleElement.getAttribute("begin")?.replace("t", "")
            const begin = Number(beginStr) / 10**7
            const endStr = subtitleElement.getAttribute("end")?.replace("t", "")
            const end = Number(endStr) / 10**7
            let subtitle = new Subtitle(begin, end, subtitleElement);
            subtitleList.push(subtitle)
        }
    }
}

function subtitle(video: HTMLVideoElement) {
    
}