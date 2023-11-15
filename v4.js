'use strict';
// 4D vector math functions.
var v4 = {
    set : function(dst, x, y, z, w) {
        dst[0] = x; dst[1] = y; dst[2] = z; dst[3] = w;
        return dst;
    },
    sets : function(dst, x) {
        dst[0] = dst[1] = dst[2] = dst[3] = x;
        return dst;
    },
    MakeUndef : function() {
        return new Float32Array(4);
    },
    Make : function(x, y, z, w) {
        var dst = new Float32Array(4);
        dst[0] = x; dst[1] = y; dst[2] = z; dst[3] = w;
        return dst;
    },
    Makes : function(x) {
        var dst = new Float32Array(4);
        dst[0] = dst[1] = dst[2] = dst[3] = x;
        return dst;
    },
    copy : function(src, dst) {
        dst[0] = src[0]; dst[1] = src[1]; dst[2] = src[2]; dst[3] = src[3];
        return dst;
    },
    Dup : function(src) {
        var dst = new Float32Array(4);
        dst[0] = src[0]; dst[1] = src[1]; dst[2] = src[2]; dst[3] = src[3];
        return dst;
    },
    neg : function(dst) {
        dst[0] = -src[0];
        dst[1] = -src[1];
        dst[2] = -src[2];
        dst[3] = -src[3];
        return dst;
    },
    Neg : function(src) {
        var dst = new Float32Array(4);
        dst[0] = -src[0];
        dst[1] = -src[1];
        dst[2] = -src[2];
        dst[3] = -src[3];
        return dst;
    },
    setX : function(dst, x) {
        dst[0] = x;
        return dst;
    },
    SetX : function(src, x) {
        var dst = new Float32Array(4);
        dst[0] = x;
        dst[1] = src[1];
        dst[2] = src[2];
        dst[3] = src[3];
        return dst;
    },
    setY : function(dst, y) {
        dst[1] = y;
        return dst;
    },
    SetY : function(src, y) {
        var dst = new Float32Array(4);
        dst[0] = src[0];
        dst[1] = y;
        dst[2] = src[2];
        dst[3] = src[3];
        return dst;
    },
    setZ : function(dst, z) {
        dst[2] = z;
        return dst;
    },
    SetZ : function(src, z) {
        var dst = new Float32Array(4);
        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = z;
        dst[3] = src[3];
        return dst;
    },
    setW : function(dst, w) {
        dst[3] = w;
        return dst;
    },
    SetW : function(src, w) {
        var dst = new Float32Array(4);
        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = src[2];
        dst[3] = w;
        return dst;
    },
    addX : function(dst, x) {
        dst[0] += x;
        return dst;
    },
    AddX : function(src, x) {
        var dst = new Float32Array(4);
        dst[0] = src[0] + x;
        dst[1] = src[1];
        dst[2] = src[2];
        dst[3] = src[3];
        return dst;
    },
    addY : function(dst, y) {
        dst[1] += y;
        return dst;
    },
    AddY : function(src, y) {
        var dst = new Float32Array(4);
        dst[0] = src[0];
        dst[1] = src[1] + y;
        dst[2] = src[2];
        dst[3] = src[3];
        return dst;
    },
    addZ : function(dst, z) {
        dst[2] += z;
        return dst;
    },
    AddZ : function(src, z) {
        var dst = new Float32Array(4);
        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = src[2] + z;
        dst[3] = src[3];
        return dst;
    },
    addW : function(dst, w) {
        dst[3] += w;
        return dst;
    },
    AddW : function(src, w) {
        var dst = new Float32Array(4);
        dst[0] = src[0];
        dst[1] = src[1];
        dst[2] = src[2];
        dst[3] = src[3] + w;
        return dst;
    },
    add : function(lhs, rhs) {
        lhs[0] += rhs[0];
        lhs[1] += rhs[1];
        lhs[2] += rhs[2];
        lhs[3] += rhs[3];
        return lhs;
    },
    Add : function(lhs, rhs) {
        var dst = new Float32Array(4);
        dst[0] = lhs[0] + rhs[0];
        dst[1] = lhs[1] + rhs[1];
        dst[2] = lhs[2] + rhs[2];
        dst[3] = lhs[3] + rhs[3];
        return dst;
    },
    sub : function(lhs, rhs) {
        lhs[0] -= rhs[0];
        lhs[1] -= rhs[1];
        lhs[2] -= rhs[2];
        lhs[3] -= rhs[3];
        return lhs;
    },
    Sub : function(lhs, rhs) {
        var dst = new Float32Array(4);
        dst[0] = lhs[0] - rhs[0];
        dst[1] = lhs[1] - rhs[1];
        dst[2] = lhs[2] - rhs[2];
        dst[3] = lhs[3] - rhs[3];
        return dst;
    },
    mul : function(lhs, rhs) {
        lhs[0] *= rhs[0];
        lhs[1] *= rhs[1];
        lhs[2] *= rhs[2];
        lhs[3] *= rhs[3];
        return lhs;
    },
    Mul : function(lhs, rhs) {
        var dst = new Float32Array(4);
        dst[0] = lhs[0] * rhs[0];
        dst[1] = lhs[1] * rhs[1];
        dst[2] = lhs[2] * rhs[2];
        dst[3] = lhs[3] * rhs[3];
        return dst;
    },
    muls : function(lhs, rhs) {
        lhs[0] *= rhs;
        lhs[1] *= rhs;
        lhs[2] *= rhs;
        lhs[3] *= rhs;
        return lhs;
    },
    Muls : function(lhs, rhs) {
        var dst = new Float32Array(4);
        dst[0] = lhs[0] * rhs;
        dst[1] = lhs[1] * rhs;
        dst[2] = lhs[2] * rhs;
        dst[3] = lhs[3] * rhs;
        return dst;
    },
    div : function(lhs, rhs) {
        lhs[0] /= rhs[0];
        lhs[1] /= rhs[1];
        lhs[2] /= rhs[2];
        lhs[3] /= rhs[3];
        return lhs;
    },
    Div : function(lhs, rhs) {
        var dst = new Float32Array(4);
        dst[0] = lhs[0] / rhs[0];
        dst[1] = lhs[1] / rhs[1];
        dst[2] = lhs[2] / rhs[2];
        dst[3] = lhs[3] / rhs[3];
        return dst;
    },
    divs : function(lhs, rhs) {
        lhs[0] /= rhs;
        lhs[1] /= rhs;
        lhs[2] /= rhs;
        lhs[3] /= rhs;
        return lhs;
    },
    Divs : function(lhs, rhs) {
        var dst = new Float32Array(4);
        dst[0] = lhs[0] / rhs;
        dst[1] = lhs[1] / rhs;
        dst[2] = lhs[2] / rhs;
        dst[3] = lhs[3] / rhs;
        return dst;
    },
    IsZero : function(src) {
        return src[0] == 0 && src[1] == 0 && src[2] == 0 && src[3] == 0;
    },
    IsEqual : function(lhs, rhs) {
        return lhs[0] == rhs[0] && lhs[1] == rhs[1]
            && lhs[2] == rhs[2] && lhs[3] == rhs[3];
    },
    setMid : function(dst, lhs, rhs) {
        return v4.set(dst,
                      (lhs[0] + rhs[0]) * 0.5,
                      (lhs[1] + rhs[1]) * 0.5,
                      (lhs[2] + rhs[2]) * 0.5,
                      (lhs[3] + rhs[3]) * 0.5);
    },
    Mid : function(lhs, rhs) {
        return v4.Make((lhs[0] + rhs[0]) * 0.5,
                       (lhs[1] + rhs[1]) * 0.5,
                       (lhs[2] + rhs[2]) * 0.5,
                       (lhs[3] + rhs[3]) * 0.5);
    },
    setLerp : function(dst, lhs, rhs, f) {
        var f0 = 1 - f;
        return v4.set(dst,
                      lhs[0] * f0 + rhs[0] * f,
                      lhs[1] * f0 + rhs[1] * f,
                      lhs[2] * f0 + rhs[2] * f,
                      lhs[3] * f0 + rhs[3] * f);
    },
    Lerp : function(lhs, rhs, f) {
        var f0 = 1 - f;
        return v4.Make(lhs[0] * f0 + rhs[0] * f,
                       lhs[1] * f0 + rhs[1] * f,
                       lhs[2] * f0 + rhs[2] * f,
                       lhs[3] * f0 + rhs[3] * f);
    },
    Min : function(lhs, rhs) {
        return v4.Make(lhs[0] < rhs[0] ? lhs[0] : rhs[0],
                       lhs[1] < rhs[1] ? lhs[1] : rhs[1],
                       lhs[2] < rhs[2] ? lhs[2] : rhs[2],
                       lhs[3] < rhs[3] ? lhs[3] : rhs[3]);
    },
    Max : function(lhs, rhs) {
        return v4.Make(lhs[0] > rhs[0] ? lhs[0] : rhs[0],
                       lhs[1] > rhs[1] ? lhs[1] : rhs[1],
                       lhs[2] > rhs[2] ? lhs[2] : rhs[2],
                       lhs[3] > rhs[3] ? lhs[3] : rhs[3]);
    },
    Clamp : function(v, min, max) {
        return v4.Make(v[0] < min[0] ? min[0] : (max[0] < v[0] ? max[0] : v[0]),
                       v[1] < min[1] ? min[1] : (max[1] < v[1] ? max[1] : v[1]),
                       v[2] < min[2] ? min[2] : (max[2] < v[2] ? max[2] : v[2]),
                       v[3] < min[3] ? min[3] : (max[3] < v[3] ? max[3] : v[3]));
    },
    Clamps : function(v, min, max) {
        return v4.Make(v[0] < min ? min : (max < v[0] ? max : v[0]),
                       v[1] < min ? min : (max < v[1] ? max : v[1]),
                       v[2] < min ? min : (max < v[2] ? max : v[2]),
                       v[3] < min ? min : (max < v[3] ? max : v[3]));
    },
    ToArray : function(v) {
        return [v[0], v[1], v[2], v[3]];
    },
    FromArray : function(v) {
        return v4.Make(v[0], v[1], v[2], v[3]);
    },
    FromV3 : function(v, w) {
        return v4.Make(v[0], v[1], v[2], w);
    },
    ToString : function(v) {
        return '(' + v[0] + ', ' + v[1] + ', ' + v[2] + ', ' + v[3] + ')';
    },
    ToFixed : function(v, d) {
        return '(' + v[0].toFixed(d)
            + ', ' + v[1].toFixed(d)
            + ', ' + v[2].toFixed(d)
            + ', ' + v[3].toFixed(d) + ')';
    },
};
v4.zero = v4.Makes(0);
v4.ones = v4.Makes(1);
v4.ex = v4.Make(1, 0, 0, 0);
v4.ey = v4.Make(0, 1, 0, 0);
v4.ez = v4.Make(0, 0, 1, 0);
v4.ew = v4.Make(0, 0, 0, 1);
v4.cWhite   = v4.Make(1, 1, 1, 1);
v4.cBlack   = v4.Make(0, 0, 0, 1);
v4.cGray    = v4.Make(0.5, 0.5, 0.5, 1);
v4.cRed     = v4.Make(1, 0, 0, 1);
v4.cGreen   = v4.Make(0, 1, 0, 1);
v4.cBlue    = v4.Make(0, 0, 1, 1);
v4.cMagenta = v4.Make(1, 0, 1, 1);
v4.cCyan    = v4.Make(0, 1, 1, 1);
v4.cYellow  = v4.Make(1, 1, 0, 1);
