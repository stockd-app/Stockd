import React from "react";
import { SlidersHorizontal } from "lucide-react";

import "./filterbutton.css";

interface FilterButtonProps {
    onClick: () => void;
}

/**
 * Renders a Filter Button that opens the filter drawer on click
 * Notify parent (e.g., Dashboard) via onClick prop
 * @param param0 
 * @returns 
 */
const FilterButton: React.FC<FilterButtonProps> = ({ onClick }) => {
    return (
        <button
            className="filterbutton"
            onClick={onClick}
            aria-label="Open filters"
        >
            <SlidersHorizontal size={20} />
        </button>
    );
};

export default FilterButton;
