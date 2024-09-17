/** @type {import('tailwindcss').Config} */
import {isolateInsideOfContainer, scopedPreflightStyles} from 'tailwindcss-scoped-preflight';

export default {
    content: ['./src/main/resources/assets/**/*.tsx'],
    theme: {
        extend: {
            colors: {
                'enonic-gray': {
                    DEFAULT: '#777777',
                    dark: '#333333',
                    light: '#acacac',
                    lighter: '#f7f7f7',
                },
                'enonic-green': {
                    DEFAULT: '#609e24',
                },
                'enonic-blue': {
                    DEFAULT: '#2c76e9',
                    light: '#5a94ee',
                },
                'openai-green': {
                    DEFAULT: '#10a37f',
                },
            },
            spacing: {
                30: '7.5rem',
                '1/2': '50%',
                '4/5': '80%',
            },
            lineHeight: {
                initial: 'initial',
                3.5: '.875rem',
            },
            padding: {
                2.5: '.625rem',
            },
            fontSize: {
                '2xs': '.625rem',
            },
            flex: {
                max: '1 0 100%',
            },
            gridTemplateColumns: {
                'min-280': 'repeat(auto-fill, minmax(300px, 1fr))',
                'mid-3': 'minmax(auto, min-content) 1fr minmax(auto, min-content)',
                'fit-1fr': 'minmax(auto, min-content) 1fr',
                'fit-fit-1fr': 'minmax(auto, min-content) minmax(auto, min-content) 1fr',
            },
            gridTemplateRows: {
                'fit-1fr': 'minmax(auto, min-content) 1fr',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
        scopedPreflightStyles({
            isolationStrategy: isolateInsideOfContainer('.enonic-ai'),
        }),
    ],
};
