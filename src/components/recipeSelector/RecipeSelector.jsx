import React from "react";
import PropTypes from "prop-types";
import { useRecipeSelector } from "../../hooks/useRecipeSelector";
import RecipeControls from "./components/RecipeControls";
import RecipeStatus from "./components/RecipeStatus";
import LoadingState from "./components/LoadingState";
import "./recipeSelector.css";

/**
 * RecipeSelector Component
 *
 * Main orchestrator component for recipe selection functionality.
 * Follows composition pattern with specialized child components.
 * Uses custom hooks for logic separation and functional programming principles.
 *
 * Features:
 * - Pure functional approach with hooks
 * - Composition over inheritance
 * - Single responsibility per component
 * - Immutable state management
 * - Clear separation of concerns
 *
 * @component
 */
const RecipeSelector = ({
  recipes = [],
  selectedRecipe,
  onRecipeChange,
  onAddRecipe,
  recipeListCount = 0,
}) => {
  // Use custom hook for selection logic
  const { selectOptions, selectionState, handlers } = useRecipeSelector({
    recipes,
    selectedRecipe,
    onRecipeChange,
    onAddRecipe,
  });

  // Early return for loading state (guard clause pattern)
  if (selectionState.isLoading) {
    return (
      <LoadingState
        recipeListCount={recipeListCount}
        message="Loading recipes..."
      />
    );
  }

  // Main component render with composition
  return (
    <div className="recipe-selector">
      <RecipeControls
        selectOptions={selectOptions}
        selectedRecipe={selectedRecipe}
        onRecipeSelect={handlers.onRecipeSelect}
        onAddRecipe={handlers.onAddRecipe}
        recipeListCount={recipeListCount}
      />

      <RecipeStatus
        recipeCount={selectOptions.length}
        selectedRecipe={selectedRecipe}
        recipeListCount={recipeListCount}
      />
    </div>
  );
};

// Comprehensive PropTypes with clear documentation
RecipeSelector.propTypes = {
  /** Array of available recipes for selection */
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
    })
  ),
  /** Currently selected recipe object */
  selectedRecipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string.isRequired,
  }),
  /** Callback function when recipe selection changes */
  onRecipeChange: PropTypes.func.isRequired,
  /** Callback function when add recipe button is clicked */
  onAddRecipe: PropTypes.func.isRequired,
  /** Number of recipes currently in the user's list */
  recipeListCount: PropTypes.number,
};

export default RecipeSelector;
