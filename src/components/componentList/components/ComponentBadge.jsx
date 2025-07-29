import React from "react";
import PropTypes from "prop-types";

/**
 * ComponentBadge Component
 *
 * Pure component for displaying component status badges.
 * Follows single responsibility principle - only handles badge display.
 *
 * @component
 */
const ComponentBadge = ({ type, children, className = "" }) => {
  const badgeClasses = [
    "component-list__badge",
    `component-list__badge--${type}`,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <span className={badgeClasses}>{children}</span>;
};

ComponentBadge.propTypes = {
  /** Badge type variant */
  type: PropTypes.oneOf(["raw", "unknown", "shortage", "complete"]).isRequired,
  /** Badge content */
  children: PropTypes.node.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ComponentBadge;
