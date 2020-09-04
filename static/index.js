  const canvas = new fabric.Canvas('c', {
    isDrawingMode: true,
    height: 500,
    width: window.innerWidth
  });

  const socket = new WebSocket(`ws://${window.location.host}/ws`);
  const drawingColorEl = document.getElementById('color');
  const drawingLineWidthEl = document.getElementById('line_width');
  const select_button = document.getElementById('select');
  const draw = document.getElementById('draw');
  const websocket_status = document.getElementById('websocket_status');
  const text = document.getElementById('text');
  text.addEventListener('click',() => {
    canvas.isDrawingMode = false;
    canvas.isTextMode = true;

  })

  fabric.Object.prototype.transparentCorners = false;
  fabric.Object.prototype.uuid = '';
  var text40 = new fabric.IText("This is a text object. I can be rotated, moved, and scaled up or down.", {
    fontSize: 40,
    uuid: 100000
  });
  canvas.add(text40);

  select_button.addEventListener('click', () => {
    canvas.isDrawingMode = false;
  });

const getObject = (uuid) => {
  let obj;
  canvas.getObjects().forEach(o => {
    if (o.uuid == uuid) {
      obj = o;
    }
  })
  return obj;
};

  draw.addEventListener('click', () => {
    canvas.isDrawingMode = true;
  });
  socket.addEventListener('open', () => {
    websocket_status.innerText = 'Connected';
    websocket_status.style.color = 'green';
  });
  socket.addEventListener('close', () => {
    websocket_status.innerText = 'Disconnected';
    websocket_status.style.color = 'red';
  });
  socket.addEventListener('message', (e) => {
    const json = JSON.parse(e.data);
    switch (json.type) {
      case "modified":
        console.log('mod');
        if (!json.objects) {
          const el = getObject(json.uuid);
          const data = {
            left: json.left,
            top: json.top,
            scaleX: json.scaleX,
            scaleY: json.scaleY,
            angle: json.angle
          }
          if (json.text) {
            data.text = json.text;
          }
          el.set(data);
          canvas.renderAll();
          break;
        } else {
          console.log('test');
          for (let index = 0; index < json.objects.length; index++) {
            console.log('fdsfsdfdsfsfaaa');
            const element = json.objects[index];
            console.log(element.uuid);
            const el = getObject(element.uuid);
            const data = {
              left: element.left,
              top: element.top,
              scaleX: element.scaleX,
              scaleY: element.scaleY,
              angle: element.angle
            }
            if (element.text) {
              data.text = element.text;
            }
            el.set(data);
            canvas.renderAll();
          }
          break;
        }
      case "added":
        const path = new fabric.Path(json.path, {
          strokeWidth: json.strokeWidth,
          stroke: json.stroke,
          uuid: json.uuid,
          fill: json.fill,
          strokeLineCap: json.strokeLineCap,
          strokeLineJoin: json.strokeLineJoin,
          emit: json.emit
        });
        canvas.add(path);
        canvas.renderAll();
        break;
      default:
        break;
    }
  });

  const objectModified = (event) => {
    if (!event.target._objects) {
    const data = {
      "left": event.target.left,
      "top": event.target.top,
      "stroke": event.target.stroke,
      "scaleX": event.target.scaleX,
      "scaleY": event.target.scaleY,
      "angle": event.target.angle,
      "uuid": event.target.uuid,
      "type": "modified",
    }
    if (event.target.type == "i-text") {
      data.text = event.target.text;
    }
    socket.send(JSON.stringify(data));
  } else {
    console.log(event.target._objects[0].uuid);
    // loop through each individual item and add nes. properties 
    let data = {
      "objects": [],
      "type": "modified",
    }
    for (let index = 0; index < event.target._objects.length; index++) {
      const element = event.target._objects[index];
      data.objects.push({
        "left": element.left,
        "top": element.top,
        "stroke": element.stroke,
        "scaleX": element.scaleX,
        "scaleY": element.scaleY,
        "angle": element.angle,
        "uuid": element.uuid,
      });
    }
    socket.send(JSON.stringify(data));
  }
  };
  const onMouseUp = (event) => {
    if (canvas.isTextMode) {
      console.log(event);
    }
  };
  canvas.on('object:modified', objectModified);
  canvas.on('object:moved', objectModified);
  canvas.on('object:scaled', objectModified);
  canvas.on('object:rotated', objectModified);
  canvas.on('mouse:up', onMouseUp);

  canvas.on('object:added', (event) => {
    if(event.target.emit == undefined) {
      event.target.uuid = Math.floor(100000 + Math.random() * 900000);
      socket.send(JSON.stringify({
        "path": event.target.path,
        "emit": true,
        "uuid": event.target.uuid,
        "fill": event.target.fill,
        "strokeWidth": event.target.strokeWidth,
        "strokeLineCap": event.target.strokeLineCap,
        "strokeLineJoin": event.target.strokeLineJoin,
        "stroke": event.target.stroke,
        "type": "added",
      }));
  }
  });
  drawingColorEl.onchange = function() {
    canvas.freeDrawingBrush.color = this.value;
  };
  drawingLineWidthEl.onchange = function() {
    canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
  };