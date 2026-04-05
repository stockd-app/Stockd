import React, { useMemo, useState } from "react";
import Button from "../Button/Button";
import { X } from "lucide-react";
import { COMMON_ALLERGENS, NOT_SURE_ALLERGEN_ICON } from "../../config/consts";

import "./AllergensModal.css";

interface Props {
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
  initial?: string[];
}

const AllergensModal: React.FC<Props> = ({
  onConfirm,
  onClose,
  initial = []
}) => {
  const allAllergenValues = useMemo(
    () => COMMON_ALLERGENS.map((item) => item.value),
    []
  );

  const initialIsAllSelected =
    allAllergenValues.length > 0 &&
    allAllergenValues.every((value) => initial.includes(value));

  const [selected, setSelected] = useState<string[]>(initial);
  const [isNotSureChecked, setIsNotSureChecked] = useState(initialIsAllSelected);

  const toggle = (allergen: string) => {
    if (isNotSureChecked) {
      setIsNotSureChecked(false);
      setSelected([allergen]);
      return;
    }

    setSelected((prev) =>
      prev.includes(allergen)
        ? prev.filter((a) => a !== allergen)
        : [...prev, allergen]
    );
  };

  const toggleNotSure = () => {
    setIsNotSureChecked((prev) => {
      const nextChecked = !prev;
      setSelected(nextChecked ? allAllergenValues : []);
      return nextChecked;
    });
  };

  const areArraysEqual = (a: string[], b: string[]) => {
    if (a.length !== b.length) return false;

    const sortedA = [...a].sort();
    const sortedB = [...b].sort();

    return sortedA.every((item, index) => item === sortedB[index]);
  };

  const hasChanges =
    !areArraysEqual(selected, initial) || isNotSureChecked !== initialIsAllSelected;

  return (
    <div className="modal__overlay">
      <div className="modal__content">
        <div className="modal__header">
          <h2>Food Allergies</h2>
          <button className="modal__close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p>Select any allergens you want us to avoid.</p>

        <div className="modal__list">
          {COMMON_ALLERGENS.map(({ label, value, icon }) => (
            <label key={value} className="modal__item">
              <input
                type="checkbox"
                checked={!isNotSureChecked && selected.includes(value)}
                onChange={() => toggle(value)}
              />

              <div className="modal__item-content">
                {/* <Icon size={18} /> */}
                <img src={icon} alt={label} className="modal__icon" />
                <span>{label}</span>
              </div>
            </label>
          ))}
          <div className="modal__divider" />
          <label className="modal__item modal__item__not__sure">
            <input
              type="checkbox"
              checked={isNotSureChecked}
              onChange={toggleNotSure}
            />

            <div className="modal__item-content">
              <img
                src={NOT_SURE_ALLERGEN_ICON}
                alt="Not sure about allergens"
                className="modal__icon"
              />
              <span>Not sure about allergens</span>
            </div>
          </label>
        </div>

        <Button
          variant="primary"
          onClick={() => onConfirm(selected)}
          disabled={!hasChanges}
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default AllergensModal;
