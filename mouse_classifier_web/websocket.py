


# This will handle Websocket requests until the connection is closed
# Here we'll wait for any new events that the server receives from the client
# Then we'll act on the contents of the event, and send the response to the client
async def websocket_applciation(scope, receive, send):
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
            if event['text'] == 'ping':

                # Send response back to the client
                await send({
                    'type': 'websocket.send',
                    'text': 'pong!'
                })
