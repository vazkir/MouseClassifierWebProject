import json, time
import pandas as pd
from mouse_classifier_web.ml_classifier import run_ml_model


# This will handle Websocket requests until the connection is closed
# Here we'll wait for any new events that the server receives from the client
# Then we'll act on the contents of the event, and send the response to the client
async def websocket_applciation(scope, receive, send):
    raw_data = []

    while True:
        event = await receive()

        # In order to allow this connection, we'll send a 'websocket.accept' event in response
        # This will complete the Websocket handshake and establish a persistent connection with the client.
        if event['type'] == 'websocket.connect':
            await send({
                'type': 'websocket.accept'
            })
        # When a client terminates their connection to the server
        if event['type'] == 'websocket.disconnect':
            break

        # This is how we receive and event from the client,
        if event['type'] == 'websocket.receive':
            event_data = json.loads(event['text'])
            print(event_data)

            if event_data['last_one'] == True:
                # Convert to pandas dataframe
                df = pd.DataFrame(raw_data, columns=['sr_no', 'HostTimestamp', 'NodeTimestamp', 'X_mg', 'Y_mg', 'Z_mg', 'X_dps', 'Y_dps', 'Z_dps'])
                # Clear empty rows
                df = df.dropna()

                print(f"Data retrieval done with {len(df)} data entries")
                # print(df.head())
                # print(list(df.columns))

                # Clear empty rows and raw_data for next call
                clean_df = df.dropna()
                raw_data = []

                # Call ML
                movement, accuracy = await run_ml_model(df)

                # Send results back to the client
                await send({
                    'type': 'websocket.send',
                    'text': json.dumps({
                        'movement':movement,
                        'accuracy':accuracy
                    }),
                })

            elif event_data['is_message'] == False:
                sd = event_data['data'] # Grab single data points

                # See for why not df directly: https://stackoverflow.com/a/62734983/8970591
                # Items need to be floats
                raw_data.append([
                    sd['sr_no'],
                    sd['hostTime'],
                    float("%.1f" % sd['nodeTime']),
                    float(sd['x_acc']),
                    float(sd['y_acc']),
                    float(sd['z_acc']),
                    float(sd['x_gyr']),
                    float(sd['y_gyr']),
                    float(sd['z_gyr']),
                ])
