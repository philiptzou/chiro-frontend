import React from 'react';
import useSuscResults from './use-susc-results';


function usePrepareQuery({skip}) {
  return React.useMemo(
    () => {
      const addColumns = [];
      const joinClause = [];

      if (!skip) {
        addColumns.push('RXCP.infection');
        addColumns.push('RXCP.timing');
        addColumns.push('RXCP.severity');

        joinClause.push(`
          JOIN rx_conv_plasma RXCP ON
            S.ref_name = RXCP.ref_name AND
            S.rx_name = RXCP.rx_name
        `);
      }
      return {addColumns, joinClause};
    },
    [skip]
  );

}


export default function useConvPlasmaSuscResults({
  refName,
  spikeMutations,
  mutationMatch,
  skip = false
}) {

  const {addColumns, joinClause} = usePrepareQuery({skip});
  const {
    suscResults,
    suscResultLookup,
    isPending
  } = useSuscResults({
    refName,
    spikeMutations,
    mutationMatch,
    addColumns,
    joinClause,
    skip
  });

  return {suscResults, suscResultLookup, isPending};
}
