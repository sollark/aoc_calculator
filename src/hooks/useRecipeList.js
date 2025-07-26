import { useState, useCallback, useMemo } from "react";
import { createStateManagers } from "../services/appStateService";

/**
 * Custom hook for managing recipe list operations
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @returns {Object} Recipe list state and handlers
 */
export const useRecipeList = (recipeServiceFunctions) => {
  const [recipeList, setRecipeList] = useState([]);

  // Create stateManagers inside this hook, using the local setRecipeList
  const stateManagers = useMemo(() => {
    if (!recipeServiceFunctions) return null;

    console.log("🔍 Creating stateManagers with:");
    console.log("🔍 setRecipeList type:", typeof setRecipeList);
    console.log("🔍 recipeList length:", recipeList.length);

    return createStateManagers(
      recipeServiceFunctions,
      setRecipeList, // ← Now this is the actual function
      () => recipeList // ← Now this returns current state
    );
  }, [recipeServiceFunctions, recipeList]);

  // Make sure the state updates properly after adding a recipe
  const handleAddRecipe = useCallback(
    async (recipe) => {
      console.log("🔍 handleAddRecipe called with:", recipe);
      console.log("🔍 Recipe type:", typeof recipe);
      console.log("🔍 Recipe structure:", recipe);

      if (!stateManagers?.recipeList?.addRecipe) {
        console.error("❌ addRecipe function not available in stateManagers");
        return { success: false, message: "addRecipe function not available" };
      }

      try {
        const result = await stateManagers.recipeList.addRecipe(recipe);
        console.log("🔍 addRecipe result:", result);

        // The setState callback in appStateService.js will handle the state update
        // No need to manually update here since we're using the callback approach

        return result;
      } catch (error) {
        console.error("❌ Error in handleAddRecipe:", error);
        return { success: false, message: error.message };
      }
    },
    [stateManagers]
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
