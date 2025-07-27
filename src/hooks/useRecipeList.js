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
      setRecipeList,
      () => recipeList
    );
  }, [recipeServiceFunctions, recipeList]);

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
        return result;
      } catch (error) {
        console.error("❌ Error in handleAddRecipe:", error);
        return { success: false, message: error.message };
      }
    },
    [stateManagers]
  );

  // SIMPLIFIED: Remove recipe handler - just calls the state manager and updates state
  const handleRemoveRecipe = useCallback(
    (recipeId) => {
      console.log("🗑️ handleRemoveRecipe called with ID:", recipeId);
      console.log("🗑️ Current recipeList:", recipeList);
      console.log("🗑️ Current recipeList length:", recipeList.length);

      if (!stateManagers?.recipeList?.removeRecipe) {
        console.error("🗑️ No removeRecipe function available in stateManagers");
        return;
      }

      try {
        const updatedList = stateManagers.recipeList.removeRecipe(recipeId);
        console.log("🗑️ removeRecipe returned:", updatedList);
        console.log("🗑️ updatedList type:", typeof updatedList);
        console.log("🗑️ updatedList length:", updatedList?.length);

        setRecipeList(updatedList);
      } catch (error) {
        console.error("🗑️ Error in handleRemoveRecipe:", error);
      }
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
