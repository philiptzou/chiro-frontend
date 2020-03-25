import React from 'react';
import PropTypes from 'prop-types';
import sortBy from 'lodash/sortBy';

import ExpTable from './exptable';
import {virusExperimentsShape} from './prop-types';
import {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef, compoundColDef
} from './table-helper';


function renderSI(num, cmp) {
  if (num === null) {
    return 'ND';
  }
  num = readableNum(num);
  return `${cmp === '=' ? '' : cmp}${num}`;
}


const tableColumns = [
  authorYearColDef, virusSpeciesDef,
  new ColDef('virusInput', 'Virus Input', null, null, false),
  compoundColDef('Compound'),
  new ColDef(
    'drugTiming', 'Timing',
    value => (
      value ?
        (/\d$/.test(value) ? `${value} hr` : value) :
        'NA'
    )
  ),
  new ColDef('cellsName', 'Cells'),
  new ColDef(
    'durationOfInfection', 'Infection Duration',
    value => (
      value ?
        (/\d$/.test(value) ? `${value} hr` : value) :
        'NA'
    )
  ),
  new ColDef('measurement'),
  new ColDef(
    'ec50', 'EC50',
    (ec50, {ec50cmp, ec50unit}) => renderXX50(ec50, ec50cmp, ec50unit),
    data => sortBy(data, ['ec50unit', 'ec50', 'ec50cmp'])
  ),
  new ColDef(
    'si', 'SI',
    (si, {sicmp}) => renderSI(si, sicmp),
    data => sortBy(data, ['sicmp', 'si'])
  )
];


export default class VirusExpTable extends React.Component {

  static propTypes = {
    compoundName: PropTypes.string,
    virusName: PropTypes.string,
    data: virusExperimentsShape.isRequired
  }

  render() {
    const {compoundName, virusName, data} = this.props;
    return (
      <ExpTable
       cacheKey={`${compoundName}@@${virusName}`}
       columnDefs={tableColumns}
       data={reformExpData(data)} />
    );
  }

}
