import React from "react";

/**
 * Reusable loading state component
 * @param {string} message - Loading message to display
 */
export const LoadingState = ({ message = "Loading..." }) => (
  <div className="App">
    <div>{message}</div>
  </div>
);
