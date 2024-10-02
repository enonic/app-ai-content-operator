import clsx from 'clsx';
import {useId} from 'react';
import {twMerge} from 'tailwind-merge';

type Props = {
    className?: string;
    animated?: boolean;
};

export default function ApplicantIcon({className, animated = false}: Props): JSX.Element {
    const pupilId = useId();
    const eyeId = useId();

    return (
        <div
            className={twMerge(
                clsx(['flex justify-items-center items-center', 'w-8 h-8', 'rounded-full', 'bg-white', className]),
            )}
        >
            <svg
                xmlnsXlink='http://www.w3.org/1999/xlink'
                viewBox='0 0 512 512'
                width='100%'
                height='100%'
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
            >
                <g transform='scale(5.33333)'>
                    <circle fill='#8e50ae' stroke='#3d2065' cx='48' cy='48' r='46.918' />
                    <g id={eyeId}>
                        <g transform='translate(5 22)'>
                            <path
                                d='M41.54 55.64c21.02 0 32.245-20.958 32.245-37.009 0-14.55-5.511-7.076-24.252-5.5-1.933.163-34.839-10.55-34.839 5.5s5.827 37.01 26.846 37.01'
                                fill='#076f00'
                            />
                            <path
                                d='M43.013 48.4c15.747 0 25.707-12.283 25.707-24.97s-9.96-7.33-25.707-7.33-22.316-5.356-22.316 7.33S27.265 48.4 43.013 48.4'
                                fill='#a2ffbd'
                            />
                            <ellipse id={pupilId} fill='#550072' cx='47.523' cy='29.461' rx='6.003' ry='5.942' />
                        </g>
                    </g>
                    <path
                        d='M50.338 28.714c20.764 1.023 32.95-7.89 32.95-7.89S70.985 42.247 47.175 40.601 9.002 25.912 9.002 25.912s20.548 1.778 41.336 2.802'
                        fill='#3d2065'
                    />
                </g>
                {animated && (
                    <>
                        <animateTransform
                            xlinkHref={`#${pupilId}`}
                            attributeName='transform'
                            type='translate'
                            values='0,0; 0,0;  6,-5; 6,-5; 12,-5.5; 12,-5.5; 9.5,0; 9.5,0;   7,1;  7,1; -9,11; 4.5,10; 4.5,10;  9,1;  9,1;   0,0; 0,0'
                            keyTimes='0; 0.1; 0.115; 0.14;    0.28;    0.34; 0.355;  0.49; 0.495; 0.57;  0.59;   0.69;   0.72; 0.73; 0.84; 0.855; 1'
                            dur='8s'
                            repeatCount='indefinite'
                        />
                        <animateTransform
                            xlinkHref={`#${eyeId}`}
                            attributeName='transform'
                            type='translate'
                            values='0,0; 0,0; 3,-2.5; 3,-2.5; 6,-2.75; 6,-2.75; 4.75,0; 4.75,0; 3.5,0.5; 3.5,0.5; -4.5,2.25; 2.25,2; 2.25,2; 4.5,0.5; 4.5,0.5;   0,0; 0,0'
                            keyTimes='0; 0.1;  0.115;   0.14;    0.28;    0.34;  0.355;   0.49;   0.495;    0.57;      0.59;   0.69;   0.72;    0.73;    0.84; 0.855;   1'
                            dur='8s'
                            repeatCount='indefinite'
                        />
                    </>
                )}
            </svg>
        </div>
    );
}
