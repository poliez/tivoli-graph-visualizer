import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCurrentNetName,
  parseAllFiles,
  extractAllNodeNames,
  buildGraphFromParsedData,
  filterGraph
} from './graphProcessor';
import type {
  ParsedData,
  OperationData,
  InternalRelationData,
  ExternalPredecessorData,
  ExternalSuccessorData,
  OperatorInstructionData,
  GraphData
} from '../types';

// Mock PapaParse
vi.mock('papaparse', () => ({
  default: {
    parse: vi.fn((file, options) => {
      // Simulate parsing based on file name
      if (file.name.includes('operations')) {
        options.complete({
          data: [
            { 'Nome Job': 'JOB1', 'Tipo': 'COMMAND' },
            { 'Nome Job': 'JOB2', 'Tipo': 'COMMAND' }
          ]
        });
      } else if (file.name.includes('internal')) {
        options.complete({
          data: [
            { 'Nome Job Predecessore': 'JOB1', 'Nome Job': 'JOB2' }
          ]
        });
      } else if (file.name.includes('external_preds')) {
        options.complete({
          data: [
            { 'Net Predecessore': 'EXTERNAL_NET', 'Nome Job Predecessore': 'EXT_JOB1', 'Nome Job': 'JOB1' }
          ]
        });
      } else if (file.name.includes('external_succs')) {
        options.complete({
          data: [
            { 'Net Successore': 'EXTERNAL_NET', 'Nome Job': 'JOB2', 'Nome Job Successore': 'EXT_JOB2' }
          ]
        });
      } else if (file.name.includes('instructions')) {
        options.complete({
          data: [
            { 'Nome Job': 'JOB1', 'Istruzioni': 'Some instructions' }
          ]
        });
      }
    })
  }
}));

describe('getCurrentNetName', () => {
  it('should extract the Net name from a file name', () => {
    const file = { name: 'NET - TEST_NET - operations.csv' } as File;
    expect(getCurrentNetName(file)).toBe('TEST_NET');
  });
});

describe('parseAllFiles', () => {
  it('should parse all files and return structured data', async () => {
    const inputFiles = {
      operations: { name: 'NET - TEST_NET - operations.csv' } as File,
      internalRels: { name: 'NET - TEST_NET - internal.csv' } as File,
      externalPreds: { name: 'NET - TEST_NET - external_preds.csv' } as File,
      externalSuccs: { name: 'NET - TEST_NET - external_succs.csv' } as File,
      operatorInstructions: { name: 'NET - TEST_NET - instructions.csv' } as File
    };

    const result = await parseAllFiles(inputFiles);

    expect(result.opData).toHaveLength(2);
    expect(result.internalRelsData).toHaveLength(1);
    expect(result.externalPredsData).toHaveLength(1);
    expect(result.externalSuccsData).toHaveLength(1);
    expect(result.opInstructionsData).toHaveLength(1);
  });

  it('should throw an error if required files are missing', async () => {
    const inputFiles = {
      operations: { name: 'NET - TEST_NET - operations.csv' } as File,
      // Missing required files
    };

    await expect(parseAllFiles(inputFiles)).rejects.toThrow('Uno o più file richiesti non sono stati forniti.');
  });

  it('should handle missing operator instructions file', async () => {
    const inputFiles = {
      operations: { name: 'NET - TEST_NET - operations.csv' } as File,
      internalRels: { name: 'NET - TEST_NET - internal.csv' } as File,
      externalPreds: { name: 'NET - TEST_NET - external_preds.csv' } as File,
      externalSuccs: { name: 'NET - TEST_NET - external_succs.csv' } as File,
      // No operatorInstructions
    };

    const result = await parseAllFiles(inputFiles);

    expect(result.opData).toHaveLength(2);
    expect(result.opInstructionsData).toHaveLength(0);
  });
});

describe('extractAllNodeNames', () => {
  it('should extract all unique node names from parsed data', () => {
    const parsedData: ParsedData = {
      opData: [
        { 'Nome Job': 'JOB1' } as OperationData,
        { 'Nome Job': 'JOB2' } as OperationData
      ],
      internalRelsData: [
        { 'Nome Job Predecessore': 'JOB1', 'Nome Job': 'JOB2' } as InternalRelationData
      ],
      externalPredsData: [
        { 'Net Predecessore': 'EXTERNAL_NET', 'Nome Job Predecessore': 'EXT_JOB1', 'Nome Job': 'JOB1' } as ExternalPredecessorData
      ],
      externalSuccsData: [
        { 'Net Successore': 'EXTERNAL_NET', 'Nome Job': 'JOB2', 'Nome Job Successore': 'EXT_JOB2' } as ExternalSuccessorData
      ]
    };

    const result = extractAllNodeNames(parsedData);

    expect(result).toEqual(['EXT_JOB1', 'EXT_JOB2', 'JOB1', 'JOB2']);
  });

  it('should handle empty data', () => {
    const parsedData: ParsedData = {
      opData: [],
      internalRelsData: [],
      externalPredsData: [],
      externalSuccsData: []
    };

    const result = extractAllNodeNames(parsedData);

    expect(result).toEqual([]);
  });
});

describe('buildGraphFromParsedData', () => {
  let parsedData: ParsedData;
  let exclusionSet: Set<string>;

  beforeEach(() => {
    parsedData = {
      opData: [
        { 'Nome Job': 'JOB1', 'Tipo': 'COMMAND' } as OperationData,
        { 'Nome Job': 'JOB2', 'Tipo': 'COMMAND' } as OperationData,
        { 'Nome Job': 'JOB3', 'Tipo': 'COMMAND' } as OperationData
      ],
      internalRelsData: [
        { 'Nome Job Predecessore': 'JOB1', 'Nome Job': 'JOB2' } as InternalRelationData,
        { 'Nome Job Predecessore': 'JOB2', 'Nome Job': 'JOB3' } as InternalRelationData
      ],
      externalPredsData: [
        { 'Net Predecessore': 'EXTERNAL_NET', 'Nome Job Predecessore': 'EXT_JOB1', 'Nome Job': 'JOB1' } as ExternalPredecessorData
      ],
      externalSuccsData: [
        { 'Net Successore': 'EXTERNAL_NET', 'Nome Job': 'JOB3', 'Nome Job Successore': 'EXT_JOB2' } as ExternalSuccessorData
      ],
      opInstructionsData: [
        { 'Nome Job': 'JOB1', 'Istruzioni': 'Some instructions' } as OperatorInstructionData
      ]
    };
    exclusionSet = new Set<string>();
  });

  it('should build a graph from parsed data', () => {
    const result = buildGraphFromParsedData(parsedData, 'TEST_NET', exclusionSet);

    // Check nodes
    expect(result.nodes).toHaveLength(5); // 3 internal + 2 external
    expect(result.nodes.find(n => n.id === 'JOB1')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'JOB2')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'JOB3')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'EXTERNAL_NET/EXT_JOB1')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'EXTERNAL_NET/EXT_JOB2')).toBeDefined();

    // Check links
    expect(result.links).toHaveLength(4);
    expect(result.links.find(l => l.source === 'JOB1' && l.target === 'JOB2')).toBeDefined();
    expect(result.links.find(l => l.source === 'JOB2' && l.target === 'JOB3')).toBeDefined();
    expect(result.links.find(l => l.source === 'EXTERNAL_NET/EXT_JOB1' && l.target === 'JOB1')).toBeDefined();
    expect(result.links.find(l => l.source === 'JOB3' && l.target === 'EXTERNAL_NET/EXT_JOB2')).toBeDefined();

    // Check node metadata
    const job1 = result.nodes.find(n => n.id === 'JOB1');
    expect(job1?.metadata['Istruzioni']).toBe('Some instructions');
  });

  it('should exclude nodes based on exclusion set', () => {
    exclusionSet.add('JOB2');
    const result = buildGraphFromParsedData(parsedData, 'TEST_NET', exclusionSet);

    // JOB2 should be excluded
    expect(result.nodes.find(n => n.id === 'JOB2')).toBeUndefined();
    
    // Links involving JOB2 should be excluded
    expect(result.links.find(l => l.source === 'JOB1' && l.target === 'JOB2')).toBeUndefined();
    expect(result.links.find(l => l.source === 'JOB2' && l.target === 'JOB3')).toBeUndefined();
  });

  it('should ignore internal dependencies masquerading as external', () => {
    // Add a "fake" external dependency that's actually internal
    parsedData.externalPredsData.push({
      'Net Predecessore': 'TEST_NET', // Same as current net
      'Nome Job Predecessore': 'JOB1',
      'Nome Job': 'JOB3'
    } as ExternalPredecessorData);

    parsedData.externalSuccsData.push({
      'Net Successore': 'TEST_NET', // Same as current net
      'Nome Job': 'JOB1',
      'Nome Job Successore': 'JOB3'
    } as ExternalSuccessorData);

    const result = buildGraphFromParsedData(parsedData, 'TEST_NET', exclusionSet);

    // The fake external dependencies should be ignored
    expect(result.links.find(l => 
      l.source === 'JOB1' && 
      l.target === 'JOB3'
    )).toBeUndefined();
  });
});

describe('filterGraph', () => {
  let fullGraph: GraphData;

  beforeEach(() => {
    fullGraph = {
      nodes: [
        { id: 'JOB1', name: 'JOB1', type: 'internal', metadata: {} },
        { id: 'JOB2', name: 'JOB2', type: 'internal', metadata: {} },
        { id: 'JOB3', name: 'JOB3', type: 'internal', metadata: {} },
        { id: 'JOB4', name: 'JOB4', type: 'internal', metadata: {} },
        { id: 'EXTERNAL_NET/EXT_JOB1', name: 'EXT_JOB1', type: 'external', metadata: { 'Rete Esterna': 'EXTERNAL_NET' } }
      ],
      links: [
        { source: 'JOB1', target: 'JOB2' },
        { source: 'JOB2', target: 'JOB3' },
        { source: 'JOB3', target: 'JOB4' },
        { source: 'EXTERNAL_NET/EXT_JOB1', target: 'JOB1' }
      ]
    };
  });

  it('should return the full graph if search ID is empty', () => {
    const result = filterGraph(fullGraph, '');
    expect(result).toEqual(fullGraph);
  });

  it('should filter the graph to include only nodes reachable from the search node', () => {
    const result = filterGraph(fullGraph, 'JOB2');

    // Should include JOB1 (predecessor), JOB2 (search node), JOB3 and JOB4 (successors)
    expect(result.nodes).toHaveLength(5);
    expect(result.nodes.find(n => n.id === 'JOB1')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'JOB2')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'JOB3')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'JOB4')).toBeDefined();
    expect(result.nodes.find(n => n.id === 'EXTERNAL_NET/EXT_JOB1')).toBeDefined();

    // Should include all links
    expect(result.links).toHaveLength(4);
  });

  it('should return an empty graph if the search node does not exist', () => {
    const result = filterGraph(fullGraph, 'NON_EXISTENT_JOB');
    expect(result.nodes).toHaveLength(0);
    expect(result.links).toHaveLength(0);
  });

  it('should handle complex graph structures with cycles', () => {
    // Add a cycle
    fullGraph.links.push({ source: 'JOB4', target: 'JOB1' });

    const result = filterGraph(fullGraph, 'JOB1');

    // All nodes should be reachable
    expect(result.nodes).toHaveLength(5);
    expect(result.links).toHaveLength(5); // 4 original + 1 cycle link
  });
});
