import React from "react";
import { Search as SearchIcon } from "lucide-react";
import { SEARCH } from "../../config/consts";

import "./searchbar.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="searchbar__container">
      <div className="searchbar__wrapper">
        <SearchIcon className="searchbar__icon" size={20} />
        <input
          type="text"
          className="searchbar__input"
          placeholder={SEARCH}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchBar;
