import React from 'react';
import {Link} from 'found';
import {Grid, Header} from 'semantic-ui-react';

import SiteBrand from '../site-brand';

import style from './style.module.scss';

export default class Footer extends React.Component {

  render() {

    return <footer className={style['footer']}>
      <SiteBrand
       className={style['site-brand']}
       responsive hideSubtitle size="large" />
      <Grid columns={3} relaxed stackable>
        <Grid.Column>
          <Header as="h2">Database</Header>
          <ul>
            <li><Link to="/page/terms-of-use/">Terms of Use</Link></li>
            <li><Link to="/page/database-schema/">Database Schema</Link></li>
            <li><Link to="/page/acknowledgment/">Acknowledgment</Link></li>
          </ul>
        </Grid.Column>
        <Grid.Column>
          <Header as="h2">Resources</Header>
          <ul>
            <li><Link to="/page/links/">COVID-19 Websites and Links</Link></li>
            <li><Link to="/page/press-release/">Press Releases</Link></li>
            <li><Link to="/virus-list/">Viruses</Link></li>
            <li><Link to="/cells-list/">Cell lines</Link></li>
            <li><Link to="/animal-model-list/">Animal models</Link></li>
            <li><Link to="/cell-culture-measurement-list/">
              Measurements
            </Link></li>
            <li><Link to="/archive/">Archive</Link></li>
          </ul>
        </Grid.Column>
        <Grid.Column>
          <Header as="h2">Team</Header>
          <ul>
            <li>
              <a href="https://hivdb.stanford.edu/about/team/">
                Who We Are
              </a>
            </li>
            <li>
              <a href="https://hivdb.stanford.edu/about/contactus/">
                How to Contact Us
              </a>
            </li>
            <li>
              <a
               href="https://www.mdpi.com/1999-4915/12/9/1006"
               target="_blank" rel="noopener noreferrer">
                Citation
              </a>
            </li>
          </ul>
        </Grid.Column>
      </Grid>
      <div className={style.copyright}>
        © 2020. All Rights Reserved. Questions? Contact{' '}
        <a href="mailto:hivdbteam@stanford.edu">HIVDB team</a>.
      </div>
    </footer>;


  }

}
