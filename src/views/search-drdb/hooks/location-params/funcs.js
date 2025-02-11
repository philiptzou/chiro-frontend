export function parseAntibodies(antibodyText) {
  return antibodyText
    .split(',')
    .map(ab => ab.trim())
    .filter(ab => ab);
}


export function cleanQuery(query) {
  query = {...query};
  if (query.form_only) {
    query = {
      /* eslint-disable-next-line camelcase */
      form_only: null
    };
  }

  if (!query.mutations || query.mutations.trim().length === 0) {
    delete query.mutations;
  }

  if (!query.position || query.position.trim().length === 0) {
    delete query.position;
  }

  if (query.mutations !== undefined && query.variant !== undefined) {
    delete query.variant;
  }

  if (query.mutations !== undefined && query.position !== undefined) {
    delete query.position;
  }

  if (query.position !== undefined && query.variant !== undefined) {
    delete query.variant;
  }

  query = Object
    .entries(query)
    .filter(([, val]) => val !== undefined)
    .reduce(
      (acc, [key, val]) => {
        acc[key] = val;
        return acc;
      },
      {}
    );
  if (Object.keys(query).length === 0) {
    // force form_only since loading all take too long
    /* eslint-disable-next-line camelcase */
    query.form_only = null;
  }

  query = Object
    .keys(query)
    .sort()
    .reduce(
      (sorted, key) => {
        sorted[key] = query[key];
        return sorted;
      },
      {}
    );

  return query;
}


export function buildQuery(
  action,
  value,
  baseQuery = {}
) {
  let query = {...baseQuery};
  if (typeof action === 'string') {
    query[action] = value;
  }
  else {
    query = {...query, ...action};
  }

  delete query.form_only;

  if (action === 'vaccine') {
    delete query.antibodies;
    delete query.cp;
  }
  else if (action === 'antibodies') {
    delete query.vaccine;
    delete query.cp;
  }
  else if (action === 'cp') {
    delete query.antibodies;
    delete query.vaccine;
  }
  else if (action === 'variant') {
    delete query.mutations;
    delete query.position;
  }
  else if (action === 'mutations') {
    delete query.variant;
    delete query.position;
  }
  else if (action === 'position') {
    delete query.variant;
    delete query.mutations;
  }

  return cleanQuery(query);
}
