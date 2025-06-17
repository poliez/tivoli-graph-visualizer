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

// La funzione principale che orchestra tutto il processo
export async function processFilesToGraphData(inputFiles: InputFiles): Promise<GraphData> {
    const {operations, internalRels, externalPreds, externalSuccs, operatorInstructions} = inputFiles;

    // Controllo di sicurezza: i file richiesti devono esistere
    if (!operations || !internalRels || !externalPreds || !externalSuccs) {
        throw new Error('Uno o più file richiesti non sono stati forniti.');
    }

    // PASSO 1: Parsing di tutti i file in parallelo per efficienza
    const [
        opData,
        internalRelsData,
        externalPredsData,
        externalSuccsData,
        opInstructionsData, // Sarà `undefined` se il file non è stato passato
    ] = await Promise.all([
        parseCsv<any>(operations),
        parseCsv<any>(internalRels),
        parseCsv<any>(externalPreds),
        parseCsv<any>(externalSuccs),
        operatorInstructions ? parseCsv<any>(operatorInstructions) : Promise.resolve(undefined),
    ]);

    const nodes = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // PASSO 2: Creazione dei nodi interni a partire dal file "Operazioni"
    opData.forEach((row) => {
        const jobName = row['Nome Job'];
        if (!jobName) return;

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
            const jobName = row['Nome Job'];
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

    // PASSO 4: Creazione degli archi e dei nodi esterni
    // 4a: Relazioni interne
    internalRelsData.forEach((row) => {
        const source = row['Nome Job Predecessore'];
        const target = row['Nome Job'];
        if (source && target && nodes.has(source) && nodes.has(target)) {
            links.push({source, target});
        }
    });

    // 4b: Relazioni esterne predecessori (archi entranti)
    externalPredsData.forEach((row) => {
        const sourceName = row['Nome Job Predecessore'];
        const sourceNet = row['Net Predecessore'];
        const target = row['Nome Job'];
        if (sourceName && sourceNet && target && nodes.has(target)) {
            const sourceId = addExternalNode(sourceName, sourceNet);
            links.push({source: sourceId, target});
        }
    });

    // 4c: Relazioni esterne successori (archi uscenti)
    externalSuccsData.forEach((row) => {
        const source = row['Nome Job'];
        const targetName = row['Nome Job Successore'];
        const targetNet = row['Net Successore'];
        if (source && targetName && targetNet && nodes.has(source)) {
            const targetId = addExternalNode(targetName, targetNet);
            links.push({source, target: targetId});
        }
    });

    return {nodes: Array.from(nodes.values()), links};
}
