import React from 'react';
import type {GraphData, GraphNode} from '../types';

type GraphViewerProps = {
    data: GraphData;
    onNodeClick: (node: GraphNode | null) => void;
};

const GraphViewer: React.FC<GraphViewerProps> = ({data, onNodeClick}) => {
    return <div>GraphViewer Component - Nodi: {data.nodes.length}, Archi: {data.links.length}</div>;
};

export default GraphViewer;
