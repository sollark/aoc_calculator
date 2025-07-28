import React from "react";
import PropTypes from "prop-types";
import "./Select.css";

/**
 * Reusable Select Component
 *
 * Encapsulates select dropdown logic with proper value handling and validation.
 * Supports both simple values and complex object selection with custom value extraction.
 *
 * @component
 */
const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  getOptionValue,
  getOptionLabel,
  getOptionKey,
  emptyMessage = "No options available",
  ...props
}) => {
  // Ensure options is always an array
  const safeOptions = Array.isArray(options) ? options : [];

  // Default value extractors if not provided
  const extractValue = getOptionValue || ((option) => option?.value || option);
  const extractLabel =
    getOptionLabel || ((option) => option?.label || option?.name || option);
  const extractKey =
    getOptionKey ||
    ((option) => option?.id || option?.key || extractValue(option));

  // Handle change event
  const handleChange = (e) => {
    const selectedValue = e.target.value;

    if (!selectedValue) {
      onChange?.(null);
      return;
    }

    // Find the full option object that matches the selected value
    const selectedOption = safeOptions.find((option) => {
      const optionValue = extractValue(option);
      return String(optionValue) === String(selectedValue);
    });

    onChange?.(selectedOption || selectedValue);
  };

  // Get current value for the select element
  const selectValue = value ? String(extractValue(value)) : "";

  // Handle empty state
  if (safeOptions.length === 0) {
    return (
      <select
        disabled
        className={`select select--empty ${className}`}
        {...props}
      >
        <option value="">{emptyMessage}</option>
      </select>
    );
  }

  return (
    <select
      value={selectValue}
      onChange={handleChange}
      disabled={disabled}
      className={`select ${disabled ? "select--disabled" : ""} ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {safeOptions.map((option) => {
        // Safety check for option validity
        if (!option) {
          console.warn("Invalid option:", option);
          return null;
        }

        const key = extractKey(option);
        const value = extractValue(option);
        const label = extractLabel(option);

        return (
          <option key={key} value={value}>
            {label}
          </option>
        );
      })}
    </select>
  );
};

Select.propTypes = {
  /** Array of options to display */
  options: PropTypes.array,
  /** Currently selected value (can be primitive or object) */
  value: PropTypes.any,
  /** Callback when selection changes - receives full option object */
  onChange: PropTypes.func,
  /** Placeholder text for empty selection */
  placeholder: PropTypes.string,
  /** Whether select is disabled */
  disabled: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Function to extract value from option object */
  getOptionValue: PropTypes.func,
  /** Function to extract display label from option object */
  getOptionLabel: PropTypes.func,
  /** Function to extract unique key from option object */
  getOptionKey: PropTypes.func,
  /** Message to show when no options available */
  emptyMessage: PropTypes.string,
};

export default Select;
