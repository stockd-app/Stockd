import "./filterchip.css";

interface FilterChipProps {
    label: string;
    active?: boolean;
    onClick: () => void;
}

/**
 * Renders a Filter Chip button
 * @param param0 
 * @returns 
 */
const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick }) => {
    return (
        <button
            className={`filterchip ${active ? "active" : ""}`}
            onClick={onClick}
        >
            {label}
        </button>
    );
};

export default FilterChip;
