import React from "react";
import PropTypes from "prop-types";
import "./IconButton.css";

/**
 * IconButton Component
 *
 * Circular button designed for single icons/actions.
 * Perfect for remove, close, edit actions in lists and cards.
 *
 * @component
 */
const IconButton = ({
  icon,
  onClick,
  variant = "default",
  size = "medium",
  disabled = false,
  className = "",
  "aria-label": ariaLabel,
  ...props
}) => {
  const handleClick = (e) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const buttonClasses = [
    "icon-button",
    `icon-button--${variant}`,
    `icon-button--${size}`,
    disabled && "icon-button--disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={buttonClasses}
      aria-label={ariaLabel}
      {...props}
    >
      <span className="icon-button__icon">
        {typeof icon === "string" ? <span>{icon}</span> : icon}
      </span>
    </button>
  );
};

IconButton.propTypes = {
  /** Icon to display (string or React element) */
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  /** Click handler */
  onClick: PropTypes.func,
  /** Visual variant */
  variant: PropTypes.oneOf(["default", "danger", "success", "ghost"]),
  /** Size variant */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Whether button is disabled */
  disabled: PropTypes.bool,
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Accessibility label (required for icon-only buttons) */
  "aria-label": PropTypes.string.isRequired,
};

export default IconButton;
