// src/services/graphProcessor.ts

import Papa from 'papaparse';
import type {
    ExternalPredecessorData,
    ExternalSuccessorData,
    GraphData,
    GraphLink,
    GraphNode,
    InternalRelationData,
    OperationData,
    OperatorInstructionData,
    ParsedData
} from '../types';

// Un'interfaccia per i file che ci aspettiamo
interface InputFiles {
    operations?: File;
    internalRels?: File;
    externalPreds?: File;
    externalSuccs?: File;
    operatorInstructions?: File;
    additionalExternalFiles?: File[]; // File aggiuntivi con dettagli sulle dipendenze esterne
}

// NUOVA funzione helper per estrarre il nome del Net
export function getCurrentNetName(file: File): string {
    const match = file.name.match(/NET - (.*?) -/);
    if (!match) {
        throw new Error(`Impossibile estrarre il nome del Net dal file: ${file.name}`);
    }
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
export async function parseAllFiles(inputFiles: InputFiles): Promise<ParsedData> {
    const {
        operations,
        internalRels,
        externalPreds,
        externalSuccs,
        operatorInstructions,
        additionalExternalFiles
    } = inputFiles;

    if (!operations || !internalRels || !externalPreds || !externalSuccs) {
        throw new Error('Uno o più file richiesti non sono stati forniti.');
    }

    const [opData, internalRelsData, externalPredsData, externalSuccsData, opInstructionsData] = await Promise.all([
        parseCsv<OperationData>(operations),
        parseCsv<InternalRelationData>(internalRels),
        parseCsv<ExternalPredecessorData>(externalPreds),
        parseCsv<ExternalSuccessorData>(externalSuccs),
        operatorInstructions
            ? parseCsv<OperatorInstructionData>(operatorInstructions)
            : Promise.resolve([] as OperatorInstructionData[]),
    ]);

    // Parsing dei file aggiuntivi con dettagli sulle dipendenze esterne
    let additionalExternalData: OperationData[][] = [];
    if (additionalExternalFiles && additionalExternalFiles.length > 0) {
        additionalExternalData = await Promise.all(
            additionalExternalFiles.map(file => parseCsv<OperationData>(file))
        );
    }

    return {
        opData, 
        internalRelsData, 
        externalPredsData, 
        externalSuccsData, 
        opInstructionsData,
        additionalExternalData: additionalExternalData.length > 0 ? additionalExternalData : undefined
    };
}

// Funzione per aggiungere file aggiuntivi con dettagli sulle dipendenze esterne
export async function parseAdditionalFiles(parsedData: ParsedData, files: FileList): Promise<ParsedData> {
    if (!files || files.length === 0) {
        return parsedData;
    }

    // Parsing dei file aggiuntivi
    const additionalDataArrays = await Promise.all(
        Array.from(files).map(file => parseCsv<OperationData>(file))
    );

    // Aggiungi i nuovi dati a quelli esistenti
    const existingAdditionalData = parsedData.additionalExternalData || [];
    const updatedAdditionalData = [...existingAdditionalData, ...additionalDataArrays];

    return {
        ...parsedData,
        additionalExternalData: updatedAdditionalData
    };
}

// NUOVA FUNZIONE per estrarre tutti i nomi unici dei job dai dati parsati
export function extractAllNodeNames(parsedData: ParsedData): string[] {
    const nodeNames = new Set<string>();

    parsedData.opData?.forEach(row => row['Nome Job'] && nodeNames.add(row['Nome Job']));
    parsedData.internalRelsData?.forEach(row => row['Nome Job Predecessore'] && nodeNames.add(row['Nome Job Predecessore']));
    parsedData.externalPredsData?.forEach(row => row['Nome Job Predecessore'] && nodeNames.add(row['Nome Job Predecessore']));
    parsedData.externalSuccsData?.forEach(row => row['Nome Job Successore'] && nodeNames.add(row['Nome Job Successore']));

    return Array.from(nodeNames).sort();
}

// Funzione per estrarre tutti i tipi di operazione unici dai dati parsati
export function extractOperationTypes(parsedData: ParsedData): string[] {
    const operationTypes = new Set<string>();

    parsedData.opData?.forEach(row => {
        if (row['Tipo']) {
            operationTypes.add(row['Tipo']);
        }
    });

    return Array.from(operationTypes).sort();
}

// processFilesToGraphData ORA ACCETTA I DATI GIÀ PARSATI
// Function to build a graph that only includes jobs with external predecessors and their external predecessors
export function buildExternalPredecessorsGraph(
    parsedData: ParsedData,
    currentNetName: string,
    exclusionSet: Set<string>,
    selectedOperationTypes: Set<string> = new Set(),
    includeUnknownTypes: boolean = false
): GraphData {
    const {
        opData,
        externalPredsData,
        additionalExternalData
    } = parsedData;

    // Create a set of jobs that have external predecessors
    const jobsWithExternalPreds = new Set<string>();
    const externalPredecessors = new Map<string, Set<string>>(); // Map of job -> set of external predecessors

    // Identify jobs with external predecessors
    externalPredsData.forEach((row) => {
        const sourceNet = row['Net Predecessore'];
        // Ignore if it's an internal dependency masked as external
        if (sourceNet === currentNetName) return;

        const sourceName = row['Nome Job Predecessore'];
        const target = row['Nome Job'];
        if (exclusionSet.has(sourceName) || exclusionSet.has(target)) return;

        // Add the job to the set of jobs with external predecessors
        jobsWithExternalPreds.add(target);

        // Track the external predecessors for each job
        if (!externalPredecessors.has(target)) {
            externalPredecessors.set(target, new Set<string>());
        }
        const externalPredSet = externalPredecessors.get(target);
        if (externalPredSet) {
            externalPredSet.add(`${sourceNet}/${sourceName}`);
        }
    });

    // If no jobs have external predecessors, return an empty graph
    if (jobsWithExternalPreds.size === 0) {
        return { nodes: [], links: [] };
    }

    // Create nodes and links only for jobs with external predecessors and their external predecessors
    const nodes = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // Add nodes for jobs with external predecessors
    opData.forEach((row) => {
        const jobName = row['Nome Job'].trim();
        if (!jobName || exclusionSet.has(jobName)) return;

        // Skip if not in the set of jobs with external predecessors
        if (!jobsWithExternalPreds.has(jobName)) return;

        // Filter by operation type if there are selected types
        if (selectedOperationTypes.size > 0 && 
            !selectedOperationTypes.has(row['Tipo']) && 
            !(includeUnknownTypes && !row['Tipo'])) return;

        const node: GraphNode = {
            id: jobName,
            name: jobName,
            type: 'internal',
            metadata: {...row},
        };
        nodes.set(jobName, node);
    });

    // Add external predecessor nodes and links
    externalPredsData.forEach((row) => {
        const sourceNet = row['Net Predecessore'];
        if (sourceNet === currentNetName) return;

        const sourceName = row['Nome Job Predecessore'];
        const target = row['Nome Job'];

        // Skip if either node is excluded or if the target is not in our filtered set
        if (exclusionSet.has(sourceName) || exclusionSet.has(target) || !nodes.has(target)) return;

        // Add the external predecessor node
        const sourceId = `${sourceNet}/${sourceName}`;
        if (!nodes.has(sourceId)) {
            // Look for additional details for this external node
            const additionalDetails = findAdditionalDetails(sourceName, sourceNet, additionalExternalData);

            nodes.set(sourceId, {
                id: sourceId,
                name: sourceName,
                type: 'external',
                hasAdditionalDetails: !!additionalDetails,
                metadata: additionalDetails ? 
                    { ...additionalDetails, 'Rete Esterna': sourceNet } : 
                    { 'Rete Esterna': sourceNet }
            });
        }

        // Add the link from external predecessor to the job
        links.push({ source: sourceId, target });
    });

    return { nodes: Array.from(nodes.values()), links };
}

// Helper function to find additional details for an external node
function findAdditionalDetails(
    jobName: string, 
    netName: string, 
    additionalExternalData?: OperationData[][]
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> | null {
    if (!additionalExternalData || additionalExternalData.length === 0) {
        return null;
    }

    // Search in additional files
    for (const dataArray of additionalExternalData) {
        const jobDetails = dataArray.find(job => 
            job['Nome Job'] === jobName && 
            // Check if the file contains information about the Net or if it matches the specified Net
            (job['Net'] === netName || !job['Net'])
        );

        if (jobDetails) {
            return jobDetails;
        }
    }

    return null;
}

export function buildGraphFromParsedData(
    parsedData: ParsedData,
    currentNetName: string,
    exclusionSet: Set<string>,
    selectedOperationTypes: Set<string> = new Set(),
    includeUnknownTypes: boolean = false
): GraphData {
    const {
        opData,
        internalRelsData,
        externalPredsData,
        externalSuccsData,
        opInstructionsData,
        additionalExternalData
    } = parsedData;

    // La logica da qui in poi è quasi identica a prima, ma usa i dati passati come argomento
    const nodes = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // PASSO 2: Creazione dei nodi interni.
    opData.forEach((row) => {
        const jobName = row['Nome Job'].trim();
        if (!jobName || exclusionSet.has(jobName)) return;

        // Filtra per tipo di operazione se ci sono tipi selezionati
        if (selectedOperationTypes.size > 0 && 
            !selectedOperationTypes.has(row['Tipo']) && 
            !(includeUnknownTypes && !row['Tipo'])) return;

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

    // Funzione helper per verificare se un nodo esterno ha dettagli aggiuntivi
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findAdditionalDetails = (jobName: string, netName: string): Record<string, any> | null => {
        if (!additionalExternalData || additionalExternalData.length === 0) {
            return null;
        }

        // Cerca nei file aggiuntivi
        for (const dataArray of additionalExternalData) {
            const jobDetails = dataArray.find(job => 
                job['Nome Job'] === jobName && 
                // Verifica se il file contiene informazioni sul Net o se corrisponde al Net specificato
                (job['Net'] === netName || !job['Net'])
            );

            if (jobDetails) {
                return jobDetails;
            }
        }

        return null;
    };

    // Funzione helper per creare nodi esterni se non esistono già
    const addExternalNode = (jobName: string, netName: string) => {
        const externalId = `${netName}/${jobName}`;
        if (!nodes.has(externalId)) {
            // Cerca dettagli aggiuntivi per questo nodo esterno
            const additionalDetails = findAdditionalDetails(jobName, netName);

            nodes.set(externalId, {
                id: externalId,
                name: jobName,
                type: 'external',
                hasAdditionalDetails: !!additionalDetails,
                metadata: additionalDetails ? 
                    { ...additionalDetails, 'Rete Esterna': netName } : 
                    { 'Rete Esterna': netName }
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
        const sourceId = source;
        const targetId = target;

        if (!successors.has(sourceId)) successors.set(sourceId, []);
        const sourceSuccessors = successors.get(sourceId);
        if (!sourceSuccessors) {
            throw new Error(`Impossibile trovare i successori per il nodo: ${sourceId}`);
        }
        sourceSuccessors.push(targetId);

        if (!predecessors.has(targetId)) predecessors.set(targetId, []);
        const targetPredecessors = predecessors.get(targetId);
        if (!targetPredecessors) {
            throw new Error(`Impossibile trovare i predecessori per il nodo: ${targetId}`);
        }
        targetPredecessors.push(sourceId);
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
        const sourceId = l.source;
        const targetId = l.target;
        return reachableNodes.has(sourceId) && reachableNodes.has(targetId);
    });

    return {nodes: filteredNodes, links: filteredLinks};
}
