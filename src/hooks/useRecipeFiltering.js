import { useMemo, useEffect, useState, useRef } from "react";

/**
 * Hook for filtering available recipes based on current criteria
 * Handles async recipe loading and provides filtered results
 *
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @returns {Object} Object containing filtered recipes and loading state
 */
export const useRecipeFiltering = (recipeServiceFunctions) => {
  const [allRecipes, setAllRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const loadingRef = useRef(false); // Prevent multiple simultaneous loads

  // Load recipes asynchronously
  useEffect(() => {
    const loadRecipes = async () => {
      // Prevent multiple simultaneous loading attempts
      if (loadingRef.current) {
        console.log("🔍 Already loading recipes, skipping...");
        return;
      }

      // Wait for recipeServiceFunctions to be available
      if (!recipeServiceFunctions?.getAllRecipes) {
        console.log("🔍 Waiting for recipe service functions...");
        setIsLoading(true);
        return;
      }

      try {
        loadingRef.current = true;
        setIsLoading(true);
        setError(null);
        console.log("🔍 Loading recipes for filtering...");

        const recipes = await recipeServiceFunctions.getAllRecipes();
        console.log("🔍 Loaded recipes:", recipes?.length || 0);

        if (Array.isArray(recipes)) {
          setAllRecipes(recipes);
        } else {
          console.error("Recipes is not an array:", recipes);
          setAllRecipes([]);
          setError("Invalid recipe data format");
        }
      } catch (error) {
        console.error("Error loading recipes for filtering:", error);
        setAllRecipes([]);
        setError(error.message);
      } finally {
        setIsLoading(false);
        loadingRef.current = false;
      }
    };

    loadRecipes();
  }, [recipeServiceFunctions]); // Only re-run when recipeServiceFunctions reference changes

  // Apply filtering logic (memoized for performance)
  const filteredRecipes = useMemo(() => {
    if (isLoading || !Array.isArray(allRecipes)) {
      return [];
    }

    try {
      // For now, return all recipes
      // Later you can add filtering logic here based on user preferences
      const filtered = allRecipes.filter((recipe) => {
        // Add your filtering logic here
        // For example: recipe.type !== 'hidden' || recipe.available === true
        return true; // Return all recipes for now
      });

      console.log(
        `🔍 Filtered ${filtered.length} recipes from ${allRecipes.length} total`
      );
      return filtered;
    } catch (error) {
      console.error("Error filtering recipes:", error);
      return [];
    }
  }, [allRecipes, isLoading]);

  // Return object with recipes and metadata
  return {
    recipes: filteredRecipes,
    isLoading,
    error,
    totalCount: allRecipes.length,
  };
};
