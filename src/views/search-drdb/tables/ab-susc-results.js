import useColumnDefs from './use-column-defs';
import useRenderSuscResults from './use-render-susc-results';


export default function AbSuscResults({
  loaded,
  cacheKey,
  antibodyLookup,
  variantLookup,
  abSuscResults
}) {

  const indivMutColumnDefs = useColumnDefs({
    antibodyLookup,
    variantLookup,
    columns: [
      'refName',
      'section',
      'controlVariantName',
      'variantName',
      'abNames',
      'fold'
    ],
    labels: {
      variantName: 'Mutation'
    }
  });

  const comboMutsColumnDefs = useColumnDefs({
    antibodyLookup,
    variantLookup,
    columns: [
      'refName',
      'section',
      'controlVariantName',
      'variantName',
      'abNames',
      'fold'
    ],
    labels: {
      variantName: 'Variant'
    }
  });

  return useRenderSuscResults({
    loaded,
    id: 'mab-susc-results',
    cacheKey,
    suscResults: abSuscResults,
    variantLookup,
    indivMutColumnDefs,
    comboMutsColumnDefs
  });
}
