class UserConfig {
    public caiyunToken = '';
}

function getUserConfig() {
    return new Promise<UserConfig>((resolve) => {
        chrome.storage.sync.get(['userConfig'], (result) => {
            let userConfig: UserConfig = result['userConfig'];
            resolve(userConfig);
        });
    });
}

export { UserConfig, getUserConfig };
