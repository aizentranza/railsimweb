'use strict';
var cPI = Math.PI;
var cPI2 = cPI * 2;
var cDeg2Rad = cPI / 180;
var cRad2Deg = 180 / cPI;
var cGoldenRatio = (1 + Math.sqrt(5)) / 2;
var cMinStepF32 = (new Float32Array([1.0000001]))[0];
var cMinValueF32 = cMinStepF32 - 1;
function square(x) { return x * x; }
function lerp(a, b, f) { return a * (1 - f) + b * f; }
function clamp(x, a_min, a_max) { return x < a_min ? a_min : (x < a_max ? x : a_max); }
function max_abs(a, b) { return Math.max(Math.abs(a), Math.abs(b)); }
function step(edge, x) { return edge <= x ? 1 : 0; }
function linearstep(edge0, edge1, x) {
    return clamp((x - edge0) / (edge1 - edge0), 0, 1);
}
function smoothstep(edge0, edge1, x) {
    var t = linearstep(edge0, edge1, x);;
    return t * t * (3 - 2 * t );
}
function pitchYawDeg(pitch, yaw) {
    var pitch_rad = pitch * cDeg2Rad, yaw_rad = yaw * cDeg2Rad;
    var cos_pitch = Math.cos(pitch_rad), sin_pitch = Math.sin(pitch_rad);
    var cos_yaw   = Math.cos(yaw_rad  ), sin_yaw   = Math.sin(yaw_rad  );
    return v3.Make(-cos_pitch * sin_yaw, sin_pitch, cos_pitch * cos_yaw);
}
function pitchYawDegV(v) { return pitchYawDeg(v[0], v[1]); }
function pitchYawRollDeg(pitch, yaw, roll) {
    var pitch_rad = pitch * cDeg2Rad, yaw_rad = yaw * cDeg2Rad, roll_rad = roll * cDeg2Rad;
    var cos_pitch = Math.cos(pitch_rad), sin_pitch = Math.sin(pitch_rad);
    var cos_yaw   = Math.cos(yaw_rad  ), sin_yaw   = Math.sin(yaw_rad  );
    var cos_roll  = Math.cos(roll_rad ), sin_roll  = Math.sin(roll_rad );
    //v3.Make(-cos_pitch * sin_yaw, sin_pitch,  cos_pitch * cos_yaw);
    //v3.Make(cos_yaw, 0, sin_yaw);
    return v3.Make(sin_roll * cos_yaw - cos_roll * cos_pitch * sin_yaw,
                   cos_roll * sin_pitch,
                   sin_roll * sin_yaw + cos_roll * cos_pitch * cos_yaw);
}
function pitchYawRollDegV(v) { return pitchYawRollDeg(v[0], v[1], v[2]); }
function calcV3Center(poss) {
    var center = v3.Makes(0);
    for (var i = 0; i < poss.length; ++i) {
        v3.add(center, poss[i]);
    }
    return v3.muls(center, 1 / poss.length);
}
function CalcMinStepF32()
{
    var ff = new Float32Array(4);
    var delta = 1, i = 0;
    while (true) {
        var next_delta = delta / 2;
        ff[0] = 1 + next_delta;
        if (ff[0] == 1) {
            ff[0] = 1 + delta;
            alert('delta = ' + delta + ', 1 + delta = ' + ff[0] + ', i = ' + i);
            break;
        }
        delta = next_delta;
        ++i;
    }
    var cMinStep = 1 + delta;
    ff[0] = cMinStep;
    ff[1] = 1.0000001;
    ff[2] = 1.0000002;
    alert('' + ff[0] + ' / ' + ff[1] + ' / ' + ff[2]);
}

var cIcosahedron = [];
for (var dim = 0; dim < 3; ++dim) {
    var dim_u = (dim + 1) % 3, dim_v = (dim + 2) % 3;
    for (var face = 0; face < 2; ++face) {
        var f_sign = face * 2 - 1;
        var pos = [];
        for (var u = 0; u < 2; ++u) {
            function push_tri(tri) {
                cIcosahedron.push(tri.map(p => v3.Normalize(p)));
            }
            var u_sign = u * 2 - 1;
            var p0 = v3.Makes(0), p1 = v3.Makes(0), p2 = v3.Makes(0);
            p0[dim] = p1[dim] = f_sign * cGoldenRatio;
            p0[dim_u] = -u_sign * f_sign; p1[dim_u] = u_sign * f_sign;
            p2[dim] = f_sign; p2[dim_v] = u_sign * cGoldenRatio;
            push_tri([p0, p1, p2]);
            if (dim == 0) {
                var p3 = v3.Makes(0), p4 = v3.Makes(0);
                p3[dim_u] = -u_sign * f_sign * cGoldenRatio;
                p4[dim_u] =  u_sign * f_sign * cGoldenRatio;
                p3[dim_v] = p4[dim_v] = u_sign;
                push_tri([p0, p2, p3]); push_tri([p2, p1, p4]);
            }
        }
    }
}
function calcNearestPointsOnLines(p0, d0, p1, d1)
{
    var nd0 = v3.Normalize(d0), nd1 = v3.Normalize(d1);
    var dd0 = v3.Dot(nd0, nd0), dd1 = v3.Dot(nd1, nd1), dd01 = v3.Dot(nd0, nd1);
    var w = dd0 * dd1 - dd01 * dd01;
    if (w == 0) { return null; }
    var t0 = v3.Dot(nd0, p0) - v3.Dot(nd0, p1);
    var t1 = v3.Dot(nd1, p0) - v3.Dot(nd1, p1);
    var a = (-dd1 * t0 + dd01 * t1) / w, pa = v3.add(v3.Muls(nd0, a), p0);
    var b = (-dd01 * t0 + dd0 * t1) / w, pb = v3.add(v3.Muls(nd1, b), p1);
    return {
        pos0 : p0, dir0 : nd0, dist0 : a, pivot0 : pa,
        pos1 : p1, dir1 : nd1, dist1 : b, pivot1 : pb,
        dist : v3.Length(v3.Sub(pa, pb)),
    };
}
