var s = document.createElement('script');
s.src = chrome.runtime.getURL('js/netflix_accessible_script.js');
s.onload = function() {
    s.remove();
};
(document.head || document.documentElement).appendChild(s);