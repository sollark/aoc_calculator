import { useState, useCallback, useMemo } from "react";

/**
 * Custom hook for managing component quantities state
 *
 * Encapsulates all quantity management logic with immutable updates.
 * Follows single responsibility principle by handling only quantity state.
 *
 * @param {Array} components - Array of components
 * @param {Function} onQuantityChange - External quantity change handler
 * @returns {Object} Quantity state and handlers
 */
export const useComponentQuantities = (components = [], onQuantityChange) => {
  const [componentQuantities, setComponentQuantities] = useState({});

  // Pure function for quantity updates with immutability
  const updateQuantity = useCallback(
    (componentId, componentName, newQuantity) => {
      setComponentQuantities((prev) => ({
        ...prev,
        [componentId]: newQuantity,
      }));

      // Notify external handler if provided
      onQuantityChange?.(componentId, componentName, newQuantity);
    },
    [onQuantityChange]
  );

  // Memoized calculations to prevent unnecessary recalculations
  const quantityMetrics = useMemo(() => {
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

    const isAllComplete =
      totalComponents > 0 && completedComponents === totalComponents;

    return {
      totalComponents,
      completedComponents,
      totalQuantityNeeded,
      totalQuantityHave,
      isAllComplete,
    };
  }, [components, componentQuantities]);

  // Pure function to get component status
  const getComponentStatus = useCallback(
    (component) => {
      const currentQuantity = componentQuantities[component.id] || 0;
      const isComplete = currentQuantity >= component.quantity;
      const shortage = Math.max(0, component.quantity - currentQuantity);

      return {
        currentQuantity,
        isComplete,
        shortage,
      };
    },
    [componentQuantities]
  );

  return {
    componentQuantities,
    quantityMetrics,
    handlers: {
      updateQuantity,
      getComponentStatus,
    },
  };
};
