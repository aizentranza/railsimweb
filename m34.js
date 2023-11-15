'use strict';
// 3x4 matrix functions.
var m34 = {
    set : function(dst,
                   a11, a12, a13, a14,
                   a21, a22, a23, a24,
                   a31, a32, a33, a34)
    {
        dst[ 0] = a11; dst[ 1] = a12; dst[ 2] = a13; dst[ 3] = a14;
        dst[ 4] = a21; dst[ 5] = a22; dst[ 6] = a23; dst[ 7] = a24;
        dst[ 8] = a31; dst[ 9] = a32; dst[10] = a33; dst[11] = a34;
        return dst;
    },
    MakeUndef : function() {
        return new Float32Array(12);
    },
    Make : function(a11, a12, a13, a14,
                    a21, a22, a23, a24,
                    a31, a32, a33, a34)
    {
        var dst = new Float32Array(12);
        dst[ 0] = a11; dst[ 1] = a12; dst[ 2] = a13; dst[ 3] = a14;
        dst[ 4] = a21; dst[ 5] = a22; dst[ 6] = a23; dst[ 7] = a24;
        dst[ 8] = a31; dst[ 9] = a32; dst[10] = a33; dst[11] = a34;
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
        return dst;
    },
    Dup : function(src)
    {
        var dst = new Float32Array(12);
        dst[ 0] = src[ 0]; dst[ 1] = src[ 1];
        dst[ 2] = src[ 2]; dst[ 3] = src[ 3];
        dst[ 4] = src[ 4]; dst[ 5] = src[ 5];
        dst[ 6] = src[ 6]; dst[ 7] = src[ 7];
        dst[ 8] = src[ 8]; dst[ 9] = src[ 9];
        dst[10] = src[10]; dst[11] = src[11];
        return dst;
    },
    GetRow : function(src, i)
    {
        i *= 4;
        return v4.Make(src[0 + i], src[1 + i], src[2 + i], src[3 + i]);
    },
    GetCol : function(src, i)
    {
        return v3.Make(src[0 + i], src[4 + i], src[8 + i]);
    },
    setZero : function(dst)
    {
        dst.fill(0);
        return dst;
    },
    MakeZero : function()
    {
        var dst = new Float32Array(12);
        dst.fill(0);
        return dst;
    },
    setIdent : function(dst)
    {
        return m34.set(
            dst,
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0);
    },
    MakeIdent : function()
    {
        var dst = new Float32Array(12);
        return m34.setIdent(dst);
    },
    RotV3 : function(lhs, rhs)
    {
        return v3.Make(
            lhs[ 0] * rhs[0] + lhs[ 1] * rhs[1] + lhs[ 2] * rhs[2],
            lhs[ 4] * rhs[0] + lhs[ 5] * rhs[1] + lhs[ 6] * rhs[2],
            lhs[ 8] * rhs[0] + lhs[ 9] * rhs[1] + lhs[10] * rhs[2]);
    },
    MulV3 : function(lhs, rhs)
    {
        return v3.Make(
            lhs[ 0] * rhs[0] + lhs[ 1] * rhs[1] + lhs[ 2] * rhs[2] + lhs[ 3],
            lhs[ 4] * rhs[0] + lhs[ 5] * rhs[1] + lhs[ 6] * rhs[2] + lhs[ 7],
            lhs[ 8] * rhs[0] + lhs[ 9] * rhs[1] + lhs[10] * rhs[2] + lhs[11]);
    },
    setMul : function(dst, lhs, rhs)
    {
        return m34.set(
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
            lhs[ 8] * rhs[ 3] + lhs[ 9] * rhs[ 7] + lhs[10] * rhs[11] + lhs[11]);
    },
    Mul : function(lhs, rhs)
    {
        var dst = new Float32Array(12);
        return m34.setMul(dst, lhs, rhs);
    },
    setST : function(dst, scale, trans)
    {
        return m34.set(
            dst,
            scale[0], 0, 0, trans[0],
            0, scale[1], 0, trans[1],
            0, 0, scale[2], trans[2]);
    },
    MakeST : function(scale, trans)
    {
        var dst = new Float32Array(12);
        return m34.setST(dst, scale, trans);
    },
    setRotX : function(dst, rx)
    {
        var sinx = Math.sin(rx), cosx = Math.cos(rx);
        return m34.set(
            dst,
            1,     0,    0, 0,
            0,  cosx, sinx, 0,
            0, -sinx, cosx, 0);
    },
    setRotY : function(dst, ry)
    {
        var siny = Math.sin(ry), cosy = Math.cos(ry);
        return m34.set(
            dst,
            cosy, 0, -siny, 0,
               0, 1,     0, 0,
            siny, 0,  cosy, 0);
    },
    setRotZ : function(dst, rz)
    {
        var sinz = Math.sin(rz), cosz = Math.cos(rz);
        return m34.set(
            dst,
             cosz, sinz, 0, 0,
            -sinz, cosz, 0, 0,
                0,    0, 1, 0);
    },
    setRotZXY : function(dst, r)
    {
        var sinx = Math.sin(r[0]), cosx = Math.cos(r[0]);
        var siny = Math.sin(r[1]), cosy = Math.cos(r[1]);
        var sinz = Math.sin(r[2]), cosz = Math.cos(r[2]);
        // RotX * RotZ
        //         cosz,         sinz,    0,
        // -cosx * sinz,  cosx * cosz, sinx,
        //  sinx * sinz, -sinx * cosz, cosx,
        return m34.set(
            dst,
            cosy * cosz - siny * sinx * sinz, cosy * sinz + siny * sinx * cosz, -siny * cosx, 0,
                                -cosx * sinz,                      cosx * cosz,         sinx, 0,
            siny * cosz + cosy * sinx * sinz, siny * sinz - cosy * sinx * cosz,  cosy * cosx, 0);
    },
    setRotZXYDeg : function(dst, r) { return m34.setRotZXY(dst, v3.Muls(r, cDeg2Rad)); },
    setSRT : function(dst, s, r, t)
    {
        var sinx = Math.sin(r[0]), cosx = Math.cos(r[0]);
        var siny = Math.sin(r[1]), cosy = Math.cos(r[1]);
        var sinz = Math.sin(r[2]), cosz = Math.cos(r[2]);
        return m34.set(
            dst,
            s[0] * (cosy * cosz - siny * sinx * sinz),
            s[1] * (cosy * sinz + siny * sinx * cosz),
            s[2] * -siny * cosx,
            t[0],
            s[0] * -cosx * sinz,
            s[1] * cosx * cosz,
            s[2] * sinx,
            t[1],
            s[0] * (siny * cosz + cosy * sinx * sinz),
            s[1] * (siny * sinz - cosy * sinx * cosz),
            s[2] * cosy * cosx,
            t[2]);
    },
    setSRTDeg : function(dst, s, r, t) { return m34.setSRT(dst, s, v3.Muls(r, cDeg2Rad), t); },
    MakeSRT : function(s, r, t)
    {
        var dst = new Float32Array(12);
        return m34.setSRT(dst, s, r, t);
    },
    MakeSRTDeg : function(s, r, t) { return m34.MakeSRT(s, v3.Muls(r, cDeg2Rad), t); },
    setOrtho : function(dst, dir, up, pos, scale)
    {
        scale = scale || v3.Makes(1);
        v3.normalize(dir)
        var left = v3.normalize(v3.Cross(up, dir));
        up = v3.normalize(v3.Cross(dir, left));
        return m34.set(
            dst,
            left[0] * scale[0],
            up  [0] * scale[1],
            dir [0] * scale[2],
            pos [0],
            left[1] * scale[0],
            up  [1] * scale[1],
            dir [1] * scale[2],
            pos [1],
            left[2] * scale[0],
            up  [2] * scale[1],
            dir [2] * scale[2],
            pos [2]);
    },
    MakeOrtho : function(dir, up, pos, scale)
    {
        var dst = new Float32Array(12);
        return m34.setOrtho(dst, dir, up, pos, scale);
    },
    setLookAt : function(dst, cam_pos, cam_at, up)
    {
        var vz = v3.normalize(v3.Sub(cam_pos, cam_at));
        var vx = v3.normalize(v3.Cross(up, vz));
        var vy = v3.normalize(v3.Cross(vz, vx));
        return m34.set(
            dst,
            vx[0], vx[1], vx[2], -v3.Dot(cam_pos, vx),
            vy[0], vy[1], vy[2], -v3.Dot(cam_pos, vy),
            vz[0], vz[1], vz[2], -v3.Dot(cam_pos, vz));
    },
    MakeLookAt : function(cam_pos, cam_at, up)
    {
        var dst = new Float32Array(12);
        return m34.setLookAt(dst, cam_pos, cam_at, up);
    },
    GetTrans : function(src) { return v3.Make(src[3], src[7], src[11]); },
    setTrans : function(dst, t) { dst[3]  = t[0]; dst[7]  = t[1]; dst[11]  = t[2]; },
    addTrans : function(dst, t) { dst[3] += t[0]; dst[7] += t[1]; dst[11] += t[2]; },
    subTrans : function(dst, t) { dst[3] -= t[0]; dst[7] -= t[1]; dst[11] -= t[2]; },
    Dump : function(src, d, label)
    {
        if (label) { Log(label + ':'); }
        Log('[0] ' + v4.ToFixed(m34.GetRow(src, 0), d));
        Log('[1] ' + v4.ToFixed(m34.GetRow(src, 1), d));
        Log('[2] ' + v4.ToFixed(m34.GetRow(src, 2), d));
    },
};
