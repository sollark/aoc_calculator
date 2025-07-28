import React from "react";
import PropTypes from "prop-types";
import { QuantityControl } from "../ui";
import "./craftComponent.css";

const CraftComponent = ({
  id,
  name,
  quantity,
  currentQuantity = 0,
  onQuantityChange,
  readOnly = false,
}) => {
  const handleQuantityChange = (newValue) => {
    if (onQuantityChange && !readOnly) {
      onQuantityChange(id, name, newValue); // Pass both ID and name
    }
  };

  return (
    <div
      className={`craft-component ${
        readOnly ? "craft-component--readonly" : ""
      }`}
    >
      <div className="craft-component__info">
        <span className="craft-component__name">{name}</span>
        <span className="craft-component__quantity">Required: {quantity}</span>
        {!readOnly && (
          <span className="craft-component__current">
            Have: {currentQuantity}
          </span>
        )}
      </div>

      {!readOnly && onQuantityChange && (
        <div className="craft-component__controls">
          <QuantityControl
            value={currentQuantity}
            onChange={handleQuantityChange}
            min={0}
            size="small"
            disabled={readOnly}
            aria-label={`Quantity of ${name}`}
            className="craft-component__quantity-control"
          />
        </div>
      )}
    </div>
  );
};

CraftComponent.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  name: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  currentQuantity: PropTypes.number,
  onQuantityChange: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default CraftComponent;
