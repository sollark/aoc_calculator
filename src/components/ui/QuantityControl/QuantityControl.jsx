import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import Button from "../Button"; // ✅ FIXED: Import as default export
import "./QuantityControl.css";

/**
 * QuantityControl Component
 *
 * Reusable quantity input with increment/decrement controls.
 * Encapsulates all quantity manipulation logic and validation.
 *
 * Features:
 * - Configurable min/max values
 * - Step size control
 * - Keyboard navigation
 * - Input validation
 * - Disabled states
 * - Custom styling variants
 *
 * @component
 */
const QuantityControl = ({
  value = 0,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  disabled = false,
  readOnly = false,
  placeholder = "0",
  size = "medium",
  variant = "default",
  className = "",
  showButtons = true,
  showInput = true,
  inputProps = {},
  decrementProps = {},
  incrementProps = {},
  "aria-label": ariaLabel,
  ...props
}) => {
  // Internal state for controlled/uncontrolled behavior
  const [internalValue, setInternalValue] = useState(value);
  const [inputValue, setInputValue] = useState(String(value));

  // Determine if component is controlled
  const isControlled = onChange !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Validate and constrain value within bounds
  const constrainValue = useCallback(
    (val) => {
      const numVal = Number(val);
      if (isNaN(numVal)) return min;
      return Math.max(min, Math.min(max, numVal));
    },
    [min, max]
  );

  // Handle value changes with validation
  const handleValueChange = useCallback(
    (newValue) => {
      const constrainedValue = constrainValue(newValue);

      if (isControlled) {
        onChange?.(constrainedValue);
      } else {
        setInternalValue(constrainedValue);
      }

      setInputValue(String(constrainedValue));
    },
    [constrainValue, isControlled, onChange]
  );

  // Handle input change with debounced validation
  const handleInputChange = useCallback(
    (e) => {
      const inputVal = e.target.value;
      setInputValue(inputVal);

      // Allow empty input for better UX
      if (inputVal === "") {
        return;
      }

      const numVal = parseInt(inputVal, 10);
      if (!isNaN(numVal)) {
        handleValueChange(numVal);
      }
    },
    [handleValueChange]
  );

  // Handle input blur to ensure valid value
  const handleInputBlur = useCallback(() => {
    if (inputValue === "" || isNaN(Number(inputValue))) {
      const fallbackValue = constrainValue(min);
      setInputValue(String(fallbackValue));
      handleValueChange(fallbackValue);
    }
  }, [inputValue, constrainValue, min, handleValueChange]);

  // Increment/decrement handlers
  const handleDecrement = useCallback(() => {
    if (disabled || readOnly) return;
    handleValueChange(currentValue - step);
  }, [disabled, readOnly, currentValue, step, handleValueChange]);

  const handleIncrement = useCallback(() => {
    if (disabled || readOnly) return;
    handleValueChange(currentValue + step);
  }, [disabled, readOnly, currentValue, step, handleValueChange]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (disabled || readOnly) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          handleIncrement();
          break;
        case "ArrowDown":
          e.preventDefault();
          handleDecrement();
          break;
        case "Enter":
          e.preventDefault();
          e.target.blur(); // Trigger validation
          break;
        default:
          // No action for other keys
          break;
      }
    },
    [disabled, readOnly, handleIncrement, handleDecrement]
  );

  // Check if buttons should be disabled
  const canDecrement = !disabled && !readOnly && currentValue > min;
  const canIncrement = !disabled && !readOnly && currentValue < max;

  // Build CSS classes
  const controlClasses = [
    "quantity-control",
    `quantity-control--${size}`,
    `quantity-control--${variant}`,
    disabled && "quantity-control--disabled",
    readOnly && "quantity-control--readonly",
    !showButtons && "quantity-control--input-only",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={controlClasses}
      role="spinbutton"
      aria-label={ariaLabel || "Quantity control"}
      aria-valuenow={currentValue}
      aria-valuemin={min}
      aria-valuemax={max === Infinity ? undefined : max}
      {...props}
    >
      {showButtons && (
        <Button
          onClick={handleDecrement}
          disabled={!canDecrement}
          variant="ghost"
          size={size}
          className="quantity-control__decrement"
          aria-label="Decrease quantity"
          {...decrementProps}
        >
          −
        </Button>
      )}

      {showInput && (
        <input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          min={min}
          max={max === Infinity ? undefined : max}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className="quantity-control__input"
          aria-label="Quantity input"
          {...inputProps}
        />
      )}

      {showButtons && (
        <Button
          onClick={handleIncrement}
          disabled={!canIncrement}
          variant="ghost"
          size={size}
          className="quantity-control__increment"
          aria-label="Increase quantity"
          {...incrementProps}
        >
          +
        </Button>
      )}
    </div>
  );
};

QuantityControl.propTypes = {
  /** Current quantity value */
  value: PropTypes.number,
  /** Callback when value changes - receives new value */
  onChange: PropTypes.func,
  /** Minimum allowed value */
  min: PropTypes.number,
  /** Maximum allowed value */
  max: PropTypes.number,
  /** Step size for increment/decrement */
  step: PropTypes.number,
  /** Whether control is disabled */
  disabled: PropTypes.bool,
  /** Whether control is read-only */
  readOnly: PropTypes.bool,
  /** Input placeholder text */
  placeholder: PropTypes.string,
  /** Size variant */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Visual variant */
  variant: PropTypes.oneOf(["default", "compact", "minimal"]),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Whether to show increment/decrement buttons */
  showButtons: PropTypes.bool,
  /** Whether to show input field */
  showInput: PropTypes.bool,
  /** Props to pass to input element */
  inputProps: PropTypes.object,
  /** Props to pass to decrement button */
  decrementProps: PropTypes.object,
  /** Props to pass to increment button */
  incrementProps: PropTypes.object,
  /** Accessibility label */
  "aria-label": PropTypes.string,
};

export default QuantityControl;
