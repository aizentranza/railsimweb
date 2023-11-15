'use strict';
var ModelDrawerShader = CreateInstance();
ModelDrawerShader.cBoundStepLt = function(a, v, w) {
    if (w == 0) {
        return 'step(' + a + ', float(' + v + '))';
    } else {
        return 'linearstep_rcp_w(' + a + ', float(' + ( 1 / w ) + '), float(' + v + '))';
    }
};
ModelDrawerShader.cBoundStepGt = function(a, v, w) {
    if (w == 0) {
        return 'step(float(' + v + '), ' + a + ')';
    } else {
        return 'linearstep_rcp_w(' + a + ', float(' + ( -1 / w ) + '), float(' + v + '))';
    }
};
ModelDrawerShader.cBoundStepFns = {
    lt : ModelDrawerShader.cBoundStepLt,
    gt : ModelDrawerShader.cBoundStepGt,
};
ModelDrawerShader.getInsertColor = function(mdl, cdata) {
    if (cdata.override_color_id) {
        var info = mdl.user_data.insert_colors[cdata.override_color_id];
        if (info) {
            return 'cInsertColors[' + info.index + ']';
        }
    }
    return 'vec4' + v4.ToString(cdata.default_value);
};
ModelDrawerShader.create = function(mdl)
{ return Shader.create(
    'model_drawer',
    [
        ['vec3', 'aPos'],
        ['vec3', 'aNrm'],
        ['vec3', 'aCol'],
    ],
    [
        ['vec3', 'vLocalPos'],
        ['vec3', 'vWorldNrm'],
        ['vec4', 'vColor'   ],
    ],
    [
        ['vec4', 'cViewProjMtx', 4],
        ['vec4', 'cInstMtx', 3],
    ],
    [
        mdl.user_data.insert_color_num > 0 &&
            ['vec4', 'cInsertColors', Math.max(mdl.user_data.insert_color_num, 2)],
    ],
    [
        'void main() {',
        'vLocalPos = aPos;',
        'vec3 world_pos = mulMtx34Vec3(cInstMtx, aPos);',
        'gl_Position = mulMtx44Vec4(cViewProjMtx, vec4(world_pos, 1));',
        'vWorldNrm = normalize(rotMtx34Vec3(cInstMtx, aNrm));',
        'vColor = vec4(aCol, 1);',
        '}',
    ].join('\n'),
    [
        'void main() {',
        'vec3 f_world_normal = normalize(vWorldNrm), bdif;',
        'float diffuse_s = calcDiffuse(f_world_normal);',
        'float bdot, mask, t;',
        'vec4 pcolor;',
        'gl_FragColor = vColor;',
        mdl.painters.map(function(painter) {
            var ret = ['mask = 1.0;',
                       'pcolor = '+ModelDrawerShader.getInsertColor(
                           mdl, painter.color)+';',];
            painter.bounds.forEach(function(bound) {
                var d = pitchYawRollDegV(bound.angle), t_bound = bound.bound;
                ret.push('bdif = vLocalPos - vec3'+v3.ToString(bound.pos)+';');
                ret.push('bdot = dot(bdif, vec3'+v3.ToString(d)+');');
                if (bound.shape != 'plane') {
                    if (bound.shape == 'circle') {
                        ret.push('bdot = length(bdif - bdot * vec3'+v3.ToString(d)+');');
                    } else if (bound.shape == 'sphere') {
                        ret.push('bdot = length(bdif);');
                    }
                    if (t_bound < 0) { ret.push('bdot = -bdot;'); }
                }
                ret.push('t = '+ModelDrawerShader.cBoundStepFns[bound.type.slice(-2)](
                    'bdot', t_bound, bound.width)+';');
                if (bound.type.startsWith('alt')) {
                    ret.push('pcolor = mix(pcolor, '+ModelDrawerShader.getInsertColor(
                        mdl, bound.alt_color)+', t);');
                } else {
                    ret.push('mask = mix(mask, '+(
                        bound.type.startsWith('mask') ? '0.0' : '1.0')+', t);');
                }
            });
            ret.push('gl_FragColor.rgb = mix(gl_FragColor.rgb, pcolor.rgb, pcolor.a * mask);');
            return ret;
        }).flat().join('\n'),
        'gl_FragColor.rgb *= diffuse_s;',
        '}',
    ].join('\n'));
};
var ModelDrawer = CreateInstance();
ModelDrawer.create = function()
{
    var inst = CreateInstance();
    inst.initialize = function(gl, mdl)
    {
        this.mShaderInfo = ModelDrawerShader.create(mdl);
        this.mShLoc = this.mShaderInfo.mLocations;
        this.mStride = this.mShaderInfo.mStride;
        this.mVertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
        this.mVertexNum = 0;
        this.mAABB = aabb3.MakeUndef();
        this.setGeometry(gl, mdl);
        this.mInstInfo = [];
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.mIsTunnel = mdl.draw_pass == 'tunnel';
    };
    inst.beginWrite = function()
    {
        this.mInstInfo = [];
    };
    inst.pushModel = function(/*m34*/m, colors)
    {
        if (0) {
            var bsp = aabb3.CalcBoundingSphere(this.mAABB, m);
            g_line_drawer.pushAABB(this.mAABB, v4.Makes(1), m);
            g_line_drawer.pushSphere(bsp, v4.Makes(1));
        }
        this.mInstInfo.push({
            cInstMtx : m34.Dup(m),
            cInsertColors : colors,
        });
    };
    inst.endWrite = function(gl)
    {
    };
    inst.draw = function(gl, view_ctx)
    {
        if (this.mInstInfo.length <= 0) { return; }
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        if (this.mIsTunnel) { gl.depthFunc(gl.GREATER); }
        gl.useProgram(this.mShaderInfo.mShader);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.mVertexBuffer);
        this.mShaderInfo.activateAttrib(gl, 'aPos');
        this.mShaderInfo.activateAttrib(gl, 'aNrm');
        this.mShaderInfo.activateAttrib(gl, 'aCol');
        webgl.uniform4fx4(gl, this.mShLoc.cViewProjMtx, view_ctx.view_proj_mtx);
        for (var i = 0; i < this.mInstInfo.length; ++i)
        {
            var info = this.mInstInfo[i];
            webgl.uniform4fx3(gl, this.mShLoc.cInstMtx, info.cInstMtx);
            if (this.mShLoc.cInsertColors) {
                webgl.uniform4fv(gl, this.mShLoc.cInsertColors, info.cInsertColors);
            }
            gl.drawArrays(
                gl.TRIANGLES,
                0, // offset
                this.mVertexNum // count
            );
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        if (this.mIsTunnel) { gl.depthFunc(gl.LESS); }
    };
    inst.setGeometry = function(gl, mdl)
    {
        var buf = [], base_color;
        for (var i_prim = 0; i_prim < mdl.primitives.length; ++i_prim)
        {
            var prim = mdl.primitives[i_prim];
            function push_tri(p0, p1, p2) {
                if (v3.IsEqual(p0, p1) || v3.IsEqual(p1, p2) || v3.IsEqual(p2, p0)) {
                    //Log('skip tri: ' + v3.ToFixed(p0, 3)
                    //    + ', ' + v3.ToFixed(p1, 3) + ', ' + v3.ToFixed(p2, 3));
                    return;
                }
                function push_buf(p, n) {
                    buf.push(p[0], p[1], p[2], n[0], n[1], n[2],
                             base_color[0], base_color[1], base_color[2]);
                };
                var n = v3.normalize(v3.Cross(v3.Sub(p0, p1), v3.Sub(p0, p2)));
                var tri = [p0, p1, p2];
                function push_impl(di) {
                    if (0) { // triangulation check
                        var center = calcV3Center(tri);
                        for (var i = 0; i < cVtxPerTri; ++i) {
                            push_buf(v3.Lerp(tri[(i * di) % cVtxPerTri], center, 0.05), n);
                        }
                    } else {
                        for (var i = 0; i < cVtxPerTri; ++i) {
                            push_buf(tri[(i * di) % cVtxPerTri], n);
                        }
                    }
                    inst.mVertexNum += 3;
                }
                if (prim.face == 'front' || prim.face == 'both') { push_impl(1); }
                if (prim.face == 'back'  || prim.face == 'both') { v3.neg(n); push_impl(2); }
            };
            var split = prim.split;
            base_color = prim.base_color;
            var slicers = [];
            for (var i = 0; i < prim.slicers.length; ++i) {
                var slicer = prim.slicers[i];
                var d = { dir : pitchYawRollDegV(slicer.angle),
                          ofs : slicer.offset, res : slicer,
                          is_erase : slicer.type.startsWith('erase'), }
                if (slicer.type.endsWith(d.is_erase ? 'lt' : 'gt')) {
                    v3.neg(d.dir); d.ofs = -d.ofs;
                }
                slicers.push(d);
            }
            var polys = [];
            var mtx = m34.setSRTDeg(m34.MakeZero(), prim.scale, prim.rotate, prim.trans);
            function mm(p) {
                if (prim.taper < 0) {
                    var s = lerp(1, 0.5 + p[2], -prim.taper);
                    p = v3.Make(s * p[0], s * p[1], p[2]);
                } else if (prim.taper > 0) {
                    var s = lerp(1, 0.5 - p[2], prim.taper);
                    p = v3.Make(s * p[0], s * p[1], p[2]);
                }
                return m34.MulV3(mtx, p);
            }
            if (prim.type == 'plane')
            {
                var pos = [];
                for (var u = 0; u < 2; ++u) {
                    for (var v = 0; v < 2; ++v) {
                        var p = v3.Makes(0);
                        p[0] = u - 0.5;
                        p[2] = -(v - 0.5);
                        p = mm(p);
                        pos.push(p);
                    }
                }
                polys.push([pos[0], pos[2], pos[3], pos[1]]);
            }
            else if (prim.type == 'prism')
            {
                var q = [v3.Make(0, 0.5, 0), v3.Make(-0.5, -0.5, 0), v3.Make(0.5, -0.5, 0)];
                for (var face = 0; face < 2; ++face) {
                    var pos = [];
                    for (var i = 0; i < 3; ++i ) {
                        var p = q[face ? i : 2 - i];
                        pos.push(mm(v3.AddZ(p, face - 0.5)));
                    }
                    polys.push([pos[0], pos[1], pos[2]]);
                }
                for (var i = 0; i < 3; ++i ) {
                    var pos = [];
                    for (var u = 0; u < 2; ++u) {
                        for (var v = 0; v < 2; ++v) {
                            pos.push(mm(v3.AddZ(q[(i + u) % 3], v - 0.5)));
                        }
                    }
                    polys.push([pos[0], pos[2], pos[3], pos[1]]);
                }
            }
            else if (prim.type == 'cube')
            {
                for (var dim = 0; dim < 3; ++dim) {
                    var dim_u = (dim + 1) % 3, dim_v = (dim + 2) % 3;
                    for (var face = 0; face < 2; ++face) {
                        var f_sign = face * 2 - 1;
                        var pos = [];
                        for (var u = 0; u < 2; ++u) {
                            for (var v = 0; v < 2; ++v) {
                                var p = v3.Makes(0);
                                p[dim] = face - 0.5;
                                p[dim_u] = u - 0.5;
                                p[dim_v] = (v - 0.5) * f_sign;
                                p = mm(p);
                                pos.push(p);
                            }
                        }
                        polys.push([pos[0], pos[2], pos[3], pos[1]]);
                    }
                }
            }
            else if (prim.type == 'cylinder')
            {
                var q = [];
                for (i = 0; i < split; ++i) {
                    var rad = i * cPI2 / split;
                    q.push(v3.muls(v3.Make(-Math.sin(rad), Math.cos(rad), 0), 0.5));
                }
                for (var face = 0; face < 2; ++face) {
                    var pos = [];
                    for (var i = 0; i < split; ++i ) {
                        var p = q[face ? i : split - 1 - i];
                        pos.push(mm(v3.AddZ(p, face - 0.5)));
                    }
                    polys.push(pos);
                }
                for (var i = 0; i < split; ++i ) {
                    var pos = [];
                    for (var u = 0; u < 2; ++u) {
                        for (var v = 0; v < 2; ++v) {
                            pos.push(mm(v3.AddZ(q[(i + u) % split], v - 0.5)));
                        }
                    }
                    polys.push([pos[0], pos[2], pos[3], pos[1]]);
                }
            }
            else if (prim.type == 'sphere')
            {
                cIcosahedron.forEach(function split_tri(p) {
                    function add_tri(pos) {
                        var tri = [];
                        for (var i = 0; i < 3; ++i) {
                            tri.push(mm(v3.muls(v3.Normalize(pos[i]), 0.5)));
                        }
                        polys.push(tri);
                    }
                    for (var u = 0; u < split; ++u) {
                        var a0 = u == 0 ? p[0] : v3.Lerp(p[0], p[1], u / split);
                        var a1 = u == split - 1 ? p[1] : v3.Lerp(p[0], p[1], (u + 1) / split);
                        var b0 = u == 0 ? p[0] : v3.Lerp(p[0], p[2], u / split);
                        var b1 = u == split - 1 ? p[2] : v3.Lerp(p[0], p[2], (u + 1) / split);
                        var a2 = a0, a3 = a1;
                        for (var v = 0; v < u; ++v) {
                            var a4 = v3.Lerp(a0, b0, (v + 1) / u);
                            var a5 = v3.Lerp(a1, b1, (v + 1) / (u + 1));
                            add_tri([a2, a3, a5]); add_tri([a2, a5, a4]);
                            a2 = a4; a3 = a5;
                        }
                        add_tri([a2, a3, b1]);
                    }
                });
            }
            var polys_set = [polys], erased_polys_set = [];
            for (var i_slicer = 0; i_slicer < slicers.length; ++i_slicer) {
                var d = slicers[i_slicer];
                var src_polys_set = d.is_erase ? polys_set : erased_polys_set;
                var new_polys_set = [], new_erased_polys_set = [];
                if (d.is_erase) {
                    erased_polys_set.forEach(s => new_erased_polys_set.push(s));
                } else {
                    polys_set.forEach(s => new_polys_set.push(s));
                }
                src_polys_set.forEach(function(src_polys) {
                    var new_polys = [], dump_polys = [], prof_vertices = [], is_cut = false;
                    function push_prof(pp) {
                        if (!d.res.solid) { return; }
                        for (var j = 0; j < prof_vertices.length; ++j) {
                            if (v3.IsEqual(pp, prof_vertices[j])) { return; }
                        }
                        prof_vertices.push(pp);
                    }
                    src_polys.forEach(function(poly) {
                        var vertices = [], dump_vertices = [], prof = [], p0, dot0, abs_dot0;
                        for (var i = 0; i <= poly.length; ++i) {
                            var p1 = poly[i % poly.length];
                            var dot1 = v3.Dot(v3.Sub(p1, d.res.pos), d.dir) - d.ofs;
                            var abs_dot1 = Math.abs(dot1);
                            if (i) {
                                if (dot0 <= 0) { vertices.push(p0); }
                                if (dot0 >= 0) { dump_vertices.push(p0); }
                                if (dot0 * dot1 < 0) {
                                    var p2 = v3.Lerp(p0, p1, abs_dot0 / (abs_dot0 + abs_dot1));
                                    vertices.push(p2);
                                    dump_vertices.push(p2);
                                    push_prof(p2);
                                    is_cut = true;
                                }
                                if (dot1 == 0) { prof.push(p1); }
                            }
                            p0 = p1; dot0 = dot1; abs_dot0 = abs_dot1;
                        }
                        if (vertices.length >= cVtxPerTri) {
                            new_polys.push(vertices);
                        }
                        if (prof.length < poly.length) {
                            if (dump_vertices.length >= cVtxPerTri) {
                                dump_polys.push(dump_vertices);
                            }
                            if (vertices.length > 0 && dump_vertices.length > 0
                                && vertices.length < poly.length
                                && dump_vertices.length < poly.length) {
                                is_cut = true;
                            }
                            prof.forEach(pp => push_prof(pp));
                        }
                    });
                    if (prof_vertices.length >= cVtxPerTri && is_cut) {
                        var center = calcV3Center(prof_vertices);
                        var d0 = v3.normalize(v3.Sub(prof_vertices[0], center));
                        var d1, max_cross = 0;
                        for (var j = 1; j < prof_vertices.length; ++j) {
                            var dj = v3.normalize(v3.Sub(prof_vertices[j], center));
                            var dotj = v3.Length(v3.Cross(d0, dj));
                            if (dotj >= max_cross) { d1 = dj; max_cross = dotj; }
                        }
                        var dn = v3.Cross(d0, d1);
                        if (v3.Dot(dn, d.dir) > 0) { v3.neg(dn); }
                        d1 = v3.Cross(dn, d0);
                        var order = [], angle = [];
                        for (var i = 0; i < prof_vertices.length; ++i) {
                            order.push(i);
                            var delta = v3.Sub(prof_vertices[i], center);
                            angle.push(Math.atan2(v3.Dot(d0, delta), v3.Dot(d1, delta)));
                        }
                        order.sort(function(a, b) { return angle[a] - angle[b]; });
                        new_polys.push(order.map(i => prof_vertices[i]));
                        dump_polys.push(order.map(i => prof_vertices[i]).reverse());
                    }
                    if (new_polys.length > 0) { new_polys_set.push(new_polys); }
                    if (dump_polys.length > 0 && d.res.reshapable) {
                        new_erased_polys_set.push(dump_polys);
                    }
                });
                polys_set = new_polys_set; erased_polys_set = new_erased_polys_set;
            }
            polys_set.forEach(function(t_polys) {
                t_polys.forEach(function(poly) {
                    for (var i = 2; i < poly.length; ++i) {
                        push_tri(poly[0], poly[i - 1], poly[i]);
                    }
                    if (poly.length >= cVtxPerTri) {
                        for (var i = 0; i < poly.length; ++i) {
                            aabb3.extendWith(inst.mAABB, poly[i]);
                        }
                    }
                });
            });
        }
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array(buf),
            gl.STATIC_DRAW
        );
    };
    return inst;
};
