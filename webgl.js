'use strict';
const cSignNum = 2;
const cVtxPerTri = 3;
const cVtxPerQuad = 4;
const cTriPerQuad = 2;
const cFacePerCube = 6;
var webgl = CreateInstance();
webgl.initialize = function(gl)
{
    //Log('webgl.initialize');
    this.mContext = gl;
    this.checkConstant(gl, 'MAX_VERTEX_ATTRIBS');
    this.checkConstant(gl, 'MAX_VERTEX_UNIFORM_VECTORS');
    this.checkConstant(gl, 'MAX_FRAGMENT_UNIFORM_VECTORS');
    this.mExtInstancedArrays = gl.getExtension('ANGLE_instanced_arrays');
};
webgl.checkConstant = function(gl, name)
{
    this[name] = gl.getParameter(gl[name]);
    Log(name + ' = ' + this[name]);
};
webgl.createShader = function(gl, id, src, type)
{
    var shader = gl.createShader(type);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var lastError = gl.getShaderInfoLog(shader);
        var line_no = 0;
        console.log(src.split('\n').map(line => '' + (++line_no) + ' ' + line).join('\n'));
        console.log('*** Error compiling shader ' + id + '.'
                    + (type == gl.VERTEX_SHADER ? 'vsh' : 'fsh') + ':');
        console.log(lastError);
        gl.deleteShader(shader);
        return null;
    }
    return shader;
};
webgl.createShaderProgram = function(gl, id, vsh_src, fsh_src)
{
    var shaders = [
        this.createShader(gl, id, vsh_src, gl.VERTEX_SHADER  ),
        this.createShader(gl, id, fsh_src, gl.FRAGMENT_SHADER),
    ];
    var program = gl.createProgram();
    for (var i = 0; i < shaders.length; ++i) {
        if (!shaders[i]) {
            gl.deleteProgram(program);
            return null;
        }
        gl.attachShader(program, shaders[i]);
    }
    gl.linkProgram(program);
    var linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        var lastError = gl.getProgramInfoLog(program);
        console.log('Error in program linking:');
        console.log(lastError);
        gl.deleteProgram(program);
        return null;
    }
    return program;
};
webgl.getUniformLocationV = function(gl, shader, name, size)
{
    var locations = [];
    for (var i = 0; i < size; ++i) {
        locations.push(gl.getUniformLocation(shader, name + '[' + i + ']'));
    }
    return locations;
};
webgl.uniform4fx3 = function(gl, locations, m)
{
    gl.uniform4f(locations[0], m[ 0], m[ 1], m[ 2], m[ 3]);
    gl.uniform4f(locations[1], m[ 4], m[ 5], m[ 6], m[ 7]);
    gl.uniform4f(locations[2], m[ 8], m[ 9], m[10], m[11]);
};
webgl.uniform4fx4 = function(gl, locations, m)
{
    gl.uniform4f(locations[0], m[ 0], m[ 1], m[ 2], m[ 3]);
    gl.uniform4f(locations[1], m[ 4], m[ 5], m[ 6], m[ 7]);
    gl.uniform4f(locations[2], m[ 8], m[ 9], m[10], m[11]);
    gl.uniform4f(locations[3], m[12], m[13], m[14], m[15]);
};
webgl.uniform4fv = function(gl, locations, a)
{
    var n = Math.min(locations.length, a.length);
    for (var i = 0; i < n; ++i) {
        gl.uniform4fv(locations[i], a[i]);
    }
};
