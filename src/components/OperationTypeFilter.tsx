import React from 'react';
import styles from './OperationTypeFilter.module.css';

type OperationTypeFilterProps = {
    operationTypes: string[];
    selectedTypes: Set<string>;
    onTypeChange: (newSelectedTypes: Set<string>) => void;
    includeUnknownTypes?: boolean;
    onIncludeUnknownTypesChange?: (include: boolean) => void;
};

const OperationTypeFilter: React.FC<OperationTypeFilterProps> = ({
    operationTypes,
    selectedTypes,
    onTypeChange,
    includeUnknownTypes = false,
    onIncludeUnknownTypesChange
}) => {
    const handleToggleType = (type: string) => {
        const newSet = new Set(selectedTypes);
        if (newSet.has(type)) {
            newSet.delete(type);
        } else {
            newSet.add(type);
        }
        onTypeChange(newSet);
    };

    const handleSelectAll = () => {
        onTypeChange(new Set(operationTypes));
    };

    const handleDeselectAll = () => {
        onTypeChange(new Set());
    };

    const handleToggleUnknownTypes = () => {
        if (onIncludeUnknownTypesChange) {
            onIncludeUnknownTypesChange(!includeUnknownTypes);
        }
    };

    return (
        <div className={styles.operationTypeFilter}>
            <div className={styles.filterHeader}>
                <label>Filtra per Tipo di Operazione</label>
                <div className={styles.filterActions}>
                    <button type="button" onClick={handleSelectAll} className={styles.selectButton}>
                        Seleziona Tutti
                    </button>
                    <button type="button" onClick={handleDeselectAll} className={styles.selectButton}>
                        Deseleziona Tutti
                    </button>
                </div>
            </div>
            <div className={styles.typeList}>
                <div className={styles.unknownTypeItem}>
                    <input
                        type="checkbox"
                        id="include-unknown-types"
                        checked={includeUnknownTypes}
                        onChange={handleToggleUnknownTypes}
                    />
                    <label htmlFor="include-unknown-types">Includi Tipi Sconosciuti</label>
                </div>
                <div className={styles.typeSeparator}></div>
                {operationTypes.map(type => (
                    <div key={type} className={styles.typeItem}>
                        <input
                            type="checkbox"
                            id={`type-${type}`}
                            checked={selectedTypes.has(type)}
                            onChange={() => handleToggleType(type)}
                        />
                        <label htmlFor={`type-${type}`}>{type}</label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OperationTypeFilter;
