import React from "react";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon, User } from "lucide-react";
import { SEARCH } from "../../config/consts";

import "./searchbar.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  const navigate = useNavigate();
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
      <button
        className="searchbar__profile-button"
        onClick={() => navigate("/profile")}
        aria-label="Profile"
      >
        <User size={24} />
      </button>
    </div>
  );
};

export default SearchBar;
