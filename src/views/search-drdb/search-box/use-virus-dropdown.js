import React from 'react';
import pluralize from 'pluralize';
import {Dropdown} from 'semantic-ui-react';
import {NumExpStats} from '../hooks/susc-summary';
import LocationParams from '../hooks/location-params';
import Variants from '../hooks/variants';
import IsolateAggs, {compareIsolateAggs} from '../hooks/isolate-aggs';
import Positions from '../hooks/positions';

import FragmentWithoutWarning from './fragment-without-warning';
import style from './style.module.scss';


const EMPTY = '__EMPTY';
const ANY = '__ANY';
const EMPTY_TEXT = 'Select item';


export default function useVirusDropdown() {

  const {
    params: {
      varName: paramVarName,
      isoAggkey: paramIsoAggKey,
      formOnly
    },
    onChange
  } = LocationParams.useMe();

  const {
    variants,
    isPending: isVarsPending
  } = Variants.useMe();

  const {
    isolateAggs,
    isPending: isIsoAggsPending
  } = IsolateAggs.useMe();

  const {
    positions,
    isPending: isPositionsPending
  } = Positions.useMe();

  const [
    varTotalNumExp,
    isVarTotalNumExpPending
  ] = NumExpStats.useVirusTotal();
  const [
    varNumExpLookup,
    isVarNumExpLookupPending
  ] = NumExpStats.useVar();
  const [
    isoAggNumExpLookup,
    isIsoAggNumExpLookupPending
  ] = NumExpStats.useIsoAgg();
  const [
    posNumExpLookup,
    isPosNumExpLookupPending
  ] = NumExpStats.usePos();

  const isPending = (
    isVarsPending ||
    isIsoAggsPending ||
    isPositionsPending ||
    isVarTotalNumExpPending ||
    isVarNumExpLookupPending ||
    isIsoAggNumExpLookupPending ||
    isPosNumExpLookupPending
  );

  const variantOptions = React.useMemo(
    () => {
      if (isPending) {
        return [
          {
            key: 'any',
            text: 'Any',
            value: ANY
          },
          ...(paramVarName ? [{
            key: paramVarName,
            text: paramVarName,
            value: paramVarName
          }] : []),
          ...(paramIsoAggKey ? [{
            key: paramIsoAggKey,
            text: paramIsoAggKey,
            value: paramIsoAggKey
          }] : [])
        ];
      }
      else {
        const displayVariants = variants
          .map(
            ({varName, synonyms}) => ({
              varName,
              synonyms,
              numExp: varNumExpLookup[varName] || 0
            })
          )
          .filter(({numExp}) => numExp > 0)
          .sort((a, b) => b.numExp - a.numExp);

        const displayIsolateAggs = isolateAggs
          .filter(
            ({varName, isoType}) => (
              varName === null || isoType === 'indiv-mut'
            )
          )
          .map(
            ({isoAggkey, isoAggDisplay, mutations}) => ({
              isoAggkey,
              isoAggDisplay,
              position: mutations[0]?.position,
              numExp: isoAggNumExpLookup[isoAggkey] || 0
            })
          )
          .filter(({numExp}) => numExp > 0)
          .sort(compareIsolateAggs);

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
              varTotalNumExp,
              true
            )
          },
          ...(displayVariants.length > 0 ? [
            {
              key: 'variant-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            ...displayVariants
              .map(
                ({varName, synonyms, numExp}) => ({
                  key: varName,
                  text: (
                    synonyms.length > 0 ?
                      `${varName} (${synonyms[0]})` : varName
                  ),
                  value: varName,
                  type: 'variant',
                  description: pluralize('result', numExp, true)
                })
              )
          ] : []),
          ...(displayIsolateAggs.length > 0 ? [
            {
              key: 'combomut-divider',
              as: FragmentWithoutWarning,
              children: <Dropdown.Divider />
            },
            ...[
              ...positions
                .map(
                  ({posKey, gene, position, refAminoAcid}) => ({
                    key: posKey,
                    text: (
                      `${
                        gene === 'S' ? '' : `${gene}:`
                      }${refAminoAcid}${position} - any`
                    ),
                    value: posKey,
                    type: 'positions',
                    position,
                    description: pluralize(
                      'result',
                      posNumExpLookup[posKey],
                      true
                    )
                  })
                ),
              ...displayIsolateAggs
                .map(
                  ({isoAggkey, isoAggDisplay, position, numExp}) => ({
                    key: isoAggkey,
                    text: isoAggDisplay,
                    value: isoAggkey,
                    type: 'mutations',
                    position,
                    description: pluralize('result', numExp, true)
                  })
                )
            ].sort((a, b) => a.position - b.position)
          ] : [])
        ];
      }
    },
    [
      isPending,
      variants,
      isolateAggs,
      positions,
      paramVarName,
      paramIsoAggKey,
      formOnly,
      varTotalNumExp,
      varNumExpLookup,
      isoAggNumExpLookup,
      posNumExpLookup
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
            variant: undefined,
            mutations: undefined
          });
        }
        else {
          const {type} = options.find(opt => opt.value === value);
          onChange(type, value);
        }
      }
    },
    [onChange]
  );

  const defaultValue = formOnly ? EMPTY : ANY;

  return (
    <div
     data-loaded={!isPending}
     className={style['search-box-dropdown-container']}>
      <Dropdown
       search direction="right"
       placeholder={EMPTY_TEXT}
       options={variantOptions}
       onChange={handleChange}
       value={paramVarName || paramIsoAggKey || defaultValue} />
    </div>
  );
}
