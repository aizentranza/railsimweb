'use strict';
var BoxDrawerShader = CreateInstance();
BoxDrawerShader.create = function()
{ return Shader.create(
    'box_drawer',
    [
        ['vec3', 'aPos'     ],
        ['vec3', 'aNrm'     ],
        ['vec4', 'instMtx0' ],
        ['vec4', 'instMtx1' ],
        ['vec4', 'instMtx2' ],
        ['vec4', 'instColor'],
    ],
    [
        ['vec3', 'vWorldNrm'],
        ['vec4', 'vColor'   ],
    ],
    [
        ['vec4', 'cViewProjMtx', 4],
    ],
    [],
    [
        'void main() {',
        'vec4 inst_mtx[3];',
        'inst_mtx[0] = instMtx0;',
        'inst_mtx[1] = instMtx1;',
        'inst_mtx[2] = instMtx2;',
        'vec3 world_pos = mulMtx34Vec3(inst_mtx, aPos);',
        'gl_Position = mulMtx44Vec4(cViewProjMtx, vec4(world_pos, 1));',
        'vWorldNrm = normalize(rotMtx34Vec3(inst_mtx, aNrm));',
        'vColor = instColor;',
        '}',
    ].join('\n'),
    [
        'void main() {',
        'vec3 f_world_normal = normalize(vWorldNrm);',
        'float diffuse_s = calcDiffuse(f_world_normal);',
        'gl_FragColor = vColor;',
        'gl_FragColor.rgb *= diffuse_s;',
        '}',
    ].join('\n'));
};
var BoxDrawer = CreateInstance();
BoxDrawer.create = function()
{
    var inst = CreateInstance();
    inst.initialize = function(gl)
    {
        this.mShaderInfo = BoxDrawerShader.create();
        this.mShLoc = this.mShaderInfo.mLocations;
        this.mInstStride = this.mShaderInfo.mInstStride;
        this.mVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
        this.setGeometry(gl);
        this.mBufferCapacity = 0;
        this.mArrayCapacity = 128;
        this.mSize = 0;
        this.mInstVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mInstVertexBuffer);
        this.mInstVertexArray = new Float32Array(this.mArrayCapacity * this.mInstStride);
        gl.bufferData(gl.ARRAY_BUFFER, this.mInstVertexArray, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    inst.beginWrite = function()
    {
        this.mSize = 0;
    };
    inst.pushBox = function(/*m34*/m, c)
    {
        var new_size = this.mSize + 1;
        if (this.mArrayCapacity < new_size) {
            while (this.mArrayCapacity < new_size) { this.mArrayCapacity *= 2; }
            var new_array = new Float32Array(this.mArrayCapacity * this.mInstStride);
            new_array.set(this.mInstVertexArray);
            this.mInstVertexArray = new_array;
            CapacityLog('box array capacity => ' + this.mArrayCapacity);
        }
        var ofs = this.mSize * this.mInstStride;
        this.mInstVertexArray.set(m, ofs     );
        this.mInstVertexArray.set(c, ofs + 12);
        this.mSize = new_size;
    };
    inst.endWrite = function(gl)
    {
        if (this.mBufferCapacity < this.mArrayCapacity) {
            this.mBufferCapacity = this.mArrayCapacity;
            CapacityLog('box buffer capacity => ' + this.mBufferCapacity);
            this.mInstVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mInstVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.mInstVertexArray, gl.DYNAMIC_DRAW);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mInstVertexBuffer);
        }
        gl.bufferSubData(
            gl.ARRAY_BUFFER, 0,
            new Float32Array(this.mInstVertexArray.buffer,
                             0, this.mSize * this.mInstStride));
    };
    inst.getCapacityText = function() { return '' + this.mSize + '/' + this.mArrayCapacity; };
    inst.draw = function(gl, view_ctx)
    {
        if (this.mSize <= 0) { return; }
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        gl.useProgram(this.mShaderInfo.mShader);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
        this.mShaderInfo.activateAttrib(gl, 'aPos');
        this.mShaderInfo.activateAttrib(gl, 'aNrm');
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mInstVertexBuffer);
        this.mShaderInfo.activateInstAttrib(gl, 'instMtx0');
        this.mShaderInfo.activateInstAttrib(gl, 'instMtx1');
        this.mShaderInfo.activateInstAttrib(gl, 'instMtx2');
        this.mShaderInfo.activateInstAttrib(gl, 'instColor');
        webgl.uniform4fx4(gl, this.mShLoc.cViewProjMtx, view_ctx.view_proj_mtx);
        webgl.mExtInstancedArrays.drawArraysInstancedANGLE(
            gl.TRIANGLES,
            0, // offset
            36, // count
            this.mSize // instances
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instMtx0 , 0);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instMtx1 , 0);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instMtx2 , 0);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instColor, 0);
    };
    inst.setGeometry = function(gl)
    {
        var buf = [];
        function push_buf(p, n) {
            buf.push(p[0], p[1], p[2], n[0], n[1], n[2]);
        };
        for (var dim = 0; dim < 3; ++dim) {
            var dim1 = (dim + 1) % 3, dim2 = (dim + 2) % 3;
            for (var face = 0; face < 2; ++face) {
                var nrm = [0, 0, 0];
                var f_sign = face * 2 - 1;
                nrm[dim] = f_sign;
                var pos = [];
                for (var u = 0; u < 2; ++u) {
                    for (var v = 0; v < 2; ++v) {
                        var p = [0, 0, 0];
                        p[dim] = face - 0.5;
                        p[dim1] = u - 0.5;
                        p[dim2] = (v - 0.5) * f_sign;
                        pos.push(p);
                    }
                }
                push_buf(pos[0], nrm); push_buf(pos[2], nrm); push_buf(pos[1], nrm);
                push_buf(pos[1], nrm); push_buf(pos[2], nrm); push_buf(pos[3], nrm);
            }
        }
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(buf),
            gl.STATIC_DRAW
        );
    };
    return inst;
};
