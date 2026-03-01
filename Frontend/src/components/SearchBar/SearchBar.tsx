import React from "react";
import { Search as SearchIcon } from "lucide-react";
import "./searchbar.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  return (
    <div className="searchbar__container">
      <div className="searchbar__wrapper">
        <SearchIcon className="searchbar__icon" size={20} />

        <input
          className="searchbar__input"
          value={value}
          placeholder="Search for any recipe..."
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSubmit();
            }
          }}
        />
      </div>
    </div>
  );
};

export default SearchBar;