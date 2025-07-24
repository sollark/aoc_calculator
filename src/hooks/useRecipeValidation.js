import { useMemo } from "react";

/**
 * Custom hook for recipe validation logic
 * @param {string} selectedRecipe - Currently selected recipe
 * @param {Array} recipeList - Current recipe list
 * @param {Array} allRecipes - All available recipes
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @returns {Object} Validation state
 */
export const useRecipeValidation = (
  selectedRecipe,
  recipeList,
  allRecipes,
  recipeServiceFunctions
) => {
  return useMemo(() => {
    const canAddSelected = Boolean(
      selectedRecipe &&
        recipeServiceFunctions &&
        !recipeServiceFunctions.isRecipeAlreadyAdded(
          recipeList,
          allRecipes.find((recipe) => recipe.name === selectedRecipe)
        )
    );

    const hasRecipes = recipeList.length > 0;

    return {
      canAddSelected,
      canClearList: hasRecipes,
      hasSelection: Boolean(selectedRecipe),
    };
  }, [selectedRecipe, recipeList, allRecipes, recipeServiceFunctions]);
};
