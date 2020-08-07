import React, { Component } from 'react';
import { Card, Button } from 'react-bootstrap';
import {
  Gyroscope,
  // Magnetometer,
  Accelerometer
} from 'motion-sensors-polyfill/src/motion-sensors.js';


// Requesting permission: https://dev.to/li/how-to-requestpermission-for-devicemotion-and-deviceorientation-events-in-ios-13-46g2
// Npm motion sensor: https://developer.aliyun.com/mirror/npm/package/motion-sensors-polyfill#how-to-use-the-polyfill
// Start tracking sensor data: https://mobiforge.com/design-development/the-generic-sensor-api
// Another article on tracking: https://medium.com/better-programming/track-your-smartphone-in-2d-with-javascript-1ba44603c0df
class MouseClassifier extends Component {

    constructor(props) {
      super(props);
      // User variable from django if applicable
      console.log("INIT MouseClassifier");
      this.state = {
          isTracking: false,
          listnersAdded: false,
          deviceMotionPermission: false,
          deviceOrientationPermission: false,
          isSendingData: false,
          accSensor: new Accelerometer(),
          gyrSensor: new Gyroscope({ frequency: 15 }),
          webSocket: {},
          messages: [],
          dataPeriod: 50,
          msInterval: 0,
          currentData:{ x_acc:0, y_acc:0, z_acc:0, x_gyr:0, y_gyr:0, z_gyr:0 },
          interval: {}
      };
    }

    componentDidMount(){
        this.setupWebSocket();
        this.startTracking = this.startTracking.bind(this);
    }

    // https://upmostly.com/tutorials/setinterval-in-react-components-using-hooks
    startDataInterval = () => {
        const interval = setInterval(this.handleDataTransmission, this.state.dataPeriod);
        this.setState({interval: interval});
    }

    handleDataTransmission = () => {
        const msInterval = this.state.msInterval + this.state.dataPeriod;
        this.setState({msInterval: msInterval});
        document.getElementById('intervalSeconds').innerHTML = msInterval;
        console.log(msInterval);
        if (msInterval < 2000){
            // send socket data
            this.sendDataUpstream(this.state.currentData, false);
        }else{
            // Stop all handlers, trackers etc.
            this.stopAll();
        }
    }

    stopAll = () => {
        // Close the interval first
        clearInterval(this.state.interval);

        // Send closing message
        this.sendDataUpstream({}, true);

        // Stop tracking
        this.stopTrackingSensors();

        // Reset Data
        const cleanData = {x_acc:0, y_acc:0, z_acc:0, x_gyr:0, y_gyr:0, z_gyr:0};
        this.setState({...this.state, currentData: cleanData});
        this.setState({ msInterval: 0, isTracking: false}); // Needs to be a seperate call
    }

    setupWebSocket(){
        var socketPath = 'wss://localhost:8000/';
        const webSocket = new WebSocket(socketPath);

        this.setState({
            webSocket:webSocket
        });

        webSocket.onmessage = (e) => {
            var data = JSON.parse(e.data);
            console.log(data);

            // Display the movement and accuracy
            // And unlock button again
        };

        webSocket.onclose = (e) => {
            console.error('Chat socket closed unexpectedly');
        };
    }

    sendDataUpstream = (data, isLast, isMessage = false) => {
        this.state.webSocket.send(JSON.stringify({
            'last_one': isLast,
            'is_message':isMessage,
            'data': data
        }));
    }

   async requestDeviceMotionPermission() {
      // feature detect
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        await DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
                console.log("Device Motion granted");
                this.setState({deviceMotionPermission: true});
            }
          })
          .catch(console.error);
      } else {
        // handle regular non iOS 13+ devices
        console.log("Non ios 13 device");
      }
    }

    async requestDeviceOrientationPermission () {
        // feature detect
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          await DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
              if (permissionState === 'granted') {
                  console.log("Device Orientation granted");
                  this.setState({deviceOrientationPermission: true});
              }
            })
            .catch(console.error);
        } else {
          // handle regular non iOS 13+ devices
          console.log("Non ios 13 device");
        }
      }


    async startTracking(){
        this.sendDataUpstream({ message:"Tracking starts.." }, false, true);
        if (!this.state.deviceMotionPermission || !this.state.deviceOrientationPermission){
            await this.requestDeviceMotionPermission();
            await this.requestDeviceOrientationPermission();
        }
        this.startMovement();
        this.startDataInterval();
    }

    // Button tappped
    startMovement = () => {
        // The .stop method doesn't work so adding and removing listners
        // if (!this.state.listnersAdded){
        this.state.gyrSensor.addEventListener('reading', this.readGyr);
        this.state.accSensor.addEventListener('reading', this.readAcc);

        // }

        // Start up the sensorts
        this.state.gyrSensor.start();
        this.state.accSensor.start();

        this.setState({ isTracking: true });
    };

    readGyr = (e) =>{
        this.setState({...this.state.currentData,
            x_gyr: e.target.x,
            y_gyr: e.target.x,
            z_gyr: e.target.x,
        });

        document.getElementById('statusGyr').innerHTML = 'x: ' + e.target.x + ' y: ' + e.target.y + ' z: ' + e.target.z;
    }

    readAcc = (e) =>{
        this.setState({...this.state.currentData,
            x_acc: e.target.x,
            y_acc: e.target.x,
            z_acc: e.target.x,
        });

        document.getElementById('statusAcc').innerHTML = 'x: ' + e.target.x + ' y: ' + e.target.y + ' z: ' + e.target.z;
    }

    stopTrackingSensors = () => {
        // Doesn't work so removing listners
        this.state.gyrSensor.stop();
        this.state.accSensor.stop();

        this.state.gyrSensor.removeEventListener("reading", this.readGyr);
        this.state.accSensor.removeEventListener("reading", this.readAcc);
    }

    render() {
        const buttonTitle = !this.state.isTracking ? "Start" : "Stop";

        return (
            <div className="mb-2 center">
            <Button variant="success" size="lg"  style={{ width: '28rem', height:'6rem' }}
            onClick={!this.state.isTracking ? this.startTracking : this.stopAll}>
                {buttonTitle}
            </Button>
            <p id="statusGyr">Gyroscope Waiting...</p>
            <p id="statusAcc">Accelerometer Waiting...</p>
            <p id="intervalSeconds">0....</p>
            </div>
        );
    }
}

export default MouseClassifier;
