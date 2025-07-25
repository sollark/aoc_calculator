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
      console.log("🔍 handleAddRecipe called with:", selectedRecipe);
      console.log("🔍 stateManagers:", stateManagers);
      console.log("🔍 stateManagers.recipeList:", stateManagers?.recipeList);

      if (!stateManagers?.recipeList) {
        console.error(
          "❌ Failed to add recipe: stateManagers.recipeList not available"
        );
        return;
      }

      if (!selectedRecipe) {
        console.error("❌ Failed to add recipe: No recipe selected");
        return;
      }

      console.log(
        "🔍 Available functions in stateManagers.recipeList:",
        Object.keys(stateManagers.recipeList)
      );

      if (!stateManagers.recipeList.addRecipe) {
        console.error(
          "❌ Failed to add recipe: addRecipe function not available"
        );
        return;
      }

      const result = stateManagers.recipeList.addRecipe(
        recipeList,
        selectedRecipe
      );

      console.log("🔍 addRecipe result:", result);

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
