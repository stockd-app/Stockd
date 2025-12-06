import React from "react";
import { SEARCH } from "../../config/consts";
import "./searchbar.css";

const SearchBar: React.FC = () => {
    return (
        <div className="searchbar__container">
            <input
                type="text"
                className="searchbar__input"
                placeholder={SEARCH}
            />
        </div>
    );
};

export default SearchBar;