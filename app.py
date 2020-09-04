from starlette.applications import Starlette
from starlette.routing import Route, WebSocketRoute, Mount
from starlette.websockets import WebSocket
from starlette.endpoints import WebSocketEndpoint
from starlette.templating import Jinja2Templates
from starlette.staticfiles import StaticFiles


templates = Jinja2Templates(directory='templates')

sockets = []

async def homepage(request):
    return templates.TemplateResponse('index.html', {'request': request})

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
        print(data)
        await emit(data, websocket)

    async def on_disconnect(self, websocket: WebSocket, close_code):
        print('Client disconnected')
        sockets.remove(websocket)

routes = [
    Route('/', endpoint=homepage),
    Mount('/static', StaticFiles(directory='static'), name='static'),
    WebSocketRoute('/ws', WS)
]

app = Starlette(routes=routes)
