export function delay(ms = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('');
        }, ms);
    });
}

// eslint-disable-next-line no-undef
export async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = 1000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(input, {
        ...init,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}
