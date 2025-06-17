import * as d3 from 'd3';

// Interfacce per i dati CSV
// Operazioni (job)
interface OperationData {
    'Nome Job': string;
    'Tipo': 'JOB' | 'LOG' | 'JOBZC' | string;
    [key: string]: string | number | boolean; // Altri campi possibili
}

// Relazioni interne
interface InternalRelationData {
    'Nome Job Predecessore': string;
    'Nome Job': string;
    [key: string]: string | number | boolean; // Altri campi possibili
}

// Predecessori esterni
interface ExternalPredecessorData {
    'Net Predecessore': string;
    'Nome Job Predecessore': string;
    'Nome Job': string;
    [key: string]: string | number | boolean; // Altri campi possibili
}

// Successori esterni
interface ExternalSuccessorData {
    'Net Successore': string;
    'Nome Job': string;
    'Nome Job Successore': string;
    [key: string]: string | number | boolean; // Altri campi possibili
}

// Istruzioni operatore
interface OperatorInstructionData {
    'Nome Job': string;
    'Istruzioni': string;
    [key: string]: string | number | boolean; // Altri campi possibili
}

// Tipo per i dati parsati
interface ParsedData {
    opData: OperationData[];
    internalRelsData: InternalRelationData[];
    externalPredsData: ExternalPredecessorData[];
    externalSuccsData: ExternalSuccessorData[];
    opInstructionsData?: OperatorInstructionData[];
}

// L'interfaccia per i nostri nodi.
// Estende d3.SimulationNodeDatum per essere compatibile
// con la simulazione di D3, che aggiungerà proprietà come x, y, vx, vy.
interface GraphNode extends d3.SimulationNodeDatum {
    id: string; // ID univoco, es: "BR401_DUMMY_JOB" o "EXT_NET/EXT_JOB"
    name: string; // Il nome visualizzato, es: "DUMMY_JOB"
    type: 'internal' | 'external';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: Record<string, any>; // Un contenitore per tutte le altre info che può contenere campi dinamici dai CSV
}

// L'interfaccia per i nostri archi.
// d3.SimulationLinkDatum si aspetta source e target, che possono essere
// l'oggetto nodo completo o solo il suo ID stringa.
interface GraphLink {
    source: string; // ID del nodo di partenza
    target: string; // ID del nodo di arrivo
}

// L'oggetto completo che rappresenta il nostro grafo
interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

export type {
    GraphNode, 
    GraphLink, 
    GraphData, 
    OperationData, 
    InternalRelationData, 
    ExternalPredecessorData, 
    ExternalSuccessorData, 
    OperatorInstructionData,
    ParsedData
};
