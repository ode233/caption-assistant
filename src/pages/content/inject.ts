function injectXMLHttpRequest(open: any) {
    XMLHttpRequest.prototype.open = function () {
        if (arguments[1] && arguments[1].includes('nflxvideo.net/?o=1')) {
            this.addEventListener('load', () => {
                window.dispatchEvent(new CustomEvent('get_subtitle', { detail: { type: 'netflix', data: this.response } }));
            });
        }
        open.apply(this, arguments);
    }
}

injectXMLHttpRequest(XMLHttpRequest.prototype.open);
