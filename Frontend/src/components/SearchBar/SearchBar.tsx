import React from "react";
import { Search as SearchIcon } from "lucide-react";
import { SEARCH } from "../../config/consts";

import "./searchbar.css";

const SearchBar: React.FC = () => {
    return (
        <div className="searchbar__container">
            <div className="searchbar__wrapper">
                <SearchIcon className="searchbar__icon" size={20} />
                <input
                    type="text"
                    className="searchbar__input"
                    placeholder={SEARCH}
                />
            </div>
        </div>
    );
};

export default SearchBar;
