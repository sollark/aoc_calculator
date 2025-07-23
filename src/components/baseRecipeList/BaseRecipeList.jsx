import React from "react";
import PropTypes from "prop-types";
import "./baseRecipeList.css";

const BaseRecipeList = ({
  items,
  title,
  emptyMessage,
  className = "",
  children,
  headerActions,
  itemRenderer,
}) => {
  if (items.length === 0) {
    return (
      <div className={`base-list base-list--empty ${className}`}>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`base-list ${className}`}>
      {(title || headerActions) && (
        <div className="base-list__header">
          {title && <h3>{title}</h3>}
          {headerActions && (
            <div className="base-list__actions">{headerActions}</div>
          )}
        </div>
      )}

      <ul className="base-list__items">
        {items.map((item, index) => (
          <li key={item.id || item.name || index} className="base-list__item">
            {itemRenderer ? itemRenderer(item, index) : children(item, index)}
          </li>
        ))}
      </ul>
    </div>
  );
};

BaseRecipeList.propTypes = {
  items: PropTypes.array.isRequired,
  title: PropTypes.string,
  emptyMessage: PropTypes.string.isRequired,
  className: PropTypes.string,
  children: PropTypes.func,
  headerActions: PropTypes.node,
  itemRenderer: PropTypes.func,
};

export default BaseRecipeList;
