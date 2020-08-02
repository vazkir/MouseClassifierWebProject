import React, { Component } from 'react';
import { Card, Button } from 'react-bootstrap';
import {
  Gyroscope,
  AbsoluteOrientationSensor,
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
          hasPermission: false,
          isSendingData: false,
          gyrSensor: new Gyroscope({ frequency: 15 }),
          accSensor: new Accelerometer(),
      };

    }

    checkSensorSupport = () => {

    }


   requestDeviceMotionPermission = () => {
      // feature detect
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then(permissionState => {
            if (permissionState === 'granted') {
                console.log("Device Motion granted");
            }
          })
          .catch(console.error);
      } else {
        // handle regular non iOS 13+ devices
        alert("Non ios 13 device");
      }
    }

    requestDeviceOrientationPermission = () => {
        // feature detect
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
              if (permissionState === 'granted') {
                  console.log("Device Orientation granted");
              }
            })
            .catch(console.error);
        } else {
          // handle regular non iOS 13+ devices
          alert("Non ios 13 device");
        }
      }


    startTracking = () => {
        if (!this.state.hasPermission){
            this.requestDeviceMotionPermission();
            this.requestDeviceOrientationPermission();
            this.setState({ hasPermission: true });
        }
        this.startMovement();
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

        this.setState({
            isTracking: true
        });
    };

    readGyr = (e) =>{
        document.getElementById('statusGyr').innerHTML = 'x: ' + e.target.x + ' y: ' + e.target.y + ' z: ' + e.target.z;
    }

    readAcc = (e) =>{
        document.getElementById('statusAcc').innerHTML = 'x: ' + e.target.x + ' y: ' + e.target.y + ' z: ' + e.target.z;
    }

    stopTracking = () => {
        // Doesn't work so removing listners
        this.state.gyrSensor.stop();
        this.state.accSensor.stop();

        this.state.gyrSensor.removeEventListener("reading", this.readGyr);
        this.state.accSensor.removeEventListener("reading", this.readAcc);

        this.setState({
            isTracking: false
        })
    }


    render() {
        const buttonTitle = !this.state.isTracking ? "Start" : "Stop";

        return (
            <div className="mb-2 center">
            <Button variant="success" size="lg"  style={{ width: '28rem', height:'6rem' }}
            onClick={!this.state.isTracking ? this.startTracking : this.stopTracking}>
                {buttonTitle}
            </Button>
            <p id="statusGyr">Gyroscope Waiting...</p>
            <p id="statusAcc">Accelerometer Waiting...</p>
            </div>
        );
    }
}

export default MouseClassifier;
