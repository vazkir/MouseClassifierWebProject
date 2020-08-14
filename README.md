# Mouse Classifier Web Project


## How does it work
This is a web project created to support our project [Computer mouse replication with gestures](https://github.com/hidai25/mouserepwithgestures).

The web App can live demo our movement classifier by accessing the sensors of phones visiting our website. This was built with a Django backend, React frontend. The latest Django versions above 3.0, [supports ASGI](https://docs.djangoproject.com/en/3.0/releases/3.0/) which gives developers the possibility to program asynchronously. This made the use of websockets easier to do then previous Django versions where you have to use Django-channels. It works like this:

1. Django opens websocket while opening the frontend app with React

2. Then the React App displays a button to begin the movement classifier, for which it then takes care of getting the required permissions through the Generic Sensor Api.
a.

Basically we created a bridge in React with a native JS library through [a polyfill](https://www.npmjs.com/package/motion-sensors-polyfill) to access the motion sensors library, be able to access and process the data in React.

3. Once it has the permissions, it sends the recorded x,y z data for all 2 required sensors for our ML model directly through the websocket back to Django.

4. Django then formats the data into the correct pandas dataframe object required for our ML model to work.

5. The data is fed to the model and makes the predictions, which are then sent downstream through the websocket to React.

6. React then displays the movement our model classified and with which accuracy.

7. Lastly the user can start again to try another movement.


## What ML is used
I have used our ML model from our [main project](https://github.com/hidai25/mouserepwithgestures) and altered the test and training data first. I have removed the input sensor data from the Magnetometer, since I am not able to obtain this data real time through a web app due to [Apple not supporting it](https://caniuse.com/#feat=magnetometer). You can see [the altered Jupyter notebook](https://github.com/10686142/MouseClassifierWebProject/tree/master/ml_web_modeling) used to create the the model under "ml_web_modeling". Furthermore, I used XGBoost, since this still gave the best accuracy (around 87%) of the 5 models tested.

## The ML predictions
Unfortunately, the new ML model without the Magnetometer, does not perform that well. If you test out the [Live App](https://www.mcwp.vsc.app/), you'll probably notice that the movements classified are not always the movement you made with particular high accuracy. I am not 100% sure why this happens but I believe it can be 1 of 2 things:
1. The Magnetometer actually gives a dimension of direction to the movements. So what this means is that the ML knows that the movement accelerates (Accelerometer) and know the orientation (Gyroscope), but doesn't know the direction of the actual movement. So basically it can't classify direction.
2. The data recording from the sensors needed some alteration to the rightly formatted for the ML, since the test and training data were recorded with the [SensorTile](https://www.st.com/en/evaluation-tools/steval-stlkt01v1.html).

If you do know what it could be, [please let me know](mailto:vmeerman.appdev@gmail.com?subject=[GitHub]%20Mouse%20Classifier%20Web%20Project) so I can update the code.


The bottomline is that I wanted to create a Proof of Concept in addition to our [main project](https://github.com/hidai25/mouserepwithgestures), which does work, only just doesn't make the best predictions possible.


## Future prospects
If I were to continue this project, I would get my test and training data from the actual [Generic Api Sensors](https://www.w3.org/TR/generic-sensor/) then use my [Data Handling and Cleaning project](https://github.com/10686142/mouse-gesture-data-handling) to ready the data and finally fully rebuild the model for the new data and use that model in production.


## Live App
You can test it out here:
[mcwp.vsc.app](https://www.mcwp.vsc.app/)


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
