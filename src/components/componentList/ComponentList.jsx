import React, { useState } from "react";
import PropTypes from "prop-types";
import BaseRecipeList from "../baseRecipeList/BaseRecipeList";
import CraftComponent from "../craftComponent/CraftComponent";
import "./componentList.css";

const ComponentList = ({
  components,
  title = "Required Components",
  showQuantityControls = false,
  showBreakdown = false,
  onQuantityChange,
}) => {
  // Use component ID as key instead of name for state management
  const [componentQuantities, setComponentQuantities] = useState({});

  const handleQuantityChange = (componentId, componentName, newQuantity) => {
    setComponentQuantities((prev) => ({
      ...prev,
      [componentId]: newQuantity, // Use ID as key
    }));

    if (onQuantityChange) {
      onQuantityChange(componentId, componentName, newQuantity);
    }
  };

  const renderComponentItem = (component) => {
    const currentQuantity = componentQuantities[component.id] || 0;
    const isComplete = currentQuantity >= component.quantity;
    const shortage = Math.max(0, component.quantity - currentQuantity);

    return (
      <div
        className={`component-list__item-content ${
          isComplete ? "component-list__item-content--complete" : ""
        }`}
      >
        <div className="component-list__item-header">
          <CraftComponent
            id={component.id}
            name={component.name}
            quantity={component.quantity}
            currentQuantity={currentQuantity}
            onQuantityChange={
              showQuantityControls ? handleQuantityChange : undefined
            }
            readOnly={!showQuantityControls}
          />

          {showBreakdown && (
            <div className="component-list__item-meta">
              {component.isRaw && (
                <span className="component-list__badge component-list__badge--raw">
                  Raw Material
                </span>
              )}
              {component.isUnknown && (
                <span className="component-list__badge component-list__badge--unknown">
                  Unknown
                </span>
              )}
              {shortage > 0 && (
                <span className="component-list__shortage">
                  Need: {shortage}
                </span>
              )}
              {isComplete && (
                <span className="component-list__complete">✓ Complete</span>
              )}
            </div>
          )}
        </div>

        {component.description && (
          <p className="component-list__description">{component.description}</p>
        )}
      </div>
    );
  };

  // Calculate totals for summary - use component.id for lookups
  const totalComponents = components.length;
  const completedComponents = components.filter(
    (component) =>
      (componentQuantities[component.id] || 0) >= component.quantity
  ).length;
  const totalQuantityNeeded = components.reduce(
    (sum, component) => sum + component.quantity,
    0
  );
  const totalQuantityHave = components.reduce(
    (sum, component) => sum + (componentQuantities[component.id] || 0),
    0
  );

  const headerActions = showBreakdown && totalComponents > 0 && (
    <div className="component-list__summary">
      <span className="component-list__summary-stat">
        Components: {completedComponents}/{totalComponents}
      </span>
      <span className="component-list__summary-stat">
        Total: {totalQuantityHave}/{totalQuantityNeeded}
      </span>
      {completedComponents === totalComponents && (
        <span className="component-list__summary-complete">
          🎉 All Complete!
        </span>
      )}
    </div>
  );

  return (
    <BaseRecipeList
      items={components}
      title={title ? `${title} (${totalComponents} unique materials)` : null}
      emptyMessage="No components required."
      className="component-list"
      headerActions={headerActions}
      itemRenderer={renderComponentItem}
    />
  );
};

ComponentList.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      isRaw: PropTypes.bool,
      isUnknown: PropTypes.bool,
      description: PropTypes.string,
    })
  ).isRequired,
  title: PropTypes.string,
  showQuantityControls: PropTypes.bool,
  showBreakdown: PropTypes.bool,
  onQuantityChange: PropTypes.func,
};

export default ComponentList;
