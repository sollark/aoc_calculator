import React from "react";
import PropTypes from "prop-types";
import { Select, Button } from "../ui";
import "./recipeSelector.css";

/**
 * Recipe Selector Component
 *
 * Specialized component for recipe selection and management.
 * Uses reusable UI components while maintaining domain-specific logic.
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
  // Transform recipes for the Select component
  const selectOptions = Array.isArray(recipes) ? recipes : [];

  // Handle recipe selection
  const handleRecipeSelect = (selectedOption) => {
    console.log("🔍 RecipeSelector - Recipe selected:", selectedOption);
    onRecipeChange?.(selectedOption);
  };

  // Handle add recipe action
  const handleAddRecipe = (e) => {
    console.log("🔧 RecipeSelector - Add Recipe clicked");
    console.log("🔍 Selected recipe:", selectedRecipe);

    if (!selectedRecipe) {
      console.warn("❌ No recipe selected");
      return;
    }

    onAddRecipe?.(e);
  };

  // Render loading state
  if (selectOptions.length === 0) {
    return (
      <div className="recipe-selector recipe-selector--loading">
        <div className="recipe-selector__controls">
          <Select
            disabled
            placeholder="Loading recipes..."
            emptyMessage="No recipes available"
            className="recipe-selector__dropdown"
          />
          <Button
            disabled
            variant="primary"
            className="recipe-selector__add-btn"
          >
            Add Recipe
          </Button>
        </div>
        <StatusMessage type="loading">Loading recipes...</StatusMessage>
      </div>
    );
  }

  return (
    <div className="recipe-selector">
      <div className="recipe-selector__controls">
        <Select
          options={selectOptions}
          value={selectedRecipe}
          onChange={handleRecipeSelect}
          placeholder="Select a recipe..."
          getOptionValue={(recipe) => recipe?.name}
          getOptionLabel={(recipe) =>
            recipe?.name || `Recipe ${recipe?.id}` || "Unknown Recipe"
          }
          getOptionKey={(recipe) =>
            recipe?.id || recipe?.name || `recipe-${Math.random()}`
          }
          emptyMessage="No recipes available"
          className="recipe-selector__dropdown"
        />

        <Button
          onClick={handleAddRecipe}
          disabled={!selectedRecipe}
          variant="primary"
          badge={recipeListCount || null}
          className="recipe-selector__add-btn"
        >
          Add Recipe
        </Button>
      </div>

      <RecipeStatus
        recipeCount={selectOptions.length}
        selectedRecipe={selectedRecipe}
        recipeListCount={recipeListCount}
      />
    </div>
  );
};

/**
 * Status Message Component
 *
 * Displays contextual status information.
 *
 * @component
 */
const StatusMessage = ({ children, type = "info" }) => (
  <p className={`recipe-selector__status recipe-selector__status--${type}`}>
    {children}
  </p>
);

StatusMessage.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(["info", "success", "loading", "empty"]),
};

/**
 * Recipe Status Component
 *
 * Displays recipe selection and list status information.
 * Encapsulates status logic for better maintainability.
 *
 * @component
 */
const RecipeStatus = ({ recipeCount, selectedRecipe, recipeListCount }) => {
  // Show recipe list count if there are items
  if (recipeListCount > 0) {
    return (
      <StatusMessage type="success">
        {recipeListCount} recipe{recipeListCount !== 1 ? "s" : ""} in your list
      </StatusMessage>
    );
  }

  // Show selected recipe info
  if (selectedRecipe) {
    return (
      <StatusMessage type="success">
        ✅ Selected: <strong>{selectedRecipe.name}</strong>
      </StatusMessage>
    );
  }

  // Show available recipes count when nothing is selected
  if (recipeCount > 0) {
    return (
      <StatusMessage type="info">
        {recipeCount} recipe{recipeCount !== 1 ? "s" : ""} available
      </StatusMessage>
    );
  }

  // Fallback to empty state
  return <StatusMessage type="empty">No recipes available</StatusMessage>;
};

RecipeStatus.propTypes = {
  recipeCount: PropTypes.number.isRequired,
  selectedRecipe: PropTypes.object,
  recipeListCount: PropTypes.number.isRequired,
};

// Main component PropTypes
RecipeSelector.propTypes = {
  /** Array of available recipes */
  recipes: PropTypes.array,
  /** Currently selected recipe object */
  selectedRecipe: PropTypes.object,
  /** Callback when recipe selection changes */
  onRecipeChange: PropTypes.func.isRequired,
  /** Callback when add recipe button is clicked */
  onAddRecipe: PropTypes.func.isRequired,
  /** Number of recipes in the current list */
  recipeListCount: PropTypes.number,
};

export default RecipeSelector;
