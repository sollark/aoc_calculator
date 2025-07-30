import { useState, useEffect } from "react";
import { processRecipeListToRawComponents } from "../services/recipe";
import { useSelectedList } from "../contexts/SelectedListContext";

/**
 * Custom hook for calculating consolidated components from selected recipe list in context
 *
 * Encapsulates component calculation logic with proper error handling.
 * Uses direct import instead of dependency injection for better maintainability.
 *
 * @returns {Array} Consolidated components
 */
export const useComponentCalculation = () => {
  const { recipeList } = useSelectedList();
  const [consolidatedComponents, setConsolidatedComponents] = useState([]);

  useEffect(() => {
    const processComponents = async () => {
      // Early return for empty or invalid recipe list
      if (!recipeList || recipeList.length === 0) {
        setConsolidatedComponents([]);
        return;
      }

      try {
        const consolidated = await processRecipeListToRawComponents(recipeList);
        setConsolidatedComponents(consolidated);
      } catch (err) {
        setConsolidatedComponents([]);
      }
    };

    processComponents();
  }, [recipeList]);

  return consolidatedComponents;
};
