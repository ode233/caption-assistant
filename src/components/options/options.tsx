import { Button, css, Divider, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { getUserConfig, UserConfig } from '../../definition/userConfigDefinition';

console.log('options');

const Option = () => {
    const [userConfig, setUserConfig] = useState(new UserConfig());

    useEffect(() => {
        getUserConfig().then((userConfig) => {
            if (userConfig) {
                setUserConfig(userConfig);
            }
        });
    }, []);

    function save() {
        chrome.storage.sync.set({ userConfig: userConfig }, () => {
            chrome.runtime.sendMessage({ queryBackground: 'applyUserConfig' });
        });
    }

    const onCaiyunTokenChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        userConfig.caiyunToken = event.target.value;
        setUserConfig({ ...userConfig });
    };

    return (
        <div>
            <div
                css={css`
                    margin-left: 10rem;
                `}
            >
                <h3>翻译API</h3>
                <Divider></Divider>
                <h4>彩云小译</h4>
                <TextField
                    label="token"
                    variant="standard"
                    value={userConfig.caiyunToken}
                    onChange={onCaiyunTokenChange}
                />
                <Divider
                    css={css`
                        margin-top: 1rem;
                        margin-bottom: 1rem;
                    `}
                ></Divider>
                <Button onClick={save}>保存</Button>
            </div>
        </div>
    );
};

const root = document.getElementById('root');

ReactDOM.render(<Option></Option>, root);
