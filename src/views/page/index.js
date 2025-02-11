import React from 'react';
import PropTypes from 'prop-types';

import CMSPage from './cms';
import SusceptibilityDataPage from './susceptibility-data';


export default class Page extends React.Component {

  static propTypes = {
    match: PropTypes.shape({
      location: PropTypes.object.isRequired,
      params: PropTypes.shape({
        pageName: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }

  render() {
    const {params: {pageName}} = this.props.match;
    if (pageName === 'susceptibility-data') {
      return <SusceptibilityDataPage />;
    }
    else {
      return <CMSPage key={pageName} pageName={pageName} />;
    }
  }
}
