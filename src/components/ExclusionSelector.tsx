// src/components/ExclusionSelector.tsx

import React, {useMemo, useState} from 'react';
import styles from './ExclusionSelector.module.css';

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
        <div className={styles.exclusionSelector}>
            <label htmlFor="exclusion-filter">Filtra e Seleziona Nodi da Escludere</label>
            <input
                id="exclusion-filter"
                type="text"
                placeholder="Cerca fase..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />
            <div className={styles.filterActions}>
                <button
                    className={styles.selectButton}
                    onClick={handleExcludeAllFiltered}
                    title="Escludi tutti i risultati filtrati"
                >
                    Escludi Tutti
                </button>
                <button
                    className={styles.selectButton}
                    onClick={handleIncludeAllFiltered}
                    title="Includi tutti i risultati filtrati"
                >
                    Includi Tutti
                </button>
            </div>
            <div className={styles.exclusionList}>
                {filteredList.map(nodeName => (
                    <div key={nodeName} className={styles.listItem}>
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
