import React, { useState, useEffect } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import axios from "axios";

import "./Main.css";
import Navbar from "./components/Navbar/Navbar";

import SignUp from "./components/SignUp";
import Login from "./components/Login";

import Home from "./views/Home";
import Dashboard from "./views/Dashboard/Dashboard";
import Setup from "./views/Setup";
import Profile from "./views/Profile/Profile";

const App = () => {
  const [user, setUser] = useState({
    username: "",
    email: "",
    preferences: []
  });
  const [userFeeds, setUserFeeds] = useState([]);
  const [open, setOpen] = useState(false);
  const [userStatus, setUserStatus] = useState(false);
  const history = useHistory();

  //toggleNav
  const navControl = () => {
    open ? setOpen(false) : setOpen(true);
  };

  useEffect(() => {
    //check user is authenticated
    const token = localStorage.getItem("x-auth-header");
    if (token) {
      axios.defaults.headers.common["x-auth-header"] = token;

      let url = process.env.REACT_APP_API;

      //move this back out on re-factor
      axios
        .get(`${url}/user/dashboard`)
        .then(res => {
          const user = {
            username: res.data.username,
            email: res.data.email,
            preferences: res.data.preferences
          };

          parseFeedData(res.data.preferences);

          setUser(user);
        })
        .catch(err => console.warn(err));
    } else {
      history.push("/");
    }
  }, [userStatus]); //useEffect

  //flag to rerender
  const handleUserStatus = status => {
    //need to clear previous user details

    //refactor so it changes on value of userStatus
    if (status) {
      setUserStatus(status);
    } else {
      setUserStatus(status);
      setUser({ username: "", email: "", preferences: [] });
      setUserFeeds([]);
    }
  };

  //converts full preference data into the dashboard render version
  //expects preference object
  const parseFeedData = preferenceData => {
    const feeds = [];

    Object.keys(preferenceData).forEach(outlet => {
      let outlet_name = outlet;
      let categories = preferenceData[outlet];

      Object.keys(categories).forEach(category => {
        feeds.push({
          label: category,
          outlet_name,
          endpoint: categories[category],
          visible: true
        });
      });
    });

    setUserFeeds(feeds);
  }; //parse feed data

  //toggles visiblility of feed display divs
  //passed down to navbar//split state
  const onFeedItemClick = (outlet, category) => {
    const itemIndex = userFeeds.findIndex(
      f => f.outlet_name === outlet && f.label === category
    );

    const feedsCopy = [...userFeeds];
    feedsCopy[itemIndex].visible = !feedsCopy[itemIndex].visible;
    setUserFeeds(feedsCopy);
  };

  //updates preferences from profile
  const preferenceUpdate = updates => {
    parseFeedData(updates.preferences);
    setUser(updates);
  };

  return (
    <div className="App">
      <Navbar
        navOpen={navControl}
        openState={open}
        userData={user}
        feedSelectionHandler={onFeedItemClick}
        handleStatus={handleUserStatus}
      />

      <div
        className="main"
        style={open ? { marginLeft: "20vw" } : { marginLeft: "8vw" }}
      >
        <img
          className="mainLogo"
          src={require(`./assets/slug.png`)}
          alt="logo"
        />

        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/signup" component={SignUp} />
          <Route
            exact
            path="/login"
            render={props => (
              <Login
                {...props}
                handleStatus={handleUserStatus}
                userFeedData={userFeeds}
              />
            )}
          />

          <Route
            exact
            path="/profile/setup"
            render={props => (
              <Setup {...props} handleStatus={handleUserStatus} />
            )}
          />
          <Route
            exact
            path="/profile"
            render={props => (
              <Profile {...props} handleSelection={preferenceUpdate} />
            )}
          />

          <Route
            exact
            path="/dashboard"
            render={props => (
              <Dashboard
                {...props}
                handleStatus={handleUserStatus}
                userFeedData={userFeeds}
              />
            )}
          />
        </Switch>
      </div>
    </div>
  );
};

export default App;
