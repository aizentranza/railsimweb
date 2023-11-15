'use strict';
// Scalar F32 wrapper.
var v1 = {
    Make : function(x) {
        var dst = new Float32Array(1);
        dst[0] = x;
        return dst;
    },
    Dup : function(src) {
        var dst = new Float32Array(1);
        dst[0] = src[0];
        return dst;
    },
};
// 2D vector math functions.
var v2 = {
    set : function(dst, x, y) {
        dst[0] = x; dst[1] = y;
        return dst;
    },
    sets : function(dst, x) {
        dst[0] = dst[1] = x;
        return dst;
    },
    MakeUndef : function() {
        return new Float32Array(2);
    },
    Make : function(x, y) {
        var dst = new Float32Array(2);
        dst[0] = x; dst[1] = y;
        return dst;
    },
    Makes : function(x) {
        var dst = new Float32Array(2);
        dst[0] = dst[1] = x;
        return dst;
    },
    copy : function(dst, src) {
        dst[0] = src[0]; dst[1] = src[1];
        return dst;
    },
    Dup : function(src) {
        var dst = new Float32Array(2);
        dst[0] = src[0]; dst[1] = src[1];
        return dst;
    },
    neg : function(dst) {
        dst[0] = -dst[0];
        dst[1] = -dst[1];
        return dst;
    },
    Neg : function(src) {
        var dst = new Float32Array(2);
        dst[0] = -src[0];
        dst[1] = -src[1];
        return dst;
    },
    setX : function(dst, x) {
        dst[0] = x;
        return dst;
    },
    SetX : function(src, x) {
        var dst = new Float32Array(2);
        dst[0] = x;
        dst[1] = src[1];
        return dst;
    },
    setY : function(dst, y) {
        dst[1] = y;
        return dst;
    },
    SetY : function(src, y) {
        var dst = new Float32Array(2);
        dst[0] = src[0];
        dst[1] = y;
        return dst;
    },
    addX : function(dst, x) {
        dst[0] += x;
        return dst;
    },
    AddX : function(src, x) {
        var dst = new Float32Array(2);
        dst[0] = src[0] + x;
        dst[1] = src[1];
        return dst;
    },
    addY : function(dst, y) {
        dst[1] += y;
        return dst;
    },
    AddY : function(src, y) {
        var dst = new Float32Array(2);
        dst[0] = src[0];
        dst[1] = src[1] + y;
        return dst;
    },
    add : function(lhs, rhs) {
        lhs[0] += rhs[0];
        lhs[1] += rhs[1];
        return lhs;
    },
    Add : function(lhs, rhs) {
        var dst = new Float32Array(2);
        dst[0] = lhs[0] + rhs[0];
        dst[1] = lhs[1] + rhs[1];
        return dst;
    },
    sub : function(lhs, rhs) {
        lhs[0] -= rhs[0];
        lhs[1] -= rhs[1];
        return lhs;
    },
    Sub : function(lhs, rhs) {
        var dst = new Float32Array(2);
        dst[0] = lhs[0] - rhs[0];
        dst[1] = lhs[1] - rhs[1];
        return dst;
    },
    mul : function(lhs, rhs) {
        lhs[0] *= rhs[0];
        lhs[1] *= rhs[1];
        return lhs;
    },
    Mul : function(lhs, rhs) {
        var dst = new Float32Array(2);
        dst[0] = lhs[0] * rhs[0];
        dst[1] = lhs[1] * rhs[1];
        return dst;
    },
    muls : function(lhs, rhs) {
        lhs[0] *= rhs;
        lhs[1] *= rhs;
        return lhs;
    },
    Muls : function(lhs, rhs) {
        var dst = new Float32Array(2);
        dst[0] = lhs[0] * rhs;
        dst[1] = lhs[1] * rhs;
        return dst;
    },
    div : function(lhs, rhs) {
        lhs[0] /= rhs[0];
        lhs[1] /= rhs[1];
        return lhs;
    },
    Div : function(lhs, rhs) {
        var dst = new Float32Array(2);
        dst[0] = lhs[0] / rhs[0];
        dst[1] = lhs[1] / rhs[1];
        return dst;
    },
    divs : function(lhs, rhs) {
        lhs[0] /= rhs;
        lhs[1] /= rhs;
        return lhs;
    },
    Divs : function(lhs, rhs) {
        var dst = new Float32Array(2);
        dst[0] = lhs[0] / rhs;
        dst[1] = lhs[1] / rhs;
        return dst;
    },
    IsZero : function(src) {
        return src[0] == 0 && src[1] == 0;
    },
    IsEqual : function(lhs, rhs) {
        return lhs[0] == rhs[0] && lhs[1] == rhs[1];
    },
    Length : function(src) {
        return Math.sqrt(src[0] * src[0] + src[1] * src[1]);
    },
    CalcDist : function(lhs, rhs) {
        return v2.Length(v2.Sub(lhs, rhs));
    },
    normalize : function(dst) {
        var length = this.Length(dst);
        if (length != 0) {
            dst[0] = dst[0] / length;
            dst[1] = dst[1] / length;
        } else {
            dst[0] = dst[1] = 0;
        }
        return dst;
    },
    Normalize : function(src) {
        return v2.normalize(v2.Dup(src));
    },
    Dot : function(lhs, rhs) {
        return lhs[0] * rhs[0] + lhs[1] * rhs[1];
    },
    setMid : function(dst, lhs, rhs) {
        return v2.set(dst,
                      (lhs[0] + rhs[0]) * 0.5,
                      (lhs[1] + rhs[1]) * 0.5);
    },
    Mid : function(lhs, rhs) {
        return v2.Make((lhs[0] + rhs[0]) * 0.5,
                       (lhs[1] + rhs[1]) * 0.5);
    },
    setLerp : function(dst, lhs, rhs, f) {
        var f0 = 1 - f;
        return v2.set(dst,
                      lhs[0] * f0 + rhs[0] * f,
                      lhs[1] * f0 + rhs[1] * f);
    },
    Lerp : function(lhs, rhs, f) {
        var f0 = 1 - f;
        return v2.Make(lhs[0] * f0 + rhs[0] * f,
                       lhs[1] * f0 + rhs[1] * f);
    },
    Min : function(lhs, rhs) {
        return v2.Make(lhs[0] < rhs[0] ? lhs[0] : rhs[0],
                       lhs[1] < rhs[1] ? lhs[1] : rhs[1]);
    },
    Max : function(lhs, rhs) {
        return v2.Make(lhs[0] > rhs[0] ? lhs[0] : rhs[0],
                       lhs[1] > rhs[1] ? lhs[1] : rhs[1]);
    },
    Clamp : function(v, min, max) {
        return v2.Make(v[0] < min[0] ? min[0] : (max[0] < v[0] ? max[0] : v[0]),
                       v[1] < min[1] ? min[1] : (max[1] < v[1] ? max[1] : v[1]));
    },
    Clamps : function(v, min, max) {
        return v2.Make(v[0] < min ? min : (max < v[0] ? max : v[0]),
                       v[1] < min ? min : (max < v[1] ? max : v[1]));
    },
    ToArray : function(v) {
        return [v[0], v[1]];
    },
    FromArray : function(v) {
        return v2.Make(v[0], v[1]);
    },
    ToString : function(v) {
        return '(' + v[0] + ', ' + v[1] + ')';
    },
    ToFixed : function(v, d) {
        return '(' + v[0].toFixed(d)
            + ', ' + v[1].toFixed(d) + ')';
    },
};
v2.zero = v2.Makes(0);
v2.ones = v2.Makes(1);
v2.ex = v2.Make(1, 0);
v2.ey = v2.Make(0, 1);
