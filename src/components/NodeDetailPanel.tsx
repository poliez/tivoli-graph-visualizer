import React from 'react';
import type {GraphNode} from '../types';

type NodeDetailPanelProps = {
    node: GraphNode;
};

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({node}) => {
    return <div>NodeDetailPanel Component - Info per: {node.name}</div>;
};

export default NodeDetailPanel;
