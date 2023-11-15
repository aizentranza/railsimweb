'use strict';
var Shader = CreateInstance();
Shader.create = function(id, attribs, varyings,
                         vsh_uniforms, fsh_uniforms, vsh_src, fsh_src)
{
    var gl = g_canvas.getContext();
    function expand_args(args, decl) {
        var src = '';
        for (var i = 0; i < args.length; ++i) {
            var v = args[i];
            if (v) {
                var type = v[0], name = v[1];
                src += decl + ' ' + type + ' ' + name + ';\n';
            }
        }
        return src;
    }
    var attrib_src = expand_args(attribs, 'attribute');
    var varying_src = expand_args(varyings, 'varying');
    function expand_uniforms(args) {
        var src = '';
        for (var i = 0; i < args.length; ++i) {
            var v = args[i];
            if (v) {
                var type = v[0], name = v[1], alen = v[2];
                src += 'uniform ' + type + ' ' + name;
                if (alen > 1) { src += '[' + alen + ']'; }
                src += ';\n';
            }
        }
        return src;
    }
    var vsh_uniform_src = expand_uniforms(vsh_uniforms);
    var fsh_uniform_src = expand_uniforms(fsh_uniforms);
    vsh_src = Shader.cVertexPreHeader
        + Shader.cCommonHeader
        + Shader.cVertexHeader
        + attrib_src
        + varying_src
        + vsh_uniform_src
        + vsh_src;
    fsh_src = Shader.cFragmentPreHeader
        + Shader.cCommonHeader
        + Shader.cFragmentHeader
        + varying_src
        + fsh_uniform_src
        + fsh_src;
    var shader = webgl.createShaderProgram(gl, id, vsh_src, fsh_src);
    var locations = {}, attrib_infos = {}, stride = 0, inst_stride = 0;
    for (var i = 0; i < attribs.length; ++i) {
        var v = attribs[i];
        if (v) {
            var type = v[0], name = v[1];
            var loc = gl.getAttribLocation(shader, name);
            locations[name] = loc;
            var size = 1;
            for (var i_size = 2; i_size <= 4; ++i_size) {
                if (type.endsWith(i_size.toString())) { size = i_size; break; }
            }
            var info = { size : size, };
            if (name.startsWith('inst')) {
                info.byte_offset = 4 * inst_stride;
                inst_stride += size;
            } else {
                info.byte_offset = 4 * stride;
                stride += size;
            }
            attrib_infos[name] = info;
        }
    }
    //Log(id + ': stride = ' + stride + (inst_stride ? ', inst_stride = ' + inst_stride : ''));
    function search_uniforms(args) {
        for (var i = 0; i < args.length; ++i) {
            var v = args[i];
            if (v) {
                var name = v[1], alen = v[2];
                var loc;
                if (alen == 1) {
                    loc = gl.getUniformLocation(shader, name);
                } else {
                    loc = webgl.getUniformLocationV(gl, shader, name, alen);
                }
                locations[name] = loc;
            }
        }
    }
    search_uniforms(vsh_uniforms);
    search_uniforms(fsh_uniforms);
    return {
        mShader : shader,
        mLocations : locations,
        mAttribInfos : attrib_infos,
        mStride : stride,
        mInstStride : inst_stride,
        activateAttrib : function(gl, name)
        {
            var info = this.mAttribInfos[name];
            gl.enableVertexAttribArray(this.mLocations[name]);
            gl.vertexAttribPointer(
                this.mLocations[name],
                info.size,
                gl.FLOAT, // type
                false, // normalize
                4 * this.mStride,
                info.byte_offset
            );
        },
        activateInstAttrib : function(gl, name)
        {
            var info = this.mAttribInfos[name];
            gl.enableVertexAttribArray(this.mLocations[name]);
            gl.vertexAttribPointer(
                this.mLocations[name],
                info.size,
                gl.FLOAT, // type
                false, // normalize
                4 * this.mInstStride,
                info.byte_offset
            );
            webgl.mExtInstancedArrays.vertexAttribDivisorANGLE(this.mLocations[name], 1);
        },
    };
};
Shader.cCommonHeader = [
    'vec3 mulMtx34Vec3(vec4 m[3], vec3 v) {',
    '    vec3 r;',
    '    r.x = dot(m[0], vec4(v, 1));',
    '    r.y = dot(m[1], vec4(v, 1));',
    '    r.z = dot(m[2], vec4(v, 1));',
    '    return r;',
    '}',
    'vec3 rotMtx34Vec3(vec4 m[3], vec3 v) {',
    '    vec3 r;',
    '    r.x = dot(m[0].xyz, v);',
    '    r.y = dot(m[1].xyz, v);',
    '    r.z = dot(m[2].xyz, v);',
    '    return r;',
    '}',
    'vec4 mulMtx44Vec4(vec4 m[4], vec4 v) {',
    '    vec4 r;',
    '    r.x = dot(m[0], v);',
    '    r.y = dot(m[1], v);',
    '    r.z = dot(m[2], v);',
    '    r.w = dot(m[3], v);',
    '    return r;',
    '}',
    'float saturate(float x) { return clamp(x, 0.0, 1.0); }',
    'float step2(float e0, float e1, float x) { return step(e0, x) * step(x, e1); }',
    'float linearstep(float e0, float e1, float x) { return saturate((x - e0) / (e1 - e0)); }',
    'float linearstep_w(float e, float w, float x) { return saturate((x - e) / w); }',
    'float linearstep_rcp_w(float e, float rcp_w, float x)',
    '{ return saturate((x - e) * rcp_w); }',
    '',
].join('\n');
Shader.cVertexPreHeader = [
    '',
].join('\n');
Shader.cVertexHeader = [
    '',
].join('\n');
Shader.cFragmentPreHeader = [
    'precision mediump float;',
    '',
].join('\n');
Shader.cFragmentHeader = [
    'vec3 cLightDir = normalize(vec3(-1, -4, -2));',
    'float calcDiffuse(vec3 nrm) {',
    'float diffuse = saturate(dot(-cLightDir, nrm) * 0.5 + 0.5);',
    'float ambient = 0.1; return diffuse + ambient;',
    '}',
    'float IGN(vec2 p) {',
    'return fract(52.9829189 * fract(0.06711056*p.x + 0.00583715*p.y));',
    '}',
    '',
].join('\n');
