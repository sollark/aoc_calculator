import { useMemo, useCallback } from "react";
import {
  createRecipeLookups,
  createRawComponentLookups,
  findRecipe,
  findRawComponent,
} from "../utils/recipeUtils";
import { createRecipeServiceFunctions } from "../services/recipeService"; // Named import

/**
 * Custom hook for initializing recipe data and services
 * @param {Array} allRecipes - All available recipes
 * @param {Array} rawComponents - All raw components
 * @returns {Object} Recipe data, lookups, and service functions
 */
export const useRecipeData = (allRecipes, rawComponents) => {
  // Create efficient lookup maps using utility functions
  const recipeLookups = useMemo(
    () => createRecipeLookups(allRecipes),
    [allRecipes]
  );

  const rawComponentLookups = useMemo(
    () => createRawComponentLookups(rawComponents),
    [rawComponents]
  );

  // Optimized finder functions using lookups
  const findRecipeByIdentifier = useCallback(
    (identifier) => findRecipe(recipeLookups, allRecipes, identifier),
    [recipeLookups, allRecipes]
  );

  const findRawComponentByIdentifier = useCallback(
    (identifier) =>
      findRawComponent(rawComponentLookups, rawComponents, identifier),
    [rawComponentLookups, rawComponents]
  );

  // Create recipe service functions
  const recipeServiceFunctions = useMemo(
    () =>
      createRecipeServiceFunctions(
        findRecipeByIdentifier,
        findRawComponentByIdentifier
      ),
    [findRecipeByIdentifier, findRawComponentByIdentifier]
  );

  return {
    recipeLookups,
    rawComponentLookups,
    findRecipeByIdentifier,
    findRawComponentByIdentifier,
    recipeServiceFunctions,
  };
};

// Default export for the hook
export default useRecipeData;
