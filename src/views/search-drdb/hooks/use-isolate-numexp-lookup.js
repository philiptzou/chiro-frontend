import React from 'react';
import useSuscSummary from './use-susc-summary';


export default function useIsolateNumExpLookup({
  skip,
  articleValue,
  antibodyValue,
  vaccineValue,
  convPlasmaValue
}) {
  let rxType;
  const aggregateBy = [];
  if (articleValue) {
    aggregateBy.push('article');
  }
  if (antibodyValue && antibodyValue.length > 0) {
    if (antibodyValue[0] === 'any') {
      rxType = 'antibody';
      aggregateBy.push('rx_type');
      antibodyValue = null;
    }
    else if (antibodyValue.length === 1) {
      aggregateBy.push('antibody:indiv');
    }
    else {
      aggregateBy.push('antibody');
    }
  }
  if (vaccineValue) {
    if (vaccineValue === 'any') {
      rxType = 'vacc-plasma';
      aggregateBy.push('rx_type');
      vaccineValue = null;
    }
    else {
      aggregateBy.push('vaccine');
    }
  }
  if (convPlasmaValue) {
    if (convPlasmaValue === 'any') {
      rxType = 'conv-plasma';
      aggregateBy.push('rx_type');
      convPlasmaValue = null;
    }
    else {
      aggregateBy.push('infected_variant');
    }
  }
  const {
    suscSummary,
    isPending
  } = useSuscSummary({
    aggregateBy: ['isolate', ...aggregateBy],
    refName: articleValue,
    rxType,
    antibodyNames: antibodyValue,
    vaccineName: vaccineValue,
    infectedVarName: convPlasmaValue,
    selectColumns: [
      'iso_name',
      'potency_type',
      'potency_unit',
      'num_experiments'
    ],
    skip
  });

  const lookup = React.useMemo(
    () => {
      if (skip || isPending) {
        return {};
      }
      const lookup = {};
      for (const {isoName, numExperiments} of suscSummary) {
        // we have multiple rows since different control isolate
        lookup[isoName] = lookup[isoName] || 0;
        lookup[isoName] += numExperiments;
      }
      return lookup;
    },
    [skip, isPending, suscSummary]
  );
  return [lookup, isPending];
}
