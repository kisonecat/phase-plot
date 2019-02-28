import panzoom from 'pan-zoom';
import {mat3, vec2} from 'gl-matrix';
import vertexShaderGLSL from './vertex.glsl';
import fragmentShaderGLSL from './fragment.glsl';
//import complexShaderGLSL from './reim.glsl';

import Expression from 'math-expressions/build/math-expressions.js';

import * as dat from 'dat.gui';
const gui = new dat.GUI();

var Parameters = function() {
    this.f = 'sin(z)/(z-w)';
    this.rootDarkening = 0.85;
    this.rootDarkeningSharpness = 1;
    this.poleLightening = 0.85;
    this.poleLighteningSharpness = 30;
    this.rectangularGridOpacity = 0.1;
    this.polarGridOpacity = 0.7;
    this.axisOpacity = 1.0;
};
					      
var parameters = new Parameters();

function processHash() {
    var hash = window.location.hash.replace(/^#/,'');
    hash.split(',').forEach( function(assignment) {
	var lhs = assignment.split('=')[0];
	var rhs = assignment.split('=')[1];
	if (typeof parameters[lhs] == 'number')
	    parameters[lhs] = parseFloat(rhs);
	if (typeof parameters[lhs] == 'string')
	    parameters[lhs] = rhs;
    });
}

if(window.location.hash) {
    processHash();
} 

window.addEventListener("hashchange", function () {
  processHash();
  updateHash();  
  updateShaders();
  initShaders();
  window.requestAnimationFrame(drawScene);  
}, false);

var markers = {};
var glslFunction;
updateShaders();
var currentlyDragging = undefined;

function updateHash() {
    var properties = [];
    var originalParameters = new Parameters();
    
    Object.getOwnPropertyNames(parameters).forEach( function(property) {
	if (originalParameters[property] != parameters[property]) {
	    properties.unshift( property + "=" + parameters[property].toString() );
	}
    });

    var hash = properties.join(',');
    history.pushState(null, null, '#' + hash);
}

function updateShaders() {
  try {
    var expression = Expression.fromText(parameters.f.toLowerCase());
    var vars = expression.variables();

    vars.forEach( function(v) {
      if (v == 'e') return;
      if (v == 'w') return;
      if (v == 'z') return;

      if (!(v in markers)) {
        markers[v] = vec2.clone( [0.3*Math.random() - 0.15, 0.3*Math.random() - 0.15] );
      }
    });
    
    Object.keys(markers).forEach( function(v) {
      if (vars.indexOf(v) < 0) {
        delete markers[v];
        var el = document.getElementById(v);
        el.parentNode.removeChild(el);
      }
    });
    
    glslFunction = expression.toGLSL();
  } catch (err) {
    return;
  }
}

var functionText = gui.add(parameters, 'f').onChange( function() {
  updateHash();
  updateShaders();
  initShaders();
  window.requestAnimationFrame(drawScene);    
}).listen();

var colorFolder = gui.addFolder('Colors');

function update() {
    var originalParameters = new Parameters();
    
    updateHash();
    window.requestAnimationFrame(drawScene);
}

colorFolder.add(parameters, 'rootDarkening', 0, 1 ).onChange( update ).listen();
colorFolder.add(parameters, 'rootDarkeningSharpness', 1, 40 ).onChange( update ).listen();
colorFolder.add(parameters, 'poleLightening', 0, 1 ).onChange( update ).listen();
colorFolder.add(parameters, 'poleLighteningSharpness', 0, 40 ).onChange( update ).listen();
colorFolder.add(parameters, 'rectangularGridOpacity', 0, 1 ).onChange( update ).listen();
colorFolder.add(parameters, 'polarGridOpacity', 0, 1 ).onChange( update ).listen();

gui.add(parameters, 'axisOpacity', 0, 1 ).onChange( update ).listen();

var gl;

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl2");

	var width = gl.canvas.clientWidth;
	var height = gl.canvas.clientHeight;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}
 
var shaderProgram;
 
function initShaders() {
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    var source = fragmentShaderGLSL.replace( 'THEFUNCTIONGOESHERE', glslFunction );
    gl.shaderSource(fragmentShader, source);
    gl.compileShader(fragmentShader);
    
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragmentShader));
        return null;
    }

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderGLSL);
    gl.compileShader(vertexShader);

    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertexShader));
        return null;
    }

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
 
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);
 
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
 
    shaderProgram.uPanzoomMatrix = gl.getUniformLocation(shaderProgram, "uPanzoomMatrix");

    shaderProgram.axisOpacity = gl.getUniformLocation(shaderProgram, "axisOpacity");
    shaderProgram.rootDarkening = gl.getUniformLocation(shaderProgram, "rootDarkening");
    shaderProgram.rootDarkeningSharpness = gl.getUniformLocation(shaderProgram, "rootDarkeningSharpness");
    shaderProgram.poleLightening = gl.getUniformLocation(shaderProgram, "poleLightening");
    shaderProgram.poleLighteningSharpness = gl.getUniformLocation(shaderProgram, "poleLighteningSharpness");
    shaderProgram.rectangularGridOpacity = gl.getUniformLocation(shaderProgram, "rectangularGridOpacity");
    shaderProgram.polarGridOpacity = gl.getUniformLocation(shaderProgram, "polarGridOpacity");
    shaderProgram.pixelRatio = gl.getUniformLocation(shaderProgram, "pixelRatio");

    shaderProgram.variables = [];
    "abcdfghjklmnopqrstuvwxyz".split('').forEach(function(v) {
      shaderProgram.variables[v] = gl.getUniformLocation(shaderProgram, v);
      if (v in markers)
        gl.uniform2fv(shaderProgram.variables[v], markers[v]);
    });
}

var panzoomMatrix = mat3.create();
var viewportMatrix = mat3.create();

function setUniforms() {
    gl.uniformMatrix3fv(shaderProgram.uPanzoomMatrix, false, panzoomMatrix);

    gl.uniform1f(shaderProgram.axisOpacity, parameters.axisOpacity);
    gl.uniform1f(shaderProgram.rootDarkening, parameters.rootDarkening);
    gl.uniform1f(shaderProgram.rootDarkeningSharpness, parameters.rootDarkeningSharpness);
    gl.uniform1f(shaderProgram.poleLightening, parameters.poleLightening);
    gl.uniform1f(shaderProgram.poleLighteningSharpness, parameters.poleLighteningSharpness);
    gl.uniform1f(shaderProgram.rectangularGridOpacity, parameters.rectangularGridOpacity);
    gl.uniform1f(shaderProgram.polarGridOpacity, parameters.polarGridOpacity);
    
    gl.uniform1f(shaderProgram.pixelRatio, window.devicePixelRatio);
}
 
var squareVertexPositionBuffer;
 
function initBuffers() {
  //Create Square Position Buffer
    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    var vertices = [
         1.0,  1.0,  0.0,
        -1.0,  1.0,  0.0,
         1.0, -1.0,  0.0,
        -1.0, -1.0,  0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;
}

var viewportScale = 1.0;

function drawScene() {
  resize(gl.canvas);

  var height = gl.canvas.clientHeight * window.devicePixelRatio;
  var width = gl.canvas.clientWidth * window.devicePixelRatio;
  var aspectRatio = width / height;

  var m = width;
  if (m < height) m = height;

  gl.viewport((width - m)/2, (height - m)/2, m, m );

  height = gl.canvas.clientHeight;
  width = gl.canvas.clientWidth;
  
  m = width;
  if (m < height) m = height;
  
  viewportScale = m/2;
  
  mat3.identity(viewportMatrix);
  mat3.scale(viewportMatrix, viewportMatrix, [2.0/m, -2.0/m]);
  mat3.translate(viewportMatrix, viewportMatrix, [-width/2, -height/2]);        
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
  
  setUniforms();
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

  var inversePanzoom = mat3.create();
  mat3.invert( inversePanzoom, panzoomMatrix );
  var inverseViewport = mat3.create();
  mat3.invert( inverseViewport, viewportMatrix );

  Object.keys(markers).forEach( function(v) {
    var el = document.getElementById(v);
    
    if (!el) {
      el = document.createElement('div');
      var t = document.createTextNode(v);
      el.appendChild(t);
      document.body.appendChild(el);
      el.id = v;
      el.classList.add('marker');
      el.onmousedown = function(event) {
        currentlyDragging = event.target.id;
      };
      el.onmouseup = function(event) {
        currentlyDragging = undefined;
      };      
    }
    
    var point = vec2.clone( markers[v] );
    
    vec2.transformMat3( point, point, inversePanzoom );
    vec2.transformMat3( point, point, inverseViewport );
    
    el.style.bottom = (height - point[1].toString()) + 'px';
    el.style.left = (point[0].toString() - 10) + 'px';
  });
}

window.addEventListener("resize", function() {
    window.requestAnimationFrame(drawScene);
});

function resize(canvas) {
    // Lookup the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth * window.devicePixelRatio;
    var displayHeight = canvas.clientHeight * window.devicePixelRatio;
        
    // Check if the canvas is not the same size.
    if (canvas.width  != displayWidth ||
	canvas.height != displayHeight) {
	
	// Make the canvas the same size
	canvas.width  = displayWidth;
	canvas.height = displayHeight;
    }
}

function webGLStart() {
    const canvas = document.querySelector("#glCanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl2");
    
    // Only continue if WebGL is available and working
    if (gl === null) {
	alert("Unable to initialize WebGL. Your browser or machine may not support it.");
	return;
    }

    initGL(canvas);
    initShaders();
    initBuffers();
 
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    window.requestAnimationFrame(drawScene);
}
 
webGLStart();

document.querySelector("#glCanvas").addEventListener("mouseup", function(e) {
  currentlyDragging = undefined;
});

document.querySelector("#glCanvas").addEventListener("mousemove", function(e) {
  var point = vec2.clone( [e.clientX, e.clientY] );
  vec2.transformMat3( point, point, viewportMatrix );
  var inverse = mat3.clone(panzoomMatrix);
  vec2.transformMat3( point, point, inverse );

  if (currentlyDragging) {
    markers[currentlyDragging] = point;
    gl.uniform2fv(shaderProgram.variables[currentlyDragging], point);
  } else {
    gl.uniform2fv(shaderProgram.variables["w"], point);
  }
  
  window.requestAnimationFrame(drawScene);
});

panzoom(document.querySelector("#glCanvas"), e => {
    var center = vec2.clone( [e.x, e.y] );
    
    vec2.transformMat3( center, center, viewportMatrix );
    
    vec2.scale( center, center, -1 );
    mat3.translate( panzoomMatrix, panzoomMatrix, center );
    var scale = Math.exp(e.dz / 100.0);
    mat3.scale( panzoomMatrix, panzoomMatrix, [scale,scale] );
    vec2.scale( center, center, -1 );
    mat3.translate( panzoomMatrix, panzoomMatrix, center );    

    mat3.translate( panzoomMatrix, panzoomMatrix, [-e.dx/viewportScale, e.dy/viewportScale] );
    
    window.requestAnimationFrame(drawScene);

});
