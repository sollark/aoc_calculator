import { useMemo } from "react";

/**
 * Custom hook for recipe validation logic
 * @param {string} selectedRecipe - Currently selected recipe
 * @param {Array} recipeList - Current recipe list
 * @param {Array} allRecipes - All available recipes
 * @returns {Object} Validation state
 */
export const useRecipeValidation = (selectedRecipe, recipeList, allRecipes) => {
  return useMemo(() => {
    console.log("🔍 useRecipeValidation - selectedRecipe:", selectedRecipe);
    console.log("🔍 useRecipeValidation - recipeList:", recipeList);
    console.log(
      "🔍 useRecipeValidation - allRecipes length:",
      allRecipes?.length
    );

    // Check if a recipe is selected
    const hasSelection = Boolean(selectedRecipe);

    // Check if the selected recipe is already in the list
    const isAlreadyInList =
      hasSelection &&
      recipeList.some(
        (item) => item.recipe && item.recipe.id === selectedRecipe.id
      );

    // Can add if recipe is selected and not already in list
    const canAddSelected = hasSelection && !isAlreadyInList;

    // Can clear if list has items
    const canClearList = recipeList.length > 0;

    const validation = {
      hasSelection,
      canAddSelected,
      canClearList,
      isAlreadyInList,
    };

    console.log("🔍 useRecipeValidation result:", validation);

    return validation;
  }, [selectedRecipe, recipeList, allRecipes]);
};
