#version 300 es

in vec3 aVertexPosition;
uniform mat3 uPanzoomMatrix;
//uniform mat3 uPMatrix;
//uniform vec2 uViewportSize;
      
//These will be passed to the fragment shader and will be interpreted per
//pixel
out vec2 z;
      
void main(void) {
  //gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  //The line below will ignore any translation of perspective matrix
  gl_Position =  vec4(aVertexPosition, 1.0);
  //gl_Position = gl_Vertex;
  z = vec2(uPanzoomMatrix * vec3(aVertexPosition.x,aVertexPosition.y, 1.0));
}
