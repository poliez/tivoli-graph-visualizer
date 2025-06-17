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
        <div className="search-bar">
            <label htmlFor="job-search" style={{marginRight: '10px'}}>Cerca e Isola Job</label>
            <input
                id="job-search"
                type="text"
                placeholder="Nome esatto del job..."
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
};

export default SearchBar;
