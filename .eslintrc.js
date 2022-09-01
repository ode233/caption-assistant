/* eslint-disable @typescript-eslint/no-require-imports */
const { getWords, getGlobalWords } = require('modules-words');

module.exports = {
    extends: ['alloy', 'alloy/typescript'],
    env: {
        // 您的环境变量（包含多个预定义的全局变量）
        // Your environments (which contains several predefined global variables)
        //
        // browser: true,
        // node: true,
        // mocha: true,
        // jest: true,
        // jquery: true
        webextensions: true
    },
    globals: {
        // 您的全局变量（设置为 false 表示它不允许被重新赋值）
        // Your global variables (setting to false means it's not allowed to be reassigned)
        //
        // myGlobal: false
    },
    plugins: ['spellcheck'],
    rules: {
        // 自定义您的规则
        // Customize your rules
        semi: [1],
        'spellcheck/spell-checker': [
            'warn',
            {
                skipWords: [
                    ...getWords('@emotion/react'),
                    ...getWords('react-icons/bs'),
                    ...getWords('axios'),
                    ...getWords('typescript'),
                    ...getGlobalWords(),
                    'href',
                    'netflix',
                    'xml',
                    'br',
                    'player-timedtext',
                    'webextensions',
                    'globals',
                    'tsx',
                    'youdao',
                    'tgt',
                    'anki',
                    'fefefe'
                ]
            }
        ]
    }
};
