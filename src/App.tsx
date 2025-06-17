import {useEffect, useMemo, useState} from 'react';
import type {GraphData, GraphNode} from './types';
import './App.css';

import {filterGraph, processFilesToGraphData} from './services/graphProcessor';

import FileUploader from './components/FileUploader';
import GraphViewer from './components/GraphViewer';
import NodeDetailPanel from './components/NodeDetailPanel';
import SearchBar from './components/SearchBar';

// Definiamo una mappa per riconoscere i file
const fileTypeKeywords: Record<string, keyof InputFiles> = {
    'Operazioni': 'operations',
    'Relazioni Interne': 'internalRels',
    'Relazioni Esterne Predecessori': 'externalPreds',
    'Relazioni Esterne Successori': 'externalSuccs',
    'Operator Instructions': 'operatorInstructions',
};

// L'interfaccia per i file che ci aspettiamo (spostiamola qui o in types)
interface InputFiles {
    operations?: File;
    internalRels?: File;
    externalPreds?: File;
    externalSuccs?: File;
    operatorInstructions?: File;
}

function App() {
    const [selectedFiles, setSelectedFiles] = useState<InputFiles>({});
    const [fullGraphData, setFullGraphData] = useState<GraphData | null>(null);
    const [filteredGraphData, setFilteredGraphData] = useState<GraphData | null>(null);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    // Nuovo stato per gestire il feedback durante l'elaborazione
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Classifica i file quando vengono selezionati
    const handleFilesSelected = (files: FileList) => {
        const classifiedFiles: InputFiles = {};
        Array.from(files).forEach(file => {
            for (const keyword in fileTypeKeywords) {
                if (file.name.includes(keyword)) {
                    const fileType = fileTypeKeywords[keyword];
                    classifiedFiles[fileType] = file;
                    break; // Trovato, passa al prossimo file
                }
            }
        });
        setSelectedFiles(classifiedFiles);
    };

    // Controlla se i file necessari sono stati caricati
    const areRequiredFilesPresent = useMemo(() => {
        return selectedFiles.operations && selectedFiles.internalRels && selectedFiles.externalPreds && selectedFiles.externalSuccs;
    }, [selectedFiles]);

    const handleGenerateGraph = async () => {
        if (!areRequiredFilesPresent) return;
        setIsProcessing(true);
        setError(null);
        try {
            const graphData = await processFilesToGraphData(selectedFiles);
            setFullGraphData(graphData);
            setFilteredGraphData(graphData);
            setSelectedFiles({}); // Resetta i file dopo la generazione
        } catch (err: any) {
            console.error(err);
            setError('Errore durante l\'elaborazione dei file. Controlla la console.');
        } finally {
            setIsProcessing(false);
        }
    };

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
            <header className="app-controls-header">
                <h1>Tivoli Workload Graph Visualizer</h1>
                <div className="controls-container">
                    <FileUploader onFilesSelected={handleFilesSelected}/>
                    <button onClick={handleGenerateGraph} disabled={!areRequiredFilesPresent || isProcessing}>
                        {isProcessing ? 'Elaborazione...' : 'Genera Grafo'}
                    </button>
                    {fullGraphData && <SearchBar onSearch={setSearchTerm}/>}
                </div>
            </header>

            {/* Il layout principale ora è più semplice */}
            <main className="app-main">
                <div className="graph-panel">
                    {isProcessing ? (
                        <div className="placeholder">Elaborazione in corso...</div>
                    ) : filteredGraphData ? (
                        <GraphViewer data={filteredGraphData} onNodeClick={setSelectedNode} searchTerm={searchTerm}/>
                    ) : (
                        <div className="placeholder">
                            {error ? `Errore: ${error}` : 'Carica i file e clicca "Genera Grafo"'}
                        </div>
                    )}
                </div>

                {/* Il pannello dei dettagli ora è un overlay controllato dallo stato `selectedNode` */}
                <div className={`node-detail-sidebar ${selectedNode ? 'open' : ''}`}>
                    {selectedNode && <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)}/>}
                </div>
            </main>
        </div>
    );
}

export default App;
