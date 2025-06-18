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
        <div className="border border-gray-300 rounded p-2 w-64">
            <div className="flex flex-col mb-2">
                <label className="text-sm font-medium text-gray-700 mb-2">Filtra per Tipo di Operazione</label>
                <div className="flex justify-between mt-2">
                    <button 
                        type="button" 
                        onClick={handleSelectAll} 
                        className="text-sm px-2 py-1 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                        Seleziona Tutti
                    </button>
                    <button 
                        type="button" 
                        onClick={handleDeselectAll} 
                        className="text-sm px-2 py-1 bg-gray-100 border border-gray-300 rounded cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                        Deseleziona Tutti
                    </button>
                </div>
            </div>
            <div className="max-h-72 overflow-y-auto border-t border-gray-200">
                <div className="flex items-center py-1 font-bold text-gray-600">
                    <input
                        type="checkbox"
                        id="include-unknown-types"
                        checked={includeUnknownTypes}
                        onChange={handleToggleUnknownTypes}
                        className="mr-2"
                    />
                    <label htmlFor="include-unknown-types" className="cursor-pointer whitespace-nowrap text-sm">
                        Includi Tipi Sconosciuti
                    </label>
                </div>
                <div className="h-px bg-gray-300 my-2"></div>
                {operationTypes.map(type => (
                    <div key={type} className="flex items-center py-1">
                        <input
                            type="checkbox"
                            id={`type-${type}`}
                            checked={selectedTypes.has(type)}
                            onChange={() => handleToggleType(type)}
                            className="mr-2"
                        />
                        <label htmlFor={`type-${type}`} className="cursor-pointer whitespace-nowrap text-sm">
                            {type}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OperationTypeFilter;
