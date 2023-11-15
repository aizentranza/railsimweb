'use strict';
// 3D vector math functions.
var v3 = {
    set : function(dst, x, y, z) {
        dst[0] = x; dst[1] = y; dst[2] = z;
        return dst;
    },
    sets : function(dst, x) {
        dst[0] = dst[1] = dst[2] = x;
        return dst;
    },
    MakeUndef : function() {
        return new Float32Array(3);
    },
    Make : function(x, y, z) {
        var dst = new Float32Array(3);
        dst[0] = x; dst[1] = y; dst[2] = z;
        return dst;
    },
    Makes : function(x) {
        var dst = new Float32Array(3);
        dst[0] = dst[1] = dst[2] = x;
        return dst;
    },
    MakeRandomRange : function(min, max) {
        var dst = new Float32Array(3);
        var range = max - min;
        dst[0] = min + Math.random() * range;
        dst[1] = min + Math.random() * range;
        dst[2] = min + Math.random() * range;
        return dst;
    },
    copy : function(dst, src) {
        dst[0] = src[0]; dst[1] = src[1]; dst[2] = src[2];
        return dst;
    },
    Dup : function(src) {
        var dst = new Float32Array(3);
        dst[0] = src[0]; dst[1] = src[1]; dst[2] = src[2];
        return dst;
    },
    neg : function(dst) {
        dst[0] = -dst[0];
        dst[1] = -dst[1];
        dst[2] = -dst[2];
        return dst;
    },
    Neg : function(src) {
        var dst = new Float32Array(3);
        dst[0] = -src[0];
        dst[1] = -src[1];
        dst[2] = -src[2];
        return dst;
    },
    setX : function(dst, x) {
        dst[0] = x;
        return dst;
    },
    SetX : function(src, x) {
        var dst = new Float32Array(3);
        dst[0] = x;
        dst[1] = src[1];
        dst[2] = src[2];
        return dst;
    },
    setY : function(dst, y) {
        dst[1] = y;
        return dst;
    },
    SetY : function(src, y) {
        var dst = new Float32Array(3);
        dst[0] = src[0];
        dst[1] = y;
        dst[2] = src[2];
        return dst;
    },
    setZ : function(dst, z) {
        dst[2] = z;
        return dst;
    },
    SetZ : function(src, z) {
        var dst = new Float32Array(3);
        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = z;
        return dst;
    },
    addX : function(dst, x) {
        dst[0] += x;
        return dst;
    },
    AddX : function(src, x) {
        var dst = new Float32Array(3);
        dst[0] = src[0] + x;
        dst[1] = src[1];
        dst[2] = src[2];
        return dst;
    },
    addY : function(dst, y) {
        dst[1] += y;
        return dst;
    },
    AddY : function(src, y) {
        var dst = new Float32Array(3);
        dst[0] = src[0];
        dst[1] = src[1] + y;
        dst[2] = src[2];
        return dst;
    },
    addZ : function(dst, z) {
        dst[2] += z;
        return dst;
    },
    AddZ : function(src, z) {
        var dst = new Float32Array(3);
        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = src[2] + z;
        return dst;
    },
    add : function(lhs, rhs) {
        lhs[0] += rhs[0];
        lhs[1] += rhs[1];
        lhs[2] += rhs[2];
        return lhs;
    },
    Add : function(lhs, rhs) {
        var dst = new Float32Array(3);
        dst[0] = lhs[0] + rhs[0];
        dst[1] = lhs[1] + rhs[1];
        dst[2] = lhs[2] + rhs[2];
        return dst;
    },
    sub : function(lhs, rhs) {
        lhs[0] -= rhs[0];
        lhs[1] -= rhs[1];
        lhs[2] -= rhs[2];
        return lhs;
    },
    Sub : function(lhs, rhs) {
        var dst = new Float32Array(3);
        dst[0] = lhs[0] - rhs[0];
        dst[1] = lhs[1] - rhs[1];
        dst[2] = lhs[2] - rhs[2];
        return dst;
    },
    mul : function(lhs, rhs) {
        lhs[0] *= rhs[0];
        lhs[1] *= rhs[1];
        lhs[2] *= rhs[2];
        return lhs;
    },
    Mul : function(lhs, rhs) {
        var dst = new Float32Array(3);
        dst[0] = lhs[0] * rhs[0];
        dst[1] = lhs[1] * rhs[1];
        dst[2] = lhs[2] * rhs[2];
        return dst;
    },
    muls : function(lhs, rhs) {
        lhs[0] *= rhs;
        lhs[1] *= rhs;
        lhs[2] *= rhs;
        return lhs;
    },
    Muls : function(lhs, rhs) {
        var dst = new Float32Array(3);
        dst[0] = lhs[0] * rhs;
        dst[1] = lhs[1] * rhs;
        dst[2] = lhs[2] * rhs;
        return dst;
    },
    div : function(lhs, rhs) {
        lhs[0] /= rhs[0];
        lhs[1] /= rhs[1];
        lhs[2] /= rhs[2];
        return lhs;
    },
    Div : function(lhs, rhs) {
        var dst = new Float32Array(3);
        dst[0] = lhs[0] / rhs[0];
        dst[1] = lhs[1] / rhs[1];
        dst[2] = lhs[2] / rhs[2];
        return dst;
    },
    divs : function(lhs, rhs) {
        lhs[0] /= rhs;
        lhs[1] /= rhs;
        lhs[2] /= rhs;
        return lhs;
    },
    Divs : function(lhs, rhs) {
        var dst = new Float32Array(3);
        dst[0] = lhs[0] / rhs;
        dst[1] = lhs[1] / rhs;
        dst[2] = lhs[2] / rhs;
        return dst;
    },
    IsZero : function(src) {
        return src[0] == 0 && src[1] == 0 && src[2] == 0;
    },
    IsEqual : function(lhs, rhs) {
        return lhs[0] == rhs[0] && lhs[1] == rhs[1] && lhs[2] == rhs[2];
    },
    Length : function(src) {
        return Math.sqrt(src[0] * src[0] + src[1] * src[1] + src[2] * src[2]);
    },
    CalcDist : function(lhs, rhs) {
        return v3.Length(v3.Sub(lhs, rhs));
    },
    normalize : function(dst) {
        var length = v3.Length(dst);
        if (length != 0) {
            dst[0] /= length;
            dst[1] /= length;
            dst[2] /= length;
        } else {
            dst[0] = dst[1] = dst[2] = 0;
        }
        return dst;
    },
    Normalize : function(src) {
        return v3.normalize(v3.Dup(src));
    },
    Dot : function(lhs, rhs) {
        return lhs[0] * rhs[0] + lhs[1] * rhs[1] + lhs[2] * rhs[2];
    },
    setCross : function(dst, lhs, rhs) {
        return v3.set(dst,
                      lhs[1] * rhs[2] - lhs[2] * rhs[1],
                      lhs[2] * rhs[0] - lhs[0] * rhs[2],
                      lhs[0] * rhs[1] - lhs[1] * rhs[0]);
    },
    Cross : function(lhs, rhs) {
        return v3.Make(lhs[1] * rhs[2] - lhs[2] * rhs[1],
                       lhs[2] * rhs[0] - lhs[0] * rhs[2],
                       lhs[0] * rhs[1] - lhs[1] * rhs[0]);
    },
    setMid : function(dst, lhs, rhs) {
        return v3.set(dst,
                      (lhs[0] + rhs[0]) * 0.5,
                      (lhs[1] + rhs[1]) * 0.5,
                      (lhs[2] + rhs[2]) * 0.5);
    },
    Mid : function(lhs, rhs) {
        return v3.Make((lhs[0] + rhs[0]) * 0.5,
                       (lhs[1] + rhs[1]) * 0.5,
                       (lhs[2] + rhs[2]) * 0.5);
    },
    setLerp : function(dst, lhs, rhs, f) {
        var f0 = 1 - f;
        return v3.set(dst,
                      lhs[0] * f0 + rhs[0] * f,
                      lhs[1] * f0 + rhs[1] * f,
                      lhs[2] * f0 + rhs[2] * f);
    },
    Lerp : function(lhs, rhs, f) {
        var f0 = 1 - f;
        return v3.Make(lhs[0] * f0 + rhs[0] * f,
                       lhs[1] * f0 + rhs[1] * f,
                       lhs[2] * f0 + rhs[2] * f);
    },
    Min : function(lhs, rhs) {
        return v3.Make(lhs[0] < rhs[0] ? lhs[0] : rhs[0],
                       lhs[1] < rhs[1] ? lhs[1] : rhs[1],
                       lhs[2] < rhs[2] ? lhs[2] : rhs[2]);
    },
    Max : function(lhs, rhs) {
        return v3.Make(lhs[0] > rhs[0] ? lhs[0] : rhs[0],
                       lhs[1] > rhs[1] ? lhs[1] : rhs[1],
                       lhs[2] > rhs[2] ? lhs[2] : rhs[2]);
    },
    Clamp : function(v, min, max) {
        return v3.Make(v[0] < min[0] ? min[0] : (max[0] < v[0] ? max[0] : v[0]),
                       v[1] < min[1] ? min[1] : (max[1] < v[1] ? max[1] : v[1]),
                       v[2] < min[2] ? min[2] : (max[2] < v[2] ? max[2] : v[2]));
    },
    Clamps : function(v, min, max) {
        return v3.Make(v[0] < min ? min : (max < v[0] ? max : v[0]),
                       v[1] < min ? min : (max < v[1] ? max : v[1]),
                       v[2] < min ? min : (max < v[2] ? max : v[2]));
    },
    ToArray : function(v) {
        return [v[0], v[1], v[2]];
    },
    FromArray : function(v) {
        return v3.Make(v[0], v[1], v[2]);
    },
    ToString : function(v) {
        return '(' + v[0] + ', ' + v[1] + ', ' + v[2] + ')';
    },
    ToFixed : function(v, d) {
        return '(' + v[0].toFixed(d)
            + ', ' + v[1].toFixed(d)
            + ', ' + v[2].toFixed(d) + ')';
    },
    ToColorCode : function(v) {
        var ret = '#';
        for (var i = 0; i < 3; ++i) {
            var t = Math.ceil(clamp(v[i], 0, 1) * 255).toString(16);
            ret += t.length < 2 ? '0' + t : t;
        }
        return ret;
    },
};
v3.zero = v3.Makes(0);
v3.ones = v3.Makes(1);
v3.ex = v3.Make(1, 0, 0);
v3.ey = v3.Make(0, 1, 0);
v3.ez = v3.Make(0, 0, 1);
