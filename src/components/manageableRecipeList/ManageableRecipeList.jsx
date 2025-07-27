import React from "react";
import PropTypes from "prop-types";
import Recipe from "../recipeCard/RecipeCard";
import BaseRecipeList from "../baseRecipeList/BaseRecipeList";
import "./manageableRecipeList.css";

const ManageableRecipeList = ({ recipes, onRemoveRecipe, onClearList }) => {
  const headerActions = (
    <button
      onClick={onClearList}
      className="manageable-recipe-list__clear-btn"
      disabled={recipes.length === 0}
    >
      Clear All
    </button>
  );

  const renderRecipeItem = (recipe) => {
    console.log("🔍 ManageableRecipeList - renderRecipeItem recipe:", recipe);
    console.log(
      "🔍 ManageableRecipeList - recipe.id (list item ID):",
      recipe.id
    );
    console.log("🔍 ManageableRecipeList - recipe structure:", {
      id: recipe.id,
      name: recipe.name,
      hasRecipeData: !!recipe.recipe,
      originalRecipeId: recipe.recipe?.id,
      idType: typeof recipe.id,
      idValue: recipe.id,
    });

    return (
      <>
        <button
          onClick={() => {
            console.log("🗑️ Remove button clicked for recipe:", recipe.name);
            console.log("🗑️ Recipe ID being passed:", recipe.id);
            console.log("🗑️ Recipe ID type:", typeof recipe.id);
            console.log("🗑️ Recipe ID value:", recipe.id);
            console.log("🗑️ Full recipe object:", recipe);
            console.log("🗑️ About to call onRemoveRecipe with ID:", recipe.id);

            // Add a confirmation check to make sure we're not accidentally calling clear
            if (typeof onRemoveRecipe === "function") {
              console.log("🗑️ onRemoveRecipe is a function, calling it now");
              onRemoveRecipe(recipe.id);
            } else {
              console.error(
                "🗑️ onRemoveRecipe is not a function!",
                typeof onRemoveRecipe
              );
            }
          }}
          className="manageable-recipe-list__remove-btn"
          aria-label={`Remove ${recipe.name} recipe`}
        >
          ×
        </button>
        <Recipe recipeData={recipe} />
      </>
    );
  };

  return (
    <BaseRecipeList
      items={recipes}
      title={`Recipe List (${recipes.length} recipes)`}
      emptyMessage="No recipes added yet. Select a recipe and click 'Add Recipe' to get started."
      className="manageable-recipe-list"
      headerActions={headerActions}
      itemRenderer={renderRecipeItem}
    />
  );
};

ManageableRecipeList.propTypes = {
  recipes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  onRemoveRecipe: PropTypes.func.isRequired,
  onClearList: PropTypes.func.isRequired,
};

export default ManageableRecipeList;
