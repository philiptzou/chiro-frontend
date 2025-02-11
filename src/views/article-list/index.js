import React from 'react';
import {Link} from 'found';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';

import {Grid, Header, Loader} from 'semantic-ui-react';

import ArticleInfo from '../../components/article-info';
import ArticleAbstractInfo from '../../components/article-abstract-info';
import query from './query.gql.js';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';


class ArticleListInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    articles: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {
      loading,
      articles
    } = this.props;

    setTitle('References');

    return <Grid stackable className={style['article-list']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h1" dividing>
              References
              <Header.Subheader>
                # Total: {articles.edges.length},
                # Peer reviewed: {
                  articles.edges.filter(({node}) => {
                    let result = (node.pmid.length !== 0);
                    if (!result) {
                      result = node.doi.filter((d) => {
                        return (!d.startsWith('10.1101'));
                      }).length > 0;
                    }
                    return result;
                  }).length},
                # Preprint: {
                  articles.edges.filter(({node}) => {
                    if (node.pmid.length > 0) {
                      return false;
                    }
                    return node.doi.filter((d) => {
                      return d.startsWith('10.1101');
                    }).length > 0;
                  }).length
                }
              </Header.Subheader>
            </Header>
            <ol>
              {articles.edges.map(
                ({node: {experimentCounts, nickname, ...node}}, idx) => (
                  <li key={idx}>
                    <ArticleInfo {...node} />{' '}
                    (<Link to={{
                      pathname: '/search',
                      query: {article: nickname[0]}
                    }}>
                      {(() => {
                        const total = experimentCounts.reduce(
                          (acc, {count}) => acc + count,
                          0
                        );
                        if (total > 1) {
                          return `${total} experiment results`;
                        }
                        else {
                          return `${total} experiment result`;
                        }
                      })()}
                    </Link>)
                    <ArticleAbstractInfo nickname={nickname[0]} />
                  </li>
                )
              )}
            </ol>
          </Grid.Column>
        </Grid.Row>
      }
    </Grid>;

  }


}


export default function ArticleList(props) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return (
      <ArticleListInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <ArticleListInner
     {...props}
     {...data} />
  );
}
