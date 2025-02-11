import React from 'react';
import PropTypes from 'prop-types';
import {useRouter} from 'found';

import {buildQuery, parseAntibodies} from './funcs';

const LocationParamsContext = React.createContext();

LocationParamsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function LocationParamsProvider({children}) {
  const {router, match} = useRouter();
  const {
    location: loc,
    location: {
      query: {
        form_only: formOnly,
        article: refName = null,
        mutations: isoAggkey = '',
        antibodies: antibodyText = '',
        variant: varName = null,
        position: genePos = null,
        cp: infectedVarName = '',
        vaccine: vaccineName = null
      } = {}
    }
  } = match;
  const queryRef = React.useRef(loc.query);

  const onChange = React.useCallback(
    (action, value, clearAction = false) => {
      const query = buildQuery(
        action,
        value,
        clearAction ? {} : queryRef.current
      );
      queryRef.current = query;

      router.push({
        pathname: '/search-drdb/',
        query
      });
    },
    [router]
  );

  const contextValue = React.useMemo(
    () => {
      const abNames = parseAntibodies(antibodyText);
      return {
        params: {
          formOnly: formOnly !== undefined,
          refName,
          isoAggkey,
          abNames,
          varName,
          vaccineName,
          infectedVarName,
          genePos
        },
        filterFlag: {
          article: !!refName,
          isolateAgg: !!isoAggkey,
          antibody: !!(abNames && abNames.length > 0),
          variant: !!varName,
          vaccine: !!vaccineName,
          infectedVariant: !!infectedVarName,
          genePos: !!genePos
        },
        onChange
      };
    },
    [
      formOnly,
      refName,
      isoAggkey,
      antibodyText,
      varName,
      vaccineName,
      infectedVarName,
      genePos,
      onChange
    ]
  );
  return <LocationParamsContext.Provider value={contextValue}>
    {children}
  </LocationParamsContext.Provider>;
}

function useLocationParams() {
  return React.useContext(LocationParamsContext);
}

const LocationParams = {
  Provider: LocationParamsProvider,
  useMe: useLocationParams
};

export default LocationParams;
