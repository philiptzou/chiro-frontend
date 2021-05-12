import React from 'react';
import {Dropdown} from 'semantic-ui-react';
import escapeRegExp from 'lodash/escapeRegExp';


const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';
const ANTIBODY = 'antibodies';
const VACCINE = 'vaccine';


function rxSearch(options, query) {
  if (query === '') {
    return options;
  }
  const re = new RegExp(escapeRegExp(query), 'i');
  return options.filter(rx => (
    rx.value && (
      re.test(rx.text) ||
      re.test(rx.value) ||
      (rx.synonyms && rx.synonyms.some(syn => re.test(syn)))
    )
  ));
}


function FragmentWithoutWarning({key, children}) {
  return <React.Fragment key={key}>{children}</React.Fragment>;
}


export default function useRxDropdown({
  loaded,
  vaccines, vaccineValue,
  antibodies, antibodyValue,
  onChange,
  formOnly
}) {
  const [includeAll, setIncludeAll] = React.useState(false);
  const onSearchChange = React.useCallback(
    (event, {searchQuery}) => {
      setIncludeAll(searchQuery !== '');
    },
    [setIncludeAll]
  );

  const options = React.useMemo(
    () => {
      if (!loaded) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          {
            key: vaccineValue,
            text: vaccineValue,
            value: vaccineValue,
            type: VACCINE
          },
          ...(
            antibodyValue && antibodyValue.length > 0 ?
              [{
                key: antibodyValue.join(','),
                text: antibodyValue.join(' + '),
                value: antibodyValue.join(','),
                type: ANTIBODY
              }] : []
          )
        ];
      }
      else {
        return [
          ...(formOnly ? [{
            key: 'empty',
            text: EMPTY_TEXT,
            value: EMPTY
          }] : []),
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          {
            key: 'vaccine-divider',
            as: FragmentWithoutWarning,
            children: <Dropdown.Divider />
          },
          ...vaccines
            .filter(({vaccineName}) => (
              includeAll ||
              vaccineName === vaccineValue ||
              !(/\+/.test(vaccineName))
            ))
            .map(
              ({vaccineName, vaccineType, suscResultCount}) => ({
                key: vaccineName,
                text: vaccineName,
                value: vaccineName,
                description: `${suscResultCount} results (${vaccineType})`,
                type: VACCINE
              })
            ),
          {
            key: 'antibody-divider',
            as: FragmentWithoutWarning,
            children: <Dropdown.Divider />
          },
          ...((
            antibodyValue && antibodyValue.length > 0 &&
            (
              antibodyValue.length > 1 ||
              !antibodies.some(({abName}) => abName === antibodyValue[0])
            )
          ) ?
            [{
              key: antibodyValue.join(','),
              text: antibodyValue.join(' + '),
              value: antibodyValue.join(','),
              type: ANTIBODY
            }] : []
          ),
          ...antibodies
            .filter(
              ({abName, visibility}) => (
                includeAll ||
                antibodyValue.includes(abName) ||
                visibility === true
              )
            )
            .map(
              ({
                abName,
                abbreviationName: abbr,
                synonyms,
                abClass,
                suscResultCount
              }) => {
                const isPlural = suscResultCount > 1;
                let description = `${suscResultCount} result${
                  isPlural ? 's' : ''
                }`;
                if (abClass) {
                  const abClassShort = (
                    abClass
                      .replace(' Class ', ' ')
                      .replace(' Cluster ', ' ')
                  );
                  description += ` (${abClassShort})`;
                }
                return {
                  key: abName,
                  text: abbr ? `${abName} (${abbr})` : abName,
                  value: abName,
                  type: ANTIBODY,
                  description,
                  synonyms
                };
              }
            )
        ];
      }
    },
    [
      loaded, includeAll,
      vaccines, antibodies,
      vaccineValue, antibodyValue,
      formOnly
    ]
  );
  const handleChange = React.useCallback(
    (evt, {value, options}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else {
        if (value === ANY) {
          onChange({
            vaccine: undefined,
            antibodies: undefined
          });
        }
        else {
          const {type} = options.find(opt => opt.value === value);
          onChange(type, value);
        }
        setIncludeAll(false);
      }
    },
    [onChange]
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  const activeRx = (
    antibodyValue && antibodyValue.length > 0 ?
      antibodyValue.join(',') :
      (vaccineValue || defaultValue)
  );
  return (
    <Dropdown
     direction="right"
     search={rxSearch}
     options={options}
     placeholder={EMPTY_TEXT}
     onChange={handleChange}
     onSearchChange={onSearchChange}
     value={activeRx} />
  );
}
