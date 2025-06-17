// src/services/graphProcessor.ts

import Papa from 'papaparse';
import type {GraphData, GraphLink, GraphNode} from '../types';

// Un'interfaccia per i file che ci aspettiamo
interface InputFiles {
    operations?: File;
    internalRels?: File;
    externalPreds?: File;
    externalSuccs?: File;
    operatorInstructions?: File;
}

// NUOVA funzione helper per estrarre il nome del Net
export function getCurrentNetName(file: File): string {
    const match = file.name.match(/NET - (.*?) -/);
    return match[1];
}

// Funzione helper per "promisificare" il parsing di PapaParse
function parseCsv<T>(file: File): Promise<T[]> {
    return new Promise((resolve, reject) => {
        Papa.parse<T>(file, {
            header: true, // Tratta la prima riga come header
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error) => reject(error),
        });
    });
}

// NUOVA FUNZIONE DI SOLO PARSING
export async function parseAllFiles(inputFiles: InputFiles): Promise<Record<string, any[]>> {
    const {operations, internalRels, externalPreds, externalSuccs, operatorInstructions} = inputFiles;

    if (!operations || !internalRels || !externalPreds || !externalSuccs) {
        throw new Error('Uno o più file richiesti non sono stati forniti.');
    }

    const [opData, internalRelsData, externalPredsData, externalSuccsData, opInstructionsData] = await Promise.all([
        parseCsv<any>(operations),
        parseCsv<any>(internalRels),
        parseCsv<any>(externalPreds),
        parseCsv<any>(externalSuccs),
        operatorInstructions ? parseCsv<any>(operatorInstructions) : Promise.resolve(null as unknown as any[]),
    ]);

    return {opData, internalRelsData, externalPredsData, externalSuccsData, opInstructionsData};
}

// NUOVA FUNZIONE per estrarre tutti i nomi unici dei job dai dati parsati
export function extractAllNodeNames(parsedData: Record<string, any[]>): string[] {
    const nodeNames = new Set<string>();

    parsedData.opData?.forEach(row => row['Nome Job'] && nodeNames.add(row['Nome Job']));
    parsedData.internalRelsData?.forEach(row => row['Nome Job Predecessore'] && nodeNames.add(row['Nome Job Predecessore']));
    parsedData.externalPredsData?.forEach(row => row['Nome Job Predecessore'] && nodeNames.add(row['Nome Job Predecessore']));
    parsedData.externalSuccsData?.forEach(row => row['Nome Job Successore'] && nodeNames.add(row['Nome Job Successore']));

    return Array.from(nodeNames).sort();
}

// processFilesToGraphData ORA ACCETTA I DATI GIÀ PARSATI
export function buildGraphFromParsedData(
    parsedData: Record<string, any[]>,
    currentNetName: string,
    exclusionSet: Set<string>
): GraphData {
    const {opData, internalRelsData, externalPredsData, externalSuccsData, opInstructionsData} = parsedData;

    // La logica da qui in poi è quasi identica a prima, ma usa i dati passati come argomento
    const nodes = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // PASSO 2: Creazione dei nodi interni.
    opData.forEach((row) => {
        const jobName = row['Nome Job'].trim();
        if (!jobName || exclusionSet.has(jobName)) return;

        const node: GraphNode = {
            id: jobName,
            name: jobName,
            type: 'internal',
            metadata: {...row},
        };
        nodes.set(jobName, node);
    });

    // PASSO 3: Arricchimento dei nodi con le "Operator Instructions" (se presenti)
    if (opInstructionsData) {
        opInstructionsData.forEach((row) => {
            const jobName = row['Nome Job'].trim();
            const existingNode = nodes.get(jobName);
            if (existingNode) {
                existingNode.metadata['Istruzioni'] = row['Istruzioni'];
            }
        });
    }

    // Funzione helper per creare nodi esterni se non esistono già
    const addExternalNode = (jobName: string, netName: string) => {
        const externalId = `${netName}/${jobName}`;
        if (!nodes.has(externalId)) {
            nodes.set(externalId, {
                id: externalId,
                name: jobName,
                type: 'external',
                metadata: {'Rete Esterna': netName}
            });
        }
        return externalId;
    }

    // PASSO 4: Creazione degli archi e dei nodi esterni.
    // La logica di esclusione è già stata applicata ai nodi interni,
    // quindi gli archi verso/da essi verranno scartati dal controllo `nodes.has()`.

    // 4a: Relazioni interne
    internalRelsData.forEach((row) => {
        const source = row['Nome Job Predecessore'];
        const target = row['Nome Job'];
        // Se source o target sono stati esclusi, `nodes.has` sarà false e l'arco verrà saltato.
        if (source && target && nodes.has(source) && nodes.has(target)) {
            links.push({source, target});
        }
    });

    // 4b: Relazioni esterne predecessori (archi entranti)
    externalPredsData.forEach((row) => {
        const sourceNet = row['Net Predecessore'];
        // NUOVO: Ignora se è una dipendenza interna mascherata da esterna
        if (sourceNet === currentNetName) return;

        const sourceName = row['Nome Job Predecessore'];
        const target = row['Nome Job'];
        if (exclusionSet.has(sourceName)) return; // Ignora se il predecessore è in lista

        if (sourceName && sourceNet && target && nodes.has(target)) {
            const sourceId = addExternalNode(sourceName, sourceNet);
            links.push({source: sourceId, target});
        }
    });

    // 4c: Relazioni esterne successori (archi uscenti)
    externalSuccsData.forEach((row) => {
        const targetNet = row['Net Successore'];
        // NUOVO: Ignora se è una dipendenza interna mascherata da esterna
        if (targetNet === currentNetName) return;

        const source = row['Nome Job'];
        const targetName = row['Nome Job Successore'];
        if (exclusionSet.has(targetName)) return; // Ignora se il successore è in lista

        if (source && targetName && targetNet && nodes.has(source)) {
            const targetId = addExternalNode(targetName, targetNet);
            links.push({source, target: targetId});
        }
    });

    return {nodes: Array.from(nodes.values()), links};
}

export function filterGraph(fullGraph: GraphData, searchId: string): GraphData {
    if (!searchId) {
        return fullGraph; // Se la ricerca è vuota, restituisci il grafo completo
    }

    const {nodes, links} = fullGraph;
    const reachableNodes = new Set<string>();
    const nodesToVisit: string[] = [];

    // Mappe di adiacenza per una ricerca efficiente
    const successors = new Map<string, string[]>();
    const predecessors = new Map<string, string[]>();

    links.forEach(({source, target}) => {
        const sourceId = typeof source === 'object' ? source.id : source;
        const targetId = typeof target === 'object' ? target.id : target;

        if (!successors.has(sourceId)) successors.set(sourceId, []);
        successors.get(sourceId)!.push(targetId);

        if (!predecessors.has(targetId)) predecessors.set(targetId, []);
        predecessors.get(targetId)!.push(sourceId);
    });

    // Controlla se il nodo cercato esiste
    const startNode = nodes.find(n => n.id === searchId);
    if (!startNode) {
        return {nodes: [], links: []}; // Nodo non trovato, restituisci un grafo vuoto
    }

    // PASSO 1: Trova tutti i nodi raggiungibili (successori e predecessori)
    nodesToVisit.push(startNode.id);
    reachableNodes.add(startNode.id);

    let i = 0;
    // Visita in avanti (successori)
    while (i < nodesToVisit.length) {
        const currentNodeId = nodesToVisit[i++];
        const nextNodes = successors.get(currentNodeId) || [];
        for (const nextNodeId of nextNodes) {
            if (!reachableNodes.has(nextNodeId)) {
                reachableNodes.add(nextNodeId);
                nodesToVisit.push(nextNodeId);
            }
        }
    }

    // Visita all'indietro (predecessori)
    // Riusiamo lo stesso array, ripartendo dal nodo iniziale
    nodesToVisit.length = 1;
    i = 0;
    while (i < nodesToVisit.length) {
        const currentNodeId = nodesToVisit[i++];
        const prevNodes = predecessors.get(currentNodeId) || [];
        for (const prevNodeId of prevNodes) {
            if (!reachableNodes.has(prevNodeId)) {
                reachableNodes.add(prevNodeId);
                nodesToVisit.push(prevNodeId);
            }
        }
    }

    // PASSO 2: Filtra nodi e archi originali in base ai nodi raggiungibili
    const filteredNodes = nodes.filter(n => reachableNodes.has(n.id));
    const filteredLinks = links.filter(l => {
        const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const targetId = typeof l.target === 'object' ? l.target.id : l.target;
        return reachableNodes.has(sourceId) && reachableNodes.has(targetId);
    });

    return {nodes: filteredNodes, links: filteredLinks};
}
