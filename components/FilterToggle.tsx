import { useState, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faUndoAlt,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { Columns, Button, Icon, Form } from 'react-bulma-components';
import appendCurrencyToNumber from '../utils/appendCurrencyToNumber';

interface CheckboxState {
  label: string;
  value: string;
  isChecked: boolean;
}

interface FilterToggleProps {
  currencyCode: string;
  onFilter: (query: string) => void;
}

const FilterToggle = ({ currencyCode, onFilter }: FilterToggleProps) => {
  const initialPriceCheckboxes = [
    {
      label: `<${appendCurrencyToNumber(currencyCode, 500)}`,
      value: `variants.price:<500`,
      isChecked: false,
    },
    {
      label: `${appendCurrencyToNumber(
        currencyCode,
        500,
      )} - ${appendCurrencyToNumber(currencyCode, 1000)}`,
      value: `variants.price:>=500 variants.price:<=1000`,
      isChecked: false,
    },
    {
      label: `${appendCurrencyToNumber(
        currencyCode,
        1000,
      )} - ${appendCurrencyToNumber(currencyCode, 2000)}`,
      value: `variants.price:>=1000 variants.price:<=2000`,
      isChecked: false,
    },
    {
      label: `>${appendCurrencyToNumber(currencyCode, 2000)}`,
      value: `variants.price:>2000`,
      isChecked: false,
    },
  ];

  const initialSizeCheckboxes = [
    {
      label: 'X-Small',
      value: 'tag:X-Small',
      isChecked: false,
    },
    {
      label: 'Small',
      value: 'tag:Small',
      isChecked: false,
    },
    {
      label: 'Medium',
      value: 'tag:Medium',
      isChecked: false,
    },
    {
      label: 'Large',
      value: 'tag:Large',
      isChecked: false,
    },
  ];

  const initialColorCheckboxes = [
    {
      label: 'Red',
      value: 'tag:Red',
      isChecked: false,
    },
    {
      label: 'Green',
      value: 'tag:Green',
      isChecked: false,
    },
    {
      label: 'White',
      value: 'tag:White',
      isChecked: false,
    },
    {
      label: 'Black',
      value: 'tag:Black',
      isChecked: false,
    },
    {
      label: 'Yellow',
      value: 'tag:Yellow',
      isChecked: false,
    },
    {
      label: 'Olive',
      value: 'tag:Olive',
      isChecked: false,
    },
    {
      label: 'Navy',
      value: 'tag:Navy',
      isChecked: false,
    },
    {
      label: 'Celestial',
      value: 'tag:Celestial',
      isChecked: false,
    },
  ];

  const [isToggleOn, setIsToggleOn] = useState(false);
  const [sizeCheckboxes, setSizeCheckboxes] = useState<CheckboxState[]>(
    initialSizeCheckboxes,
  );
  const [colorCheckboxes, setColorCheckboxes] = useState<CheckboxState[]>(
    initialColorCheckboxes,
  );
  const [priceCheckboxes, setPriceCheckboxes] = useState<CheckboxState[]>(
    initialPriceCheckboxes,
  );

  const handleClick = useCallback(() => {
    setIsToggleOn(!isToggleOn);
  }, [isToggleOn]);

  const [checkFilter, setCheckFilter] = useState(false);
  const showFilter = useCallback(() => {
    setCheckFilter(true);
  }, []);
  const closeFilter = useCallback(() => {
    setCheckFilter(false);
  }, []);

  const { Control, Checkbox } = Form;

  const getSelectedValues = useCallback((checkboxes: CheckboxState[]) => {
    return checkboxes.reduce((result, currentItem) => {
      if (currentItem.isChecked) {
        result.push(currentItem.value);
      }
      return result;
    }, []);
  }, []);

  const isFilterSelected =
    [
      ...getSelectedValues(sizeCheckboxes),
      ...getSelectedValues(colorCheckboxes),
      ...getSelectedValues(priceCheckboxes),
    ].length > 0;

  const handleCheckboxChange = useCallback(
    (stateUpdater, checkboxes: CheckboxState[], value: string) => {
      const checkBoxIndex = checkboxes.findIndex(
        (checkbox) => checkbox.value === value,
      );
      checkboxes[checkBoxIndex].isChecked = !checkboxes[checkBoxIndex]
        .isChecked;
      stateUpdater([...checkboxes]);
      const sizeValues = getSelectedValues(sizeCheckboxes);
      const colorValues = getSelectedValues(colorCheckboxes);
      const priceValues = getSelectedValues(priceCheckboxes);
      const composedQuery = `${sizeValues.join(' OR ')} ${
        sizeValues.length > 0 && colorValues.length > 0
          ? `AND ${colorValues.join(' OR ')}`
          : colorValues.length > 0
          ? colorValues.join(' OR ')
          : ''
      } ${
        (sizeValues.length > 0 || colorValues.length > 0) &&
        priceValues.length > 0
          ? `AND ${priceValues.join(' OR ')}`
          : priceValues.length > 0
          ? priceValues.join(' OR ')
          : ''
      }`;
      onFilter(composedQuery);
    },
    [sizeCheckboxes, colorCheckboxes, priceCheckboxes],
  );

  const resetCheckboxes = useCallback(() => {
    setSizeCheckboxes([...initialSizeCheckboxes]);
    setColorCheckboxes([...initialColorCheckboxes]);
    setPriceCheckboxes([...initialPriceCheckboxes]);
    onFilter('');
  }, [initialSizeCheckboxes, initialColorCheckboxes, initialPriceCheckboxes]);

  return (
    <Columns.Column size={2} className="collection-filter">
      <Button
        className={checkFilter ? 'toggle-filter active' : 'toggle-filter'}
        onClick={showFilter}
      >
        <span>Filter</span>
        <Icon>
          <FontAwesomeIcon icon={faChevronDown} />
        </Icon>
      </Button>
      <div className={checkFilter ? 'filter-content show' : 'filter-content'}>
        <Button
          renderAs="button"
          className="close-filter"
          onClick={closeFilter}
        >
          <Icon>
            <FontAwesomeIcon icon={faTimes} />
          </Icon>
        </Button>

        {isFilterSelected ? (
          <Button className="reset-filter" onClick={resetCheckboxes}>
            <span>Reset all</span>
            <Icon>
              <FontAwesomeIcon icon={faUndoAlt} />
            </Icon>
          </Button>
        ) : null}
        <h2>Size</h2>
        <Control>
          {sizeCheckboxes.map((checkbox) => {
            return (
              <Checkbox
                checked={checkbox.isChecked}
                onChange={() =>
                  handleCheckboxChange(
                    setSizeCheckboxes,
                    sizeCheckboxes,
                    checkbox.value,
                  )
                }
                key={checkbox.value}
              >
                {checkbox.label}
              </Checkbox>
            );
          })}
        </Control>
        <h2>Color</h2>
        <Control>
          {colorCheckboxes.map((checkbox) => {
            return (
              <Checkbox
                checked={checkbox.isChecked}
                onChange={() =>
                  handleCheckboxChange(
                    setColorCheckboxes,
                    colorCheckboxes,
                    checkbox.value,
                  )
                }
                key={checkbox.value}
              >
                {checkbox.label}
              </Checkbox>
            );
          })}
        </Control>
        <h2>Price</h2>
        <Control>
          {priceCheckboxes.map((checkbox) => {
            return (
              <Checkbox
                checked={checkbox.isChecked}
                onChange={() =>
                  handleCheckboxChange(
                    setPriceCheckboxes,
                    priceCheckboxes,
                    checkbox.value,
                  )
                }
                key={checkbox.value}
              >
                {checkbox.label}
              </Checkbox>
            );
          })}
        </Control>
      </div>
      {checkFilter ? (
        <div className="filter-background" onClick={closeFilter} />
      ) : null}
    </Columns.Column>
  );
};

export default FilterToggle;
