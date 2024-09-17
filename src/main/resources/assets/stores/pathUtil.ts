import {Path, PathElement} from './data/Path';

export const pathElementEqual = (element1: PathElement, element2: PathElement, compareLabel?: boolean): boolean => {
    const index1 = element1.index ?? 0;
    const index2 = element2.index ?? 0;
    return (
        element1.name === element2.name &&
        index1 === index2 &&
        (compareLabel ? element1.label === element2.label : true)
    );
};

export const pathsEqual = (path1: Path, path2: Path): boolean => {
    return (
        (!path1 && !path2) ||
        (path1?.elements.length === path2?.elements.length &&
            path1.elements.every((element, index) => pathElementEqual(element, path2.elements[index])))
    );
};

export const startsWith = (path: Path, prefix: Path): boolean => {
    return (
        path.elements.length > prefix.elements.length &&
        prefix.elements.every((element, index) => pathElementEqual(element, path.elements[index]))
    );
};

export const toPathElement = (value: string): PathElement => {
    const valArr = value.split('[');

    return {
        name: valArr[0],
        index: valArr[1] ? parseInt(valArr[1].slice(0, -1)) : 0,
    };
};

export const pathFromString = (pathAsString: string): Path => {
    const noLeadingSlashPath = pathAsString.startsWith('/') ? pathAsString.slice(1) : pathAsString;
    const elements = noLeadingSlashPath.split('/').map(toPathElement);
    return {elements};
};

export function pathToString(path: Path): string {
    return '/' + path.elements.map(pathElementToString).join('/');
}

function pathElementToString(element: PathElement): string {
    const text = element.name;
    return element.index == undefined || element.index === 0 ? text : `${text}[${element.index}]`;
}

export function getPathLabel(path: Path): string {
    const lastElement = path.elements[path.elements.length - 1];
    return lastElement.label || lastElement.name;
}

export function clonePath(path: Path): Path {
    const cloned = path.elements.map(element => {
        return {
            name: element.name,
            label: element.label,
            index: element.index,
        };
    });

    return {elements: cloned};
}

export function pathToPrettifiedString(path: Path): string {
    return path.elements.map(pathElementToPrettifiedString).join('/');
}

function pathElementToPrettifiedString(element: PathElement): string {
    const text = element.label || element.name;
    return element.index == undefined || element.index === 0 ? text : `${text}[${element.index}]`;
}

export const isChildPath = (child: Path, parent: Path): boolean => {
    return startsWith(child, parent) && child.elements.length === parent.elements.length + 1;
};

export const isRootPath = (path: Path): boolean => {
    return path.elements.length === 1;
};

export const getParentPath = (path: Path): Optional<Path> => {
    return path.elements.length > 1 ? {elements: path.elements.slice(0, -1)} : null;
};
