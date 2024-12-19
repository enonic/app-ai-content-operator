import {twMerge} from 'tailwind-merge';

import {
    HeroIconArrowDownOnSquare,
    HeroIconArrowDownOnSquareStack,
    HeroIconArrowPath,
    HeroIconArrowUp,
    HeroIconCheck,
    HeroIconCheckCircleSolid,
    HeroIconChevronDown,
    HeroIconChevronLeft,
    HeroIconChevronRight,
    HeroIconChevronUp,
    HeroIconClipboardDocument,
    HeroIconClipboardDocumentCheck,
    HeroIconClose,
    HeroIconCodeBracket,
    HeroIconExclamationTriangleMicro,
    HeroIconPencilSquared,
    HeroIconPencilSquaredSolid,
    HeroIconPresentationChartLine,
    HeroIconQuestion,
    HeroIconScale,
    HeroIconSparkles,
    HeroIconStop,
    HeroIconTrash,
    SvgIconGemini,
    SvgIconGeminiFlash,
    SvgIconGeminiPro,
} from '../icons';

const outlineIcons = {
    copy: HeroIconClipboardDocument,
    copySuccess: HeroIconClipboardDocumentCheck,
    apply: HeroIconArrowDownOnSquare,
    applyAll: HeroIconArrowDownOnSquareStack,
    retry: HeroIconArrowPath,
    expand: HeroIconChevronDown,
    collapse: HeroIconChevronUp,
    left: HeroIconChevronLeft,
    right: HeroIconChevronRight,
    send: HeroIconArrowUp,
    check: HeroIconCheck,
    close: HeroIconClose,
    stop: HeroIconStop,
    question: HeroIconQuestion,
    scale: HeroIconScale,
    sparkles: HeroIconSparkles,
    presentationChartLine: HeroIconPresentationChartLine,
    codeBracket: HeroIconCodeBracket,
    pencilSquared: HeroIconPencilSquared,
    trash: HeroIconTrash,
} as const;

const solidIcons = {
    checkCircle: HeroIconCheckCircleSolid,
    pencilSquared: HeroIconPencilSquaredSolid,
} as const;

const microIcons = {
    exclamationTriangle: HeroIconExclamationTriangleMicro,
} as const;

const svgIcons = {
    gemini: SvgIconGemini,
    geminiFlash: SvgIconGeminiFlash,
    geminiPro: SvgIconGeminiPro,
} as const;

type OutlineIconName = keyof typeof outlineIcons;
type SolidIconName = keyof typeof solidIcons;
type MicroIconName = keyof typeof microIcons;
type SvgIconName = keyof typeof svgIcons;
export type IconName = OutlineIconName | SolidIconName | MicroIconName | SvgIconName;
export type IconNameOrOptions = IconName | {name: IconName; type?: IconType};

const isOutlineIcon = (name: IconName): name is OutlineIconName => name in outlineIcons;
const isSolidIcon = (name: IconName): name is SolidIconName => name in solidIcons;
const isMicroIcon = (name: IconName): name is MicroIconName => name in microIcons;

type Props = {
    className?: string;
    name: IconName;
    type?: IconType;
    title?: string;
};

type IconType = 'outline' | 'solid' | 'micro';

function selectIcon(
    name: IconName,
    type: Optional<IconType>,
): (props: {className?: string; title?: string}) => React.ReactNode {
    if (type === 'solid') {
        if (isSolidIcon(name)) {
            return solidIcons[name];
        }
        if (isOutlineIcon(name)) {
            return outlineIcons[name];
        }
        if (isMicroIcon(name)) {
            return microIcons[name];
        }
    } else if (type === 'micro') {
        if (isMicroIcon(name)) {
            return microIcons[name];
        }
        if (isOutlineIcon(name)) {
            return outlineIcons[name];
        }
        if (isSolidIcon(name)) {
            return solidIcons[name];
        }
    } else {
        if (isOutlineIcon(name)) {
            return outlineIcons[name];
        }
        if (isSolidIcon(name)) {
            return solidIcons[name];
        }
        if (isMicroIcon(name)) {
            return microIcons[name];
        }
    }
    return svgIcons[name];
}

export default function Icon({className, name, type, title}: Props): React.ReactNode {
    const IconElement = selectIcon(name, type);
    return <IconElement className={twMerge('w-6 h-6', className)} title={title} />;
}
