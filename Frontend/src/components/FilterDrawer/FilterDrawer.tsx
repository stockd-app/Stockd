import React from "react";
import Button from "../Button/Button";

import "./filterdrawer.css";

interface FilterDrawerProps {
    open: boolean;
    onClose: () => void;
    children?: React.ReactNode;
}

/**
 * Renders a Filter Drawer that slides in from the side (right)
 * Parent component must manage open state and provide onClose handler
 * Parent component must provide filter UI as children
 * @param param0 
 * @returns 
 */
const FilterDrawer: React.FC<FilterDrawerProps> = ({
    open,
    onClose,
    children,
}) => {
    return (
        <>
            {/* Backdrop */}
            {open && (
                <div
                    className="filterdrawer__backdrop"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div className={`filterdrawer ${open ? "open" : ""}`}>
                <div className="filterdrawer__header">
                    <h3>Filters</h3>
                    <Button onClick={onClose} variant="close" />
                </div>

                <div className="filterdrawer__content">
                    {children ?? <p>Filter options coming soon…</p>}
                </div>
            </div>
        </>
    );
};

export default FilterDrawer;
