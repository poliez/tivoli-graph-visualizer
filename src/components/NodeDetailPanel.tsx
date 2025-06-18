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
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="m-0 text-xl font-semibold text-gray-800 break-all">Dettagli: {node.name}</h3>
                <button onClick={onClose} className="bg-transparent border-none text-2xl cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
                    ×
                </button>
            </div>
            <div className="space-y-4">
                <dl className="space-y-3">
                    {metadataToShow.map(([key, value]) => (
                        <div key={key}>
                            <dt className="font-bold text-gray-600 text-sm">{key}</dt>
                            <dd className="ml-0 text-gray-800 break-words bg-gray-100 p-2 rounded text-sm mt-1">
                                {String(value) || 'N/D'}
                            </dd>
                        </div>
                    ))}
                </dl>

                {externalDependencies.length > 0 && (
                    <div className="mt-6">
                        <h4 className="m-0 text-gray-800 border-b-2 border-blue-500 pb-1 mb-3">Dipendenze Esterne</h4>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-sm">
                                <thead>
                                    <tr>
                                        <th className="text-left p-2 border-b-2 border-gray-300 font-bold bg-gray-50">Nome Job</th>
                                        <th className="text-left p-2 border-b-2 border-gray-300 font-bold bg-gray-50">Descrizione</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {externalDependencies.map(dep => (
                                        <tr key={dep.id}>
                                            <td className="p-2 border-b border-gray-200 align-top font-semibold">
                                                {dep.name}
                                            </td>
                                            <td className="p-2 border-b border-gray-200 align-top text-gray-600">
                                                {dep.hasAdditionalDetails && dep.metadata['Descrizione'] 
                                                    ? dep.metadata['Descrizione'] 
                                                    : 'N/D'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NodeDetailPanel;
