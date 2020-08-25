import React from 'react';
import {Link} from 'found';
import sortBy from 'lodash/sortBy';
import orderBy from 'lodash/orderBy';
import {Popup} from 'semantic-ui-react';

import style from './style.module.scss';
import {ColumnDef} from '../../components/chiro-table';


function reformExpData(expData, sort = true) {
  if (!expData || !expData.edges) {
    return [];
  }
  const data = expData.edges.map(({node}) => node);
  if (sort === true) {
    return orderBy(
      data, [
        row => ((row.articles[0] || {}).year || 0),
        row => ((row.articles[0] || {}).nickname || [''])[0]
      ],
      ['desc', 'asc']
    );
  }
  else if (typeof sort === 'function') {
    return sort(data);
  }
  else {
    return data;
  }
}


function readableNum(num) {
  if (isNaN(num)) {
    return '?';
  }
  let prec = Math.max(Math.floor(Math.log10(num)) + 1, 0);
  if (prec < 2) {
    prec ++;
  }
  return (
    num.toPrecision(prec)
      .replace(/(\.\d*)0+$/, '$1')
      .replace(/\.$/, '')
  );
}


function renderXX50(
  num, cmp, unit, inactive,
  default_unit = '\xb5M',
  none = '?', converters = {}
) {
  if (inactive) {
    return '>>>';
  }
  if (num === null) {
    return none;
  }
  if (`${unit}-to-${default_unit}` in converters) {
    num = converters[`${unit}-to-${default_unit}`](num);
    unit = default_unit;
  }
  num = readableNum(num);
  return <span className={style['nowrap']}>
    {cmp === '=' ? '' : cmp}{num}
    {unit === default_unit ? '' : ` ${unit}`}
  </span>;
}


const authorYearColDef = new ColumnDef({
  name: 'articles',
  label: 'Author/Year',
  render: articles => articles.map(
    ({nickname, journal, journalAbbr}, idx) => {
      return [
        <Link key={idx} to={{
          pathname: '/search/',
          query: {article: nickname[0]}
        }}>{nickname[0]}</Link>,
        journalAbbr ? <span key={`j${idx}`}>&#8232;({journalAbbr})</span> : (
          journal ? <span key={`j${idx}`}>&#8232;({journal})</span> : null
        )
      ];
    }
  ),
  sort: data => sortBy(data, row => (
    ((row.articles[0] || {}).nickname || [''])[0]
  ))
});


const virusSpeciesDef = new ColumnDef({
  name: 'virusName',
  label: 'Virus',
  render: (virusName, {virusStrainName}) => {
    if (virusStrainName) {
      return (
        <Popup
         content={<>Strain: <strong>{virusStrainName}</strong></>}
         trigger={<span className={style['with-info']}>
           {virusName}
         </span>} />
      );
    } else {
      return virusName;
    }
  }
});


const compoundColDef = label => new ColumnDef({
  name: 'compoundNames',
  label,
  render: compoundNames => compoundNames.map(
    name => name.replace(
      /^MAb-(SARS-CoV-2-|SARS-CoV-|MERS-CoV-)?/, ''
    )
  ).join(' + '),
  sort: data => sortBy(data, ['compoundNames[0]'])
});


const nameAndDescColDef = (name, label, none='?') => new ColumnDef({
  name,
  label,
  render: (obj, data) => {
    if (!obj) {
      return none;
    }
    const {name, description} = obj;
    if (!description) {
      return name;
    }
    return (
      <Popup
       header={name} content={description}
       trigger={<span className={style['with-info']}>
         {name}
       </span>} />
    );
  },
  sort: data => sortBy(data, [`${name}.name`]),
});

const ColDef = ColumnDef;

export {
  ColDef, reformExpData, readableNum, renderXX50,
  authorYearColDef, virusSpeciesDef, compoundColDef,
  nameAndDescColDef
};
