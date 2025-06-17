import {useEffect, useState} from 'react';
import type {GraphData, GraphNode} from './types';
import './App.css';

import {buildGraphFromParsedData, extractAllNodeNames, filterGraph, getCurrentNetName, parseAllFiles} from './services/graphProcessor';

import FileUploader from './components/FileUploader';
import GraphViewer from './components/GraphViewer';
import NodeDetailPanel from './components/NodeDetailPanel';
import SearchBar from './components/SearchBar';
import ExclusionSelector from "./components/ExclusionSelector.tsx";

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
    // STATI PER LA FASE 1: PARSING
    const [parsedData, setParsedData] = useState<Record<string, any[]> | null>(null);
    const [allNodeNames, setAllNodeNames] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    // STATI PER LA FASE 2: CONFIGURAZIONE E GENERAZIONE
    const [excludedNodes, setExcludedNodes] = useState<Set<string>>(new Set(['BNRUN']));
    const [fullGraphData, setFullGraphData] = useState<GraphData | null>(null);
    const [filteredGraphData, setFilteredGraphData] = useState<GraphData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // STATI PER L'INTERAZIONE
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<FileList | null>(null);

    // FASE 1: L'utente carica i file, noi li parsiamo subito
    const handleFilesSelected = async (files: FileList) => {
        setIsParsing(true);
        setError(null);
        setParsedData(null);
        setAllNodeNames([]);
        setFullGraphData(null); // Resetta tutto
        setFiles(files); // Salva i file per uso futuro

        try {
            const classifiedFiles: InputFiles = {}; // La tua logica di classificazione file va qui
            Array.from(files).forEach(file => {
                for (const keyword in fileTypeKeywords) {
                    if (file.name.includes(keyword)) {
                        const fileType = fileTypeKeywords[keyword];
                        classifiedFiles[fileType] = file;
                        break; // Trovato, passa al prossimo file
                    }
                }
            });
            const data = await parseAllFiles(classifiedFiles);
            setParsedData(data);
            setAllNodeNames(extractAllNodeNames(data));
        } catch (err: any) {
            setError(err.message || 'Errore durante il parsing dei file.');
        } finally {
            setIsParsing(false);
        }
    };

    // FASE 2: L'utente ha configurato le esclusioni e clicca "Genera"
    const handleGenerateGraph = () => {
        if (!parsedData) return;
        setIsGenerating(true);
        setError(null);

        try {
            const currentNetName = getCurrentNetName(files[0]);
            const graph = buildGraphFromParsedData(parsedData, currentNetName, excludedNodes);
            setFullGraphData(graph);
            setFilteredGraphData(graph);
        } catch (err: any) {
            setError(err.message || 'Errore durante la generazione del grafo.');
        } finally {
            setIsGenerating(false);
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
                    <div className="control-group">
                        <h4>1. Carica File</h4>
                        <FileUploader onFilesSelected={handleFilesSelected}/>
                    </div>

                    {isParsing && <p>Analisi file in corso...</p>}

                    {allNodeNames.length > 0 && (
                        <>
                            <div className="control-group">
                                <h4>2. Configura Esclusioni</h4>
                                <ExclusionSelector
                                    allNodeNames={allNodeNames}
                                    initialExclusions={excludedNodes}
                                    onExclusionChange={setExcludedNodes}
                                />
                            </div>
                            <div className="control-group">
                                <h4>3. Genera Grafo</h4>
                                <button onClick={handleGenerateGraph} disabled={isGenerating} className="generate-button">
                                    {isGenerating ? 'Generazione...' : 'Genera Grafo'}
                                </button>
                            </div>
                        </>
                    )}

                    {fullGraphData && (
                        <div className="control-group">
                            <h4>Filtra Grafo</h4>
                            <SearchBar onSearch={setSearchTerm}/>
                        </div>
                    )}
                </div>
            </header>

            <main className="app-main">
                <div className="graph-panel">
                    {isParsing || isGenerating ? (
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
