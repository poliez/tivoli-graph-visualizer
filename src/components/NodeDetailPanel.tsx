import React from 'react';
import type {GraphNode, GraphData} from '../types';

type NodeDetailPanelProps = {
    node: GraphNode;
    graphData: GraphData;
    onClose: () => void; // Aggiungiamo una funzione per chiudere il pannello
};

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({node, graphData, onClose}) => {
    // Escludiamo le proprietà usate da D3 per non mostrarle come metadati
    const metadataToShow = Object.entries(node.metadata).filter(
        ([key]) => !['x', 'y', 'vx', 'vy', 'fx', 'fy', 'index'].includes(key)
    );

    // Trova tutte le dipendenze esterne direttamente connesse al nodo selezionato
    const externalDependencies = graphData.nodes.filter(n => 
        n.type === 'external' && 
        graphData.links.some(link => 
            (link.source === node.id && link.target === n.id) || 
            (link.source === n.id && link.target === node.id)
        )
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

                {externalDependencies.length > 0 && (
                    <div className="external-dependencies">
                        <h4>Dipendenze Esterne</h4>
                        <ul className="dependency-list">
                            {externalDependencies.map(dep => (
                                <li key={dep.id} className="dependency-item">
                                    {dep.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NodeDetailPanel;
