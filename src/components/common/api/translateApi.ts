export const getYoudaoTranslate = async (content: string) => {
    const response = await fetch(
        'https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=' + encodeURIComponent(content)
    );
    return response.json();
};

export const getPhonetic = async (text: string) => {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
    return response.json();
};

export const dataUrlToBlob = async (dataUrl: string) => {
    const response = await fetch(dataUrl);
    return response.blob();
};
