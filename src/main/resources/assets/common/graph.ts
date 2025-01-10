export type GraphNode = {
    [key: string]: unknown;
    id: string;
    prevId?: string;
    active: boolean;
    nextIds: string[];
};

export type GraphNodes<T extends GraphNode> = Record<string, T>;

export function flattenGraph<T extends GraphNode>(nodes: GraphNodes<T>, startId: string): T[] {
    const visited = new Set<string>();
    const result: T[] = [];
    let currentId: Optional<string> = startId;

    while (currentId != null) {
        const currentNode: T | undefined = nodes[currentId];

        if (visited.has(currentId) || !currentNode) {
            currentId = null;
            continue;
        }

        visited.add(currentId);
        result.push(currentNode);

        currentId = currentNode.nextIds.find(id => !visited.has(id) && nodes[id]?.active);
    }

    return result;
}

export function getReachableNodeIds<T extends GraphNode>(
    nodes: GraphNodes<T>,
    startId: string,
    excludeIds?: string[],
): Set<string> {
    const visited = new Set<string>();
    const excluded = new Set(excludeIds);
    const stack = excluded.has(startId) ? [] : [startId];

    while (stack.length > 0) {
        const currentId = stack.pop()!;
        if (visited.has(currentId) || excluded.has(currentId)) {
            continue;
        }

        const currentNode: T | undefined = nodes[currentId];
        if (!currentNode) {
            excluded.add(currentId);
            continue;
        }

        visited.add(currentId);

        const unvisitedNextIds = new Set(currentNode.nextIds).difference(visited);
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

    const prunedNodes: GraphNodes<T> = {};
    for (const id of reachable) {
        const node = nodes[id];

        if (!node) {
            continue;
        }

        const prunedNode = {...node};
        const {nextIds} = prunedNode;

        prunedNode.nextIds = nextIds.filter(nextId => reachable.has(nextId));

        prunedNodes[id] = prunedNode;
    }

    return prunedNodes;
}

export function getNextActiveNode<T extends GraphNode>(nodes: GraphNodes<T>, parentId: string): Optional<T> {
    const activeId = nodes[parentId]?.nextIds.find(id => nodes[id]?.active);
    return activeId ? nodes[activeId] : null;
}
