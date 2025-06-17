import React from 'react';
import type {GraphNode} from '../types';

type NodeDetailPanelProps = {
    node: GraphNode;
    onClose: () => void; // Aggiungiamo una funzione per chiudere il pannello
};

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({node, onClose}) => {
    // Escludiamo le proprietà usate da D3 per non mostrarle come metadati
    const metadataToShow = Object.entries(node.metadata).filter(
        ([key]) => !['x', 'y', 'vx', 'vy', 'fx', 'fy', 'index'].includes(key)
    );

    return (
        <div className="node-detail-panel">
            <div className="panel-header">
                <h3>Dettagli: {node.name}</h3>
                <button onClick={onClose} className="close-btn">×</button>
            </div>
            <div className="panel-content">
                <dl>
                    {metadataToShow.map(([key, value]) => (
                        <React.Fragment key={key}>
                            <dt>{key}</dt>
                            <dd>{String(value) || 'N/D'}</dd>
                        </React.Fragment>
                    ))}
                </dl>
            </div>
        </div>
    );
};

export default NodeDetailPanel;
