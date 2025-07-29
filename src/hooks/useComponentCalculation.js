import { useState, useEffect } from "react";
import { processRecipeListToRawComponents } from "../services/recipe";

/**
 * Custom hook for calculating consolidated components from recipe list
 *
 * Encapsulates component calculation logic with proper error handling.
 * Uses direct import instead of dependency injection for better maintainability.
 *
 * @param {Array} recipeList - List of recipes to process
 * @returns {Array} Consolidated components
 */
export const useComponentCalculation = (recipeList) => {
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  useEffect(() => {
    const processComponents = async () => {
      console.log("🔍 useComponentCalculation called with:");
      console.log("🔍 recipeList:", recipeList);
      console.log("🔍 recipeList length:", recipeList?.length);

      // Log each recipe item for debugging
      recipeList?.forEach((item, index) => {
        console.log(`🔍 Recipe list item ${index}:`, item);
        console.log(`🔍 Recipe list item ${index} recipe:`, item?.recipe);
      });

      // Early return for empty or invalid recipe list
      if (!recipeList || recipeList.length === 0) {
        console.log("🔍 Setting empty components - no recipes provided");
        setConsolidatedComponents([]);
        return;
      }

      try {
        console.log(
          "🔍 About to call processRecipeListToRawComponents with:",
          recipeList
        );

        // ✅ FIXED: Direct function call instead of through parameter
        const consolidated = await processRecipeListToRawComponents(recipeList);

        console.log(
          "🔍 processRecipeListToRawComponents result:",
          consolidated
        );

        setConsolidatedComponents(consolidated);
      } catch (err) {
        console.error("Error processing recipe list:", err);
        setConsolidatedComponents([]);
      }
    };

    processComponents();
  }, [recipeList]);

  return consolidatedComponents;
};
