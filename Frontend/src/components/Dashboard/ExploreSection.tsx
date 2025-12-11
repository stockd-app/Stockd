import React from "react";
import ExploreImage1 from "../../assets/images/ExploreImage1.png";
import ExploreImage2 from "../../assets/images/ExploreImage2.png";
import ExploreImage3 from "../../assets/images/ExploreImage3.png";
import "./exploresection.css";

const ExploreSection: React.FC = () => {
    return (
        <div className="explore__section">
            <h3 className="explore__title">Explore</h3>

            <div className="explore__grid">
                <div className="explore__large__card explore__card">
                    <img
                        src={ExploreImage1}
                        alt="Find your match"
                        className="explore__image"
                    />
                    <p className="explore__text">Find Your Perfect Match</p>
                </div>

                <div className="explore__small__card explore__card">
                    <img
                        src={ExploreImage2}
                        alt="Trending"
                        className="explore__image"
                    />
                    <p className="explore__text">Trending</p>
                </div>

                <div className="explore__small__card explore__card">
                    <img
                        src={ExploreImage3}
                        alt="More Categories"
                        className="explore__image"
                    />
                    <p className="explore__text">More Categories</p>
                </div>
            </div>
        </div>
    );
};

export default ExploreSection;
