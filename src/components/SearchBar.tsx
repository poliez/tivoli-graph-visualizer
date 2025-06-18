import React, {useEffect, useState} from 'react';

type SearchBarProps = {
    onSearch: (term: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({onSearch}) => {
    const [value, setValue] = useState('');

    // Effetto per il "debouncing": la ricerca parte solo quando l'utente
    // smette di digitare per 300ms.
    useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(value);
        }, 300);

        // Funzione di pulizia: resetta il timer se l'utente digita di nuovo
        return () => {
            clearTimeout(handler);
        };
    }, [value, onSearch]);

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="job-search" className="font-medium text-gray-700">Cerca e Isola Job</label>
            <input
                id="job-search"
                type="text"
                placeholder="Nome esatto del job..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
        </div>
    );
};

export default SearchBar;
