'use strict';
var SmokeDrawerShader = CreateInstance();
SmokeDrawerShader.create = function()
{ return Shader.create(
    'smoke_drawer',
    [
        ['vec3', 'aPos'     ],
        ['vec3', 'aNrm'     ],
        ['vec4', 'instPosR' ],
        ['vec4', 'instColor'],
    ],
    [
        ['vec3', 'vWorldNrm'],
        ['vec4', 'vColor'   ],
        ['vec2', 'vNoiseOfs'],
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
        //'vNoiseOfs = floor(fract(instPosR.xz) * 100.0);',
        '}',
    ].join('\n'),
    [
        'void main() {',
        'float ix = fract(gl_FragCoord.x * 0.0078125) * 128.0;',
        'float iy = fract(gl_FragCoord.y * 0.0078125) * 128.0;',
        'if (IGN(vec2(ix, iy)) > vColor.a) { discard; }',
        'vec3 f_world_normal = normalize(vWorldNrm);',
        'float diffuse_s = calcDiffuse(f_world_normal);',
        'gl_FragColor = vec4(vColor.rgb, 1);',
        'gl_FragColor.rgb *= diffuse_s;',
        '}',
    ].join('\n'));
};
var SmokeDrawer = CreateInstance();
SmokeDrawer.create = function()
{
    var inst = CreateInstance();
    inst.initialize = function(gl)
    {
        this.mShaderInfo = SmokeDrawerShader.create();
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
        this.mPtclArray = [];
    };
    inst.beginWrite = function()
    {
        this.mSize = 0;
        var new_ptcl_array = [];
        this.mPtclArray.forEach(function(ptcl) {
            var smoke = ptcl.smoke;
            if (!this.mIsPause) {
                v3.add(ptcl.pos, v3.add(v3.MakeRandomRange(
                    -smoke.turbulence, smoke.turbulence), ptcl.vel));
                v3.muls(ptcl.vel, smoke.damp);
                ptcl.alpha = ptcl.life / ptcl.init_life;
                ptcl.scale = lerp(smoke.scale_fin, smoke.scale, ptcl.alpha);
                --ptcl.life;
            }
            this.pushSmokeV4(v4.FromV3(ptcl.pos, ptcl.scale),
                             v4.Lerp(smoke.color_fin, smoke.color, ptcl.alpha));
            if (ptcl.life > 0) { new_ptcl_array.push(ptcl); }
        }, this);
        this.mPtclArray = new_ptcl_array;
    };
    inst.pushSmoke = function(pos, dir, smoke)
    {
        if (this.mIsPause || this.mIsFade) { return; }
        var init_life = Math.round(smoke.life * 60);
        this.mPtclArray.push({
            pos : v3.Dup(pos),
            vel : dir,
            scale : smoke.scale,
            init_life : init_life,
            life : init_life,
            alpha : 1,
            smoke : smoke,
        });
        this.pushSmokeV4(v4.FromV3(pos, smoke.scale), smoke.color);
    };
    inst.pushSmokeV4 = function(smoke, c)
    {
        var new_size = this.mSize + 1;
        if (this.mArrayCapacity < new_size) {
            while (this.mArrayCapacity < new_size) { this.mArrayCapacity *= 2; }
            var new_array = new Float32Array(this.mArrayCapacity * this.mInstStride);
            new_array.set(this.mInstVertexArray);
            this.mInstVertexArray = new_array;
            CapacityLog('smoke array capacity => ' + this.mArrayCapacity);
        }
        var ofs = this.mSize * this.mInstStride;
        this.mInstVertexArray.set(smoke, ofs    );
        this.mInstVertexArray.set(c    , ofs + 4);
        this.mSize = new_size;
    };
    inst.endWrite = function(gl)
    {
        if (this.mBufferCapacity < this.mArrayCapacity) {
            this.mBufferCapacity = this.mArrayCapacity;
            CapacityLog('smoke buffer capacity => ' + this.mBufferCapacity);
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
var ModelSmoke = CreateInstance();
ModelSmoke.createSmokesMgr = function(parent, parent_mgr, is_mount)
{
    parent.mSmokeMgr = UI_Struct.createMgr({ clip_name : 'smoke', disable_undo : true, });
    if (is_mount) {
        parent.mSmokeMgr.pushStruct({
            key : 'mount_id', def_value : '', labeled : true,
            title : LangJoin([cLang.train_fixed_to, ' ', cLang.cmn_id]),
            mgr : UI_Text.createMgr({
                parent_mgr : parent.mSmokeMgr, fixed : true, size : 8, type : 'id', }), });
    }
    parent.mSmokeMgr.pushStruct({
        key : 'life', title : cLang.smoke_life, title_sub : ' [s]', def_value : 1,
        mgr : UI_Slider.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true,
            min : 0, max : 10, slide_round : 0.1, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'scale', title : cLang.cmn_scale, def_value : 1,
        mgr : UI_Slider.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true,
            min : 0, max : 10, slide_round : 0.1, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'scale_fin', title : cLang.smoke_scale_fin, def_value : 2,
        mgr : UI_Slider.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true,
            min : 0, max : 10, slide_round : 0.1, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'damp', title : cLang.smoke_speed_damp, def_value : 0.9,
        mgr : UI_Slider.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true, fixed_range : true,
            min : 0, max : 1, slide_round : 0.01, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'emit_ratio', title : cLang.smoke_emit_ratio, def_value : 0.5,
        mgr : UI_Slider.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true, fixed_range : true,
            min : 0, max : 1, slide_round : 0.01, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'turbulence', title : cLang.smoke_turbulence, def_value : 0.1,
        mgr : UI_Slider.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true, fixed_range : true,
            min : 0, max : 1, slide_round : 0.01, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'direction', title : cLang.cmn_direction, def_value : v3.Make(0, 1, 0),
        mgr : UI_Vector.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true,
            dim : 3, min : -1, max : 1, size : 4, slide_round : 0.01, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'trans', title : cLang.cmn_trans, def_value : v3.Makes(0),
        mgr : UI_Vector.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true, dim : 3, min : -50, max : 50, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'color', title : cLang.cmn_color, def_value : v4.Makes(1), labeled : 'value',
        mgr : UI_Color.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true, is_rgba : true, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'color_fin', title : cLang.cmn_color, def_value : v4.Make(1, 1, 1, 0),
        mgr : UI_Color.createMgr({
            parent_mgr : parent.mSmokeMgr, fixed : true, is_rgba : true, }), });
    parent.mSmokeMgr.pushStruct({
        key : 'condition', title : cLang.cmn_condition, def_value : null,
        mgr : ModelSwitch.createConditionMgr(parent.mSmokeMgr), });
    parent.mSmokeMgr.initializeStruct();
    parent.mSmokesMgr = UI_Array.createMgr({
        parent_mgr : parent_mgr, fixed : true,
        element_mgr : parent.mSmokeMgr, init_element_value : null, });
    return parent.mSmokesMgr;
};
ModelSmoke.applySmokeSwitches = function(mdl, values, is_preview)
{
    var ret = [];
    mdl.smokes.forEach(function(smoke) {
        ret.push(EditModel.applySwitchCondition(mdl, values, is_preview, smoke.condition));
    });
    return ret;
};
