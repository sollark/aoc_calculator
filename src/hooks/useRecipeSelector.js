import { useCallback, useMemo } from "react";

/**
 * Custom hook for recipe selection logic
 *
 * Encapsulates all recipe selection state management and validation.
 * Follows single responsibility principle by handling only selection logic.
 *
 * @param {Array} recipes - Available recipes
 * @param {Object} selectedRecipe - Currently selected recipe
 * @param {Function} onRecipeChange - Recipe change handler
 * @param {Function} onAddRecipe - Add recipe handler
 * @returns {Object} Recipe selector state and handlers
 */
export const useRecipeSelector = ({
  recipes = [],
  selectedRecipe,
  onRecipeChange,
  onAddRecipe,
}) => {
  // Memoize recipe options to prevent unnecessary re-renders
  const selectOptions = useMemo(() => {
    return Array.isArray(recipes) ? recipes : [];
  }, [recipes]);

  // Memoize selection state
  const selectionState = useMemo(
    () => ({
      hasRecipes: selectOptions.length > 0,
      hasSelection: Boolean(selectedRecipe),
      canAddRecipe: Boolean(selectedRecipe),
      isLoading: selectOptions.length === 0,
    }),
    [selectOptions.length, selectedRecipe]
  );

  // Pure function for recipe selection handling
  const handleRecipeSelect = useCallback(
    (selectedOption) => {
      if (!selectedOption) {
        console.warn("❌ Invalid recipe selection");
        return;
      }

      console.log("🔍 Recipe selected:", selectedOption.name);
      onRecipeChange?.(selectedOption);
    },
    [onRecipeChange]
  );

  // Pure function for add recipe handling with validation
  const handleAddRecipe = useCallback(
    (event) => {
      event?.preventDefault();

      if (!selectedRecipe) {
        console.warn("❌ Cannot add recipe: No recipe selected");
        return;
      }

      console.log("🔧 Adding recipe:", selectedRecipe.name);
      onAddRecipe?.(event);
    },
    [selectedRecipe, onAddRecipe]
  );

  return {
    selectOptions,
    selectionState,
    handlers: {
      onRecipeSelect: handleRecipeSelect,
      onAddRecipe: handleAddRecipe,
    },
  };
};
