(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//Websockets

var WS_URI = 'ws://localhost:3000/ws';
var BASE_TOPIC_URI = "http://wamptutorial/";
var sess;

// Connect to WebSocket
ab.connect(
    WS_URI,
    // Connection callback
    function (session) {
        sess = session;
        console.log("Connected to " + WS_URI, sess.sessionid());
        sess.prefix("event", BASE_TOPIC_URI + "event#");
        sess.prefix("rpc",   BASE_TOPIC_URI + "rpc#");
        sess.subscribe("event:chat", onChatEvent);
        sess.subscribe("event:state", onStateEvent);
    },
    // Disconnection callback
    function (code, reason) {
        sess = null;
        if (code != 0) {  // ignore app disconnects
            console.log("Connection lost (" + reason + ")");
        }
    },
    // Options
    {'maxRetries': 60, 'retryDelay': 30000}
);

function onChatEvent(topic, event) {
    console.log("event:chat RECEIVED", event);
}

var appState = {
  cells: {},
  lockOwner: null
};

function onStateEvent(topic, event) {
    console.log("event:state RECEIVED", event);
    appState = event;
    console.log(appState);
    renderComponents(appState);
}

//ReactJS components

var GridCell = React.createClass({displayName: "GridCell",
  handleClick: function(e) {
    e.preventDefault();
    //Request server to place cell
    console.log('Request to place cell no: '+this.props.uid);

    var data = {
      "cellno": this.props.uid,
      "sess-id": sess.sessionid()
    };
      
    sess.call("rpc:placeCell", data).then(
      function (res) { console.log("rpc:placeCell RECEIVED success", res); },
      function (res) { console.log("rpc:placeCell RECEIVED error", res); }
    );
  },

  render: function() {
    return React.createElement("div", {className: "grid-cell", 
      onClick: this.handleClick, 
      style: {backgroundColor: this.props.bgColor}})
  }
});

var Grid = React.createClass({displayName: "Grid",
  //getInitialState: function() {
  //  return {"cells": cellsData};
  //},

  getCellColor: function(x) {
    if(this.props.cellsData.hasOwnProperty(x))
    {
      return this.props.cellsData[x];
    }
    else
    {
      return "none";
    }
  },

  render: function() {
    var cells = [];
    for(i=0; i<this.props.cells; i++) {
      cells.push(React.createElement(GridCell, {key: i, uid: i, bgColor: this.getCellColor(i)}));
    }
    return React.createElement("div", {className: "grid"}, cells)
  }
});

var GetLockButton = React.createClass({displayName: "GetLockButton",
  handleClick: function(e) {
    e.preventDefault();
    console.log('Request to own lock');
    sess.call("rpc:getLock", sess.sessionid()).then(
      function (res) { console.log("rpc:getLock RECEIVED success", res); },
      function (res) { console.log("rpc:getLock RECEIVED error", res); }
    );
  },

  render: function() {
    return React.createElement("button", {type: "button", 
      onClick: this.handleClick, 
      disabled: this.props.lockOwner != null && this.props.lockOwner != sess.sessionid()}, 
        "Get Lock"
      )
  }
});

var Notify = React.createClass({displayName: "Notify",
  render: function() {
    return React.createElement("div", null, "Some notification here")
  }
});

function renderComponents(state) {
  React.render(
    React.createElement("div", null, 
      React.createElement(Grid, {cells: 100, cellsData: state.cells}), 
      React.createElement(GetLockButton, {lockOwner: state.lockOwner})
    ),
    document.getElementById('wrapper')
  );
}

renderComponents(appState);


},{}]},{},[1]);
