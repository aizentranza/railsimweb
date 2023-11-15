'use strict';
var LineDrawerShader = CreateInstance();
LineDrawerShader.create = function()
{ return Shader.create(
    'line_drawer',
    [
        ['vec3', 'aPos'],
        ['vec4', 'aCol'],
    ],
    [
        ['vec4', 'vColor'],
    ],
    [
        ['vec4', 'cViewProjMtx', 4],
    ],
    [],
    [
        'void main() {',
        'vec3 world_pos = aPos;',
        'gl_Position = mulMtx44Vec4(cViewProjMtx, vec4(world_pos, 1));',
        'vColor = aCol;',
        '}'
    ].join('\n'),
    [
        'void main() {',
        'gl_FragColor = vColor;',
        '}',
    ].join('\n'));
};
var LineDrawer = CreateInstance();
LineDrawer.create = function()
{
    var inst = CreateInstance();
    inst.initialize = function(gl)
    {
        this.mShaderInfo = LineDrawerShader.create();
        this.mShLoc = this.mShaderInfo.mLocations;
        this.mStride = this.mShaderInfo.mStride;
        this.mBufferCapacity = 0;
        this.mArrayCapacity = 128;
        this.mSize = 0;
        this.mVertexArray = new Float32Array(this.mArrayCapacity * this.mStride);
    };
    inst.setIgnoreDepth = function(f) { this.mIgnoreDepth = f; }
    inst.beginWrite = function()
    {
        this.mSize = 0;
    };
    inst.addSize = function(delta)
    {
        var new_size = this.mSize + delta;
        if (this.mArrayCapacity >= new_size) { return new_size; }
        while (this.mArrayCapacity < new_size) { this.mArrayCapacity *= 2; }
        var new_array = new Float32Array(this.mArrayCapacity * this.mStride);
        new_array.set(this.mVertexArray);
        this.mVertexArray = new_array;
        CapacityLog('line array capacity => ' + this.mArrayCapacity);
        return new_size;
    };
    inst.pushVertex = function(p, c)
    {
        var new_size = this.addSize(1);
        var ofs = this.mSize * this.mStride;
        this.mVertexArray.set(p, ofs    );
        this.mVertexArray.set(c, ofs + 3);
        this.mSize = new_size;
    };
    inst.pushLine = function(p0, p1, c)
    {
        var new_size = this.addSize(2);
        var ofs = this.mSize * this.mStride;
        this.mVertexArray.set(p0, ofs     );
        this.mVertexArray.set(c , ofs +  3);
        this.mVertexArray.set(p1, ofs +  7);
        this.mVertexArray.set(c , ofs + 10);
        this.mSize = new_size;
    };
    inst.pushQuad = function(mtx, c)
    {
        var poss = [
            m34.MulV3(mtx, v3.Make( 0.5, 0,  0.5)),
            m34.MulV3(mtx, v3.Make(-0.5, 0,  0.5)),
            m34.MulV3(mtx, v3.Make(-0.5, 0, -0.5)),
            m34.MulV3(mtx, v3.Make( 0.5, 0, -0.5)),
        ];
        for (var i = 0; i < 4; ++i) {
            this.pushLine(poss[i], poss[(i + 1) & 3], c);
        }
    };
    inst.pushQuadTriangle = function(mtx, c)
    {
        var poss = [
            m34.MulV3(mtx, v3.Make(-0.5, 0,  0.5)),
            m34.MulV3(mtx, v3.Make(-0.5, 0, -0.5)),
            m34.MulV3(mtx, v3.Make( 0.5, 0, -0.5)),
        ];
        for (var i = 0; i < 3; ++i) {
            this.pushLine(poss[i], poss[(i + 1) % 3], c);
        }
    };
    inst.pushAxis = function(mtx)
    {
        var c = m34.GetCol(mtx, 3);
        this.pushLine(c, m34.MulV3(mtx, v3.ex), v4.Make(1, 0, 0, 1));
        this.pushLine(c, m34.MulV3(mtx, v3.ey), v4.Make(0, 1, 0, 1));
        this.pushLine(c, m34.MulV3(mtx, v3.ez), v4.Make(0, 0, 1, 1));
    }
    inst.pushDualAxis = function(mtx)
    {
        this.pushLine(m34.MulV3(mtx, v3.Make(-1, 0, 0)),
                      m34.MulV3(mtx, v3.ex), v4.Make(1, 0, 0, 1));
        this.pushLine(m34.MulV3(mtx, v3.Make(0, -1, 0)),
                      m34.MulV3(mtx, v3.ey), v4.Make(0, 1, 0, 1));
        this.pushLine(m34.MulV3(mtx, v3.Make(0, 0, -1)),
                      m34.MulV3(mtx, v3.ez), v4.Make(0, 0, 1, 1));
    }
    inst.pushAABB = function(aabb, c, mtx)
    {
        if (!aabb3.IsValid(aabb)) { return; }
        for (var i_dim = 0; i_dim < 3; ++i_dim) {
            var u_dim = (i_dim + 1) % 3, v_dim = (i_dim + 2) % 3;
            for (var u = 0; u < 2; ++u) {
                for (var v = 0; v < 2; ++v) {
                    var p0 = v3.MakeUndef(), p1 = v3.MakeUndef();
                    p0[i_dim] = aabb[0][i_dim]; p1[i_dim] = aabb[1][i_dim];
                    p0[u_dim] = p1[u_dim] = aabb[u][u_dim];
                    p0[v_dim] = p1[v_dim] = aabb[v][v_dim];
                    if (mtx) {
                        p0 = m34.MulV3(mtx, p0);
                        p1 = m34.MulV3(mtx, p1);
                    }
                    this.pushLine(p0, p1, c);
                }
            }
        }
    };
    inst.pushSphere = function(sphere, c)
    {
        var r = sphere[3];
        cIcosahedron.forEach(function(p) {
            var q = [], m = v3.Makes(0);
            for (var i = 0; i < 3; ++i) {
                q.push(v3.normalize(v3.Mid(p[i], p[(i + 1) % 3])));
                v3.add(m, p[i]);
            }
            v3.normalize(m);
            for (var i = 0; i < 3; ++i) {
                var t = v3.add(v3.Muls(q[i], r), sphere);
                inst.pushLine(t, v3.add(v3.Muls(p[i], r), sphere), c);
                inst.pushLine(t, v3.add(v3.Muls(m, r), sphere), c);
            }
        });
    };
    inst.endWrite = function(gl)
    {
        if (this.mBufferCapacity < this.mArrayCapacity) {
            this.mBufferCapacity = this.mArrayCapacity;
            CapacityLog('line buffer capacity => ' + this.mBufferCapacity);
            this.mVertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, this.mVertexArray, gl.DYNAMIC_DRAW);
        } else {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
        }
        gl.bufferSubData(
            gl.ARRAY_BUFFER, 0,
            new Float32Array(this.mVertexArray.buffer,
                             0, this.mSize * this.mStride));
    };
    inst.getCapacityText = function() { return '' + this.mSize + '/' + this.mArrayCapacity; };
    inst.draw = function(gl, view_ctx)
    {
        if (this.mSize <= 0) { return; }
        gl.enable(gl.CULL_FACE);
        if (this.mIgnoreDepth) { gl.disable(gl.DEPTH_TEST); }
        else { gl.enable(gl.DEPTH_TEST); }
        gl.useProgram(this.mShaderInfo.mShader);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
        this.mShaderInfo.activateAttrib(gl, 'aPos');
        this.mShaderInfo.activateAttrib(gl, 'aCol');
        webgl.uniform4fx4(gl, this.mShLoc.cViewProjMtx, view_ctx.view_proj_mtx);
        gl.drawArrays(
            gl.LINES,
            0, // offset
            this.mSize // count
        );
        if (this.mIgnoreDepth) { gl.enable(gl.DEPTH_TEST); }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };
    return inst;
};
