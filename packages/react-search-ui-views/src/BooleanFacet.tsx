import React from "react";
import { FacetViewProps } from "./types";
import { helpers } from "@elastic/search-ui";

import { appendClassName } from "./view-helpers";

function BooleanFacet({
  className,
  label,
  options,
  onChange,
  onRemove
}: FacetViewProps) {
  const trueOption = options.find((option) =>
    helpers.getFilterBooleanValue(option.value)
  );
  if (!trueOption) return null;
  const isSelected = trueOption.selected;

  const apply = () => onChange("true");
  const remove = () => onRemove("true");
  const toggle = () => {
    isSelected ? remove() : apply();
  };

  return (
    <fieldset className={appendClassName("sui-facet", className)}>
      <legend className="sui-facet__title">{label}</legend>
      <div className="sui-boolean-facet">
        <div className={"sui-boolean-facet__option-input-wrapper"}>
          <label className="sui-boolean-facet__option-label">
            <div className="sui-boolean-facet__option-input-wrapper">
              <input
                data-transaction-name={`facet - ${label}`}
                className="sui-boolean-facet__checkbox"
                type="checkbox"
                onChange={toggle}
                checked={isSelected}
              />
              <span className="sui-boolean-facet__input-text">{label}</span>
            </div>
            <span className="sui-boolean-facet__option-count">
              {trueOption.count}
            </span>
          </label>
        </div>
      </div>
    </fieldset>
  );
}

export default BooleanFacet;
