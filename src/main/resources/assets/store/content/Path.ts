export type Path = {
    elements: PathElement[];
};

export type PathElement = {
    name: string;
    label?: string;
    index?: number;
};
