import * as d3 from 'd3';

// L'interfaccia per i nostri nodi.
// Estende d3.SimulationNodeDatum per essere compatibile
// con la simulazione di D3, che aggiungerà proprietà come x, y, vx, vy.
interface GraphNode extends d3.SimulationNodeDatum {
    id: string; // ID univoco, es: "BR401_DUMMY_JOB" o "EXT_NET/EXT_JOB"
    name: string; // Il nome visualizzato, es: "DUMMY_JOB"
    type: 'internal' | 'external';
    metadata: Record<string, any>; // Un contenitore per tutte le altre info
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

export type {GraphNode, GraphLink, GraphData};
