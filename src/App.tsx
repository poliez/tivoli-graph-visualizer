import {useEffect, useState} from 'react';
import type {GraphData, GraphNode, ParsedData} from './types';
import './App.css';

import {buildGraphFromParsedData, extractAllNodeNames, extractOperationTypes, filterGraph, getCurrentNetName, parseAllFiles} from './services/graphProcessor';

import FileUploader from './components/FileUploader';
import GraphViewer from './components/GraphViewer';
import NodeDetailPanel from './components/NodeDetailPanel';
import SearchBar from './components/SearchBar';
import ExclusionSelector from "./components/ExclusionSelector.tsx";
import OperationTypeFilter from "./components/OperationTypeFilter";

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
    const [parsedData, setParsedData] = useState<ParsedData | null>(null);
    const [allNodeNames, setAllNodeNames] = useState<string[]>([]);
    const [operationTypes, setOperationTypes] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);

    // STATI PER LA FASE 2: CONFIGURAZIONE E GENERAZIONE
    const [excludedNodes, setExcludedNodes] = useState<Set<string>>(new Set());
    const [selectedOperationTypes, setSelectedOperationTypes] = useState<Set<string>>(new Set());
    const [includeUnknownTypes, setIncludeUnknownTypes] = useState(false);
    const [fullGraphData, setFullGraphData] = useState<GraphData | null>(null);
    const [filteredGraphData, setFilteredGraphData] = useState<GraphData | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // STATI PER L'INTERAZIONE
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [files, setFiles] = useState<FileList | null>(null);
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [currentNetName, setCurrentNetName] = useState<string | null>(null);

    // FASE 1: L'utente carica i file, noi li parsiamo subito
    const handleFilesSelected = async (files: FileList) => {
        setIsParsing(true);
        setError(null);
        setParsedData(null);
        setAllNodeNames([]);
        setOperationTypes([]);
        setFullGraphData(null); // Resetta tutto
        setCurrentNetName(null); // Resetta il nome del Net
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

            // Estrai i tipi di operazione e inizializza il set dei tipi selezionati
            const types = extractOperationTypes(data);
            setOperationTypes(types);
            setSelectedOperationTypes(new Set(types)); // Inizialmente, seleziona tutti i tipi
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Errore durante il parsing dei file.';
            setError(errorMessage);
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
            // @ts-expect-error non è possibile che i file siano null qui, ma TypeScript non lo sa
            const netName = getCurrentNetName(files[0]);
            setCurrentNetName(netName);
            const graph = buildGraphFromParsedData(parsedData, netName, excludedNodes, selectedOperationTypes, includeUnknownTypes);
            setFullGraphData(graph);
            setFilteredGraphData(graph);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Errore durante la generazione del grafo.';
            setError(errorMessage);
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
            <header className={`app-controls-header ${isHeaderCollapsed ? 'collapsed' : ''}`}>
                <div className="header-title-row">
                    <h1>Tivoli Workload Graph Visualizer {currentNetName && ` - Net: ${currentNetName}`}</h1>
                    <button 
                        className="collapse-toggle-btn" 
                        onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                    >
                        {isHeaderCollapsed ? '▼' : '▲'}
                    </button>
                </div>
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
                                <h4>3. Filtra per Tipo</h4>
                                <OperationTypeFilter
                                    operationTypes={operationTypes}
                                    selectedTypes={selectedOperationTypes}
                                    onTypeChange={setSelectedOperationTypes}
                                    includeUnknownTypes={includeUnknownTypes}
                                    onIncludeUnknownTypesChange={setIncludeUnknownTypes}
                                />
                            </div>
                            <div className="control-group">
                                <h4>4. Genera Grafo</h4>
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
                    {selectedNode && filteredGraphData && <NodeDetailPanel node={selectedNode} graphData={filteredGraphData} onClose={() => setSelectedNode(null)}/>}
                </div>
            </main>
        </div>
    );
}

export default App;
