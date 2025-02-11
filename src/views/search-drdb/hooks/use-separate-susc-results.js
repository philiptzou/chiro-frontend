import React from 'react';
import Isolates from './isolates';

const type2Section = {
  'individual-mutation': 'indivMut',
  'mutation-combination': 'comboMuts'
};

export default function useSeparateSuscResults({
  suscResults,
  skip
}) {
  const {
    isolateLookup,
    isPending
  } = Isolates.useMe();

  return React.useMemo(
    () => {
      if (skip || isPending) {
        return;
      }
      return suscResults.reduce(
        (acc, sr) => {
          const {type} = isolateLookup[sr.isoName];
          const section = type2Section[type];
          if (sr.cumulativeCount > 1) {
            acc[section].aggFold.push(sr);
          }
          else {
            acc[section].indivFold.push(sr);
          }
          return acc;
        },
        {
          indivMut: {indivFold: [], aggFold: []},
          comboMuts: {indivFold: [], aggFold: []}
        }
      );
    },
    [skip, isPending, suscResults, isolateLookup]
  );
}
