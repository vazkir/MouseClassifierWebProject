import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import PropTypes from 'prop-types';
import {
  Gyroscope,
  Accelerometer,
  LinearAccelerationSensor
} from 'motion-sensors-polyfill/src/motion-sensors.js';
import ProgressBar from './progress/ProgressBar';
import { isMobile } from "react-device-detect";

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
          accSensor: new Accelerometer({frequency: 13}),
          gyrSensor: new Gyroscope({ frequency: 15 }),
          webSocket: {},
          messages: [],
          dataPeriod: 50,
          msInterval: 0,
          sr_no: 0,
          hostTime: 156162,
          nodeTime: 29922.0,
          currentData:{ x_acc:0, y_acc:0, z_acc:0, x_gyr:0, y_gyr:0, z_gyr:0 },
          interval: {},
          resultAccuracy: 0.0,
          resultMovement: "",
          resultColor:'#d9edfe',
          colorDefault: '#d9edfe',
          colorGood: '#4FFF33',
          colorMedium: '#A2E766',
          colorBad:'#F06925',
      };
    }

    componentDidMount(){
        this.setupWebSocket();
        this.startTracking = this.startTracking.bind(this);

        if (!isMobile && this.props.is_production){ this.notMobileAlert(); }
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
        const new_sr_no = this.state.sr_no + 1;
        const msInterval = this.state.msInterval + this.state.dataPeriod;
        // 156222 -> 156282
        const newHostTime = this.state.hostTime + this.state.dataPeriod;

        // 29922.0 -> 29928.0
        const newNodeTime = this.state.nodeTime + (this.state.dataPeriod/10);

        this.setState({
            msInterval: msInterval,
            sr_no: new_sr_no,
            hostTime: newHostTime,
            nodeTime: newNodeTime
        });

        document.getElementById('intervalSeconds').innerHTML = msInterval + 'ms';
        // console.log(msInterval);
        // Send socket data
        if (msInterval < 2000){
            // Null checking accelormeter
            const x_acc = 100 * (this.state.accSensor.x != null ? this.state.accSensor.x : 0);
            const y_acc = 100 * (this.state.accSensor.y != null ? this.state.accSensor.y : 0);
            const z_acc = 100 * (this.state.accSensor.z != null ? this.state.accSensor.z : 0);

            // Null checking gyrescope
            const x_gyr = this.state.gyrSensor.x != null ? this.state.gyrSensor.x : 0;
            const y_gyr = this.state.gyrSensor.y != null ? this.state.gyrSensor.y : 0;
            const z_gyr = this.state.gyrSensor.z != null ? this.state.gyrSensor.z : 0;

            var newData = {
                x_acc: (x_acc).toFixed(2),
                y_acc: (y_acc).toFixed(2),
                z_acc: (z_acc).toFixed(2),
                x_gyr: (x_gyr).toFixed(2),
                y_gyr: (y_gyr).toFixed(2),
                z_gyr: (z_gyr).toFixed(2),
            }

            newData.sr_no = new_sr_no;
            newData.msInterval = msInterval;
            newData.hostTime = newHostTime;
            newData.nodeTime = newNodeTime;

            console.log(newData);
            this.sendDataUpstream(newData, false);
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
        this.setState({ msInterval: 0, sr_no: 0, hostTime: 156162, nodeTime: 29922.0,}); // Needs to be a seperate call
    }

    setupWebSocket(){
        const domain = this.props.is_production ? 'mcwp.vsc.app/' : 'localhost';
        var socketPath = "wss://"+ domain + ":8000/";

        const webSocket = new WebSocket(socketPath);

        this.setState({ webSocket:webSocket });

        // Received downstream websocket message
        webSocket.onmessage = (e) => {
            var data = JSON.parse(e.data);
            console.log(data);
            const accuracyPerc = +(data.accuracy * 100).toFixed(2);
            var resultColor = accuracyPerc > 70 ? this.state.colorGood : this.state.colorMedium;
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
            console.error(e);
        };
    }

    sendDataUpstream = (data, isLast, isMessage = false) => {
        // this.state.webSocket.onopen = function(e) {
            this.state.webSocket.send(JSON.stringify({
                'last_one': isLast,
                'is_message':isMessage,
                'data': data
            }));
        // }
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
        if (!isMobile && this.props.is_production){
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
        document.getElementById('statusGyr').innerHTML = `Gyro -> x: ${+(e.target.x).toFixed(2)}, y: ${+(e.target.y).toFixed(2)}, z: ${+(e.target.z).toFixed(2)}`;
    }

    readAcc = (e) =>{
        document.getElementById('statusAcc').innerHTML = `Acc -> x: ${(100 * e.target.x).toFixed(2)}, y: ${(100 * e.target.x).toFixed(2)}, z: ${(100 * e.target.x).toFixed(2)}`;
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
            <div className="dark-vazkir">
                <p id="statusGyr">Gyroscope waiting...</p>
                <p id="statusAcc">Accelerometer waiting...</p>
                <p id="intervalSeconds">0ms</p>
                <div className="center">
                    <ProgressBar
                      progress={this.state.resultAccuracy}
                      size={220}
                      strokeWidth={15}
                      circleOneStroke={this.state.colorDefault}
                      circleTwoStroke={this.state.resultColor}
                    />
                    <h3>{this.state.resultMovement}</h3>
                    <br/>
                    <Button disabled={this.state.isTracking}
                        variant="success"
                        size="lg"
                        style={{ width: '14rem', height:'3rem' }}
                        onClick={!this.state.isTracking ? this.startTracking : this.stopAll}>
                        {buttonTitle}
                    </Button>
                </div>
            </div>
        );
    }
}

MouseClassifier.propTypes = {
    is_production: PropTypes.bool.isRequired,
}
export default MouseClassifier;
