import React from "react";
import PropTypes from "prop-types";
import ComponentBadge from "./ComponentBadge";

/**
 * ComponentItemMeta Component
 *
 * Pure component for displaying component metadata and status.
 * Encapsulates badge logic for clean separation of concerns.
 *
 * @component
 */
const ComponentItemMeta = ({ component, componentStatus, showBreakdown }) => {
  // Early return if metadata shouldn't be shown
  if (!showBreakdown) return null;

  const { isComplete, shortage } = componentStatus;

  return (
    <div className="component-list__item-meta">
      {component.isRaw && (
        <ComponentBadge type="raw">Raw Material</ComponentBadge>
      )}

      {component.isUnknown && (
        <ComponentBadge type="unknown">Unknown</ComponentBadge>
      )}

      {shortage > 0 && (
        <span className="component-list__shortage">Need: {shortage}</span>
      )}

      {isComplete && (
        <span className="component-list__complete">✓ Complete</span>
      )}
    </div>
  );
};

ComponentItemMeta.propTypes = {
  /** Component data object */
  component: PropTypes.shape({
    isRaw: PropTypes.bool,
    isUnknown: PropTypes.bool,
  }).isRequired,
  /** Component status object */
  componentStatus: PropTypes.shape({
    isComplete: PropTypes.bool.isRequired,
    shortage: PropTypes.number.isRequired,
  }).isRequired,
  /** Whether to show breakdown metadata */
  showBreakdown: PropTypes.bool.isRequired,
};

export default ComponentItemMeta;
