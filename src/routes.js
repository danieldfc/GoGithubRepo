import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import Main from './pages/Main';
import Repository from './pages/Repository';

export default class Rotes extends Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={Main} />
          <Route path="/repository" component={Repository} />
        </Switch>
      </BrowserRouter>
    );
  }
}
