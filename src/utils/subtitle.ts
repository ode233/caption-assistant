export function createSubtitleElement(subtitleHTML: string, index: number): HTMLParagraphElement {
    let newSubtitleElement = document.createElement('p');
    newSubtitleElement.setAttribute('index', index.toString());
    newSubtitleElement.style.whiteSpace = 'pre-line';
    newSubtitleElement.style.fontFamily = 'serif';
    newSubtitleElement.innerHTML = subtitleHTML;
    return newSubtitleElement;
}
