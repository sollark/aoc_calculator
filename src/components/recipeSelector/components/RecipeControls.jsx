import React from "react";
import PropTypes from "prop-types";
import { Select, Button } from "../../ui";

/**
 * RecipeControls Component
 *
 * Pure component for recipe selection controls.
 * Encapsulates the dropdown and button interaction logic.
 *
 * @component
 */
const RecipeControls = ({
  selectOptions,
  selectedRecipe,
  onRecipeSelect,
  onAddRecipe,
  recipeListCount,
  disabled = false,
}) => {
  // Pure function for option value extraction
  const getOptionValue = (recipe) => recipe?.name;

  // Pure function for option label extraction
  const getOptionLabel = (recipe) =>
    recipe?.name || `Recipe ${recipe?.id}` || "Unknown Recipe";

  // Pure function for option key extraction
  const getOptionKey = (recipe) =>
    recipe?.id || recipe?.name || `recipe-${Math.random()}`;

  return (
    <div className="recipe-selector__controls">
      <Select
        options={selectOptions}
        value={selectedRecipe}
        onChange={onRecipeSelect}
        placeholder={disabled ? "Loading recipes..." : "Select a recipe..."}
        getOptionValue={getOptionValue}
        getOptionLabel={getOptionLabel}
        getOptionKey={getOptionKey}
        emptyMessage="No recipes available"
        disabled={disabled}
        className="recipe-selector__dropdown"
      />

      <Button
        onClick={onAddRecipe}
        disabled={disabled || !selectedRecipe}
        variant="primary"
        badge={recipeListCount || null}
        className="recipe-selector__add-btn"
      >
        Add Recipe
      </Button>
    </div>
  );
};

RecipeControls.propTypes = {
  /** Array of recipe options for the select */
  selectOptions: PropTypes.array.isRequired,
  /** Currently selected recipe */
  selectedRecipe: PropTypes.object,
  /** Recipe selection handler */
  onRecipeSelect: PropTypes.func.isRequired,
  /** Add recipe handler */
  onAddRecipe: PropTypes.func.isRequired,
  /** Number of recipes in list (for badge) */
  recipeListCount: PropTypes.number,
  /** Whether controls are disabled */
  disabled: PropTypes.bool,
};

export default RecipeControls;
