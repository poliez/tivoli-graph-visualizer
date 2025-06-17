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

    return (
        <div className="exclusion-selector">
            <label htmlFor="exclusion-filter">Filtra e Seleziona Nodi da Escludere</label>
            <input
                id="exclusion-filter"
                type="text"
                placeholder="Cerca fase..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />
            <div className="exclusion-list">
                {filteredList.map(nodeName => (
                    <div key={nodeName} className="list-item">
                        <input
                            type="checkbox"
                            id={`exclude-${nodeName}`}
                            checked={excludedNodes.has(nodeName)}
                            onChange={() => handleToggleNode(nodeName)}
                        />
                        <label htmlFor={`exclude-${nodeName}`}>{nodeName}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExclusionSelector;
