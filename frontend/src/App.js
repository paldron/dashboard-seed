import React from 'react';
import { Switch, Route, withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { initOrgParams } from './redux/organization/org.actions';

import AppLayout from './components/app-layout/app-layout.component';
import Dashboard from './pages/dashboard/page.component';

import backImg from './assets/img/video_1.mp4';
import './styles/main.scss';

class App extends React.Component {

  componentDidMount() {
    this.props.initOrgParams();
  }

  render() {
    //console.log('App Rendered',this.props);
    return (
      <div style={{position: 'relative'}}>
        <div className="bg-video">
          <video className="bg-video__content" autoPlay muted loop>
            <source src={backImg} type="video/mp4" />
            File Not Supported!
                    </video>
        </div>
        <AppLayout>
          <Switch>
            <Route exact path="/" render={props => (<Redirect to="/dashboard" />)} />
            <Route exact path="/dashboard" component={Dashboard} />
          </Switch>
        </AppLayout>
      </div>

    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  initOrgParams: () => dispatch(initOrgParams())
});

// // const mapStateToProps = (state) => ({
// //   currentUser: selectCurrentUser(state)
// // });

const mapStateToProps = createStructuredSelector({

});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
