import { useCallback } from "react";

/**
 * Custom hook for managing recipe operations
 * SIMPLIFIED: Removed duplicate remove logic, focusing on high-level operations
 */
export const useRecipeManagement = (
  stateManagers,
  recipeServiceFunctions,
  setSelectedRecipe
) => {
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

  // SIMPLIFIED: Just delegate to state managers
  const handleRemoveRecipe = useCallback(
    (recipeId) => {
      return stateManagers.recipeList.removeRecipe(recipeId);
    },
    [stateManagers]
  );

  const handleClearList = useCallback(() => {
    return stateManagers.recipeList.clearList();
  }, [stateManagers]);

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
