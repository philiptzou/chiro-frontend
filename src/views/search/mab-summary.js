import React from 'react';
import PropTypes from 'prop-types';
import PageLoader from '../../components/page-loader';
import Markdown from 'sierra-frontend/dist/components/markdown';


function MAbSummaryTable({
  displayMAbs,
  tables: {MAbs},
  imagePrefix,
  cmsPrefix,
  curCompound,
  children
}) {
  const tableName = `MAb-${displayMAbs.join(';')}`;
  let {data, columnDefs, ...MAbProps} = MAbs;
  // remove "MAb (EC50)" column
  columnDefs = columnDefs.filter(
    ({name}) => (
      name !== 'antibodies' &&
      name !== 'dataAvailability.animal'
    )
  );
  data = data.filter(
    ({antibodies}) => displayMAbs.includes(antibodies)
  );
  if (data.length >= 2 || data.length === 0) {
    // fallback to display children
    return children;
  }
  const tables = {};
  tables[tableName] = {...MAbProps, data, columnDefs};
  let mAbsInTitle = '';
  if (displayMAbs.length > 1) {
    if (data.length === 1) {
      mAbsInTitle += 'Group of ';
    }
    else {
      mAbsInTitle += 'Groups of ';
    }
  }

  if (curCompound) {
    mAbsInTitle += curCompound.name;
  }
  else {
    mAbsInTitle += displayMAbs[0];
  }

  return <>
    <Markdown
     key={mAbsInTitle}
     imagePrefix={imagePrefix}
     cmsPrefix={cmsPrefix}
     tables={tables}>
      ## [MAbs tracker](/page/mab-tables/):{' '}{mAbsInTitle}{'\n\n'}

      [table]{'\n'}
      {tableName}{'\n'}
      [/table]{'\n'}
    </Markdown>
  </>;
}

MAbSummaryTable.propTypes = {
  displayMAbs: PropTypes.array,
  tables: PropTypes.shape({
    MAbs: PropTypes.shape({
      data: PropTypes.array.isRequired,
      columnDefs: PropTypes.array.isRequired
    })
  }).isRequired,
  imagePrefix: PropTypes.string.isRequired,
  cmsPrefix: PropTypes.string.isRequired,
  curCompound: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.node
};


export default function MAbSummaryTableContainer({
  displayMAbs, curCompound, children
}) {

  return (
    <PageLoader
     pageName="mab-tables"
     childProps={{children, curCompound, displayMAbs}}
     component={MAbSummaryTable} />
  );

}

MAbSummaryTableContainer.propTypes = {
  displayMAbs: PropTypes.array,
  curCompound: PropTypes.shape({
    name: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.node
};

MAbSummaryTableContainer.defaultProps = {children: null};
