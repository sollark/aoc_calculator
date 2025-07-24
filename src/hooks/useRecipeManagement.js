import { useCallback } from "react";

/**
 * Custom hook for managing recipe operations
 * Provides memoized handlers for recipe management operations
 *
 * @param {Object} stateManagers - State management functions
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @param {Function} setSelectedRecipe - Function to set selected recipe
 * @returns {Object} Recipe management handlers
 */
export const useRecipeManagement = (
  stateManagers,
  recipeServiceFunctions,
  setSelectedRecipe
) => {
  /**
   * Handle recipe addition with service validation
   */
  const handleAddRecipe = useCallback(
    (recipeList, selectedRecipe) => {
      const result = recipeServiceFunctions.addRecipeToList(
        recipeList,
        selectedRecipe
      );
      return stateManagers.handleRecipeAddition(result);
    },
    [recipeServiceFunctions, stateManagers]
  );

  /**
   * Handle recipe removal
   */
  const handleRemoveRecipe = useCallback(
    (recipeId) => {
      return stateManagers.handleRecipeRemoval(recipeId);
    },
    [stateManagers]
  );

  /**
   * Handle clearing recipe list
   */
  const handleClearList = useCallback(() => {
    return stateManagers.clearRecipeList();
  }, [stateManagers]);

  /**
   * Handle recipe selection change
   */
  const handleRecipeChange = useCallback(
    (recipeName) => {
      setSelectedRecipe(recipeName);
    },
    [setSelectedRecipe]
  );

  return {
    handleAddRecipe,
    handleRemoveRecipe,
    handleClearList,
    handleRecipeChange,
  };
};

export default useRecipeManagement;
