import React, {useEffect, useRef} from 'react';
import * as d3 from 'd3';
import type {GraphData, GraphNode} from '../types';

type GraphViewerProps = {
    data: GraphData;
    onNodeClick: (node: GraphNode | null) => void;
    searchTerm: string;
};

const GraphViewer: React.FC<GraphViewerProps> = ({data, onNodeClick, searchTerm}) => {
    // useRef per ottenere un riferimento diretto all'elemento SVG nel DOM.
    // React gestisce la creazione/rimozione dell'SVG, D3 lavorerà al suo interno.
    const svgRef = useRef<SVGSVGElement>(null);

    // useEffect è il gancio perfetto per eseguire codice D3.
    // Si attiva ogni volta che i dati (la nostra prop `data`) cambiano.
    useEffect(() => {
        if (!data || !svgRef.current) return;

        // Lavoriamo su una copia dei dati per non mutare le props originali.
        // La simulazione di D3 modifica gli oggetti, quindi questo è fondamentale.
        const links = data.links.map(d => ({...d}));
        const nodes = data.nodes.map(d => ({...d}));

        const svg = d3.select(svgRef.current);
        const {width, height} = svg.node()!.getBoundingClientRect();

        // Pulizia da render precedenti
        svg.selectAll('*').remove();

        // Aggiungiamo un contenitore <g> per lo zoom e il pan
        const container = svg.append('g');

        // Creiamo le frecce per gli archi orientati
        svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '-0 -5 10 10')
            .attr('refX', 23) // Distanza dal centro del nodo
            .attr('refY', 0)
            .attr('orient', 'auto')
            .attr('markerWidth', 10)
            .attr('markerHeight', 10)
            .attr('xoverflow', 'visible')
            .append('svg:path')
            .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
            .attr('fill', '#999')
            .style('stroke', 'none');

        // La simulazione fisica che posiziona nodi e archi
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink<GraphNode, any>(links).id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-500)) // Forza di repulsione tra i nodi
            .force('center', d3.forceCenter(width / 2, height / 2)); // Forza che centra il grafo

        // Disegniamo gli archi (linee)
        const link = container.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(links)
            .join('line')
            .attr('stroke-width', 1.5)
            .attr('marker-end', 'url(#arrowhead)'); // Applichiamo le frecce

        // Disegniamo i nodi (un gruppo <g> per ogni nodo)
        const node = container.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(nodes)
            .join('g')
            .on('click', (event, d) => {
                onNodeClick(d);
                event.stopPropagation(); // Evita che il click si propaghi all'SVG
            });

        // Aggiungiamo un cerchio a ogni gruppo-nodo
        node.append('circle')
            .attr('r', 15)
            .attr('class', d => `${d.type} ${d.id === searchTerm ? 'highlighted' : ''}`)

        // Aggiungiamo l'etichetta di testo a ogni gruppo-nodo
        node.append('text')
            .text(d => d.name)
            .attr('x', 20)
            .attr('y', 5);

        // Funzionalità di Drag & Drop per i nodi
        const dragHandler = d3.drag<any, GraphNode>()
            .on('start', (event, d) => {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        dragHandler(node as any);

        // Funzionalità di Zoom e Pan sull'intero SVG
        const zoomHandler = d3.zoom<SVGSVGElement, unknown>()
            .on('zoom', (event) => {
                container.attr('transform', event.transform);
            });

        svg.call(zoomHandler);

        // Svuotiamo il pannello dei dettagli se si clicca sullo sfondo
        svg.on('click', () => {
            onNodeClick(null);
        });

        // La funzione 'ticked' viene chiamata a ogni "passo" della simulazione.
        // Aggiorna le coordinate di tutti gli elementi SVG.
        simulation.on('tick', () => {
            link
                .attr('x1', d => (d.source as unknown as GraphNode).x!)
                .attr('y1', d => (d.source as unknown as GraphNode).y!)
                .attr('x2', d => (d.target as unknown as GraphNode).x!)
                .attr('y2', d => (d.target as unknown as GraphNode).y!);

            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
        });

    }, [data, onNodeClick, searchTerm]); // L'effetto si riesegue se i dati o la funzione di callback cambiano

    return (
        <svg ref={svgRef} width="100%" height="100%"></svg>
    );
};

export default GraphViewer;
