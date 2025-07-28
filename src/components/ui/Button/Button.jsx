import React from "react";
import PropTypes from "prop-types";
import "./Button.css";

/**
 * Reusable Button Component
 *
 * Encapsulates button behavior with various variants, sizes, and states.
 * Supports loading states, icons, and custom styling.
 *
 * @component
 */
const Button = ({
  children,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  onClick,
  type = "button",
  className = "",
  icon,
  iconPosition = "left",
  fullWidth = false,
  badge,
  ...props
}) => {
  // Handle click with loading state protection
  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  // Build CSS classes
  const buttonClasses = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    disabled && "button--disabled",
    loading && "button--loading",
    fullWidth && "button--full-width",
    icon && "button--with-icon",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Render icon
  const renderIcon = () => {
    if (!icon) return null;

    return (
      <span className={`button__icon button__icon--${iconPosition}`}>
        {typeof icon === "string" ? <span>{icon}</span> : icon}
      </span>
    );
  };

  // Render badge
  const renderBadge = () => {
    if (badge === null || badge === undefined) return null;

    return <span className="button__badge">{badge}</span>;
  };

  // Render loading spinner
  const renderSpinner = () => {
    if (!loading) return null;

    return (
      <span className="button__spinner">
        <svg
          className="button__spinner-icon"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="button__spinner-track"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="button__spinner-path"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </span>
    );
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={buttonClasses}
      {...props}
    >
      {loading && renderSpinner()}
      {icon && iconPosition === "left" && renderIcon()}

      <span className="button__content">
        {children}
        {renderBadge()}
      </span>

      {icon && iconPosition === "right" && renderIcon()}
    </button>
  );
};

Button.propTypes = {
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Visual variant */
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "outline",
    "ghost",
    "danger",
    "success",
  ]),
  /** Size variant */
  size: PropTypes.oneOf(["small", "medium", "large"]),
  /** Whether button is disabled */
  disabled: PropTypes.bool,
  /** Whether button is in loading state */
  loading: PropTypes.bool,
  /** Click handler */
  onClick: PropTypes.func,
  /** Button type */
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Icon element or string */
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  /** Icon position */
  iconPosition: PropTypes.oneOf(["left", "right"]),
  /** Whether button takes full width */
  fullWidth: PropTypes.bool,
  /** Badge content (number, string, or null to hide) */
  badge: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export default Button;
