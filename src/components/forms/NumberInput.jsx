import React from 'react';
import './NumberInput.css';

const NumberInput = ({ 
  label, 
  value, 
  onChange, 
  placeholder = "Enter a quantity",
  min = 0,
  max = 1000,
  step = 1,
  id,
  className = "",
  ...props 
}) => {
  console.log(`NumberInput rendered`);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    console.log(`Input changed to: ${inputValue}`);
    
    // Only allow valid numbers, do not allow empty string
    if (!isNaN(inputValue) && inputValue !== '') {
      onChange(Number(inputValue));
    }
  };

  return (
    <div className={`number-input-container ${className}`}>
      {label && (
        <label htmlFor={id} className="number-input-label">
          {label}
        </label>
      )}
      <input
        id={id}
        type="number"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className="number-input-field"
        {...props}
      />
    </div>
  );
};

export default NumberInput;