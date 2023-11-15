'use strict';
var FieldTypeInfo = {
    grass  : { color : v4.Make(0.2, 0.4, 0.0, 1), },
    desert : { color : v4.Make(0.9, 0.8, 0.3, 1), },
    rock   : { color : v4.Make(0.6, 0.6, 0.6, 1), },
    snow   : { color : v4.Make(0.9, 1.0, 1.0, 1), },
    water  : { color : v4.Make(0.1, 0.2, 0.8, 1), },
};
// Workaround for failing line drawing in some renderer when crossing near clipping plane.
var GridDrawerShader = CreateInstance();
GridDrawerShader.cRepeatInterval = 160;
GridDrawerShader.create = function()
{ return Shader.create(
    'line_drawer',
    [
        ['vec3', 'aPos0'],
        ['vec3', 'aPos1'],
        ['vec4', 'aCol'],
    ],
    [
        ['vec4', 'vColor'],
    ],
    [
        ['vec4', 'cViewProjMtx', 4],
        ['vec4', 'cCenter', 1],
    ],
    [],
    [
        'void main() {',
        'float cNear = 1.0;',
        'vec3 world_pos0 = aPos0 * cCenter.w + cCenter.xyz;',
        'vec3 world_pos1 = aPos1 * cCenter.w + cCenter.xyz;',
        'vec4 screen_pos0 = mulMtx44Vec4(cViewProjMtx, vec4(world_pos0, 1));',
        'vec4 screen_pos1 = mulMtx44Vec4(cViewProjMtx, vec4(world_pos1, 1));',
        'if (screen_pos0.w < cNear && screen_pos1.w > cNear) {',
        '    float r = (cNear - screen_pos0.w) / (screen_pos1.w - screen_pos0.w);',
        '    gl_Position = mix(screen_pos0, screen_pos1, r);',
        '} else {',
        '    gl_Position = screen_pos0;',
        '}',
        'vColor = aCol;',
        '}'
    ].join('\n'),
    [
        'void main() {',
        'gl_FragColor = vColor;',
        '}',
    ].join('\n'));
};
var GridDrawer = CreateInstance();
GridDrawer.create = function(snap_unit)
{
    var inst = CreateInstance();
    inst.mSnapUnit = snap_unit;
    inst.mDrawScale = 1;
    inst.mCenterPosY = 0;
    inst.initialize = function(gl)
    {
        this.mShaderInfo = GridDrawerShader.create();
        this.mShLoc = this.mShaderInfo.mLocations;
        this.mStride = this.mShaderInfo.mStride;
        this.mBufferCapacity = 0;
        this.mArrayCapacity = 128;
        this.mSize = 0;
        this.mVertexArray = new Float32Array(this.mArrayCapacity * this.mStride);
    };
    inst.beginWrite = function()
    {
        this.mSize = 0;
    };
    inst.pushLine = function(p0, p1, c)
    {
        var new_size = this.mSize + 2;
        if (this.mArrayCapacity < new_size) {
            while (this.mArrayCapacity < new_size) { this.mArrayCapacity *= 2; }
            var new_array = new Float32Array(this.mArrayCapacity * this.mStride);
            new_array.set(this.mVertexArray);
            this.mVertexArray = new_array;
            CapacityLog('grid array capacity => ' + this.mArrayCapacity);
        }
        var ofs = this.mSize * this.mStride;
        this.mVertexArray.set(p0, ofs     );
        this.mVertexArray.set(p1, ofs +  3);
        this.mVertexArray.set(c , ofs +  6);
        this.mVertexArray.set(p1, ofs + 10);
        this.mVertexArray.set(p0, ofs + 13);
        this.mVertexArray.set(c , ofs + 16);
        this.mSize = new_size;
    };
    inst.endWrite = function(gl)
    {
        if (this.mBufferCapacity < this.mArrayCapacity) {
            this.mBufferCapacity = this.mArrayCapacity;
            CapacityLog('grid buffer capacity => ' + this.mBufferCapacity);
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
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(this.mShaderInfo.mShader);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
        this.mShaderInfo.activateAttrib(gl, 'aPos0');
        this.mShaderInfo.activateAttrib(gl, 'aPos1');
        this.mShaderInfo.activateAttrib(gl, 'aCol');
        webgl.uniform4fx4(gl, this.mShLoc.cViewProjMtx, view_ctx.view_proj_mtx);
        gl.uniform4f(
            this.mShLoc.cCenter,
            Math.round(view_ctx.camera_at[0] / this.mSnapUnit) * this.mSnapUnit,
            this.mCenterPosY,
            Math.round(view_ctx.camera_at[2] / this.mSnapUnit) * this.mSnapUnit,
            this.mDrawScale);
        gl.drawArrays(
            gl.LINES,
            0, // offset
            this.mSize // count
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.disable(gl.BLEND);
    };
    return inst;
};
var FieldDrawerShader = CreateInstance();
FieldDrawerShader.create = function(field_unit)
{ return Shader.create(
    'field_drawer',
    [
        ['vec3', 'aPos'     ],
        ['vec3', 'aNrm'     ],
        ['vec4', 'instPos'  ],
        ['vec4', 'instParam'],
        ['vec4', 'instColor'],
    ],
    [
        ['vec3', 'vWorldNrm'   ],
        ['vec2', 'vNoiseVal'   ],
        ['vec3', 'vColor'      ],
        ['vec4', 'vSelectColor'],
    ],
    [
        ['vec4', 'cViewProjMtx', 4],
        ['vec4', 'cDrawParam0' , 1],
        ['vec2', 'cNoiseCenter', 1],
    ],
    [],
    [
        'void main() {',
        'float cFieldUnit = '+field_unit.toFixed(1)+';',
        'vec2 rx = instParam.xy, rz = vec2(-rx.y, rx.x);',
        'vec3 world_pos = vec3(dot(rx, aPos.xz), 0, dot(rz, aPos.xz));',
        'vec2 slope = instParam.zw;',
        'float sy = dot(world_pos.xz, slope);',
        'world_pos = world_pos * cFieldUnit + instPos.xyz;',
        'vNoiseVal = world_pos.xz - cNoiseCenter;',
        'world_pos.y += sy;',
        'world_pos.y = mix(world_pos.y, instColor.w, aPos.y);',
        'gl_Position = mulMtx44Vec4(cViewProjMtx, vec4(world_pos, 1));',
        'vWorldNrm = mix(vec3(dot(rx, aNrm.xz), 0, dot(rz, aNrm.xz)),',
        '  vec3(-slope.x, cFieldUnit, -slope.y), aNrm.y);',
        'float highlight = instPos.w == cDrawParam0.x ? 1.0 : 0.0;',
        'float selected  = instPos.w == cDrawParam0.y ? 1.0 : 0.0;',
        'vSelectColor = vec4(highlight, selected, 0, min(1.0, highlight + selected));',
        'vColor = instColor.rgb;',
        '}',
    ].join('\n'),
    [
        'void main() {',
        'vec3 f_world_normal = normalize(vWorldNrm);',
        'float diffuse_s = calcDiffuse(f_world_normal);',
        'float noise = IGN(floor(vNoiseVal));',
        'diffuse_s *= mix(0.9, 1.0, noise);',
        'gl_FragColor = vec4(vColor, 1);',
        'gl_FragColor.rgb *= diffuse_s;',
        'gl_FragColor.rgb = mix(gl_FragColor.rgb, vSelectColor.rgb, vSelectColor.a);',
        '}',
    ].join('\n'));
};
var FieldDrawer = CreateInstance();
FieldDrawer.cRotVec = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 0]],
FieldDrawer.calcOffset = function(r, s)
{
    var asx = Math.abs(s[0]), asy = Math.abs(s[1]);
    if (r == 0 && s[0] <= 0 && s[1] <= 0 ||
        r == 1 && s[0] <= 0 && s[1] >= 0 ||
        r == 2 && s[0] >= 0 && s[1] >= 0 ||
        r == 3 && s[0] >= 0 && s[1] <= 0) {
        return (Math.max(asx, asy) - Math.min(asx, asy)) * 0.5;
    }
    return (asx + asy) * 0.5;
};
FieldDrawer.create = function(field_unit)
{
    var inst = CreateInstance();
    inst.mFieldUnit = field_unit;
    inst.initialize = function(gl)
    {
        this.mShaderInfo = FieldDrawerShader.create(this.mFieldUnit);
        this.mShLoc = this.mShaderInfo.mLocations;
        this.mInstStride = this.mShaderInfo.mInstStride;
        this.mVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
        this.setGeometry(gl);
        this.mBufferCapacity = 0;
        this.mArrayCapacity = 128;
        this.mSize = 0;
        this.mInstVertexArray = new Float32Array(this.mArrayCapacity * this.mInstStride);
        this.mFieldCounterF32 = v1.Make(cMinValueF32);
        this.mHighlightCounterF32 = v4.Makes(0);
    };
    inst.beginWrite = function()
    {
        this.mSize = 0;
        this.mFieldCounterF32[0] = cMinValueF32;
    };
    inst.pushField = function(field, alt_rot, min_y)
    {
        var finfo = FieldTypeInfo[field.type];
        var p = v3.Make((field.x + 0.5) * this.mFieldUnit, field.y,
                        (field.z + 0.5) * this.mFieldUnit);
        var r = FieldDrawer.cRotVec[alt_rot ? alt_rot : field.r];
        var s = field.s, c = finfo.color;
        p[1] += FieldDrawer.calcOffset(field.r, s);
        var new_size = this.mSize + 1;
        if (this.mArrayCapacity < new_size) {
            while (this.mArrayCapacity < new_size) { this.mArrayCapacity *= 2; }
            var new_array = new Float32Array(this.mArrayCapacity * this.mInstStride);
            new_array.set(this.mInstVertexArray);
            this.mInstVertexArray = new_array;
            CapacityLog('field array capacity => ' + this.mArrayCapacity);
        }
        var ofs = this.mSize * this.mInstStride;
        var fc = this.mFieldCounterF32;
        var y = v1.Make(min_y);
        this.mInstVertexArray.set(p , ofs     );
        this.mInstVertexArray.set(fc, ofs +  3);
        this.mInstVertexArray.set(r , ofs +  4);
        this.mInstVertexArray.set(s , ofs +  6);
        this.mInstVertexArray.set(c , ofs +  8);
        this.mInstVertexArray.set(y , ofs + 11);
        this.mSize = new_size;
        field.mFieldCounter = fc[0];
        if (!alt_rot) { this.mFieldCounterF32[0] *= cMinStepF32; }
    };
    inst.setHighlight = function(hl) { this.mHighlightCounterF32[0] = hl; };
    inst.setSelected  = function(hl) { this.mHighlightCounterF32[1] = hl; };
    inst.endWrite = function(gl)
    {
        if (this.mBufferCapacity < this.mArrayCapacity) {
            this.mBufferCapacity = this.mArrayCapacity;
            CapacityLog('field buffer capacity => ' + this.mBufferCapacity);
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
        this.mShaderInfo.activateInstAttrib(gl, 'instPos');
        this.mShaderInfo.activateInstAttrib(gl, 'instParam');
        this.mShaderInfo.activateInstAttrib(gl, 'instColor');
        webgl.uniform4fx4(gl, this.mShLoc.cViewProjMtx, view_ctx.view_proj_mtx);
        gl.uniform4fv(this.mShLoc.cDrawParam0, this.mHighlightCounterF32);
        gl.uniform2f(this.mShLoc.cNoiseCenter,
                     Math.floor(view_ctx.camera_at[0] / GridDrawerShader.cRepeatInterval)
                     * GridDrawerShader.cRepeatInterval,
                     Math.floor(view_ctx.camera_at[2] / GridDrawerShader.cRepeatInterval)
                     * GridDrawerShader.cRepeatInterval);
        webgl.mExtInstancedArrays.drawArraysInstancedANGLE(
            gl.TRIANGLES,
            0, // offset
            21, // count
            this.mSize // instances
        );
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instPos  , 0);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instParam, 0);
        webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mShLoc.instColor, 0);
        v4.set(this.mHighlightCounterF32, 0, 0, 0, 0);
    };
    inst.setGeometry = function(gl)
    {
        var buf = [];
        function push_buf(p, n) {
            buf.push(p[0], p[1], p[2], n[0], n[1], n[2]);
        };
        var pos = [v3.Make(-0.5, 0, 0.5), v3.Make(0.5, 0, -0.5), v3.Make(-0.5, 0, -0.5),
                   v3.Make(-0.5, 1, 0.5), v3.Make(0.5, 1, -0.5), v3.Make(-0.5, 1, -0.5)];
        var nrm = [v3.Make(0, 1, 0), v3.Make(1, 0, 1), v3.Make(0, 0, -1), v3.Make(-1, 0, 0)];
        push_buf(pos[0], nrm[0]); push_buf(pos[1], nrm[0]); push_buf(pos[2], nrm[0]);
        push_buf(pos[1], nrm[1]); push_buf(pos[0], nrm[1]); push_buf(pos[3], nrm[1]);
        push_buf(pos[1], nrm[1]); push_buf(pos[3], nrm[1]); push_buf(pos[4], nrm[1]);
        push_buf(pos[2], nrm[2]); push_buf(pos[1], nrm[2]); push_buf(pos[4], nrm[2]);
        push_buf(pos[2], nrm[2]); push_buf(pos[4], nrm[2]); push_buf(pos[5], nrm[2]);
        push_buf(pos[0], nrm[3]); push_buf(pos[2], nrm[3]); push_buf(pos[5], nrm[3]);
        push_buf(pos[0], nrm[3]); push_buf(pos[5], nrm[3]); push_buf(pos[3], nrm[3]);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(buf),
            gl.STATIC_DRAW
        );
    };
    return inst;
};
