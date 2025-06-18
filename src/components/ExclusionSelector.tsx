// src/components/ExclusionSelector.tsx

import React, {useMemo, useState} from 'react';

type ExclusionSelectorProps = {
    allNodeNames: string[];
    initialExclusions: Set<string>;
    onExclusionChange: (newExclusions: Set<string>) => void;
};

const ExclusionSelector: React.FC<ExclusionSelectorProps> = ({allNodeNames, initialExclusions, onExclusionChange}) => {
    const [filterText, setFilterText] = useState('');
    const [excludedNodes, setExcludedNodes] = useState(initialExclusions);

    const handleToggleNode = (nodeName: string) => {
        const newSet = new Set(excludedNodes);
        if (newSet.has(nodeName)) {
            newSet.delete(nodeName);
        } else {
            newSet.add(nodeName);
        }
        setExcludedNodes(newSet);
        onExclusionChange(newSet);
    };

    const filteredList = useMemo(() => {
        return allNodeNames.filter(name =>
            name.toLowerCase().includes(filterText.toLowerCase())
        );
    }, [allNodeNames, filterText]);

    // Function to exclude all filtered nodes
    const handleExcludeAllFiltered = () => {
        const newSet = new Set(excludedNodes);
        filteredList.forEach(nodeName => {
            newSet.add(nodeName);
        });
        setExcludedNodes(newSet);
        onExclusionChange(newSet);
    };

    // Function to include all filtered nodes
    const handleIncludeAllFiltered = () => {
        const newSet = new Set(excludedNodes);
        filteredList.forEach(nodeName => {
            newSet.delete(nodeName);
        });
        setExcludedNodes(newSet);
        onExclusionChange(newSet);
    };

    return (
        <div className="border border-gray-300 rounded p-2 w-64">
            <label htmlFor="exclusion-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filtra e Seleziona Nodi da Escludere
            </label>
            <input
                id="exclusion-filter"
                type="text"
                placeholder="Cerca fase..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="w-full p-2 mb-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-between mt-2">
                <button 
                    className="text-sm px-2 py-1 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition-colors" 
                    onClick={handleExcludeAllFiltered}
                    title="Escludi tutti i risultati filtrati"
                >
                    Escludi Tutti
                </button>
                <button 
                    className="text-sm px-2 py-1 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition-colors" 
                    onClick={handleIncludeAllFiltered}
                    title="Includi tutti i risultati filtrati"
                >
                    Includi Tutti
                </button>
            </div>
            <div className="max-h-64 overflow-y-auto border-t border-gray-200 mt-2">
                {filteredList.map(nodeName => (
                    <div key={nodeName} className="flex items-center py-1">
                        <input
                            type="checkbox"
                            id={`exclude-${nodeName}`}
                            checked={excludedNodes.has(nodeName)}
                            onChange={() => handleToggleNode(nodeName)}
                            className="mr-2"
                        />
                        <label htmlFor={`exclude-${nodeName}`} className="cursor-pointer whitespace-nowrap text-sm">
                            {nodeName}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExclusionSelector;
