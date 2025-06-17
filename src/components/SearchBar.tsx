import React from 'react';

type SearchBarProps = {
    onSearch: (term: string) => void;
};

const SearchBar: React.FC<SearchBarProps> = ({onSearch}) => {
    return <div>SearchBar Component</div>;
};

export default SearchBar;
