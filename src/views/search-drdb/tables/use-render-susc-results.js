import React from 'react';
import pluralize from 'pluralize';
import {Header} from 'semantic-ui-react';
import {H3, H4} from 'sierra-frontend/dist/components/heading-tags';

import SimpleTable from 'sierra-frontend/dist/components/simple-table';
import InlineLoader from 'sierra-frontend/dist/components/inline-loader';

import style from './style.module.scss';


const type2Section = {
  'individual-mutation': 'indivMut',
  'mutation-combination': 'comboMuts'
};


function SimpleTableWrapper({cacheKey, data, hideNN = false, ...props}) {
  const [hide, setHide] = React.useState(hideNN);

  const handleUnhide = React.useCallback(
    evt => {
      evt.preventDefault();
      setHide(!hide);
    },
    [setHide, hide]
  );

  let hideNote;
  const filtered = data.filter(
    d => d.ineffective === 'experimental' || d.ineffective === null
  );
  const removedLen = data.length - filtered.length;
  const hasNN = !hide && filtered.length > 0;
  const hasNA = data.some(d => (
    d.controlPotency === null || d.potency === null
  ));
  if (hide) {
    data = filtered;
    hideNote = (
      removedLen > 0 ?
        <div><em>
          <strong>{pluralize('result', removedLen, true)}</strong>{' '}
          {pluralize('has', removedLen)}{' '}
          been hidden due to poor neutralizing
          activity against the control virus.
        </em> (<a onClick={handleUnhide} href="#unhide">unhide</a>)
        </div> : null
    );
  }
  else {
    hideNote = (
      removedLen > 0 ?
        <div><em>
          <strong>{pluralize('result', removedLen, true)}</strong>{' '}
          {pluralize('has', removedLen)}{' '}
          poor neutralizing activity against the control virus.
        </em> (<a onClick={handleUnhide} href="#hide">hide</a>)
        </div> : null
    );
  }

  const tableJSX = (
    data.length > 0 ?
      <SimpleTable
       {...props}
       cacheKey={`${cacheKey}__${hide}`}
       data={data} /> : null
  );

  return <>
    {hideNote}
    {tableJSX}
    {hasNA || hasNN ? <p className={style.footnote}>
      {hasNA ? <>
        <strong><em>N.A.</em></strong>: data point not available
      </> : null}
      {hasNA && hasNN ? '; ' : null}
      {hasNN ? <>
        <strong><em>N.N.</em></strong>: control virus not neutralized
      </> : null}
      .
    </p> : null}
  </>;
}



export default function useRenderSuscResults({
  id,
  loaded,
  cacheKey,
  hideNN = false,
  suscResults,
  isolateLookup,
  indivMutIndivFoldColumnDefs,
  indivMutAggFoldColumnDefs,
  comboMutsIndivFoldColumnDefs,
  comboMutsAggFoldColumnDefs
}) {

  const suscResultsBySection = React.useMemo(
    () => {
      if (!loaded) {
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
    [loaded, suscResults, isolateLookup]
  );


  return React.useMemo(
    () => {
      if (loaded) {
        const numSections = (
          Object.entries(suscResultsBySection)
            .filter(
              ([, {indivFold, aggFold}]) => (
                indivFold.length + aggFold.length > 0
              )
            )
            .length
        );
        const indivMutIndivFoldTable = (
          suscResultsBySection.indivMut.indivFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_indiv-mut_indiv-fold_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={indivMutIndivFoldColumnDefs}
             data={suscResultsBySection.indivMut.indivFold} /> : null
        );
        const indivMutAggFoldTable = (
          suscResultsBySection.indivMut.aggFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_indiv-mut_agg-fold_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={indivMutAggFoldColumnDefs}
             data={suscResultsBySection.indivMut.aggFold} /> : null
        );
        const comboMutsIndivFoldTable = (
          suscResultsBySection.comboMuts.indivFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_combo-muts_indiv-fold_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={comboMutsIndivFoldColumnDefs}
             data={suscResultsBySection.comboMuts.indivFold} /> : null
        );
        const comboMutsAggFoldTable = (
          suscResultsBySection.comboMuts.aggFold.length > 0 ?
            <SimpleTableWrapper
             cacheKey={`${id}_combo-muts_agg-fold_${cacheKey}`}
             hideNN={hideNN}
             columnDefs={comboMutsAggFoldColumnDefs}
             data={suscResultsBySection.comboMuts.aggFold} /> : null
        );
        if (numSections === 2) {
          return <>
            <section>
              <Header as={H3} id={`${id}_indiv-mut`}>
                Individual mutation
                {indivMutIndivFoldTable ?
                  null : ' - data published only in aggregate form'}
              </Header>
              {indivMutIndivFoldTable}
              {indivMutIndivFoldTable && indivMutAggFoldTable ? <>
                <Header as={H4} id={`${id}_indiv-mut_agg-fold`}>
                  Individual mutation -
                  data published only in aggregate form
                </Header>
              </> : null}
              {indivMutAggFoldTable}
            </section>
            <section>
              <Header as={H3} id={`${id}_combo-muts`}>
                Variant / mutation combination
                {comboMutsIndivFoldTable ?
                  null : ' - data published only in aggregate form'}
              </Header>
              {comboMutsIndivFoldTable}
              {comboMutsIndivFoldTable && comboMutsAggFoldTable ? <>
                <Header as={H4} id={`${id}_combo-muts_agg-fold`}>
                  Variant / mutation combination -
                  data published only in aggregate form
                </Header>
              </> : null}
              {comboMutsAggFoldTable}
            </section>
          </>;
        }
        else if (numSections === 1) {
          return <>
            {indivMutIndivFoldTable}
            {indivMutAggFoldTable ? <>
              <Header as={H3} id={`${id}_indiv-mut_agg-fold`}>
                Data published only in aggregate form
              </Header>
              {indivMutAggFoldTable}
            </> : null}
            {comboMutsIndivFoldTable}
            {comboMutsAggFoldTable ? <>
              <Header as={H3} id={`${id}_combo-muts_agg-fold`}>
                Data published only in aggregate form
              </Header>
              {comboMutsAggFoldTable}
            </> : null}
          </>;
        }
        else {
          return "No susceptibility data is found for this request.";
        }
      }
      else {
        return <InlineLoader />;
      }
    },
    [
      id,
      loaded,
      hideNN,
      cacheKey,
      indivMutIndivFoldColumnDefs,
      indivMutAggFoldColumnDefs,
      comboMutsIndivFoldColumnDefs,
      comboMutsAggFoldColumnDefs,
      suscResultsBySection
    ]
  );
}
