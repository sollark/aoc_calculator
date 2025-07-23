import React from "react";
import PropTypes from "prop-types";
import BaseRecipeList from "../baseRecipeList/BaseRecipeList";
import CraftComponent from "../craftComponent/CraftComponent";
import "./componentList.css";

const ComponentList = ({
  components,
  title = "Required Components",
  showQuantityControls = false,
  onQuantityChange,
}) => {
  const renderComponentItem = (component) => (
    <div className="component-list__item-content">
      <CraftComponent
        name={component.name}
        quantity={component.quantity}
        currentQuantity={component.currentQuantity || 0}
        onQuantityChange={showQuantityControls ? onQuantityChange : undefined}
        readOnly={!showQuantityControls}
      />
      {component.recipe && (
        <div className="component-list__nested-recipe">
          <h4>Recipe for {component.name}:</h4>
          <ComponentList
            components={component.recipe.components || []}
            title={null}
            showQuantityControls={showQuantityControls}
            onQuantityChange={onQuantityChange}
          />
        </div>
      )}
    </div>
  );

  return (
    <BaseRecipeList
      items={components}
      title={title ? `${title} (${components.length} components)` : null}
      emptyMessage="No components required."
      className="component-list"
      itemRenderer={renderComponentItem}
    />
  );
};

ComponentList.propTypes = {
  components: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      currentQuantity: PropTypes.number,
      recipe: PropTypes.shape({
        components: PropTypes.array,
      }),
    })
  ).isRequired,
  title: PropTypes.string,
  showQuantityControls: PropTypes.bool,
  onQuantityChange: PropTypes.func,
};

export default ComponentList;
