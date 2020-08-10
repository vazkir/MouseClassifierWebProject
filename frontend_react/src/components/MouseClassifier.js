import React, { Component } from 'react';
import { Card, Button } from 'react-bootstrap';
import {
  Gyroscope,
  // Magnetometer,
  Accelerometer
} from 'motion-sensors-polyfill/src/motion-sensors.js';
import ProgressBar from './progress/ProgressBar';
import {
  isBrowser,
  isMobile
} from "react-device-detect";

// Requesting permission: https://dev.to/li/how-to-requestpermission-for-devicemotion-and-deviceorientation-events-in-ios-13-46g2
// Npm motion sensor: https://developer.aliyun.com/mirror/npm/package/motion-sensors-polyfill#how-to-use-the-polyfill
// Start tracking sensor data: https://mobiforge.com/design-development/the-generic-sensor-api
// Another article on tracking: https://medium.com/better-programming/track-your-smartphone-in-2d-with-javascript-1ba44603c0df
class MouseClassifier extends Component {

    constructor(props) {
      super(props);
      // User variable from django if applicable
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
          interval: {},
          resultAccuracy: 0.0,
          resultMovement: "",
          resultColor:'#d9edfe',
          colorDefault: '#d9edfe',
          colorGood: '#4FFF33',
          colorMedium: '#F6D645',
          colorBad:'#F06925',
      };
    }

    componentDidMount(){
        this.setupWebSocket();
        this.startTracking = this.startTracking.bind(this);

        if (isBrowser){ this.notMobileAlert(); }
    }

    notMobileAlert = () => {
        setTimeout(function (){
            alert("This web can only be used on mobile, since it needs access to the gyroscope and accelator..")
        }, 1000);
    }

    // https://upmostly.com/tutorials/setinterval-in-react-components-using-hooks
    startDataInterval = () => {
        const interval = setInterval(this.handleDataTransmission, this.state.dataPeriod);
        this.setState({interval: interval});
    }

    handleDataTransmission = () => {
        const msInterval = this.state.msInterval + this.state.dataPeriod;
        this.setState({msInterval: msInterval});
        document.getElementById('intervalSeconds').innerHTML = msInterval + 'ms';
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

        // Stop tracking and notify use
        this.setState({resultMovement: "Waiting for results..."});
        this.stopTrackingSensors();

        // Reset Data
        const cleanData = {x_acc:0, y_acc:0, z_acc:0, x_gyr:0, y_gyr:0, z_gyr:0};
        this.setState({...this.state, currentData: cleanData});
        this.setState({ msInterval: 0}); // Needs to be a seperate call
    }

    setupWebSocket(){
        var socketPath = 'wss://64.225.74.24:8000/';
        const webSocket = new WebSocket(socketPath);

        this.setState({ webSocket:webSocket });

        // Received downstream websocket message
        webSocket.onmessage = (e) => {
            var data = JSON.parse(e.data);
            console.log(data);
            const accuracyPerc = +(data.accuracy * 100).toFixed(0);
            const resultColor = accuracyPerc > 70 ? this.state.colorGood : this.state.colorMedium;
            if (accuracyPerc < 50) { resultColor = this.state.colorBad; }

            // Display the movement and accuracy and unlock button again
            this.setState({
                resultAccuracy: accuracyPerc,
                resultMovement: data.movement,
                resultColor: resultColor,
                isTracking: false
            })
        };

        webSocket.onclose = (e) => {
            console.error('Chat socket closed unexpectedly');
        };
    }

    sendDataUpstream = (data, isLast, isMessage = false) => {
        this.state.webSocket.onopen = function(e) {
            this.state.webSocket.send(JSON.stringify({
                'last_one': isLast,
                'is_message':isMessage,
                'data': data
            }));
        }
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
        if (isBrowser){
            this.notMobileAlert();
        }else{
            // Clear previous data
            this.setState({
                resultAccuracy: 0,
                resultMovement: "",
                resultColor: this.state.colorDefault,
                isTracking: true
            });


            this.sendDataUpstream({ message:"Tracking starts.." }, false, true);
            if (!this.state.deviceMotionPermission || !this.state.deviceOrientationPermission){
                await this.requestDeviceMotionPermission();
                await this.requestDeviceOrientationPermission();
            }

            this.startCountDown();
        }
    }

    startCountDown = () => {
        var timeleft = 4;
        var downloadTimer = setInterval(function(){
            timeleft--;
            const timeMessage =  `Tracking starts in: ${timeleft}`;
            this.setState({resultMovement: timeMessage});
            if(timeleft <= 0){
                clearInterval(downloadTimer);
                this.startMovement();
                this.startDataInterval();
            }
        }.bind(this), 1000);
    }

    // Button tappped
    startMovement = () => {
        this.setState({resultMovement: "Tracking...."});

        // The .stop method doesn't work so adding and removing listners
        // if (!this.state.listnersAdded){
        this.state.gyrSensor.addEventListener('reading', this.readGyr);
        this.state.accSensor.addEventListener('reading', this.readAcc);

        // }

        // Start up the sensorts
        this.state.gyrSensor.start();
        this.state.accSensor.start();

    };

    readGyr = (e) =>{
        this.setState({...this.state.currentData,
            x_gyr: +(e.target.x).toFixed(2),
            y_gyr: +(e.target.y).toFixed(2),
            z_gyr: +(e.target.z).toFixed(2),
        });

        document.getElementById('statusGyr').innerHTML = `x: ${this.state.currentData.x_gyr}, y: ${+(this.state.currentData.y_gyr)}, z: ${this.state.currentData.z_gyr}`;
    }

    readAcc = (e) =>{
        this.setState({...this.state.currentData,
            x_acc: +(e.target.x).toFixed(2),
            y_acc: +(e.target.y).toFixed(2),
            z_acc: +(e.target.z).toFixed(2),
        });

        document.getElementById('statusAcc').innerHTML = `x: ${this.state.currentData.x_acc}, y: ${this.state.currentData.y_acc}, z: ${this.state.currentData.z_acc}`;
    }

    stopTrackingSensors = () => {
        // Doesn't work so removing listners
        this.state.gyrSensor.stop();
        this.state.accSensor.stop();

        this.state.gyrSensor.removeEventListener("reading", this.readGyr);
        this.state.accSensor.removeEventListener("reading", this.readAcc);
    }

    render() {
        const buttonTitle = !this.state.isTracking ? "Start" : "Disabled";

        return (
            <div>
            <div className="mb-2 center">
            <ProgressBar
              progress={this.state.resultAccuracy}
              size={200}
              strokeWidth={15}
              circleOneStroke={this.state.colorDefault}
              circleTwoStroke={this.state.resultColor}
            />
            <h3>{this.state.resultMovement}</h3>
            <br/>
            <Button disabled={this.state.isTracking}
                variant="success"
                size="lg"
                style={{ width: '28rem', height:'6rem' }}
                onClick={!this.state.isTracking ? this.startTracking : this.stopAll}>
                {buttonTitle}
            </Button>
            </div>
            <p id="statusGyr">Gyroscope waiting...</p>
            <p id="statusAcc">Accelerometer waiting...</p>
            <p id="intervalSeconds">0ms</p>
            </div>
        );
    }
}

export default MouseClassifier;
