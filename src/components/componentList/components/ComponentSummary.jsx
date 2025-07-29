import React from "react";
import PropTypes from "prop-types";

// ✅ Extract static props outside component
const STATIC_PROPS = {
  summary: {
    className: "component-list__summary",
  },
  stat: {
    className: "component-list__summary-stat",
  },
  complete: {
    className: "component-list__summary-complete",
  },
};

/**
 * ComponentSummary Component
 *
 * Pure component for displaying component completion summary.
 * Uses memoization-friendly props structure for performance.
 *
 * @component
 */
const ComponentSummary = ({ quantityMetrics }) => {
  const {
    totalComponents,
    completedComponents,
    totalQuantityNeeded,
    totalQuantityHave,
    isAllComplete,
  } = quantityMetrics;

  return (
    <div {...STATIC_PROPS.summary}>
      <span {...STATIC_PROPS.stat}>
        Components: {completedComponents}/{totalComponents}
      </span>
      <span {...STATIC_PROPS.stat}>
        Total: {totalQuantityHave}/{totalQuantityNeeded}
      </span>
      {isAllComplete && (
        <span {...STATIC_PROPS.complete}>🎉 All Complete!</span>
      )}
    </div>
  );
};

ComponentSummary.propTypes = {
  /** Quantity metrics object */
  quantityMetrics: PropTypes.shape({
    totalComponents: PropTypes.number.isRequired,
    completedComponents: PropTypes.number.isRequired,
    totalQuantityNeeded: PropTypes.number.isRequired,
    totalQuantityHave: PropTypes.number.isRequired,
    isAllComplete: PropTypes.bool.isRequired,
  }).isRequired,
};

export default ComponentSummary;
