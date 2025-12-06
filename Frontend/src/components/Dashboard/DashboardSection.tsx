import React from "react";
import ItemCard from "../ItemCard/ItemCard";
import EmptyFridge from "../../assets/images/Emptyfridge.png";
import "./dashboardsection.css";

interface DashboardSectionProps {
    title: string;
    seeMore?: boolean;
    items: {
        name: string;
        image: string;
        rating?: number;
        time?: string;
        status?: string;
    }[];
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ title, seeMore = true, items }) => {
    return (
        <div className="dashboard__section">
            <div className="dashboard__section__header">
                <h3>{title}</h3>
                {seeMore && <span className="see__more">See more</span>}
            </div>

            {items.length === 0 ? (
                <div className="dashboard__pantry__empty">
                    <img
                        src={EmptyFridge}
                        alt="Empty Pantry"
                        className="dashboard__empty__image"
                    />

                    <div className="dashboard__empty__overlay">
                        <p className="dashboard__empty__text">Let’s stock your pantry!</p>
                        <p className="dashboard__empty__subtext">
                            Add ingredients by uploading a receipt or other methods.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="dashboard__items__scroll">
                    {items.map((item, index) => (
                        <ItemCard
                            key={index}
                            name={item.name}
                            image={item.image}
                            rating={item.rating}
                            time={item.time}
                            status={item.status}
                            mode="dashboard"
                        />
                    ))}
                </div>
            )}
        </div>
    );
};


export default DashboardSection;
