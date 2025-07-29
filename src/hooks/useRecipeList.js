import { useRecipeListContext } from "../contexts/RecipeListContext";

/**
 * Simplified hook that delegates to context
 * This maintains backward compatibility while using context internally
 *
 * @returns {Object} Recipe list state and handlers from context
 */
export const useRecipeList = () => {
  const {
    recipeList,
    recipeCount,
    hasRecipes,
    addRecipe,
    removeRecipe,
    clearList,
  } = useRecipeListContext();

  // Return handlers with consistent naming for backward compatibility
  return {
    recipeList,
    recipeCount,
    hasRecipes,
    handleAddRecipe: addRecipe,
    handleRemoveRecipe: removeRecipe,
    handleClearList: clearList,
  };
};
