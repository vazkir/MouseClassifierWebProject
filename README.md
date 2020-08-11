# Mouse Classifier Web Project

This is a web project created to support our project [Computer mouse replication with gestures](https://github.com/hidai25/mouserepwithgestures).

The web App can live demo our movement classifier by accessing the sensors of phones visiting our website. This was built with a Django backend, React frontend. The latest Django versions above 3.0, supports ASGI which gives developers the possibility to program asynchronously. This made the use of websockets easier to do then previous Django versions where you have to use Django-channels. It works like this:

1. Django opens websocket while opening the frontend app with React

2. Then the React App displays a button to begin the movement classifier, for which it then takes care of getting the required permissions through the Generic Sensor Api.
a.

Basically we created a bridge in React with a native JS library through a polyfill to access the motion sensors library, be able to access and process the data in React.

3. Once it has the permissions, it sends the recorded x,y z data for all 3 required sensors for our ML model directly through the websocket back to Django.

4. Django then formats the data into the correct pandas dataframe object required for our ML model to work.

5. The data is fed to the model and makes the predictions, which are then sent downstream through the websocket to React.

6. React then displays the movement our model classified and with which accuracy.

7. Lastly the user can start again to try another movement.

## Live App
You can test it out here:
[mcwp.vsc.app](https://www.mcwp.vsc.app/)


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
