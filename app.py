from starlette.applications import Starlette
from starlette.routing import Route, WebSocketRoute
from starlette.websockets import WebSocket
from starlette.endpoints import WebSocketEndpoint

sockets = []

async def emit(data, websocket: WebSocket):
    for socket in sockets:
        if socket != websocket:
            await socket.send_json(data)

class WS(WebSocketEndpoint):
    encoding = 'json'

    async def on_connect(self, websocket: WebSocket):
        print('Client connected')
        sockets.append(websocket)
        await websocket.accept()

    async def on_receive(self, websocket: WebSocket, data):
        await emit(data, websocket)

    async def on_disconnect(self, websocket: WebSocket, close_code):
        print('Client disconnected')
        sockets.remove(websocket)

routes = [
    WebSocketRoute('/ws', WS)
]

app = Starlette(routes=routes)
