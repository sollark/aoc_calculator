import { useMemo } from "react";

/**
 * Custom hook for recipe status logic
 *
 * Determines the appropriate status message and type based on current state.
 * Pure function approach for predictable status determination.
 *
 * @param {number} recipeCount - Total available recipes
 * @param {Object} selectedRecipe - Currently selected recipe
 * @param {number} recipeListCount - Number of recipes in list
 * @returns {Object} Status information
 */
export const useRecipeStatus = ({
  recipeCount = 0,
  selectedRecipe,
  recipeListCount = 0,
}) => {
  const status = useMemo(() => {
    // Priority 1: Show recipe list count if items exist
    if (recipeListCount > 0) {
      return {
        type: "success",
        message: `${recipeListCount} recipe${
          recipeListCount !== 1 ? "s" : ""
        } in your list`,
        priority: 1,
      };
    }

    // Priority 2: Show selected recipe
    if (selectedRecipe?.name) {
      return {
        type: "success",
        message: `✅ Selected: ${selectedRecipe.name}`,
        priority: 2,
      };
    }

    // Priority 3: Show available recipes
    if (recipeCount > 0) {
      return {
        type: "info",
        message: `${recipeCount} recipe${
          recipeCount !== 1 ? "s" : ""
        } available`,
        priority: 3,
      };
    }

    // Priority 4: Empty state
    return {
      type: "empty",
      message: "No recipes available",
      priority: 4,
    };
  }, [recipeCount, selectedRecipe, recipeListCount]);

  return status;
};
