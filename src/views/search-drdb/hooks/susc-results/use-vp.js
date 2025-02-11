import React from 'react';
import PropTypes from 'prop-types';
import LocationParams from '../location-params';
import useSuscResults from './use-susc-results';

const VPSuscResultsContext = React.createContext();


function usePrepareQuery({vaccineName, skip}) {
  return React.useMemo(
    () => {
      const addColumns = [];
      const joinClause = [];
      const where = [];
      const params = {};

      if (!skip) {
        addColumns.push("'vacc-plasma' AS rx_type");
        addColumns.push('vaccine_name');
        addColumns.push('timing');
        addColumns.push('dosage');

        joinClause.push(`
          JOIN rx_vacc_plasma RXVP ON
            S.ref_name = RXVP.ref_name AND
            S.rx_name = RXVP.rx_name
        `);

        if (vaccineName && vaccineName !== 'any') {
          where.push('RXVP.vaccine_name=$vaccineName');
        }
        params.$vaccineName = vaccineName;
      }
      return {addColumns, joinClause, where, params};
    },
    [skip, vaccineName]
  );
}


VPSuscResultsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


export function VPSuscResultsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      varName,
      genePos,
      vaccineName
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.antibody || filterFlag.infectedVariant;
  const {
    addColumns,
    joinClause,
    where,
    params
  } = usePrepareQuery({vaccineName, skip});

  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    isoAggkey,
    varName,
    genePos,
    addColumns,
    joinClause,
    where,
    params,
    skip
  });

  const contextValue = {suscResults, suscResultLookup, isPending};

  return <VPSuscResultsContext.Provider value={contextValue}>
    {children}
  </VPSuscResultsContext.Provider>;
}


export default function useVPSuscResults() {
  return React.useContext(VPSuscResultsContext);
}
