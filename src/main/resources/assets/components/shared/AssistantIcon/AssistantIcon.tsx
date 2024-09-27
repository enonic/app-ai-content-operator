import clsx from 'clsx';
import {twMerge} from 'tailwind-merge';

type Props = {
    className?: string;
};

export default function ApplicantIcon({className}: Props): JSX.Element {
    return (
        <div
            className={twMerge(
                clsx(['flex justify-items-center items-center', 'w-8 h-8', 'rounded-full', 'bg-white', className]),
            )}
        >
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 86 86' width='86' height='86'>
                <defs>
                    <clipPath id='circleClip'>
                        <circle cx='43' cy='43' r='43' />
                    </clipPath>
                </defs>

                <g clipPath='url(#circleClip)'>
                    <g id='Juke-1' stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
                        <g id='Juke-2' transform='translate(-63.990849, -104.000000)' fillRule='nonzero'>
                            <g id='Juke-3' transform='translate(0.000000, 0.000000)'>
                                <g id='Juke-Body'>
                                    <path
                                        d='M43.8424112,154.519531 C52.5110415,85.6891006 34.9635118,0 34.9635118,0 C34.9635118,0 105.402954,47.4414063 143.346313,104.941406 C181.289673,162.441406 199.301391,274.019531 199.301391,274.019531 C199.301391,274.019531 222.343397,357.985882 207.764282,378.846954 C177.074468,422.76062 144.311649,362.517352 127.065532,356.054377 C96.8852233,344.74432 12.7642848,449.589903 12.7642855,375.441406 C12.7642856,362.810071 20.0899777,331.106277 26.1192665,301.857422 C29.6596333,284.682647 33.5690182,268.893251 33.1065712,256.869629 C32.5774413,243.11225 27.9657875,249.946853 22.2901383,259.493741 C21.4782962,260.859324 20.6446843,262.2804 19.7981369,263.704644 C16.5687603,269.137793 13.1511405,274.617029 10.0356944,277.237456 C6.18940179,280.472603 2.80368491,279.350331 0.801395587,268.404297 C-6.22008895,230.019531 34.9635123,225.019531 43.8424112,154.519531 Z'
                                        id='Juke-Body-1'
                                        fill='#3D2065'
                                    />
                                    <path
                                        d='M49.0963185,158.113281 C57.1705373,93.15625 41.3599894,9.96289065 41.3599894,9.96289065 C41.3599894,9.96289065 102.875607,51.4804688 140.397091,107.5 C177.918576,163.519531 192.475225,265.437495 192.475225,265.437495 C192.475225,265.437495 216.421853,354.119612 202.994762,373.816406 C174.730022,415.279205 143.87811,354.398168 127.994762,348.295898 C100.199266,337.617067 18.9947536,439.826599 18.9947541,369.816406 C18.9947543,350.886938 38.6153605,268.887695 37.1153605,257.753418 C33.5825538,231.529918 13.8013953,290.457031 3.80139561,267.947266 C-6.19860411,245.4375 42.6265579,210.162459 49.0963185,158.113281 Z'
                                        id='Juke-Body-2'
                                        fill='#8E50AE'
                                    />
                                </g>
                                <g id='Juke-Eye' transform='translate(65.471319, 123.544923)'>
                                    <path
                                        d='M41.5195305,55.4550771 C62.506351,55.4550771 73.714843,34.5416467 73.714843,18.5253889 C73.714843,4.00684308 68.2119143,11.4644681 49.4999993,13.0371085 C47.5697056,13.1993397 14.714843,2.50913142 14.714843,18.5253892 C14.714843,34.5416469 20.53271,55.4550771 41.5195305,55.4550771 Z'
                                        id='Juke-Eye-1'
                                        fill='#076F00'
                                    />
                                    <path
                                        d='M43.0195305,48.5683584 C58.7596459,48.5683584 68.714843,36.270908 68.714843,23.5683587 C68.714843,10.8658095 58.7596459,16.2285146 43.0195305,16.2285146 C27.2794152,16.2285146 20.714843,10.8658095 20.714843,23.5683587 C20.714843,36.2709079 27.2794152,48.5683584 43.0195305,48.5683584 Z'
                                        id='Juke-Eye-2'
                                        fill='#A2FFBD'
                                    />
                                    <ellipse
                                        id='Juke-Eye-3'
                                        fill='#550072'
                                        cx='47.5195305'
                                        cy='28.9550771'
                                        rx='6'
                                        ry='5.5'
                                    />
                                    <path
                                        d='M32.0371094,10.683819 C11.325205,9.25572407 0,20.5865699 0,20.5865699 C0,20.5865699 10.4052527,-1.55101505 34.1554413,0.0865708681 C57.9056299,1.72415679 78.0371094,16.5494615 78.0371094,16.5494615 C78.0371094,16.5494615 52.7490137,12.1119139 32.0371094,10.683819 Z'
                                        id='Juke-Eye-4'
                                        fill='#3D2065'
                                        transform='translate(39.018555, 10.293285) rotate(180.000000) translate(-39.018555, -10.293285)'
                                    />
                                </g>
                            </g>
                        </g>
                    </g>
                </g>
                <circle cx='43' cy='43' r='42' stroke='#550072' strokeWidth='2' fill='none' />
            </svg>
        </div>
    );
}
