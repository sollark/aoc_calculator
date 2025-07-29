import React from "react";
import PropTypes from "prop-types";
import CraftComponent from "../../craftComponent/CraftComponent";
import ComponentItemMeta from "./ComponentItemMeta";

// ✅ Extract static props outside component
const STATIC_PROPS = {
  container: {
    className: "component-list__item-content",
  },
  containerComplete: {
    className:
      "component-list__item-content component-list__item-content--complete",
  },
  header: {
    className: "component-list__item-header",
  },
  description: {
    className: "component-list__description",
  },
};

/**
 * ComponentItem Component
 *
 * Pure component for rendering individual component list items.
 * Composed of smaller components for maintainability.
 *
 * @component
 */
const ComponentItem = ({
  component,
  componentStatus,
  displayOptions,
  onQuantityChange,
}) => {
  const { isComplete, currentQuantity } = componentStatus;
  const { showQuantityControls, showBreakdown } = displayOptions;

  // Select container props based on completion status
  const containerProps = isComplete
    ? STATIC_PROPS.containerComplete
    : STATIC_PROPS.container;

  return (
    <div {...containerProps}>
      <div {...STATIC_PROPS.header}>
        <CraftComponent
          id={component.id}
          name={component.name}
          quantity={component.quantity}
          currentQuantity={currentQuantity}
          onQuantityChange={showQuantityControls ? onQuantityChange : undefined}
          readOnly={!showQuantityControls}
        />

        <ComponentItemMeta
          component={component}
          componentStatus={componentStatus}
          showBreakdown={showBreakdown}
        />
      </div>

      {component.description && (
        <p {...STATIC_PROPS.description}>{component.description}</p>
      )}
    </div>
  );
};

ComponentItem.propTypes = {
  /** Component data object */
  component: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    quantity: PropTypes.number.isRequired,
    description: PropTypes.string,
    isRaw: PropTypes.bool,
    isUnknown: PropTypes.bool,
  }).isRequired,
  /** Component status object */
  componentStatus: PropTypes.shape({
    currentQuantity: PropTypes.number.isRequired,
    isComplete: PropTypes.bool.isRequired,
    shortage: PropTypes.number.isRequired,
  }).isRequired,
  /** Display options */
  displayOptions: PropTypes.shape({
    showQuantityControls: PropTypes.bool.isRequired,
    showBreakdown: PropTypes.bool.isRequired,
  }).isRequired,
  /** Quantity change handler */
  onQuantityChange: PropTypes.func,
};

export default ComponentItem;
