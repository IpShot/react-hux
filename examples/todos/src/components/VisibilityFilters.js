import React from "react";
import cx from "classnames";
import { useStore } from "../hux";
import { TODO_STORE, VISIBILITY_FILTERS } from "../constants";

const VisibilityFilters = () => {
  const { state, actions } = useStore(TODO_STORE);
  return (
    <div className="visibility-filters">
      {Object.keys(VISIBILITY_FILTERS).map(filterKey => {
        const currentFilter = VISIBILITY_FILTERS[filterKey];
        return (
          <span
            key={`visibility-filter-${currentFilter}`}
            className={cx(
              "filter",
              currentFilter === state.filter && "filter--active"
            )}
            onClick={() => actions.setFilter(currentFilter)}
          >
            {currentFilter}
          </span>
        );
      })}
    </div>
  );
};

export default VisibilityFilters;
