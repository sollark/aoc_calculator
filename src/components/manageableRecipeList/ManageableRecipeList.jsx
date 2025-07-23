import React from "react";
import PropTypes from "prop-types";
import Recipe from "../recipe/Recipe";
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

  const renderRecipeItem = (recipe) => (
    <>
      <button
        onClick={() => onRemoveRecipe(recipe.id)}
        className="manageable-recipe-list__remove-btn"
        aria-label={`Remove ${recipe.name} recipe`}
      >
        ×
      </button>
      <Recipe recipeData={recipe} />
    </>
  );

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
