import {useEffect, useState} from 'react';
import type {GraphData, GraphNode} from './types';
import './App.css';

import {filterGraph, processFilesToGraphData} from './services/graphProcessor';

import FileUploader from './components/FileUploader';
import GraphViewer from './components/GraphViewer';
import NodeDetailPanel from './components/NodeDetailPanel';
import SearchBar from './components/SearchBar';

function App() {
    const [fullGraphData, setFullGraphData] = useState<GraphData | null>(null);
    const [filteredGraphData, setFilteredGraphData] = useState<GraphData | null>(null);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Nuovo stato per gestire il feedback durante l'elaborazione
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFilesLoad = async (files: any) => {
        setIsProcessing(true);
        setError(null);
        try {
            // Aspettiamo il risultato del nostro processor
            const graphData = await processFilesToGraphData(files);
            setFullGraphData(graphData);
            setFilteredGraphData(graphData); // Inizialmente il grafo filtrato è quello completo
        } catch (err: any) {
            console.error(err);
            setError('Errore durante l\'elaborazione dei file. Controlla la console per i dettagli.');
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (!fullGraphData) return;
        const filtered = filterGraph(fullGraphData, searchTerm);
        setFilteredGraphData(filtered);
    }, [searchTerm, fullGraphData]); // Si attiva se cambia il termine di ricerca o il grafo principale


    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Tivoli Workload Graph Visualizer</h1>
            </header>
            <main className="app-main">
                <div className="controls-panel">
                    <FileUploader onFilesLoaded={handleFilesLoad} isProcessing={isProcessing}/>
                    {error && <div className="error-message">{error}</div>}
                    {/* La barra di ricerca ora è sempre visibile quando c'è un grafo */}
                    {fullGraphData && <SearchBar onSearch={setSearchTerm}/>}
                    {/* Passiamo la funzione per chiudere il pannello */}
                    {selectedNode && <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)}/>}
                </div>
                <div className="graph-panel">
                    {isProcessing ? (
                        <div className="placeholder">Elaborazione in corso...</div>
                    ) : filteredGraphData ? (
                        // Passiamo anche `searchTerm` per l'highlighting
                        <GraphViewer data={filteredGraphData} onNodeClick={setSelectedNode} searchTerm={searchTerm}/>
                    ) : (
                        <div className="placeholder">
                            {error ? 'Processo fallito.' : 'Carica i file CSV per generare il grafo.'}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
