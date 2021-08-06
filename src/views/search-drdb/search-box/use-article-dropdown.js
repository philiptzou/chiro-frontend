import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';

import {useArticleNumExpLookup} from '../hooks';
import LocationParams from '../hooks/location-params';

const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


export default function useArticleDropdown({
  loaded,
  articles
}) {
  const {
    params: {
      formOnly,
      refName: paramRefName
    },
    onChange
  } = LocationParams.useMe();
  const [numExpLookup, isPending] = useArticleNumExpLookup({
    skip: !loaded
  });
  const articleOptions = React.useMemo(
    () => {
      if (!loaded || isPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          {
            key: paramRefName,
            text: paramRefName,
            value: paramRefName
          }
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
            value: ANY,
            description: pluralize(
              'result',
              numExpLookup[ANY],
              true
            )
          },
          ...(
            !paramRefName || articles.some(
              ({refName}) => paramRefName === refName
            ) ?
              [] :
              [{
                key: paramRefName,
                text: paramRefName,
                value: paramRefName
              }]
          ),
          ...articles
            .map(
              ({refName, displayName}) => ({
                key: refName,
                text: displayName,
                value: refName,
                description: pluralize(
                  'result',
                  numExpLookup[refName] || 0,
                  true
                ),
                'data-is-empty': !numExpLookup[refName]
              })
            )
            .filter(a => !a['data-is-empty'])
        ];
      }
    },
    [
      loaded,
      isPending,
      articles,
      paramRefName,
      formOnly,
      numExpLookup
    ]
  );

  const handleChange = React.useCallback(
    (evt, {value}) => {
      if (value === EMPTY) {
        evt.preventDefault();
      }
      else {
        onChange('article', value === ANY ? undefined : value);
      }
    },
    [onChange]
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  return (
    <Dropdown
     search direction="left"
     placeholder={EMPTY_TEXT}
     options={articleOptions}
     onChange={handleChange}
     value={paramRefName || defaultValue} />
  );
}
