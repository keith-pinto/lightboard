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

var GridCell = React.createClass({
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
    return <div className='grid-cell' 
      onClick={this.handleClick}
      style={{backgroundColor: this.props.bgColor}}></div>
  }
});

var Grid = React.createClass({
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
      cells.push(<GridCell key={i} uid={i} bgColor={this.getCellColor(i)}/>);
    }
    return <div className='grid'>{cells}</div>
  }
});

var GetLockButton = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    console.log('Request to own lock');
    sess.call("rpc:getLock", sess.sessionid()).then(
      function (res) { console.log("rpc:getLock RECEIVED success", res); },
      function (res) { console.log("rpc:getLock RECEIVED error", res); }
    );
  },

  render: function() {
    return <button type='button' 
      onClick={this.handleClick} 
      disabled={this.props.lockOwner != null && this.props.lockOwner != sess.sessionid()}>
        Get Lock
      </button>
  }
});

var Notify = React.createClass({
  render: function() {
    return <div>Some notification here</div>
  }
});

function renderComponents(state) {
  React.render(
    <div>
      <Grid cells={100} cellsData={state.cells}/>
      <GetLockButton lockOwner={state.lockOwner}/>
    </div>,
    document.getElementById('wrapper')
  );
}

renderComponents(appState);
