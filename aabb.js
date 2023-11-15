'use strict';
// 3D AABB
var aabb3 = {
    set : function(dst, min, max) {
        v3.copy(dst[0], min); v3.copy(dst[1], max);
        return dst;
    },
    MakeUndef : function() {
        return [v3.Makes(0), v3.Makes(-1)];
    },
    Make : function(min, max) {
        return [v3.Dup(min), v3.Dup(max)];
    },
    Move : function(min, max) {
        return [min, max];
    },
    copy : function(dst, src) {
        v3.copy(dst[0], src[0]); v3.copy(dst[1], src[1]);
        return dst;
    },
    Dup : function(src) {
        return [v3.Dup(src[0]), v3.Dup(src[1])];
    },
    IsValid : function(v) {
        return v[0][0] <= v[1][0];
    },
    extendWith : function(dst, v) {
        if (aabb3.IsValid(dst)) {
            dst[0] = v3.Min(dst[0], v);
            dst[1] = v3.Max(dst[1], v);
        } else {
            aabb3.set(dst, v, v);
        }
        return dst;
    },
    MulMtx : function(v, mtx) {
        if (!mtx) { return v; }
        return [m34.MulV3(mtx, v[0]), m34.MulV3(mtx, v[1])];
    },
    CalcCenter : function(v, mtx)
    {
        var ret = v3.Mid(v[0], v[1]);
        if (mtx) { ret = m34.MulV3(mtx, ret); }
        return ret;
    },
    CalcBoundingSphere : function(v, mtx)
    {
        var tmp = aabb3.MulMtx(v, mtx);
        var center = v3.Mid(tmp[0], tmp[1]);
        var radius = v3.Length(v3.Sub(center, tmp[0]));
        return v4.Make(center[0], center[1], center[2], radius);
    },
    ToFixed : function(v, d)
    {
        return '[' + v3.ToFixed(v[0], d) + ', ' + v3.ToFixed(v[1], d) + ']';
    },
};
