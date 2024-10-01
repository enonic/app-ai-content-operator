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
                width='128'
                height='128'
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
            >
                <g transform='matrix(5.3333338,0,0,5.3333328,0,0)'>
                    <circle
                        fill='#8e50ae'
                        fillOpacity='1'
                        stroke='#3d2065'
                        strokeWidth='2.16392'
                        id='path2'
                        cx='48'
                        cy='48'
                        r='46.918041'
                    />
                    <g transform='matrix(1,0,0,1,5,22)'>
                        <g id={eyeId} display='inline'>
                            <path
                                d='m 41.540332,55.640758 c 21.019046,0 32.244748,-20.958702 32.244748,-37.009632 0,-14.5499744 -5.511379,-7.076206 -24.252026,-5.50016 -1.933257,0.162582 -34.838568,-10.5507683 -34.838568,5.50016 0,16.05093 5.8268,37.009632 26.845846,37.009632 z'
                                fill='#076f00'
                                strokeWidth='1'
                            />
                            <path
                                d='m 43.012638,48.399414 c 15.747602,0 25.707534,-12.281945 25.707534,-24.968478 0,-12.686534 -9.959932,-7.330589 -25.707534,-7.330589 -15.747603,0 -22.315298,-5.355945 -22.315298,7.330589 0,12.686533 6.567695,24.968478 22.315298,24.968478 z'
                                fill='#a2ffbd'
                                strokeWidth='1'
                            />
                            <ellipse
                                id={pupilId}
                                fill='#550072'
                                cx='47.522594'
                                cy='29.460514'
                                rx='6.0028539'
                                ry='5.9416161'
                                strokeWidth='1'
                            ></ellipse>
                        </g>
                        <path
                            d='m 45.338366,6.7142252 c 20.763995,1.0228353 32.948854,-7.890169 32.948854,-7.890169 0,0 -12.301555,21.4228098 -36.111476,19.7770928 C 18.365821,16.955431 4.001902,3.9120893 4.001902,3.9120893 c 0,0 20.547751,1.7780831 41.336464,2.8021359 z'
                            fill='#3d2065'
                            strokeWidth='1'
                        />
                    </g>
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
