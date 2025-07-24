import React from "react";

/**
 * Reusable error state component
 * @param {string} message - Error message to display
 */
export const ErrorState = ({ message }) => (
  <div className="App">
    <div>Error: {message}</div>
  </div>
);
