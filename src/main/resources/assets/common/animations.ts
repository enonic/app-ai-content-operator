type PathOrElement = string | HTMLElement;

export enum RGBColor {
    BLUE = '147 197 253',
    GREEN = '22 163 74',
}

export type AnimationEffect = 'glow' | 'innerGlow' | 'none';

function toElement(pathOrElement: PathOrElement): HTMLElement | null {
    return pathOrElement instanceof HTMLElement
        ? pathOrElement
        : document.querySelector(`[data-path='${pathOrElement}']`);
}

export function animateScroll(pathOrElement: PathOrElement, effect: AnimationEffect = 'glow'): void {
    const element = toElement(pathOrElement);
    element?.scrollIntoView({behavior: 'instant', block: 'center'});
    if (!element) {
        return;
    }

    if (effect === 'glow') {
        animateGlow(element, RGBColor.BLUE);
    } else if (effect === 'innerGlow') {
        animateInnerGlow(element, RGBColor.BLUE);
    }
}

export function animateTopicScroll(): void {
    const displayNameElement = document.querySelector<HTMLElement>('input[name="displayName"]');
    if (displayNameElement) {
        animateScroll(displayNameElement, 'innerGlow');
    }
}

export function animateBlink(pathOrElement: PathOrElement): void {
    toElement(pathOrElement)?.animate([{opacity: 0}, {opacity: 1}], {duration: 300});
}

export function animateHighlight(pathOrElement: PathOrElement): void {
    const element = toElement(pathOrElement);
    element?.animate(
        [{backgroundColor: '#fef9c3'}, {backgroundColor: element.style.backgroundColor ?? 'transparent'}],
        {
            duration: 800,
            easing: 'ease-in-out',
        },
    );
}

export function animateGlow(pathOrElement: PathOrElement, color = RGBColor.GREEN): void {
    toElement(pathOrElement)?.animate(
        [
            {boxShadow: `0 0 0px rgb(${color})`, offset: 0},
            {boxShadow: `0 0 12px rgb(${color})`, offset: 0.33},
            {boxShadow: `0 0 18px rgb(${color} / 30%)`, offset: 0.66},
            {boxShadow: `0 0 24px rgb(${color} / 0%)`, offset: 1},
        ],
        {
            duration: 300,
        },
    );
}

export function animateInnerGlow(pathOrElement: PathOrElement, color = RGBColor.GREEN): void {
    toElement(pathOrElement)?.animate(
        [
            {boxShadow: `inset 0 0 0px rgb(${color})`, offset: 0},
            {boxShadow: `inset 0 0 4px rgb(${color})`, offset: 0.33},
            {boxShadow: `inset 0 0 8px rgb(${color} / 30%)`, offset: 0.66},
            {boxShadow: `inset 0 0 12px rgb(${color} / 0%)`, offset: 1},
        ],
        {
            duration: 300,
        },
    );
}
