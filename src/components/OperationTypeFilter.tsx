import React from 'react';

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
        <div className="operation-type-filter">
            <div className="filter-header">
                <label>Filtra per Tipo di Operazione</label>
                <div className="filter-actions">
                    <button type="button" onClick={handleSelectAll} className="select-button">
                        Seleziona Tutti
                    </button>
                    <button type="button" onClick={handleDeselectAll} className="select-button">
                        Deseleziona Tutti
                    </button>
                </div>
            </div>
            <div className="type-list">
                <div className="unknown-type-item">
                    <input
                        type="checkbox"
                        id="include-unknown-types"
                        checked={includeUnknownTypes}
                        onChange={handleToggleUnknownTypes}
                    />
                    <label htmlFor="include-unknown-types">Includi Tipi Sconosciuti</label>
                </div>
                <div className="type-separator"></div>
                {operationTypes.map(type => (
                    <div key={type} className="type-item">
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
