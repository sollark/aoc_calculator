import { useState, useEffect } from "react";

/**
 * Custom hook for calculating consolidated components from recipe list
 * @param {Array} recipeList - List of recipes to process
 * @param {Object} recipeServiceFunctions - Recipe service functions
 * @returns {Array} Consolidated components
 */
export const useComponentCalculation = (recipeList, recipeServiceFunctions) => {
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  useEffect(() => {
    const processComponents = async () => {
      console.log("🔍 useComponentCalculation called with:");
      console.log("🔍 recipeList:", recipeList);
      console.log("🔍 recipeList length:", recipeList?.length);

      recipeList?.forEach((item, index) => {
        console.log(`🔍 Recipe list item ${index}:`, item);
        console.log(`🔍 Recipe list item ${index} recipe:`, item?.recipe);
      });

      if (!recipeServiceFunctions || !recipeList || recipeList.length === 0) {
        console.log("🔍 Setting empty components - no recipes or no function");
        setConsolidatedComponents([]);
        return;
      }

      if (!recipeServiceFunctions.processRecipeListToRawComponents) {
        console.error(
          "🔍 processRecipeListToRawComponents function not available"
        );
        setConsolidatedComponents([]);
        return;
      }

      try {
        console.log(
          "🔍 About to call processRecipeListToRawComponents with:",
          recipeList
        );
        const consolidated =
          await recipeServiceFunctions.processRecipeListToRawComponents(
            recipeList
          );
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
  }, [recipeList, recipeServiceFunctions]);

  return consolidatedComponents;
};
