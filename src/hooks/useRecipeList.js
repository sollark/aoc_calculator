import { useState, useCallback } from "react";

/**
 * Custom hook for managing recipe list operations
 * @param {Object} stateManagers - State management functions
 * @returns {Object} Recipe list state and handlers
 */
export const useRecipeList = (stateManagers) => {
  const [recipeList, setRecipeList] = useState([]);

  const handleAddRecipe = useCallback(
    (selectedRecipe) => {
      if (!stateManagers?.recipeList || !selectedRecipe) return;

      const result = stateManagers.recipeList.addRecipe(
        recipeList,
        selectedRecipe
      );

      if (result.success) {
        setRecipeList(result.newList);
      } else {
        console.warn("Failed to add recipe:", result.message);
      }
    },
    [stateManagers, recipeList]
  );

  const handleRemoveRecipe = useCallback(
    (recipeId) => {
      if (!stateManagers?.recipeList) return;

      const updatedList = stateManagers.recipeList.removeRecipe(
        recipeList,
        recipeId
      );
      setRecipeList(updatedList);
    },
    [stateManagers, recipeList]
  );

  const handleClearList = useCallback(() => {
    setRecipeList([]);
  }, []);

  return {
    recipeList,
    handleAddRecipe,
    handleRemoveRecipe,
    handleClearList,
  };
};
