/** @type {import('tailwindcss').Config} */
import {isolateInsideOfContainer, scopedPreflightStyles} from 'tailwindcss-scoped-preflight';

export default {
    content: ['./src/main/resources/assets/**/*.tsx'],
    theme: {
        extend: {
            colors: {
                'enonic-gray': {
                    700: '#333333',
                    600: '#777777',
                    500: '#999999',
                    400: '#acacac',
                    100: '#f7f7f7',
                },
                'enonic-green': {
                    DEFAULT: '#609e24',
                },
                'enonic-blue': {
                    DEFAULT: '#2c76e9',
                    light: '#5a94ee',
                },
            },
            screens: {
                sm2: '720px',
            },
            spacing: {
                30: '7.5rem',
                '1/2': '50%',
                '4/5': '80%',
            },
            padding: {
                2.5: '.625rem',
                7.5: '1.875rem',
            },
            lineHeight: {
                initial: 'initial',
                3.5: '.875rem',
                'header-title': '2rem',
            },
            fontSize: {
                '2xs': '.625rem',
                'header-title': '1.725rem',
            },
            flex: {
                max: '1 0 100%',
            },
            gridTemplateColumns: {
                auto: 'auto',
                'min-280': 'repeat(auto-fill, minmax(300px, 1fr))',
                'mid-3': 'minmax(auto, min-content) 1fr minmax(auto, min-content)',
                'fit-1fr': 'minmax(auto, min-content) 1fr',
                'fit-fit-1fr': 'minmax(auto, min-content) minmax(auto, min-content) 1fr',
            },
            gridTemplateRows: {
                auto: 'auto',
                'fit-1fr': 'minmax(auto, min-content) 1fr',
            },
            keyframes: {
                'slide-fade-in': {
                    '0%': {
                        opacity: '0',
                        'padding-bottom': '0',
                        'padding-top': '0.5rem',
                    },
                    '100%': {
                        opacity: '1',
                        'padding-bottom': '0.5rem',
                        'padding-top': '0',
                    },
                },
                blink: {
                    '0%': {
                        outline: '0 solid rgb(147 197 253)',
                    },
                    '50%': {
                        outline: '0.5rem solid rgb(147 197 253 / 10%)',
                    },
                    '90%': {
                        outline: '0.75rem solid rgb(147 197 253 / 0%)',
                    },
                    '99%': {
                        outline: '0 solid transparent',
                    },
                    '100%': {
                        outline: 'inherit',
                    },
                },
            },
            animation: {
                'slide-fade-in': 'slide-fade-in 300ms ease-in-out forwards',
                blink: 'blink 600ms linear forwards',
            },
        },
    },
    safelist: ['animate-slide-fade-in'],
    plugins: [
        require('@tailwindcss/typography'),
        scopedPreflightStyles({
            isolationStrategy: isolateInsideOfContainer('.ai-content-operator'),
        }),
    ],
};
