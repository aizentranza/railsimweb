'use strict';
// 4x4 matrix functions.
var m44 = {
    set : function(dst,
                   a11, a12, a13, a14,
                   a21, a22, a23, a24,
                   a31, a32, a33, a34,
                   a41, a42, a43, a44)
    {
        dst[ 0] = a11; dst[ 1] = a12; dst[ 2] = a13; dst[ 3] = a14;
        dst[ 4] = a21; dst[ 5] = a22; dst[ 6] = a23; dst[ 7] = a24;
        dst[ 8] = a31; dst[ 9] = a32; dst[10] = a33; dst[11] = a34;
        dst[12] = a41; dst[13] = a42; dst[14] = a43; dst[15] = a44;
        return dst;
    },
    MakeUndef : function() {
        return new Float32Array(16);
    },
    Make : function(a11, a12, a13, a14,
                    a21, a22, a23, a24,
                    a31, a32, a33, a34,
                    a41, a42, a43, a44)
    {
        var dst = new Float32Array(16);
        dst[ 0] = a11; dst[ 1] = a12; dst[ 2] = a13; dst[ 3] = a14;
        dst[ 4] = a21; dst[ 5] = a22; dst[ 6] = a23; dst[ 7] = a24;
        dst[ 8] = a31; dst[ 9] = a32; dst[10] = a33; dst[11] = a34;
        dst[12] = a41; dst[13] = a42; dst[14] = a43; dst[15] = a44;
        return dst;
    },
    copy : function(dst, src)
    {
        dst[ 0] = src[ 0]; dst[ 1] = src[ 1];
        dst[ 2] = src[ 2]; dst[ 3] = src[ 3];
        dst[ 4] = src[ 4]; dst[ 5] = src[ 5];
        dst[ 6] = src[ 6]; dst[ 7] = src[ 7];
        dst[ 8] = src[ 8]; dst[ 9] = src[ 9];
        dst[10] = src[10]; dst[11] = src[11];
        dst[12] = src[12]; dst[13] = src[13];
        dst[14] = src[14]; dst[15] = src[15];
        return dst;
    },
    Dup : function(src)
    {
        var dst = new Float32Array(16);
        dst[ 0] = src[ 0]; dst[ 1] = src[ 1];
        dst[ 2] = src[ 2]; dst[ 3] = src[ 3];
        dst[ 4] = src[ 4]; dst[ 5] = src[ 5];
        dst[ 6] = src[ 6]; dst[ 7] = src[ 7];
        dst[ 8] = src[ 8]; dst[ 9] = src[ 9];
        dst[10] = src[10]; dst[11] = src[11];
        dst[12] = src[12]; dst[13] = src[13];
        dst[14] = src[14]; dst[15] = src[15];
        return dst;
    },
    GetRow : function(src, i)
    {
        i *= 4;
        return v4.Make(src[0 + i], src[1 + i], src[2 + i], src[3 + i]);
    },
    GetCol : function(src, i)
    {
        return v4.Make(src[0 + i], src[4 + i], src[8 + i], src[12 + i]);
    },
    setZero : function(dst)
    {
        dst.fill(0);
        return dst;
    },
    MakeZero : function(dst)
    {
        var dst = new Float32Array(16);
        return m44.setZero(dst);
    },
    setIdent : function(dst)
    {
        return m44.set(
            dst,
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1);
    },
    MakeIdent : function()
    {
        var dst = new Float32Array(16);
        return m44.setIdent(dst);
    },
    setMul34 : function(dst, lhs, rhs)
    {
        return m44.set(
            dst,
            lhs[ 0] * rhs[ 0] + lhs[ 1] * rhs[ 4] + lhs[ 2] * rhs[ 8],
            lhs[ 0] * rhs[ 1] + lhs[ 1] * rhs[ 5] + lhs[ 2] * rhs[ 9],
            lhs[ 0] * rhs[ 2] + lhs[ 1] * rhs[ 6] + lhs[ 2] * rhs[10],
            lhs[ 0] * rhs[ 3] + lhs[ 1] * rhs[ 7] + lhs[ 2] * rhs[11] + lhs[ 3],
            lhs[ 4] * rhs[ 0] + lhs[ 5] * rhs[ 4] + lhs[ 6] * rhs[ 8],
            lhs[ 4] * rhs[ 1] + lhs[ 5] * rhs[ 5] + lhs[ 6] * rhs[ 9],
            lhs[ 4] * rhs[ 2] + lhs[ 5] * rhs[ 6] + lhs[ 6] * rhs[10],
            lhs[ 4] * rhs[ 3] + lhs[ 5] * rhs[ 7] + lhs[ 6] * rhs[11] + lhs[ 7],
            lhs[ 8] * rhs[ 0] + lhs[ 9] * rhs[ 4] + lhs[10] * rhs[ 8],
            lhs[ 8] * rhs[ 1] + lhs[ 9] * rhs[ 5] + lhs[10] * rhs[ 9],
            lhs[ 8] * rhs[ 2] + lhs[ 9] * rhs[ 6] + lhs[10] * rhs[10],
            lhs[ 8] * rhs[ 3] + lhs[ 9] * rhs[ 7] + lhs[10] * rhs[11] + lhs[11],
            lhs[12] * rhs[ 0] + lhs[13] * rhs[ 4] + lhs[14] * rhs[ 8],
            lhs[12] * rhs[ 1] + lhs[13] * rhs[ 5] + lhs[14] * rhs[ 9],
            lhs[12] * rhs[ 2] + lhs[13] * rhs[ 6] + lhs[14] * rhs[10],
            lhs[12] * rhs[ 3] + lhs[13] * rhs[ 7] + lhs[14] * rhs[11] + lhs[15]);
    },
    Mul34 : function(lhs, rhs)
    {
        var dst = new Float32Array(16);
        return m44.setMul34(dst, lhs, rhs);
    },
    setPerspective : function(dst, fovy, aspect, near, far, offcent)
    {
        var f = Math.tan(cPI * 0.5 - 0.5 * fovy); // 1/tan
        var range_inv = 1.0 / (near - far);
        return m44.set(
            dst,
            f / aspect, 0, offcent ? offcent[0] : 0, 0,
            0         , f, offcent ? offcent[1] : 0, 0,
            0, 0, (near + far) * range_inv, 2 * near * far * range_inv,
            0, 0, -1, 0);
    },
    MakePerspective : function(fovy, aspect, near, far, offcent)
    {
        var dst = new Float32Array(16);
        return m44.setPerspective(dst, fovy, aspect, near, far, off_center);
    },
};
