import { useMemo } from "react";

/**
 * Custom hook for filtering recipes by type
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @param {string[]} allowedTypes - Array of allowed recipe types
 * @returns {Array} Filtered recipes
 */
export const useRecipeFiltering = (
  recipeServiceFunctions,
  allowedTypes = ["intermediate_recipes", "crafted_items"]
) => {
  return useMemo(() => {
    if (!recipeServiceFunctions) return [];

    try {
      const allRecipes = recipeServiceFunctions.getAllRecipes();
      return allRecipes.filter((recipe) => allowedTypes.includes(recipe.type));
    } catch (err) {
      console.error("Error filtering recipes:", err);
      return [];
    }
  }, [recipeServiceFunctions, allowedTypes]);
};
