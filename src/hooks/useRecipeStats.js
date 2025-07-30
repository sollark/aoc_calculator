import { useMemo } from "react";
import { useAvailableList } from "../contexts/AvailableRecipeListContext";
import { useSelectedList } from "../contexts/SelectedRecipeListContext";

/**
 * Hook for calculating recipe statistics
 * Now gets all data directly from contexts - no parameters needed!
 */
export const useRecipeStats = () => {
  // ✅ DIRECT CONTEXT: Get available recipes from context
  const { availableRecipes } = useAvailableList();

  // ✅ DIRECT CONTEXT: Get selected recipes from context
  const { recipeList } = useSelectedList();

  return useMemo(() => {
    // Filter craftable recipes (same logic as RecipeManagement)
    const craftableRecipes =
      availableRecipes?.filter((recipe) => {
        return (
          recipe.recipe &&
          (recipe.recipe.artisanSkill ||
            recipe.recipe.workStation ||
            recipe.recipe.components)
        );
      }) || [];

    const totalRecipes = craftableRecipes.length;
    const selectedCount = recipeList?.length || 0;
    const availableCount = Math.max(0, totalRecipes - selectedCount);

    // Calculate unique recipes vs duplicates
    const uniqueRecipeIds = new Set(recipeList.map((recipe) => recipe.id));
    const duplicateCount = selectedCount - uniqueRecipeIds.size;

    return {
      totalRecipes,
      selectedCount,
      availableCount,
      duplicateCount,
      hasRecipes: selectedCount > 0,
      canAddMore: availableCount > 0,
      craftableRecipes, // ✅ BONUS: Return the filtered list too
    };
  }, [availableRecipes, recipeList]);
};
