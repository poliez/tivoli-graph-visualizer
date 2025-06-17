// src/App.tsx

import {useState} from 'react';
import type {GraphData, GraphNode} from './types';
import './App.css';

// Importiamo i componenti che abbiamo creato (per ora vuoti)
import FileUploader from './components/FileUploader';
import GraphViewer from './components/GraphViewer';
import NodeDetailPanel from './components/NodeDetailPanel';
import SearchBar from './components/SearchBar';

function App() {
    // Stato per i dati completi del grafo, non verrà mai modificato dopo il parsing
    const [fullGraphData, setFullGraphData] = useState<GraphData | null>(null);

    // Stato per i dati filtrati da mostrare (inizialmente uguali a quelli completi)
    const [filteredGraphData, setFilteredGraphData] = useState<GraphData | null>(null);

    // Stato per il nodo attualmente selezionato con un click
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

    // Stato per il termine di ricerca
    const [searchTerm, setSearchTerm] = useState<string>('');

    const handleFilesLoad = (files: File[]) => {
        // QUI, nel prossimo passo, chiameremo il nostro graphProcessor
        console.log('File caricati, pronto per il parsing:', files);
        // setFullGraphData(...)
        // setFilteredGraphData(...)
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Tivoli Workload Graph Visualizer</h1>
            </header>
            <main className="app-main">
                <div className="controls-panel">
                    <FileUploader onFilesLoaded={handleFilesLoad}/>
                    {fullGraphData && <SearchBar onSearch={setSearchTerm}/>}
                    {selectedNode && <NodeDetailPanel node={selectedNode}/>}
                </div>
                <div className="graph-panel">
                    {filteredGraphData ? (
                        <GraphViewer data={filteredGraphData} onNodeClick={setSelectedNode}/>
                    ) : (
                        <div className="placeholder">
                            Carica i file CSV per generare il grafo.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
