import {getReachableNodeIds, GraphNode, GraphNodes, pruneGraph} from './graph';

describe('getReachableNodeIds', () => {
    it('should return only the start node if it has no next nodes', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: []},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a']));
    });

    it('should follow nextIds links', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b']},
            b: {id: 'b', active: true, nextIds: ['c']},
            c: {id: 'c', active: true, nextIds: []},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'b', 'c']));
    });

    it('should follow multiple nextIds', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b', 'c']},
            b: {id: 'b', active: true, nextIds: []},
            c: {id: 'c', active: true, nextIds: []},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'b', 'c']));
    });

    it('should handle cycles in the graph', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b']},
            b: {id: 'b', active: true, nextIds: ['c']},
            c: {id: 'c', active: true, nextIds: ['a']},
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'b', 'c']));
    });

    it('should handle missing nodes gracefully', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b', 'c']},
            c: {id: 'c', active: true, nextIds: []},
            // 'b' is missing
        };
        expect(getReachableNodeIds(nodes, 'a')).toEqual(new Set(['a', 'c']));
    });

    it('should return empty set for non-existent start node', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: []},
        };
        expect(getReachableNodeIds(nodes, 'non-existent')).toEqual(new Set());
    });

    it('should respect excludeIds', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b']},
            b: {id: 'b', active: true, nextIds: ['c']},
            c: {id: 'c', active: true, nextIds: ['d']},
            d: {id: 'd', active: true, nextIds: []},
        };
        expect(getReachableNodeIds(nodes, 'a', ['b'])).toEqual(new Set(['a']));
        expect(getReachableNodeIds(nodes, 'a', ['c'])).toEqual(new Set(['a', 'b']));
    });

    it('should not include start node if it is excluded', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b']},
            b: {id: 'b', active: true, nextIds: []},
        };
        expect(getReachableNodeIds(nodes, 'a', ['a'])).toEqual(new Set([]));
    });
});

describe('pruneGraph', () => {
    it('should remove unreachable nodes', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b']},
            b: {id: 'b', active: true, nextIds: []},
            c: {id: 'c', active: true, nextIds: []},
        };
        expect(pruneGraph(nodes, 'a')).toEqual({
            a: {id: 'a', active: true, nextIds: ['b']},
            b: {id: 'b', active: true, nextIds: []},
        });
    });

    it('should remove excluded nodes and update references', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b', 'c']},
            b: {id: 'b', active: true, nextIds: []},
            c: {id: 'c', active: true, nextIds: []},
        };
        expect(pruneGraph(nodes, 'a', ['b'])).toEqual({
            a: {id: 'a', active: true, nextIds: ['c']},
            c: {id: 'c', active: true, nextIds: []},
        });
    });

    it('should handle cycles', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b', 'c']},
            b: {id: 'b', active: true, nextIds: ['a']},
            c: {id: 'c', active: true, nextIds: []},
        };
        expect(pruneGraph(nodes, 'a', ['b', 'c'])).toEqual({
            a: {id: 'a', active: true, nextIds: []},
        });
    });

    it('should keep nodes reachable from start node', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: ['b']},
            b: {id: 'b', active: true, nextIds: []},
            c: {id: 'c', active: true, nextIds: ['b']},
        };
        expect(pruneGraph(nodes, 'a')).toEqual({
            a: {id: 'a', active: true, nextIds: ['b']},
            b: {id: 'b', active: true, nextIds: []},
        });
    });

    it('should handle empty graph', () => {
        expect(pruneGraph({}, 'a')).toEqual({});
    });

    it('should handle graph with all nodes excluded', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: []},
            b: {id: 'b', active: true, nextIds: []},
        };
        expect(pruneGraph(nodes, 'a', ['a', 'b'])).toEqual({});
    });

    it('should handle non-existent start node', () => {
        const nodes: GraphNodes<GraphNode> = {
            a: {id: 'a', active: true, nextIds: []},
            b: {id: 'b', active: true, nextIds: []},
        };
        expect(pruneGraph(nodes, 'non-existent')).toEqual({});
    });
});
