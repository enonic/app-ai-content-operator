// Modified version of: https://github.com/ai/nanoid/blob/main/non-secure/index.js
const urlAlphabet = 'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict';

export const nanoid = (size = 21): string => {
    let id = '';
    for (let i = 0; i < size; i++) {
        id += urlAlphabet[(Math.random() * 64) | 0];
    }
    return id;
};
