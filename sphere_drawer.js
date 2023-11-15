'use strict';
var SphereDrawerShader = CreateInstance();
SphereDrawerShader.create = function()
{ return Shader.create(
    'sphere_drawer',
    [
        ['vec3', 'aPos'     ],
        ['vec3', 'aNrm'     ],
        ['vec4', 'instPosR' ],
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
        'vec3 world_pos = aPos * instPosR.w + instPosR.xyz;',
        'gl_Position = mulMtx44Vec4(cViewProjMtx, vec4(world_pos, 1));',
        'vWorldNrm = aNrm;',
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
var SphereDrawer = CreateInstance();
SphereDrawer.create = function()
{
    var inst = CreateInstance();
    inst.initialize = function(gl)
    {
        this.mShaderInfo = SphereDrawerShader.create();
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
    inst.pushSphere = function(pos, radius, c)
    {
        this.pushSphereV4(v4.FromV3(pos, radius), c);
    };
    inst.pushSphereV4 = function(sphere, c)
    {
        var new_size = this.mSize + 1;
        if (this.mArrayCapacity < new_size) {
            while (this.mArrayCapacity < new_size) { this.mArrayCapacity *= 2; }
            var new_array = new Float32Array(this.mArrayCapacity * this.mInstStride);
            new_array.set(this.mInstVertexArray);
            this.mInstVertexArray = new_array;
            CapacityLog('sphere array capacity => ' + this.mArrayCapacity);
        }
        var ofs = this.mSize * this.mInstStride;
        this.mInstVertexArray.set(sphere, ofs    );
        this.mInstVertexArray.set(c     , ofs + 4);
        this.mSize = new_size;
    };
    inst.endWrite = function(gl)
    {
        if (this.mBufferCapacity < this.mArrayCapacity) {
            this.mBufferCapacity = this.mArrayCapacity;
            CapacityLog('sphere buffer capacity => ' + this.mBufferCapacity);
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
        this.mShaderInfo.activateInstAttrib(gl, 'instPosR');
        this.mShaderInfo.activateInstAttrib(gl, 'instColor');
        webgl.uniform4fx4(gl, this.mShLoc.cViewProjMtx, view_ctx.view_proj_mtx);
        webgl.mExtInstancedArrays.drawArraysInstancedANGLE(
            gl.TRIANGLES,
            0, // offset
            60, // count
            this.mSize // instances
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instPosR , 0);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instColor, 0);
    };
    inst.setGeometry = function(gl)
    {
        var buf = [];
        function push_buf(p, n) {
            buf.push(p[0], p[1], p[2], n[0], n[1], n[2]);
        };
        cIcosahedron.forEach(function(p) {
            for (var i = 0; i < 3; ++i) {
                push_buf(v3.Muls(p[i], 0.5), p[i]);
            }
        });
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(buf),
            gl.STATIC_DRAW
        );
    };
    return inst;
};
