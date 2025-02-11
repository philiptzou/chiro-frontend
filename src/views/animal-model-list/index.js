import React from 'react';
import PropTypes from 'prop-types';
import {useQuery} from '@apollo/client';

import {Grid, Header, Item, Loader} from 'semantic-ui-react';

import query from './query.gql.js';
import style from './style.module.scss';
import setTitle from '../../utils/set-title';


class AnimalModelListInner extends React.Component {

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    animalModels: PropTypes.object
  }

  static defaultProps = {
    loading: false
  }

  render() {
    const {loading, animalModels} = this.props;
    setTitle('Animal Models');

    return <Grid stackable className={style['animal-model-list']}>
      {loading ?
        <Loader active inline="centered" /> :
        <Grid.Row>
          <Grid.Column width={16}>
            <Header as="h1" dividing>Animal Models</Header>
            <p>
              {animalModels.totalCount} animal model
              {animalModels.totalCount > 1 ? 's are' : ' is'} listed:
            </p>
            <Item.Group divided>
              {animalModels.edges.map(
                ({
                  node: {
                    name,
                    description,
                    comment
                  }
                }, idx) => (
                  <Item key={idx}>
                    <Item.Content>
                      <Item.Header>{name}</Item.Header>
                      <Item.Meta>
                        {description}
                      </Item.Meta>
                      <Item.Description>
                        {comment}
                      </Item.Description>
                    </Item.Content>
                  </Item>
                )
              )}
            </Item.Group>
          </Grid.Column>
        </Grid.Row>
      }
    </Grid>;

  }


}


export default function AnimalModelList(props) {
  let {loading, error, data} = useQuery(query);
  if (loading) {
    return (
      <AnimalModelListInner loading />
    );
  }
  else if (error) {
    return `Error: ${error.message}`;
  }

  return (
    <AnimalModelListInner
     {...props}
     {...data} />
  );
}
