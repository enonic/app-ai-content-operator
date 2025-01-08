export type GraphNode = {
    [key: string]: unknown;
    id: string;
    nextId?: string;
    nextIds?: string[];
};

export type GraphNodes<T extends GraphNode> = Record<string, T>;

export function flattenGraph<T extends GraphNode>(nodes: GraphNodes<T>, startId: string): T[] {
    const visited = new Set<string>();
    const result: T[] = [];
    const stack: string[] = [startId];

    while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (visited.has(currentId)) {
            continue;
        }

        const currentNode = nodes[currentId];
        if (!currentNode) {
            continue;
        }

        visited.add(currentId);
        result.push(currentNode);

        if (currentNode.nextId) {
            stack.push(currentNode.nextId);
        }
    }

    return result;
}

export function getReachableNodeIds<T extends GraphNode>(
    nodes: GraphNodes<T>,
    startId: string,
    excludeIds?: string[],
): Set<string> {
    const visited = new Set<string>();
    const excludeSet = new Set(excludeIds);
    const stack = excludeSet.has(startId) ? [] : [startId];

    while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (visited.has(currentId) || excludeSet.has(currentId)) {
            continue;
        }

        visited.add(currentId);

        const currentNode = nodes[currentId];
        if (!currentNode) {
            continue;
        }

        const nextIds = getNextIds(currentNode);

        const unvisitedNextIds = nextIds.difference(visited);
        unvisitedNextIds.forEach(id => stack.push(id));
    }

    return visited;
}

export function pruneGraph<T extends GraphNode>(
    nodes: GraphNodes<T>,
    startId: string,
    excludedIds?: string[],
): GraphNodes<T> {
    const reachableIds = getReachableNodeIds(nodes, startId, excludedIds);
    const reachable = new Set(reachableIds);
    const excluded = new Set(excludedIds);

    const prunedNodes: GraphNodes<T> = {};
    for (const id of reachable) {
        const node = nodes[id];

        if (!node) {
            continue;
        }

        const prunedNode = {...node};
        const {nextId, nextIds} = prunedNode;

        if (nextId && (!reachable.has(nextId) || excluded.has(nextId))) {
            delete prunedNode.nextId;
        }

        if (nextIds) {
            prunedNode.nextIds = nextIds.filter(nextId => reachable.has(nextId) && !excluded.has(nextId));
            const newNextId = prunedNode.nextIds.at(0);
            if (!prunedNode.nextId && newNextId) {
                prunedNode.nextId = newNextId;
            }
        }

        prunedNodes[id] = prunedNode;
    }

    return prunedNodes;
}

function getNextIds<T extends GraphNode>(node: T): Set<string> {
    const nextIds = new Set<string>(node.nextIds ?? []);
    if (node.nextId) {
        nextIds.add(node.nextId);
    }
    return nextIds;
}
