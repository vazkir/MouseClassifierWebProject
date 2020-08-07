


// const DeviceOrientationMixin = (superclass, ...eventNames) => class extends superclass {
//   constructor(...args) {
//     // @ts-ignore
//     super(args);
//
//     for (const eventName of eventNames) {
//       if (`on${eventName}` in window) {
//         this[slot].eventName = eventName;
//         break;
//       }
//     }
//
//     this[slot].activateCallback = () => {
//       window.addEventListener(this[slot].eventName, this[slot].handleEvent, { capture: true });
//     }
//
//     this[slot].deactivateCallback = () => {
//       window.removeEventListener(this[slot].eventName, this[slot].handleEvent, { capture: true });
//     }
//   }
// };


export const Magnetometer = window.Magnetometer;

// class Magnetometer extends DeviceOrientationMixin(Sensor, "devicemotion") {
//   constructor(options) {
//     super(options);
//     this[slot].handleEvent = event => {
//       // If there is no sensor we will get values equal to null.
//       if (event.accelerationIncludingGravity.x === null) {
//         this[slot].notifyError("Could not connect to a sensor", "NotReadableError");
//         return;
//       }
//
//       if (!this[slot].activated) {
//         this[slot].notifyActivatedState();
//       }
//
//       this[slot].timestamp = performance.now();
//
//       this[slot].x = event.accelerationIncludingGravity.x;
//       this[slot].y = event.accelerationIncludingGravity.y;
//       this[slot].z = event.accelerationIncludingGravity.z;
//
//       this[slot].hasReading = true;
//       this.dispatchEvent(new Event("reading"));
//     }
//
//     defineReadonlyProperties(this, slot, {
//       x: null,
//       y: null,
//       z: null
//     });
//
//     this[slot].deactivateCallback = () => {
//       this[slot].x = null;
//       this[slot].y = null;
//       this[slot].z = null;
//     }
//   }
// }
