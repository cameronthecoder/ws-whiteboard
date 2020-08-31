  const canvas = new fabric.Canvas('c', {
    isDrawingMode: true
  });

  const socket = new WebSocket('ws://127.0.0.1:8000/ws');
  const drawingColorEl = document.getElementById('color');
  const drawingLineWidthEl = document.getElementById('line_width');


  socket.addEventListener('message', (e) => {
    const json = JSON.parse(e.data);
    canvas.clear();
    canvas.loadFromJSON(json, canvas.renderAll.bind(canvas));
  });

  canvas.on('mouse:down', function(event){
  
    var canvasStr = JSON.stringify(canvas);
    socket.send(JSON.stringify(canvasStr));
  });

  canvas.on('mouse:up', function(event){
  
    var canvasStr = JSON.stringify(canvas);
    socket.send(JSON.stringify(canvasStr));
  });

  canvas.on('object:modified', function(event){
  
    var canvasStr = JSON.stringify(canvas);
    socket.send(JSON.stringify(canvasStr));
  });

  canvas.on('object:moving', function(event){
  
    var canvasStr = JSON.stringify(canvas);
    socket.send(JSON.stringify(canvasStr));
  });



  fabric.Object.prototype.transparentCorners = false;

  //clearEl.onclick = function() { canvas.clear() };

  drawingColorEl.onchange = function() {
    canvas.freeDrawingBrush.color = this.value;
  };
  drawingLineWidthEl.onchange = function() {
    canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
    this.previousSibling.innerHTML = this.value;
  };