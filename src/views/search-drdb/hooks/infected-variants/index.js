import React from 'react';
import PropTypes from 'prop-types';
import useQuery from '../use-query';

const LIST_JOIN_UNIQ = "$#\b#$";

const InfectedVariantsContext = React.createContext();


InfectedVariantsProvider.propTypes = {
  children: PropTypes.node.isRequired
};


function InfectedVariantsProvider({children}) {

  const sql = `
    SELECT
      var_name,
      (
        SELECT GROUP_CONCAT(synonym, "${LIST_JOIN_UNIQ}")
        FROM variant_synonyms VS
        WHERE V.var_name=VS.var_name
        ORDER BY LENGTH(synonym)
      ) AS synonyms
    FROM variants V
    WHERE
      EXISTS (
        SELECT 1 FROM susc_summary S
        WHERE
          S.aggregate_by = 'infected_variant' AND
          S.infected_var_name = V.var_name
      )
    ORDER BY var_name
  `;

  const {
    payload,
    isPending
  } = useQuery({sql});

  let infectedVariants;
  if (payload) {
    infectedVariants = payload.map(
      ({varName, synonyms}) => ({
        varName,
        synonyms: synonyms ? synonyms.split(LIST_JOIN_UNIQ) : []
      })
    );
  }

  const contextValue = {
    infectedVariants,
    isPending
  };

  return <InfectedVariantsContext.Provider value={contextValue}>
    {children}
  </InfectedVariantsContext.Provider>;

}

function useInfectedVariants() {
  return React.useContext(InfectedVariantsContext);
}

const InfectedVariants = {
  Provider: InfectedVariantsProvider,
  useMe: useInfectedVariants
};

export default InfectedVariants;
