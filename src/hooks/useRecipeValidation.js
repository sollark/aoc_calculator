import { useMemo } from "react";
import { useSelectedList } from "../contexts/SelectedRecipeListContext";

/**
 * Hook for recipe validation logic
 * Now takes selectedRecipe as parameter but gets recipeList from context
 */
export const useRecipeValidation = (selectedRecipe) => {
  // ✅ DIRECT CONTEXT: Get selected recipes directly
  const { recipeList } = useSelectedList();

  return useMemo(() => {
    const hasSelection = !!selectedRecipe;
    const isAlreadyInList =
      hasSelection &&
      recipeList.some(
        (item) =>
          item.recipe?.id === selectedRecipe.id ||
          item.recipe?.name === selectedRecipe.name
      );

    return {
      hasSelection,
      isAlreadyInList,
      canAddSelected: hasSelection && !isAlreadyInList,
      canClearList: recipeList.length > 0,
    };
  }, [selectedRecipe, recipeList]);
};
