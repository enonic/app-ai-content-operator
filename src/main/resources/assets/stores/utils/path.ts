import {Path, PathElement} from '../data/Path';

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
    const elements = path.elements.map(({index, name}) => (!index ? name : `${name}[${index}]`));
    return '/' + elements.join('/');
}

export function pathToPrettifiedLabel(path: Path): string {
    const [label = '', index] = pathToLabelAndIndex(path) ?? [];
    return index == null ? label : `${label} [${index}]`;
}

export function pathToLabelAndIndex(path: Path): Optional<[string, Optional<number>]> {
    const lastElement = path.elements.at(-1);
    if (lastElement) {
        const index = lastElement.index != null ? lastElement.index + 1 : null;
        return [lastElement.label ?? lastElement.name, index];
    }
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
    return path.elements.map(pathElementToPrettifiedString).join(' / ');
}

function pathElementToPrettifiedString(element: PathElement): string {
    const text = element.label || element.name;
    return element.index == null ? text : `${text} [${element.index + 1}]`;
}

export function isChildPath(child: Path, parent: Path): boolean {
    return startsWith(child, parent) && child.elements.length === parent.elements.length + 1;
}

export function isRootPath(path: Path): boolean {
    return path.elements.length === 1;
}

export function getParentPath(path: Path): Optional<Path> {
    return path.elements.length > 1 ? {elements: path.elements.slice(0, -1)} : null;
}

export const pathsFromString = (pathAsString: string): Path[] => {
    const paths: Path[] = [];
    let path: Optional<Path> = pathFromString(pathAsString);

    while (path) {
        paths.unshift(path);
        path = getParentPath(path);
    }

    return paths;
};

export function getAllPaths(path: Path): Path[] {
    const parentPath = getParentPath(path);
    return parentPath ? [...getAllPaths(parentPath), path] : [path];
}

export function getAllPathsFromString(pathAsString: string): Path[] {
    return getAllPaths(pathFromString(pathAsString));
}
