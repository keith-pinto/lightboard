var GridCell = React.createClass({
  render: function() {
    return <div className='grid-cell'></div>
  }
});

var Grid = React.createClass({
  render: function() {
    var cells = [];
    for(i=0; i<this.props.cells; i++) {
      cells.push(<GridCell key={i}/>);
    }
    return <div className='grid'>{cells}</div>
  }
});

var GetLockButton = React.createClass({
  render: function() {
    return <button type='button'>Get Lock</button>
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
