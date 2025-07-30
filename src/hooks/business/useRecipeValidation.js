import { useMemo } from "react";
import { useAppState } from "../../contexts/AppStateContext";

/**
 * Business logic hook for recipe validation
 * Pure validation logic separated from UI
 */
export const useRecipeValidation = (selectedRecipe) => {
  const { recipeList } = useAppState();

  return useMemo(() => {
    const hasSelection = Boolean(selectedRecipe);

    const isAlreadySelected =
      hasSelection &&
      recipeList.some(
        (item) =>
          item.recipe?.id === selectedRecipe.id ||
          item.recipe?.name === selectedRecipe.name
      );

    const canAddSelected = hasSelection && !isAlreadySelected;
    const canClearList = recipeList.length > 0;

    return {
      hasSelection,
      isAlreadySelected,
      canAddSelected,
      canClearList,
      validationMessage: !hasSelection
        ? "Select a recipe to add"
        : isAlreadySelected
        ? "Recipe already in list"
        : "Ready to add recipe",
    };
  }, [selectedRecipe, recipeList]);
};
