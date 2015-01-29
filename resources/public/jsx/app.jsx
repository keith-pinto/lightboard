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

function onStateEvent(topic, event) {
    console.log("event:state RECEIVED", event);
}

//ReactJS components

var GridCell = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    //Request server to place cell
    console.log('Request to place cell no: '+this.props.uid);
    sess.call("rpc:placeCell", this.props.uid).then(
      function (res) { console.log("rpc:placeCell RECEIVED success", res); },
      function (res) { console.log("rpc:placeCell RECEIVED error", res); }
    );
  },

  render: function() {
    return <div className='grid-cell' onClick={this.handleClick}></div>
  }
});

var Grid = React.createClass({
  render: function() {
    var cells = [];
    for(i=0; i<this.props.cells; i++) {
      cells.push(<GridCell key={i} uid={i}/>);
    }
    return <div className='grid'>{cells}</div>
  }
});

var GetLockButton = React.createClass({
  handleClick: function(e) {
    e.preventDefault();
    //console.log(sess);
    sess.publish("event:chat", "foo");
    console.log("event:chat SENT 'foo'");
  },
  render: function() {
    return <button type='button' onClick={this.handleClick}>Get Lock</button>
  }
});

var Notify = React.createClass({
  render: function() {
    return <div>Some notification here</div>
  }
});

React.render(
  <div>
    <Grid cells={100}/>
    <GetLockButton />
    <Notify />
  </div>,
  document.getElementById('wrapper')
);
