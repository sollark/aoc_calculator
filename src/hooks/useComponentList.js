import { useMemo } from "react";

/**
 * Custom hook for component list configuration and derived state
 *
 * Encapsulates component list logic and provides computed values.
 * Uses pure functions for predictable state derivation.
 *
 * @param {Object} params - Configuration parameters
 * @returns {Object} Component list configuration and computed state
 */
export const useComponentList = ({
  components = [],
  title = "Required Components",
  showQuantityControls = false,
  showBreakdown = false,
  quantityMetrics,
}) => {
  // Memoized title generation
  const computedTitle = useMemo(() => {
    if (!title) return null;
    return `${title} (${quantityMetrics.totalComponents} unique materials)`;
  }, [title, quantityMetrics.totalComponents]);

  // Memoized configuration object
  const listConfig = useMemo(
    () => ({
      items: components,
      title: computedTitle,
      emptyMessage: "No components required.",
      className: "component-list",
    }),
    [components, computedTitle]
  );

  // Memoized display options
  const displayOptions = useMemo(
    () => ({
      showQuantityControls,
      showBreakdown,
      shouldShowSummary: showBreakdown && quantityMetrics.totalComponents > 0,
    }),
    [showQuantityControls, showBreakdown, quantityMetrics.totalComponents]
  );

  return {
    listConfig,
    displayOptions,
  };
};
