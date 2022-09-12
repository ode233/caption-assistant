export const getYoudaoTranslate = async (content: string) => {
    const response = await fetch(
        'https://fanyi.youdao.com/translate?&doctype=json&type=AUTO&i=' + encodeURIComponent(content)
    );
    return response.json();
};
