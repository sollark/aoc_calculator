import { useCallback, useEffect } from "react";
import { useAppState } from "../../contexts/AppStateContext";
import { processRecipeListToRawComponents } from "../../services/recipe";

/**
 * Business logic hook for recipe processing
 * Separates business logic from UI concerns
 */
export const useRecipeProcessor = () => {
  const { recipeList, setComponents } = useAppState();

  const processRecipes = useCallback(async () => {
    if (!recipeList || recipeList.length === 0) {
      setComponents([]);
      return;
    }

    try {
      const components = await processRecipeListToRawComponents(recipeList);
      setComponents(components);
    } catch (error) {
      console.error("Failed to process recipes:", error);
      setComponents([]);
    }
  }, [recipeList, setComponents]);

  // Auto-process when recipe list changes
  useEffect(() => {
    processRecipes();
  }, [processRecipes]);

  return {
    processRecipes,
    isProcessing: false, // Could be derived from state
  };
};
