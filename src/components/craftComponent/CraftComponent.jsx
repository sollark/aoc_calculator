import React, { useState } from "react";
import NumberInput from "../forms/NumberInput";

const CraftComponent = ({ name, quantity, onQuantityChange }) => {
  console.log(`CraftComponent rendered`);
  console.log(`Component: ${name}, Quantity: ${quantity}`);

  const [owned, setOwned] = useState(0);

  const handleChange = (newValue) => {

    const value = Math.max(0, Math.min(quantity, newValue)); // Ensure value is within bounds
    setOwned(value);

    onQuantityChange(name, value);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <span>
        {name} (needed: {quantity})
      </span>
      <NumberInput
        id={`${name}-quantity`}
        min={0}
        max={quantity}
        value={owned}
        onChange={handleChange}
        style={{ marginLeft: "1rem", width: "60px" }}
      />
      <span style={{ marginLeft: "0.5rem" }}>(you have: {owned})</span>
    </div>
  );
};

export default CraftComponent;
