import React, { useState } from "react";
import "./AllergensModal.css";

const COMMON_ALLERGENS = [
  "celery",
  "crustacean",
  "egg",
  "fish, sea food",
  "gluten",
  "lupine",
  "milk",
  "mustard",
  "peanut",
  "sesame",
  "soy",
  "tree-nut"
];

interface Props {
  onConfirm: (selected: string[]) => void;
  initial?: string[];
}

const AllergensModal: React.FC<Props> = ({ onConfirm, initial = [] }) => {
  const [selected, setSelected] = useState<string[]>(initial);

  const toggle = (allergen: string) => {
    setSelected((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  return (
    <div className="modal__overlay">
      <div className="modal__content">
        <h2>Food Allergies</h2>
        <p>Select any allergens you want us to avoid.</p>

        <div className="modal__list">
          {COMMON_ALLERGENS.map((allergen) => (
            <label key={allergen} className="modal__item">
              <input
                type="checkbox"
                checked={selected.includes(allergen)}
                onChange={() => toggle(allergen)}
              />
              {allergen}
            </label>
          ))}
        </div>

        <button
          className="modal__confirm"
          onClick={() => onConfirm(selected)}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default AllergensModal;
