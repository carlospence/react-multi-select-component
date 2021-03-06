/**
 * This component represents the entire panel which gets dropped down when the
 * user selects the component.  It encapsulates the search filter, the
 * Select-all item, and the list of options.
 */
import { css } from "goober";
import React, { useEffect, useState } from "react";

import { filterOptions } from "../lib/fuzzy-match-utils";
import getString from "../lib/get-string";
import { Option } from "../lib/interfaces";
import SelectItem from "./select-item";
import SelectList from "./select-list";
import {CloseIcon} from "./icons"

interface ISelectPanelProps {
  ItemRenderer?: Function;
  options: Option[];
  value: Option[];
  focusSearchOnOpen: boolean;
  selectAllLabel?: string;
  onChange: (selected: Option[]) => void;
  onMobileClose: () => void;
  disabled?: boolean;
  disableSearch?: boolean;
  hasSelectAll: boolean;
  filterOptions?: (options: Option[], filter: string) => Option[];
  overrideStrings?: { [key: string]: string };
}

enum FocusType {
  SEARCH = -1,
  NONE = 0,
}

const SelectSearchContainer = css({
  width: "100%",
  borderBottom: "1px solid var(--rmsc-border)",
  input: {
    height: "var(--rmsc-height)",
    padding: "0 var(--rmsc-spacing)",
    width: "100%",
    outline: "none",
    border: "0",
  },
});

const MobileContainerClose = css({
  display: "none",
  width: "100%",
  height: "var(--rmsc-height)",
  padding: "10px var(--rmsc-spacing)",
  // padding: "10px",
  marginBottom: "10px",
    paddingRight: "5px",
    '@media (max-width: 768px)' : {
      display: "block"
    }

})

export const SelectPanel = (props: ISelectPanelProps) => {
  const {
    onChange,
    options,
    value,
    filterOptions: customFilterOptions,
    selectAllLabel,
    ItemRenderer,
    disabled,
    disableSearch,
    focusSearchOnOpen,
    hasSelectAll,
    overrideStrings,
    onMobileClose,
  } = props;
  const [searchText, setSearchText] = useState("");
  const [focusIndex, setFocusIndex] = useState(
    focusSearchOnOpen ? FocusType.SEARCH : FocusType.NONE
  );

  const [selectAllLength, setSelectAllLength] = useState(0);
  const selectAllOption = {
    label: selectAllLabel || getString("selectAll", overrideStrings),
    value: "",
  };

  useEffect(() => {
    setSelectAllLength(selectAllValues(true).length);
    // eslint-disable-next-line
  }, [options]);

  const selectAllValues = (checked) => {
    const selectedValues = value.map((o) => o.value);
    return options.filter(({ disabled, value }) => {
      if (checked) {
        return !disabled || selectedValues.includes(value);
      }
      return disabled && selectedValues.includes(value);
    });
  };

  const selectAllChanged = (checked: boolean) => {
    const newOptions = selectAllValues(checked);
    onChange(newOptions);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setFocusIndex(FocusType.SEARCH);
  };

  const handleMobileButtonClose = (e) => {
    onMobileClose();
    e.preventDefault();
  }

  const handleItemClicked = (index: number) => setFocusIndex(index);

  const handleKeyDown = (e) => {
    switch (e.which) {
      case 38: // Up Arrow
        if (e.altKey) {
          return;
        }
        updateFocus(-1);
        break;
      case 40: // Down Arrow
        if (e.altKey) {
          return;
        }
        updateFocus(1);
        break;
      default:
        return;
    }
    e.stopPropagation();
    e.preventDefault();
  };

  const handleSearchFocus = () => {
    setFocusIndex(FocusType.SEARCH);
  };

  const filteredOptions = () =>
    customFilterOptions
      ? customFilterOptions(options, searchText)
      : filterOptions(options, searchText);

  const updateFocus = (offset: number) => {
    let newFocus = focusIndex + offset;
    newFocus = Math.max(0, newFocus);
    newFocus = Math.min(newFocus, options.length);
    setFocusIndex(newFocus);
  };

  return (
    <div className="select-panel" role="listbox" onKeyDown={handleKeyDown}>
       <div className={MobileContainerClose}>
      <button onClick={handleMobileButtonClose} type="button" className="close"><CloseIcon></CloseIcon></button>
      </div>
      
      {!disableSearch && (
        <div className={SelectSearchContainer}>
          <input
            autoFocus={focusSearchOnOpen}
            placeholder={getString("search", overrideStrings)}
            type="search"
            aria-describedby={getString("search", overrideStrings)}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
          />
        </div>
      )}

     
        <div className="select-content" role="listbox">
      {hasSelectAll && !searchText && (
        <SelectItem
          focused={focusIndex === 0}
          checked={selectAllLength === value.length}
          option={selectAllOption}
          onSelectionChanged={selectAllChanged}
          onClick={() => handleItemClicked(0)}
          itemRenderer={ItemRenderer}
          disabled={disabled}
        />
      )}

      <SelectList
        {...props}
        options={filteredOptions()}
        focusIndex={focusIndex - 1}
        onClick={(_e, index) => handleItemClicked(index + 1)}
        ItemRenderer={ItemRenderer}
        disabled={disabled}
      />
      </div>
    </div>
  );
};

export default SelectPanel;
