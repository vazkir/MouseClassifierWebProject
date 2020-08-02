import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './App.css';
import MouseClassifier from './components/MouseClassifier'


// Button From: https://reactjsexample.com/simple-react-component-for-a-circular-progress-button/
// State in parent component & explantion 2 editor: https://stackoverflow.com/questions/43001280/accessing-draftjs-output-from-parent
class App extends Component {

  constructor(props) {
    super(props);
    // User variable from django if applicable
  }

  render() {
    return (
      <div className="App">
        <MouseClassifier/>
      </div>
    );
  }
}

export default App;
