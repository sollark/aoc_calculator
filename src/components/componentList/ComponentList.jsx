import React from "react";
import PropTypes from "prop-types";
import BaseRecipeList from "../baseRecipeList/BaseRecipeList";
import ComponentItem from "./components/ComponentItem";
import ComponentSummary from "./components/ComponentSummary";
import { useComponentQuantities } from "../../hooks/useComponentQuantities";
import { useComponentList } from "../../hooks/useComponentList";
import "./componentList.css";

/**
 * ComponentList Component
 *
 * Main orchestrator component for displaying component lists with quantity management.
 * Follows composition pattern with specialized child components.
 * Uses custom hooks for logic separation and functional programming principles.
 *
 * Features:
 * - Pure functional approach with hooks
 * - Composition over inheritance
 * - Single responsibility per component
 * - Immutable state management
 * - Performance-optimized with memoization
 *
 * @component
 */
const ComponentList = ({
  components = [],
  title = "Required Components",
  showQuantityControls = false,
  showBreakdown = false,
  onQuantityChange,
}) => {
  // Use custom hooks for state management and configuration
  const {
    quantityMetrics,
    handlers: { updateQuantity, getComponentStatus },
  } = useComponentQuantities(components, onQuantityChange);

  const { listConfig, displayOptions } = useComponentList({
    components,
    title,
    showQuantityControls,
    showBreakdown,
    quantityMetrics,
  });

  // Pure function for rendering component items
  const renderComponentItem = (component) => {
    const componentStatus = getComponentStatus(component);

    return (
      <ComponentItem
        component={component}
        componentStatus={componentStatus}
        displayOptions={displayOptions}
        onQuantityChange={updateQuantity}
      />
    );
  };

  // Generate header actions using composition
  const headerActions = displayOptions.shouldShowSummary ? (
    <ComponentSummary quantityMetrics={quantityMetrics} />
  ) : null;

  return (
    <BaseRecipeList
      {...listConfig}
      headerActions={headerActions}
      itemRenderer={renderComponentItem}
    />
  );
};

// Comprehensive PropTypes with clear documentation
ComponentList.propTypes = {
  /** Array of components to display */
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      isRaw: PropTypes.bool,
      isUnknown: PropTypes.bool,
      description: PropTypes.string,
    })
  ),
  /** List title */
  title: PropTypes.string,
  /** Whether to show quantity control inputs */
  showQuantityControls: PropTypes.bool,
  /** Whether to show detailed breakdown and metadata */
  showBreakdown: PropTypes.bool,
  /** Callback function when component quantity changes */
  onQuantityChange: PropTypes.func,
};

export default ComponentList;
