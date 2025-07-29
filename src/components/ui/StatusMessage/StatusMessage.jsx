import React from "react";
import PropTypes from "prop-types";
import "./StatusMessage.css";

/**
 * StatusMessage Component
 *
 * Pure, reusable component for displaying status information.
 * Follows single responsibility principle - only handles status display.
 *
 * @component
 */
const StatusMessage = ({
  children,
  type = "info",
  className = "",
  ...props
}) => {
  const statusClasses = ["status-message", `status-message--${type}`, className]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={statusClasses} role="status" aria-live="polite" {...props}>
      {children}
    </div>
  );
};

StatusMessage.propTypes = {
  /** Message content */
  children: PropTypes.node.isRequired,
  /** Visual variant type */
  type: PropTypes.oneOf([
    "info",
    "success",
    "warning",
    "error",
    "loading",
    "empty",
  ]),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default StatusMessage;
