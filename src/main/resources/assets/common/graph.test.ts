import {getReachableNodeIds, GraphNode, GraphNodes, pruneGraph} from './graph';

describe('getReachableNodeIds', () => {
    it('should return only the start node if it has no next nodes', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a'},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a']));
    });

    it('should follow nextId links', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b'},
            b: {id: 'b', nextId: 'c'},
            c: {id: 'c'},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'b', 'c']));
    });

    it('should follow nextIds array', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextIds: ['b', 'c']},
            b: {id: 'b'},
            c: {id: 'c'},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'b', 'c']));
    });

    it('should handle cycles in the graph', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b'},
            b: {id: 'b', nextId: 'c'},
            c: {id: 'c', nextId: 'a'},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'b', 'c']));
    });

    it('should handle both nextId and nextIds', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b', nextIds: ['c', 'd']},
            b: {id: 'b'},
            c: {id: 'c'},
            d: {id: 'd'},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'b', 'c', 'd']));
    });

    it('should handle missing nodes gracefully', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b', nextIds: ['c']},
            c: {id: 'c'},
            // 'b' is missing
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'b', 'c']));
    });

    it('should return empty set for non-existent start node', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a'},
        };
        expect(getReachableNodeIds(nodes, 'non-existent')).toEqual(new Set(['non-existent']));
    });

    it('should respect excludeIds', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b'},
            b: {id: 'b', nextId: 'c'},
            c: {id: 'c', nextId: 'd'},
            d: {id: 'd'},
        };
        expect(getReachableNodeIds(nodes, 'a', ['b'])).toEqual(new Set(['a']));
        expect(getReachableNodeIds(nodes, 'a', ['c'])).toEqual(new Set(['a', 'b']));
    });

    it('should not include start node if it is excluded', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b'},
            b: {id: 'b'},
        };
        expect(getReachableNodeIds(nodes, 'a', ['a'])).toEqual(new Set([]));
    });
});

describe('pruneGraph', () => {
    it('should remove unreachable nodes', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b'},
            b: {id: 'b'},
            c: {id: 'c'},
        };
        expect(pruneGraph(nodes, 'a')).toEqual({
            a: {id: 'a', nextId: 'b'},
            b: {id: 'b'},
        });
    });

    it('should remove excluded nodes and update references', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b', nextIds: ['c']},
            b: {id: 'b'},
            c: {id: 'c'},
        };
        expect(pruneGraph(nodes, 'a', ['b'])).toEqual({
            a: {id: 'a', nextId: 'c', nextIds: ['c']},
            c: {id: 'c'},
        });
    });

    it('should handle cycles and remove nextIds when empty', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b', nextIds: ['b', 'c']},
            b: {id: 'b', nextId: 'a'},
            c: {id: 'c'},
        };
        expect(pruneGraph(nodes, 'a', ['b', 'c'])).toEqual({
            a: {id: 'a', nextIds: []},
        });
    });

    it('should keep nodes reachable from start node', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', nextId: 'b'},
            b: {id: 'b'},
            c: {id: 'c', nextId: 'b'},
        };
        expect(pruneGraph(nodes, 'a')).toEqual({
            a: {id: 'a', nextId: 'b'},
            b: {id: 'b'},
        });
    });

    it('should handle empty graph', () => {
        expect(pruneGraph({}, 'a')).toEqual({});
    });

    it('should handle graph with all nodes excluded', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a'},
            b: {id: 'b'},
        };
        expect(pruneGraph(nodes, 'a', ['a', 'b'])).toEqual({});
    });

    it('should handle non-existent start node', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a'},
            b: {id: 'b'},
        };
        expect(pruneGraph(nodes, 'non-existent')).toEqual({});
    });
});
