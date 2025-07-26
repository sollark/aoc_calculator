import React from "react";
import PropTypes from "prop-types";
import "./recipeSelector.css";

const RecipeSelector = ({
  recipes,
  selectedRecipe,
  onRecipeChange,
  onAddRecipe,
  recipeListCount,
}) => {
  // Ensure recipes is always an array to prevent map errors
  const safeRecipes = Array.isArray(recipes) ? recipes : [];

  // Handle the case where no recipes are available
  if (safeRecipes.length === 0) {
    return (
      <div className="recipe-selector">
        <div className="recipe-selector__controls">
          <select disabled className="recipe-selector__dropdown">
            <option value="">No recipes available...</option>
          </select>
          <button disabled className="recipe-selector__add-btn">
            Add Recipe
          </button>
        </div>
        <p className="recipe-selector__status recipe-selector__status--empty">
          Loading recipes...
        </p>
      </div>
    );
  }

  // Get the recipe name for the select value
  const selectedRecipeName = selectedRecipe?.name || "";

  console.log("🔍 RecipeSelector - selectedRecipe:", selectedRecipe);
  console.log("🔍 RecipeSelector - selectedRecipeName:", selectedRecipeName);

  return (
    <div className="recipe-selector">
      <div className="recipe-selector__controls">
        <select
          value={selectedRecipeName}
          onChange={(e) => {
            console.log("🔍 Dropdown changed to:", e.target.value);
            // ❌ This is the bug - passing string instead of object:
            // onRecipeChange(e.target.value);

            // ✅ Fix - find and pass the full recipe object:
            const selectedName = e.target.value;
            const fullRecipe = safeRecipes.find(
              (recipe) => recipe.name === selectedName
            );
            if (fullRecipe) {
              console.log("🔍 Found full recipe object:", fullRecipe);
              onRecipeChange(fullRecipe); // Pass the FULL OBJECT
            } else {
              console.log("🔍 No recipe selected or not found");
              onRecipeChange(null);
            }
          }}
          className="recipe-selector__dropdown"
        >
          <option value="">Select a recipe...</option>
          {safeRecipes.map((recipe) => {
            // Safety check for recipe object
            if (!recipe || (!recipe.id && !recipe.name)) {
              console.warn("Invalid recipe object:", recipe);
              return null;
            }

            const key = recipe.id || recipe.name || `recipe-${Math.random()}`;
            const value = recipe.name || `Recipe ${recipe.id}`;
            const displayName =
              recipe.name || `Recipe ${recipe.id}` || "Unknown Recipe";

            return (
              <option key={key} value={value}>
                {displayName}
              </option>
            );
          })}
        </select>

        <button
          type="button"
          onClick={(e) => {
            console.log("🔧 Add Recipe button clicked in RecipeSelector!");
            console.log("🔍 Selected recipe object:", selectedRecipe);
            console.log("🔍 onAddRecipe function:", onAddRecipe);
            if (onAddRecipe) {
              onAddRecipe(e);
            } else {
              console.error("❌ onAddRecipe function is not provided!");
            }
          }}
          disabled={!selectedRecipe}
          className="recipe-selector__add-btn" // Use this exact class name
        >
          Add Recipe ({recipeListCount || 0})
        </button>
      </div>

      {recipeListCount > 0 && (
        <p className="recipe-selector__status">
          {recipeListCount} recipe{recipeListCount !== 1 ? "s" : ""} in your
          list
        </p>
      )}

      {/* Show selected recipe info */}
      {selectedRecipe && (
        <p className="recipe-selector__status recipe-selector__status--selected">
          ✅ Selected: <strong>{selectedRecipe.name}</strong>
        </p>
      )}

      {safeRecipes.length > 0 && recipeListCount === 0 && !selectedRecipe && (
        <p className="recipe-selector__status recipe-selector__status--info">
          {safeRecipes.length} recipe{safeRecipes.length !== 1 ? "s" : ""}{" "}
          available
        </p>
      )}
    </div>
  );
};

RecipeSelector.propTypes = {
  recipes: PropTypes.array,
  selectedRecipe: PropTypes.object, // Changed from string to object
  onRecipeChange: PropTypes.func.isRequired,
  onAddRecipe: PropTypes.func.isRequired,
  recipeListCount: PropTypes.number,
};

RecipeSelector.defaultProps = {
  recipes: [],
  selectedRecipe: null, // Changed from "" to null
  recipeListCount: 0,
};

export default RecipeSelector;
