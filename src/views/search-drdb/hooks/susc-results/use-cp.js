import React from 'react';
import PropTypes from 'prop-types';
import LocationParams from '../location-params';
import useSuscResults from './use-susc-results';


const CPSuscResultsContext = React.createContext();


function usePrepareQuery({infectedVarName, skip}) {
  return React.useMemo(
    () => {
      const addColumns = [];
      const where = [];
      const joinClause = [];
      const params = {};

      if (!skip) {
        addColumns.push("'conv-plasma' AS rx_type");
        addColumns.push('RXCP.infected_iso_name');
        addColumns.push('RXCP.timing');
        addColumns.push('RXCP.severity');

        if (infectedVarName && infectedVarName !== 'any') {
          where.push(`
            EXISTS (
              SELECT 1 FROM isolates ISO
              WHERE
                RXCP.infected_iso_name = ISO.iso_name AND
                ISO.var_name = $infectedVarName
            )
          `);
          params.$infectedVarName = infectedVarName;
        }

        joinClause.push(`
          JOIN rx_conv_plasma RXCP ON
            S.ref_name = RXCP.ref_name AND
            S.rx_name = RXCP.rx_name
        `);
      }
      return {addColumns, where, joinClause, params};
    },
    [skip, infectedVarName]
  );

}


CPSuscResultsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


export function CPSuscResultsProvider({children}) {
  const {
    params: {
      formOnly,
      refName,
      isoAggkey,
      varName,
      genePos,
      infectedVarName
    },
    filterFlag
  } = LocationParams.useMe();
  const skip = formOnly || filterFlag.antibody || filterFlag.vaccine;
  const {
    addColumns,
    joinClause,
    where,
    params
  } = usePrepareQuery({infectedVarName, skip});
  const contextValue = useSuscResults({
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

  return <CPSuscResultsContext.Provider value={contextValue}>
    {children}
  </CPSuscResultsContext.Provider>;
}


export default function useCPSuscResults() {
  return React.useContext(CPSuscResultsContext);
}
