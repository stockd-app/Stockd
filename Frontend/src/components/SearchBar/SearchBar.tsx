import React from "react";
import { Search as SearchIcon } from "lucide-react";
import { SEARCH } from "../../config/consts";

import "./searchbar.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, onSubmit }) => {
  return (
    <input
      value={value}
      placeholder="Search recipes..."
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSubmit();
        }
      }}
    />
  );
};

export default SearchBar;