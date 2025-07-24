import { useMemo } from "react";

/**
 * Custom hook for calculating recipe statistics
 * @param {Array} allRecipes - All available recipes
 * @param {Array} recipeList - Current recipe list
 * @returns {Object} Recipe statistics
 */
export const useRecipeStats = (allRecipes, recipeList) => {
  return useMemo(() => {
    const totalRecipes = allRecipes.length;
    const selectedCount = recipeList.length;
    const availableCount = totalRecipes - selectedCount;

    // Calculate unique recipes vs duplicates
    const uniqueRecipeIds = new Set(recipeList.map((recipe) => recipe.id));
    const duplicateCount = selectedCount - uniqueRecipeIds.size;

    return {
      totalRecipes,
      selectedCount,
      availableCount,
      duplicateCount,
      hasRecipes: selectedCount > 0,
      canAddMore: availableCount > 0,
    };
  }, [allRecipes.length, recipeList]);
};
