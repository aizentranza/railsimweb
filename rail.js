'use strict';
var RailMetric = CreateInstance();
RailMetric.cWidth          = 0.065;
RailMetric.cHalfWidth      = RailMetric.cWidth * 0.5;
RailMetric.cHeight         = 0.15;
RailMetric.cGauge          = 1.067;
RailMetric.cGaugeStd       = 1.435;
RailMetric.cHalfGauge      = RailMetric.cGauge    * 0.5;
RailMetric.cHalfGaugeStd   = RailMetric.cGaugeStd * 0.5;
RailMetric.cHalfMidWidth   = RailMetric.cHalfWidth + RailMetric.cHalfGauge;
RailMetric.cHalfOuterWidth = RailMetric.cWidth + RailMetric.cHalfGauge;
RailMetric.cInterval       = (RailMetric.cWidth + RailMetric.cGauge) * 0.5;
RailMetric.cEndSign        = [-1, 1];
RailMetric.cBallastTopWidth        = 2.0;
RailMetric.cBallastBottomWidth     = 3.0;
RailMetric.cHalfBallastTopWidth    = RailMetric.cBallastTopWidth    * 0.5;
RailMetric.cHalfBallastBottomWidth = RailMetric.cBallastBottomWidth * 0.5;
RailMetric.cBallastSwitchOffset    = RailMetric.cHalfBallastTopWidth + RailMetric.cHalfGauge;
RailMetric.cBallastSwitchOffsetSub =
    RailMetric.cHalfBallastTopWidth - RailMetric.cHalfOuterWidth;
RailMetric.cBallastHeight          = 0.35;
RailMetric.cSlabWidth = (RailMetric.cBallastTopWidth + RailMetric.cBallastBottomWidth) * 0.5;
RailMetric.cHalfSlabWidth          = RailMetric.cSlabWidth * 0.5;
RailMetric.cTieInterval            = 0.5;
RailMetric.calcTieNum = function(len) {
    return Math.max(1, Math.round(len / RailMetric.cTieInterval))
};
RailMetric.cSafegeWidth               = 2.2;
RailMetric.cHalfSafegeWidth           = RailMetric.cSafegeWidth * 0.5
RailMetric.cSafegeInnerWidth          = 1.8;
RailMetric.cHalfSafegeInnerWidth      = RailMetric.cSafegeInnerWidth * 0.5
RailMetric.cSafegeOpenTopWidth        = 0.6;
RailMetric.cHalfSafegeOpenTopWidth    = RailMetric.cSafegeOpenTopWidth * 0.5;
RailMetric.cSafegeOpenBottomWidth     = 1.0;
RailMetric.cHalfSafegeOpenBottomWidth = RailMetric.cSafegeOpenBottomWidth * 0.5;
RailMetric.cSafegeSingleSideWidth     =
    (RailMetric.cSafegeWidth - RailMetric.cSafegeOpenTopWidth) / 2;
RailMetric.cSafegeSwitchWidth         =
    RailMetric.cSafegeWidth - RailMetric.cSafegeSingleSideWidth;
RailMetric.cHalfSafegeBorderWidth     =
    (RailMetric.cSafegeWidth + RailMetric.cSafegeInnerWidth) / 4;
RailMetric.cSafegeBottomHeight        = 0.3;
RailMetric.cSafegeMiddleHeight        = 1.0;
RailMetric.cSafegeBorderHeight        = 1.8;
RailMetric.cSafegeTopHeight           = 2.5;
RailMetric.cSafegeFloorHeight         = 0.5;
RailMetric.cSafegeCeilHeight          = 2.3;
RailMetric.cSafegeTongueCrossFactor   = 5;
RailMetric.cSafegeTongueCrossFactor2  = 3.5;
RailMetric.cSafegePartsOffsetY        = -4.0;
RailMetric.cAlwegWidth              = 0.85;
RailMetric.cHalfAlwegWidth          = RailMetric.cAlwegWidth * 0.5;
RailMetric.cAlwegMiddleWidth        = 0.55;
RailMetric.cHalfAlwegMiddleWidth    = RailMetric.cAlwegMiddleWidth * 0.5;
RailMetric.cAlwegBottomHeight       = -1.0;
RailMetric.cAlwegMiddleBottomHeight = -0.5;
RailMetric.cAlwegLowMiddleHeight    = -0.35;
RailMetric.cAlwegHighMiddleHeight   = 0.05;
RailMetric.cAlwegMiddleTopHeight    = 0.2;
RailMetric.cAlwegTopHeight          = 0.5;
RailMetric.cAlwegSwitchWidth        = 3;
RailMetric.cAlwegGirderOffsetY      = -1.5;
RailMetric.cGirderWidth      = 4.0;
RailMetric.cHalfGirderWidth  = RailMetric.cGirderWidth * 0.5;
RailMetric.cGirderHeight     = 1.5;
RailMetric.cHalfGirderHeight = RailMetric.cGirderHeight * 0.5;
RailMetric.cTunnelWidth      = 6.0;
RailMetric.cHalfTunnelWidth  = RailMetric.cTunnelWidth * 0.5;
RailMetric.cTunnelHeight     = 6.0;
RailMetric.cTunnelBottom     = 0.01;
RailMetric.cPierWidth      = 2.0;
RailMetric.cHalfPierWidth  = RailMetric.cPierWidth * 0.5;
RailMetric.cPierBeamHeight = 1.0;
RailMetric.cHalfPierBeamHeight = RailMetric.cPierBeamHeight * 0.5;
RailMetric.cPierSideOffset = 4.0;
RailMetric.cHalfPierBeamWidth = RailMetric.cPierSideOffset + RailMetric.cHalfPierWidth;
RailMetric.cPierIntervalDefault = 10.0;
RailMetric.cTotalHeight = RailMetric.cHeight + RailMetric.cBallastHeight;
function AddRailTotalHeight(pos, up) {
    return v3.add(v3.Muls(up ? up : v3.ey, RailMetric.cTotalHeight), pos);
}
var ControlPoint = CreateIDMgr();
ControlPoint.sID = 0;
ControlPoint.create = function(pos)
{
    var point = CreateInstance();
    point.mID = ControlPoint.addID();
    point.mPos = v3.Dup(pos);
    point.mRails = [null, null];
    point.mSwitchFrom = -1;
    return point;
};
ControlPoint.setDir = function(point, dir, up)
{
    point.mDir = v3.Dup(dir);
    point.mUp = v3.Dup(up ? up : v3.ey);
    point.mLeft = v3.normalize(v3.Cross(point.mUp, point.mDir));
    v3.normalize(v3.setCross(point.mUp, point.mDir, point.mLeft));
};
ControlPoint.setRail = function(point, point_side, rail)
{
    point.mRails[point_side] = rail;
};
ControlPoint.onDeleteRail = function(point, rail)
{
    for (var i = 0; i < point.mRails.length; ++i) {
        if (point.mRails[i] == rail) {
            point.mRails[i] = null;
        }
    }
};
ControlPoint.checkSide = function(point, rail)
{
    if (point.mRails[0] == rail) { return 0; }
    if (point.mRails[1] == rail) { return 1; }
    return -1;
};
ControlPoint.forEach = function(f, a_this)
{
    Rail.forEach(function(rail) {
        var impl = function(points) {
            for (var i = 0; i < points.length; ++i) {
                var point = points[i];
                if (!point) { continue; }
                var side = ControlPoint.checkSide(point, rail);
                if (side >= 0) {
                    if (side == 0 || !point.mRails[side ? 0 : 1]) {
                        f.apply(a_this, [point]);
                    }
                }
            }
        };
        impl(rail.mPoints);
        impl(rail.mSwitchPoints);
    }, a_this);
};
var Rail = CreateObjMgr();
Rail.onClear = function()
{
    Rail.sSwitchRails = [];
    Rail.sHiddenRails = [];
    Rail.sSignalBlocks = {};
};
Rail.onClear();
Rail.cRailOptions = [
    // Rail
    { m : 'CurveFactor' , s : 'curve_factor'  , },
    { m : 'RailFlag'    , s : 'rail_flag'     , },
    { m : 'RailType'    , s : 'rail_type'     , },
    { m : 'TieFlag'     , s : 'tie_flag'      , },
    { m : 'TieType'     , s : 'tie_type'      , },
    { m : 'GirderFlag'  , s : 'girder_flag'   , },
    { m : 'GirderType'  , s : 'girder_type'   , },
    { m : 'PierFlag'    , s : 'pier_flag'     , },
    { m : 'PierType'    , s : 'pier_type'     , },
    { m : 'PierInterval', s : 'pier_interval' , },
    { m : 'PierOffset'  , s : 'pier_offset'   , },
    { m : 'LeftPart'    , s : 'left_part'     , },
    { m : 'RightPart'   , s : 'right_part'    , },
    // Schedule
    { m : 'SignalName'  , s : 'signal'        , },
];
Rail.createData = function(rail)
{
    rail.mSegments = [[[], []], [[], []]];
    rail.mCurveLength = [[0, 0], [0, 0]];
    rail.mTrainInfo = [];
    rail.mStopTime = 0;
};
Rail.create = function(point0, point_side0, point1, point_side1)
{
    //Log('Rail.create(' + point0.mID + '[' + point_side0
    //    + '], ' + point1.mID + '[' + point_side1 + '])');
    var rail = Rail.createObj()
    this.createData(rail);
    rail.mPoints = [point0, point1];
    rail.mSwitchPoints = [null, null];
    rail.mSwitchInfos = [null, null];
    rail.mStationInfo = [];
    rail.mAlternateSwitchState = [0, 0];
    rail.mSignalName = '';
    this.cRailOptions.forEach(name =>
        rail['m' +  name.m] = RailBuilder['get' + name.m]());
    rail.mRailCounter          = -1;
    rail.mRailTieCounter       = -1;
    rail.mRailGirderCounter    = -1;
    rail.mRailLeftPartCounter  = -1;
    rail.mRailRightPartCounter = -1;
    rail.mRailLeftTnlCounter   = -1;
    rail.mRailRightTnlCounter  = -1;
    Rail.connect(rail, point0, point_side0, point1, point_side1);
    return rail;
};
Rail.pushTrain = function(rail, train)
{
    for (var i = 0; i < rail.mTrainInfo.length; ++i) {
        var info = rail.mTrainInfo[i];
        if (info.train != train) { return null; }
    }
    var sig_block = null;
    if (rail.mSignalName) {
        sig_block = this.sSignalBlocks[rail.mSignalName];
        if (sig_block) {
            for (var i = 0; i < sig_block.length; ++i) {
                var info = sig_block[i];
                if (info.train != train) { return null; }
            }
        } else {
            sig_block = this.sSignalBlocks[rail.mSignalName] = [];
        }
    }
    var info = { rail : rail, train : train, sig_block : sig_block, };
    rail.mTrainInfo.push(info);
    if (sig_block) { sig_block.push(info); }
    return info;
};
Rail.eraseTrainInfo = function(train_info)
{
    var rail = train_info.rail;
    if (train_info.sig_block) {
        for (var i = 0; i < train_info.sig_block.length; ++i) {
            var info = train_info.sig_block[i];
            if (info == train_info) {
                train_info.sig_block.splice(i, 1);
                break;
            }
        }
    }
    for (var i = 0; i < rail.mTrainInfo.length; ++i) {
        var info = rail.mTrainInfo[i];
        if (info == train_info) {
            rail.mTrainInfo.splice(i, 1);
            if (rail.mTrainInfo.length == 0) {
                rail.mStopTime = 0;
            }
            return;
        }
    }
};
Rail.onDeleteRail = function(rail, del_rail)
{
    for (var i = 0; i < rail.mPoints.length; ++i) {
        ControlPoint.onDeleteRail(rail.mPoints[i], del_rail);
        var spoint = rail.mSwitchPoints[i];
        if (spoint) { ControlPoint.onDeleteRail(spoint, del_rail); }
    }
};
Rail.checkEnd = function(rail, point)
{
    if (rail.mPoints[0] == point) { return 0; }
    if (rail.mPoints[1] == point) { return 1; }
    var sp0 = rail.mSwitchPoints[0], sp1 = rail.mSwitchPoints[1];
    if (sp0 && sp0 == point) { return 0; }
    if (sp1 && sp1 == point) { return 1; }
    return -1;
};
Rail.getConnection = function(rail, side, sw)
{
    var point = Rail.getPoint(rail, side, sw);
    var next_point_side = 1 - ControlPoint.checkSide(point, rail);
    return {
        point : point,
        point_side : next_point_side,
        rail : point.mRails[next_point_side],
    };
};
Rail.getPoint = function(rail, side, sw)
{
    return sw ? rail.mSwitchPoints[side] : rail.mPoints[side];
};
Rail.getPointAtt = function(rail, side)
{
    var point = rail.mPoints[side];
    var point_side = ControlPoint.checkSide(point, rail);
    var ret = {
        pos  : point.mPos ,
        up   : point.mUp  ,
        dir  : point.mDir ,
        left : point.mLeft,
    };
    if ((side ^ point_side) == 0) {
        ret.dir  = v3.Neg(ret.dir );
        ret.left = v3.Neg(ret.left);
    }
    return ret;
};
Rail.CalcCurve = function(seg0, seg1, func, args)
{
    if (!args || args.curve_factor === undefined) { debugger; }
    var pos0 = v3.Dup(seg0.pos), dir0 = v3.Dup(seg0.dir), up0 = v3.Dup(seg0.up);
    var pos1 = v3.Dup(seg1.pos), dir1 = v3.Dup(seg1.dir), up1 = v3.Dup(seg1.up);
    var flat_left0 = v3.normalize(v3.Cross(v3.ey, dir0)), flat_up0 = v3.Cross(dir0, flat_left0);
    var flat_left1 = v3.normalize(v3.Cross(v3.ey, dir1)), flat_up1 = v3.Cross(dir1, flat_left1);
    var cant_ratio0 = v3.Dot(flat_left0, up0) / v3.Dot(flat_up0, up0);
    var cant_ratio1 = v3.Dot(flat_left1, up1) / v3.Dot(flat_up1, up1);
    var diff_pp = v3.normalize(v3.Sub(pos1, pos0));
    var mid_factor = (1 + args.curve_factor) - v3.Dot(dir0, dir1) * args.curve_factor;
    var mid_factor0 = mid_factor + Math.max(0, -v3.Dot(dir0, diff_pp)) * 5;
    var mid_factor1 = mid_factor + Math.max(0, -v3.Dot(dir1, diff_pp)) * 5;
    var len = v3.CalcDist(pos0, pos1);
    var m0 = v3.Muls(dir0, len * (mid_factor0 * 0.25 + mid_factor1 * 0.75));
    var m1 = v3.Muls(dir1, len * (mid_factor0 * 0.75 + mid_factor1 * 0.25));
    if (args && args.out_m) { args.out_m[0] = m0; args.out_m[1] = m1; }
    function calc_curve(t) {
        var t2 = t * t, t3 = t2 * t;
        var h00 =  2 * t3 - 3 * t2     + 1;
        var h10 =      t3 - 2 * t2 + t    ;
        var h01 = -2 * t3 + 3 * t2        ;
        var h11 =      t3 -     t2        ;
        var out_pos = v3.Muls(pos0, h00);
        v3.add(out_pos, v3.Muls(m0  , h10));
        v3.add(out_pos, v3.Muls(pos1, h01));
        v3.add(out_pos, v3.Muls(m1  , h11));
        var h20 =  6 * t2 - 6 * t    ;
        var h30 =  3 * t2 - 4 * t + 1;
        var h21 = -6 * t2 + 6 * t    ;
        var h31 =  3 * t2 - 2 * t    ;
        var out_dir = v3.Muls(pos0, h20);
        v3.add(out_dir, v3.Muls(m0  , h30));
        v3.add(out_dir, v3.Muls(pos1, h21));
        v3.add(out_dir, v3.Muls(m1  , h31));
        v3.normalize(out_dir);
        var flat_left = v3.normalize(v3.Cross(v3.ey, out_dir));
        var out_fup = v3.Cross(out_dir, flat_left);
        var tmp_up = v3.add(v3.Muls(flat_left, cant_ratio0 * (1 - t) + cant_ratio1 * t), out_fup);
        var out_up = v3.normalize(v3.Cross(out_dir, v3.Cross(tmp_up, out_dir)));
        return { pos : out_pos, dir : out_dir, up : out_up, fup : out_fup, ratio : t, };
    }
    var cMinDiv = 0.1, cPosAccuracy = 0.025, cDirAccuracy = 0.2, cUpAccuracy = 0.1;
    var max_div = args && args.max_div;
    var rseg0 = { pos : pos0, dir : dir0, up : up0, fup : flat_up0, ratio : 0, };
    var rseg1 = { pos : pos1, dir : dir1, up : up1, fup : flat_up1, ratio : 1, };
    var splitters = args && args.splitters, i_splitter = 0;
    var splitter = splitters && splitters[i_splitter];
    var min_seg = rseg0; min_seg.acc_len = 0;
    function solve(max_seg) {
        var mid_pos = v3.Mid(min_seg.pos, max_seg.pos);
        var mid_dir = v3.Sub(max_seg.pos, min_seg.pos);
        var mid_seg = calc_curve((min_seg.ratio + max_seg.ratio) * 0.5);
        len = v3.Length(mid_dir); v3.divs(mid_dir, len);
        if (len < cMinDiv || (!max_div || len <= max_div) &&
            (v3.CalcDist(mid_pos, mid_seg.pos) < cPosAccuracy &&
             v3.CalcDist(mid_dir, mid_seg.dir) * len < cDirAccuracy
             && v3.CalcDist(min_seg.up, max_seg.up) < cUpAccuracy)) {
            max_seg.acc_len = min_seg.acc_len + len;
            var spl_seg0 = min_seg;
            while (splitter && splitter < max_seg.acc_len) {
                if (min_seg.acc_len < splitter) {
                    var spl_seg1 = calc_curve(
                        (min_seg.ratio * (max_seg.acc_len - splitter) +
                         max_seg.ratio * (splitter - min_seg.acc_len)) / len);
                    spl_seg1.acc_len = splitter;
                    if (func(spl_seg0, spl_seg1)) { return true; }
                    spl_seg0 = spl_seg1;
                }
                splitter = splitters && splitters[++i_splitter];
            }
            if (func(spl_seg0, max_seg)) { return true; }
            min_seg = max_seg;
        } else {
            if (solve(mid_seg)) { return true; }
            if (solve(max_seg)) { return true; }
        }
        return false;
    }
    return solve(rseg1);
};
Rail.CalcCurveWithPoints = function(rail, point0, point1, func, args)
{
    var seg0 = { pos : point0.mPos, dir : v3.Dup(point0.mDir), up : v3.Dup(point0.mUp), };
    var seg1 = { pos : point1.mPos, dir : v3.Dup(point1.mDir), up : v3.Dup(point1.mUp), };
    if (ControlPoint.checkSide(point0, rail) == 0) { v3.neg(seg0.dir); }
    if (ControlPoint.checkSide(point1, rail) == 1) { v3.neg(seg1.dir); }
    Rail.CalcCurve(seg0, seg1, func, args);
};
Rail.CalcCurveWithPoints2 = function(
    rail, point0, tpoint0, side0, point1, tpoint1, side1, func, args)
{
    var seg0 = { pos : tpoint0.mPos, dir : v3.Dup(tpoint0.mDir), up : v3.Dup(tpoint0.mUp), };
    var seg1 = { pos : tpoint1.mPos, dir : v3.Dup(tpoint1.mDir), up : v3.Dup(tpoint1.mUp), };
    if (ControlPoint.checkSide(point0, rail) == side0) { v3.neg(seg0.dir); }
    if (ControlPoint.checkSide(point1, rail) == side1) { v3.neg(seg1.dir); }
    Rail.CalcCurve(seg0, seg1, func, args);
};
Rail.calcCurve = function(rail, sw0, sw1, func, args)
{
    if (!args) { args = { curve_factor : rail.mCurveFactor, }; }
    var point0 = sw0 ? rail.mSwitchPoints[0] : rail.mPoints[0];
    var point1 = sw1 ? rail.mSwitchPoints[1] : rail.mPoints[1];
    Rail.CalcCurveWithPoints(rail, point0, point1, func, args);
};
Rail.bakeCurve = function(rail, sw0, tpoint0, sw1, tpoint1, args)
{
    var segments = [];
    rail.mSegments[sw0][sw1] = segments;
    var seg_id = 0, acc_len_ofs = 0, bake_acc_len = 0;
    function bake_segment(seg0, seg1) {
        function push_segment(s, is_first) {
            var seg = {
                pos : s.pos,
                dir : s.dir,
                up : s.up,
                acc_len : s.acc_len + acc_len_ofs,
            };
            segments.push(seg);
            bake_acc_len = s.acc_len;
        }
        if (seg_id++ == 0) {
            push_segment(seg0, true);
        }
        push_segment(seg1, false);
    }
    var splitters = args.splitters; args.splitters = undefined;
    var point0 = sw0 ? rail.mSwitchPoints[0] : rail.mPoints[0];
    var point1 = sw1 ? rail.mSwitchPoints[1] : rail.mPoints[1];
    if (!v3.IsEqual(point0.mPos, tpoint0.mPos)) {
        Rail.CalcCurveWithPoints2(
            rail, point0, point0, 0, point0, tpoint0, 0, bake_segment, args);
        acc_len_ofs = bake_acc_len;
    }
    Rail.CalcCurveWithPoints2(rail, point0, tpoint0, 0, point1, tpoint1, 1, bake_segment, args);
    acc_len_ofs += bake_acc_len;
    if (!v3.IsEqual(point1.mPos, tpoint1.mPos)) {
        Rail.CalcCurveWithPoints2(
            rail, point1, tpoint1, 1, point1, point1, 1, bake_segment, args);
        acc_len_ofs += bake_acc_len;
    }
    rail.mCurveLength[sw0][sw1] = acc_len_ofs;
    segments.forEach(seg => seg.len_ratio = seg.acc_len / acc_len_ofs);
    args.splitters = splitters;
};
Rail.traverseCurve = function(rail, func, is_reverse, ignore_switch)
{
    var sw0 = 0, sw1 = 0;
    if (rail.mDrawBlock && !ignore_switch) {
        sw0 = rail.mDrawBlock.mSwitchState[1];
        sw1 = rail.mDrawBlock.mSwitchState[0];
    }
    var segments = rail.mSegments[sw0][sw1], curve_len = rail.mCurveLength[sw0][sw1];
    var seg_num = segments.length;
    if (is_reverse) {
        for (var i = seg_num - 1; i > 0; --i) {
            if (func(segments[i - 1], segments[i], curve_len)) {
                return true;
            }
        }
    } else {
        for (var i = 1; i < seg_num; ++i) {
            if (func(segments[i - 1], segments[i], curve_len)) {
                return true;
            }
        }
    }
    return false;
};
Rail.setHighlightImpl = function(rail, fname)
{
    var drawer_set = rail ? this.getDrawerSet(rail) : null;
    function set_drawer_counter(drawer, ref_drawer, cnt) {
        drawer[fname](drawer_set && drawer_set[ref_drawer] == drawer ? rail[cnt] : 0);
    }
    set_drawer_counter(g_rail_drawer         , 'rail'  , 'mRailCounter'      );
    set_drawer_counter(g_rail_switch_drawer  , 'rail'  , 'mRailCounter'      );
    set_drawer_counter(g_safege_drawer       , 'rail'  , 'mRailCounter'      );
    set_drawer_counter(g_safege_switch_drawer, 'rail'  , 'mRailCounter'      );
    set_drawer_counter(g_alweg_drawer        , 'rail'  , 'mRailCounter'      );
    set_drawer_counter(g_alweg_switch_drawer , 'rail'  , 'mRailCounter'      );
    set_drawer_counter(g_rail_ballast_drawer , 'tie'   , 'mRailTieCounter'   );
    set_drawer_counter(g_rail_slab_drawer    , 'tie'   , 'mRailTieCounter'   );
    set_drawer_counter(g_rail_girder_drawer  , 'girder', 'mRailGirderCounter');
    set_drawer_counter(g_rail_tunnel_drawer  , 'girder', 'mRailGirderCounter');
    function set_part_counter(i, pname, cname, tcname) {
        var part = rail ? rail[pname] : null;
        function is_part_type(t) { return part && part.flag && part.type == t; }
        g_rail_platform_drawer[i][fname](is_part_type('plt'  ) ? rail[cname] : 0);
        g_rail_wall_drawer    [i][fname](is_part_type('wall' ) ? rail[cname] : 0);
        g_rail_floor_drawer   [i][fname](is_part_type('floor') ? rail[cname] : 0);
        g_rail_plt_tnl_drawer [i][fname](rail ? rail[tcname] : 0);
    }
    set_part_counter(0, 'mLeftPart' , 'mRailLeftPartCounter' , 'mRailLeftTnlCounter' );
    set_part_counter(1, 'mRightPart', 'mRailRightPartCounter', 'mRailRightTnlCounter');
}
Rail.setHighlight = function(rail)
{
    this.setHighlightImpl(rail, 'setHighlight');
};
Rail.setSelected = function(rail)
{
    this.setHighlightImpl(rail, 'setSelected');
};
Rail.calcSwitch = function(rail)
{
    var cSwitchSpeed = 0.05, block = rail.mDrawBlock;
    for (var i = 0; i < 2; ++i) {
        if (rail.mSwitchPoints[1 - i]||1) {
            var sw = block.mSwitchState[i];
            var anim = block.mSwitchAnim[i];
            if (sw) { anim = Math.max(-1, anim - cSwitchSpeed); }
            else    { anim = Math.min( 1, anim + cSwitchSpeed); }
            block.mSwitchAnim[i] = anim;
        }
    }
};
Rail.getDrawerSet = function(rail)
{
    var ret = {};
    if (rail.mRailFlag) {
        if (rail.mSwitchPoints[0] || rail.mSwitchPoints[1]) {
            ret.rail = rail.mRailType == 'safege' ? g_safege_switch_drawer
                : rail.mRailType == 'alweg' ? g_alweg_switch_drawer : g_rail_switch_drawer;
        } else {
            ret.rail = rail.mRailType == 'safege' ? g_safege_drawer
                : rail.mRailType == 'alweg' ? g_alweg_drawer : g_rail_drawer;
        }
    }
    if (rail.mTieFlag && (rail.mRailType == 'narrow' || rail.mRailType == 'standard')) {
        ret.tie = rail.mTieType == 'slab' ? g_rail_slab_drawer : g_rail_ballast_drawer;
    }
    if (rail.mGirderFlag) {
        ret.girder = rail.mGirderType == 'tunnel' ? g_rail_tunnel_drawer : g_rail_girder_drawer;
    }
    return ret;
};
Rail.write = function(rail)
{
    var drawer_set = Rail.getDrawerSet(rail);
    var parts_data = [{ i : 0, part : rail.mLeftPart, }, { i : 1, part : rail.mRightPart, }];
    parts_data.forEach(function(data) {
        var drawer_pair = !data.part.flag ? null
            : data.part.type == 'plt'   ? g_rail_platform_drawer
            : data.part.type == 'wall'  ? g_rail_wall_drawer
            : data.part.type == 'floor' ? g_rail_floor_drawer : null;
        if (drawer_pair) {
            data.drawer = drawer_pair[data.i];
            data.sign = 1 - data.i * 2;
            if (drawer_set.girder == g_rail_tunnel_drawer) {
                data.tnl_drawer = g_rail_plt_tnl_drawer[data.i];
                parts_data.push({ i : data.i, part : data.part, sign : data.sign,
                                  drawer : data.tnl_drawer, });
            }
        }
    });
    var pier_drawer = rail.mPierFlag ? g_rail_pier_drawer : null;
    var pier_interval = Math.max(RailMetric.cPierWidth * 0.5, rail.mPierInterval);
    var eps = 0.001, tongue_ratio = 0.4;
    var seg_id = 0, acc_len = 0, pier_acc_len = -1;
    function calc_length(seg0, seg1) {
        acc_len += v3.CalcDist(seg0.pos, seg1.pos);
    }
    var is_shift0 = 0, is_shift1 = 0, is_main = false;
    var frog_thres0 = 0, frog_thres1 = 0;
    var gap_pos0 = null, gap_pos1 = null, curve_end_pos = null;
    var cross_len0 = null, cross_len1 = null, cross_type = 0;
    var d_pivot_len0 = null, d_pivot_len1 = null, d_pivot_range = null;
    var d_pivot_pos = null, d_pivot_dir = null;
    var curve_len, curve_tie_num, ballast_tex_v_factor, is_switch;
    var is_curve_left = true, is_curve_right = true;
    var is_switch_from0 = null, is_switch_from1 = null;
    var base_points = [], switch_points = [], is_switch_rail, is_double_slip, is_same_side;
    var is_mono = rail.mRailType == 'safege' || rail.mRailType == 'alweg';
    var is_safege = rail.mRailType == 'safege';
    var is_alweg = rail.mRailType == 'alweg';
    var gauge_type = rail.mRailType == 'standard'
        ? RailGaugeType.cStandard : RailGaugeType.cNarrow;
    var gauge_ofs = gauge_type ? RailMetric.cHalfGaugeStd - RailMetric.cHalfGauge : 0;
    var ballast_switch_ofs = RailMetric.cBallastSwitchOffset + gauge_ofs * 2;
    function set_curve_len(acc_len) {
        curve_len = acc_len;
        curve_tie_num = RailMetric.calcTieNum(acc_len);
        ballast_tex_v_factor = curve_tie_num / acc_len;
    }
    function draw_segment(seg0, seg1) {
        var tongue_thres = acc_len * tongue_ratio;
        var mid_len = acc_len * 0.5, cBallastOffsetLen = 5;
        function push_segment(s, is_first) {
            function calc_dseg(pivot_len) {
                var spos = s.pos, sdir = s.dir;
                if (pivot_len) {
                    var r = smoothstep(0, 1, 1 - Math.abs(
                        s.acc_len - pivot_len) / d_pivot_range);
                    spos = v3.Lerp(spos, d_pivot_pos, r);
                    sdir = v3.Lerp(sdir, d_pivot_dir, r);
                }
                var left = v3.normalize(v3.Cross(s.up, sdir));
                var fleft = v3.normalize(v3.Cross(s.fup, sdir));
                return { pos : spos, left : left, up : s.up, fleft : fleft, fup : s.fup,
                         ballast_v : s.acc_len * ballast_tex_v_factor, };
            }
            var is_last = v3.IsEqual(s.pos, curve_end_pos);
            var args = { gauge : gauge_type, };
            var dseg = calc_dseg(null);
            //var dseg = calc_dseg(d_pivot_len1);
            if (!is_switch) {
                if (s.ballast_offset) {
                    args.ballast_ofs = [0, 0];
                    args.ballast_ofs[s.ballast_offset < 0 ? 0 : 1] = s.ballast_offset;
                } else if (switch_points[0] || switch_points[1]) {
                    var bofs1 = s.acc_len / acc_len, bofs0 = 1 - bofs1;
                    bofs0 *= bofs0; bofs1 *= bofs1;
                    args.ballast_ofs = [0, 0];
                    if (switch_points[0]) {
                        args.ballast_ofs[switch_points[0].mIsLeft < 0 ? 0 : 1] +=
                            bofs0 * switch_points[0].mIsLeft * (
                                ballast_switch_ofs * switch_points[0].mBallastOffsetScale
                                    - RailMetric.cBallastSwitchOffsetSub);
                    }
                    if (switch_points[1]) {
                        args.ballast_ofs[switch_points[1].mIsLeft > 0 ? 0 : 1] -=
                            bofs1 * switch_points[1].mIsLeft * (
                                ballast_switch_ofs * switch_points[1].mBallastOffsetScale
                                    - RailMetric.cBallastSwitchOffsetSub);
                    }
                }
                var old_pos = null;
                if (is_switch_from0 || is_switch_from1) {
                    old_pos = dseg.pos;
                    dseg.pos = v3.Sub(dseg.pos, v3.Muls(
                        dseg.up, Math.max(
                            is_switch_from0 ? 1 - Math.min(
                                1, s.acc_len / cBallastOffsetLen) : 0,
                            is_switch_from1 ? 1 - Math.min(
                                1, (acc_len - s.acc_len) / cBallastOffsetLen) : 0) * 0.01));
                }
                if (rail.mTieType == 'slab') { args.is_tie_switch = is_switch_rail; }
                if (drawer_set.tie) {
                    drawer_set.tie.pushSegment(dseg, args, is_first, is_last);
                }
                if (is_safege) { args.girder_ofs_y = RailMetric.cSafegePartsOffsetY; }
                else if (is_alweg) {
                    args.girder_ofs_y = RailMetric.cAlwegGirderOffsetY;
                    args.girder_ofs_y2 = -RailMetric.cAlwegGirderOffsetY;
                }
                if (drawer_set.girder) {
                    drawer_set.girder.pushSegment(dseg, args, is_first, is_last);
                }
                if (old_pos) { dseg.pos = old_pos; }
            }
            if (is_safege) { args.part_ofs_y = RailMetric.cSafegePartsOffsetY; }
            else if (is_alweg) { args.part_ofs_y = RailMetric.cAlwegBottomHeight; }
            parts_data.forEach(function(data) {
                if (!data.drawer) { return; }
                if (!(data.i ? is_curve_right : is_curve_left)) { return; }
                var metrics = data.part.metrics;
                var m_idx_f = (metrics.length - 1) * s.ratio;
                var m_idx = Math.floor(m_idx_f), m_idx_r = m_idx_f - m_idx;
                function lerp_metric(pname) {
                    var param0 = metrics[m_idx][pname];
                    return m_idx >= metrics.length - 1
                        ? param0 : lerp(param0, metrics[m_idx + 1][pname], m_idx_r);
                }
                args.part_ofs = data.sign * lerp_metric('offset');
                args.part_width = data.sign * lerp_metric('width');
                args.part_height = lerp_metric('height');
                data.drawer.pushSegment(dseg, args, is_first, is_last);
            });
            if (d_pivot_len0) { args.seg_l = calc_dseg(d_pivot_len0); }
            if (d_pivot_len1) { args.seg_r = calc_dseg(d_pivot_len1); }
            var dist0 = tongue_thres - s.acc_len;
            var dist1 = s.acc_len - (acc_len - tongue_thres);
            var dist0f = frog_thres0 - s.acc_len;
            var dist1f = s.acc_len - (acc_len - frog_thres1);
            if (is_shift0 && dist0 > 0 && is_main) {
                args.shift_x = is_shift0 * (dist0 / tongue_thres);
            }
            if (is_shift1 && dist1 > 0 && is_main) {
                args.shift_x = is_shift1 * (dist1 / tongue_thres);
            }
            if (is_safege) {
                var t_sf0 = is_switch_from0;
                var t_sf1 = is_same_side ? !is_switch_from1 : is_switch_from1;
                if (t_sf0 && t_sf1) {
                    args.no_wall0 = t_sf0 ? is_shift0 : 0;
                    args.no_wall1 = t_sf1 ? is_shift1 : 0;
                } else {
                    args.no_wall0 = t_sf0 ? 0 : is_shift0;
                    args.no_wall1 = t_sf1 ? 0 : is_shift1;
                }
                if (switch_points[1]) { args.tongue_ofs0 = 1 - s.acc_len / acc_len; }
                if (switch_points[0]) { args.tongue_ofs1 =     s.acc_len / acc_len; }
                if (t_sf0 && t_sf1) {
                    args.tongue_ex_ofs0 = v3.Muls(
                        rail.mDrawBlock.mTongueOffset0, args.tongue_ofs1
                            * RailMetric.cSafegeTongueCrossFactor2
                            * (is_same_side ? 1 : -1));
                    args.tongue_ex_ofs1 = v3.Muls(
                        rail.mDrawBlock.mTongueOffset1, -args.tongue_ofs0
                            * RailMetric.cSafegeTongueCrossFactor2);
                }
            } else if (is_alweg) {
                if (is_switch_rail) {
                    dseg.ratio = s.ratio;
                }
            } else {
                if (is_shift0 && (is_shift0 * is_shift1 <= 0 && dist1f > 0)
                    && (!is_main || !is_double_slip)) {
                    args.bend_x = is_shift0 * dist1f / frog_thres1;
                }
                if (is_shift1 && (is_shift0 * is_shift1 <= 0 && dist0f > 0)
                    && (!is_main || !is_double_slip)) {
                    args.bend_x = is_shift1 * dist0f / frog_thres0;
                }
                if (args.shift_x) {
                    if (s.acc_len < mid_len) { args.tongue_ofs0 = args.shift_x; }
                    else { args.tongue_ofs1 = args.shift_x; }
                }
            }
            if (cross_len0 && cross_len0 < s.acc_len && s.acc_len < cross_len1) {
                var cross_ratio = s.acc_len <= (gap_pos0 + gap_pos1) * 0.5
                    ? linearstep(cross_len0, gap_pos0, s.acc_len)
                    : linearstep(cross_len1, gap_pos1, s.acc_len);
                if ((s.acc_len <= gap_pos0) ^ !cross_type) {
                    args.shift_x =  cross_ratio;
                    args.bend_x  =  cross_ratio;
                } else {
                    args.shift_x = -cross_ratio;
                    args.bend_x  = -cross_ratio;
                }
                args.is_mid_gap = true;
            }
            if (gap_pos0 && gap_pos0 + eps <= s.acc_len && s.acc_len <= gap_pos1 + eps) {
                args.skip_seg = true;
            }
            if (drawer_set.rail) { drawer_set.rail.pushSegment(dseg, args, is_first, is_last); }
            if (IsEnableDebugDraw()) {
                function calc_side_pos(ds, x) {
                    return AddRailTotalHeight(v3.add(v3.Muls(
                        ds.left, RailMetric.cGauge * x), ds.pos), ds.up);
                }
                g_rail_debug_line_drawer.pushLine(
                    calc_side_pos(args.seg_l ? args.seg_l : dseg,  0.5),
                    calc_side_pos(args.seg_r ? args.seg_r : dseg, -0.5),
                    v4.Make(0, 1, 1, 1));
            }
        }
        if (seg_id++ == 0) {
            push_segment(seg0, true);
        }
        push_segment(seg1, false);
        if (pier_drawer && pier_acc_len >= 0) {
            while (pier_acc_len <= seg1.acc_len) {
                var pratio = (pier_acc_len - seg0.acc_len) / (seg1.acc_len - seg0.acc_len);
                var ppos = v3.Lerp(seg0.pos, seg1.pos, pratio), pier_top = ppos[1];
                var cMinPierTop = 0.1;
                var pier_bottom = FieldEditor.getFieldHeight(ppos);
                if (pier_bottom !== null && pier_top > pier_bottom + cMinPierTop) {
                    var p_ofs_y = 0;
                    if (is_safege) {
                        p_ofs_y = RailMetric.cSafegeTopHeight + RailMetric.cPierBeamHeight;
                    } else if (is_alweg) {
                        p_ofs_y = RailMetric.cAlwegBottomHeight;
                    } else {
                        p_ofs_y = -RailMetric.cHalfGirderHeight;
                    }
                    pier_top += p_ofs_y;
                    var ldir = v3.normalize(v3.Lerp(seg0.dir, seg1.dir, pratio));
                    var pdir = v3.normalize(v3.SetY(ldir, 0));
                    var pleft = v3.Cross(v3.ey, pdir);
                    function draw_pier(x_ofs) {
                        var pos2 = v3.add(v3.Muls(pleft, x_ofs), ppos), field_arg = {};
                        pos2[1] = FieldEditor.getFieldHeight(pos2, field_arg);
                        if (pos2[1] === null || pier_top <= pos2[1] + cMinPierTop) { return; }
                        pos2[1] -= RailMetric.cPierWidth / Math.sqrt(2) *
                            Math.sqrt(1 - square(field_arg.nrm[1]));
                        var pheight = pier_top - pos2[1];
                        pos2[1] += pheight * 0.5;
                        pier_drawer.pushBox(m34.MakeOrtho(
                            pdir, v3.ey, pos2, v3.Make(
                                RailMetric.cPierWidth, pheight, RailMetric.cPierWidth)),
                                            v4.Make(.7, .7, .7, 1));
                    }
                    function draw_beam(x0, x1) {
                        var bup = v3.normalize(v3.Cross(ldir, v3.Cross(v3.ey, ldir)));
                        pier_drawer.pushBox(m34.MakeOrtho(
                            ldir, bup,
                            v3.add(v3.SetY(ppos, pier_top + p_ofs_y * (1 / bup[1] - 1)),
                                   v3.Muls(pleft, (x0 + x1) * 0.5)),
                            v3.Make(Math.abs(x0 - x1),
                                    RailMetric.cPierBeamHeight, RailMetric.cPierWidth)),
                                            v4.Make(.7, .7, .7, 1));
                    }
                    if (rail.mPierType == 'center' &&
                        (Math.abs(ldir[1]) < 0.01 || drawer_set.girder)) {
                        draw_pier(0);
                    } else {
                        pier_top -= RailMetric.cHalfPierBeamHeight;
                        if (rail.mPierType == 'left') {
                            draw_pier(RailMetric.cPierSideOffset);
                            draw_beam(RailMetric.cHalfPierBeamWidth, -RailMetric.cHalfPierWidth);
                        } else if (rail.mPierType == 'right') {
                            draw_pier(-RailMetric.cPierSideOffset);
                            draw_beam(RailMetric.cHalfPierWidth, -RailMetric.cHalfPierBeamWidth);
                        } else if (rail.mPierType == 'both') {
                            draw_pier(RailMetric.cPierSideOffset);
                            draw_pier(-RailMetric.cPierSideOffset);
                            draw_beam(RailMetric.cHalfPierBeamWidth,
                                      -RailMetric.cHalfPierBeamWidth);
                        } else {
                            draw_pier(0);
                            draw_beam(RailMetric.cHalfPierWidth, -RailMetric.cHalfPierWidth);
                        }
                    }
                }
                pier_acc_len += pier_interval;
            }
        }
    }
    var point_att0 = Rail.getPointAtt(rail, 0);
    var point_att1 = Rail.getPointAtt(rail, 1);
    is_switch_rail = rail.mSwitchPoints[0] || rail.mSwitchPoints[1];
    is_double_slip = rail.mSwitchPoints[0] && rail.mSwitchPoints[1];
    var switch_lr = [0, 0];
    function copy_point(src, other, a_sign) {
        if (!src) { return null; }
        var a_side = a_sign > 0 ? 0 : 1;
        var ret = {
            mPos : src.mPos,
            mDir : src.mDir,
            mUp : src.mUp,
            mRails : src.mRails,
            mSwitchFrom : src.mSwitchFrom,
        };
        if (!other) { return ret; }
        var sign = ControlPoint.checkSide(src, rail) ? 1 : -1;
        var perp = v3.Muls(v3.Cross(v3.ey, src.mDir), sign);
        var left_dot = v3.Dot(perp, v3.normalize(
            v3.Sub(other.mPos, src.mPos)));
        var is_left = left_dot < 0 ? 1 : -1;
        var dir_dot = v3.Dot(src.mDir, other.mDir);
        if (src.mSwitchFrom >= 0) { switch_lr[a_side] = is_left; }
        ret.mIsLeft = is_left;
        ret.mBallastOffsetScale = 1 / Math.abs(dir_dot);
        if (is_double_slip && !is_mono) {
            function make_seg(l) {
                return {
                    pos : v3.Add(src.mPos, v3.Muls(ret.mDir, l)),
                    dir : ret.mDir, up : v3.Dup(src.mUp),
                    fup : v3.normalize(v3.Cross(ret.mDir, v3.Cross(v3.ey, ret.mDir))),
                    acc_len : 0,
                };
            }
            const appr_ofs = 0.75, appr_ofs1 = (appr_ofs + 2) / 3;
            var dir_sin = Math.sqrt(1 - dir_dot * dir_dot);
            acc_len = RailMetric.cWidth * 6 / dir_sin;
            var l1 = acc_len / 3, l2 = l1 * 2, l3 = acc_len;
            var seg0 = make_seg(0);
            var seg1 = make_seg(sign * l1);
            var seg2 = make_seg(sign * l3);
            seg_id = 0;
            if (src.mSwitchFrom < 0) {
                seg0.ballast_offset = -is_left * sign
                    * (ballast_switch_ofs * ret.mBallastOffsetScale
                       - RailMetric.cBallastSwitchOffsetSub);
                seg1.ballast_offset = -is_left * sign
                    * (ballast_switch_ofs * ret.mBallastOffsetScale * appr_ofs1
                       - RailMetric.cBallastSwitchOffsetSub);
                seg2.ballast_offset = -is_left * sign
                    * (ballast_switch_ofs * ret.mBallastOffsetScale * appr_ofs
                       - RailMetric.cBallastSwitchOffsetSub);
            }
            function draw_approach(s0, s1, s2) {
                set_curve_len(l3);
                is_switch = src.mSwitchFrom >= 0;
                curve_end_pos = s2.pos;
                draw_segment(s0, s1);
                draw_segment(s1, s2);
            }
            seg0.ratio = seg1.ratio = seg2.ratio = a_side;
            is_curve_left = !(is_curve_right = (is_left < 0) ^ a_side);
            if (sign > 0) {
                is_shift0 = 0; is_shift1 = is_left;
                frog_thres0 = l1;
                seg1.acc_len = l1;
                seg2.acc_len = l3;
                draw_approach(seg0, seg1, seg2);
            } else {
                is_shift1 = 0; is_shift0 = -is_left;
                frog_thres1 = l1;
                seg1.acc_len = l2;
                seg0.acc_len = l3;
                seg0.ratio = seg1.ratio = seg2.ratio = 1;
                draw_approach(seg2, seg1, seg0);
            }
            ret.mPos = v3.Add(ret.mPos, v3.Muls(ret.mDir, sign * l3));
            ret.mBallastOffsetScale *= appr_ofs;
        }
        return ret;
    }
    var switch_state = null, switch_anim = null;
    if (rail.mDrawBlock) {
        switch_state = rail.mDrawBlock.mSwitchState;
        switch_anim = rail.mDrawBlock.mSwitchAnim;
    }
    rail.mDrawBlock = null;
    if (is_switch_rail) {
        if (drawer_set.rail) {
            rail.mDrawBlock = drawer_set.rail.pushDrawBlock();
        } else {
            rail.mDrawBlock = { mSwitchState : [0, 0], };
        }
        if (switch_state) { rail.mDrawBlock.mSwitchState = switch_state; }
        if (switch_anim) { rail.mDrawBlock.mSwitchAnim = switch_anim; }
        Rail.sSwitchRails.push(rail);
    } else {
    }
    if (!rail.mRailFlag && !drawer_set.tie) {
        Rail.sHiddenRails.push(rail);
    }
    rail.mRailCounter = drawer_set.rail ? drawer_set.rail.getRailCounter() : -1;
    rail.mRailTieCounter = drawer_set.tie ? drawer_set.tie.getRailCounter() : -1;
    rail.mRailGirderCounter = drawer_set.girder ? drawer_set.girder.getRailCounter() : -1;
    function get_part_counter(i, cname, tcname) {
        var drawer = parts_data[i].drawer;
        rail[cname ] = drawer ? drawer.getRailCounter() : -1;
        var tdrawer = parts_data[i].tnl_drawer;
        rail[tcname] = tdrawer ? tdrawer.getRailCounter() : -1;
    }
    get_part_counter(0, 'mRailLeftPartCounter' , 'mRailLeftTnlCounter' );
    get_part_counter(1, 'mRailRightPartCounter', 'mRailRightTnlCounter');
    base_points = [
        copy_point(rail.mPoints[0], rail.mSwitchPoints[0],  1),
        copy_point(rail.mPoints[1], rail.mSwitchPoints[1], -1),
    ];
    switch_points = [
        copy_point(rail.mSwitchPoints[0], rail.mPoints[0],  1),
        copy_point(rail.mSwitchPoints[1], rail.mPoints[1], -1),
    ];
    is_main = true;
    if (is_switch_rail) {
        var cTongueOffset = RailMetric.cWidth;
        // @todo: calc for single slip
        function calc_ofs(tg_sp, tg_bp, tg_rp, ofs) {
            if (!tg_sp) { return v3.Makes(0); }
            var ret = v3.Sub(tg_sp.mPos, tg_bp.mPos);
            v3.sub(ret, v3.Muls(tg_rp.mUp , v3.Dot(tg_rp.mUp , ret)));
            v3.sub(ret, v3.Muls(tg_rp.mDir, v3.Dot(tg_rp.mDir, ret)));
            return v3.muls(v3.normalize(ret), ofs);
        }
        if (is_safege) {
            rail.mDrawBlock.mTongueOffset0 = calc_ofs(
                switch_points[1], base_points[1], base_points[0],
                RailMetric.cSafegeSwitchWidth * 0.5);
            rail.mDrawBlock.mTongueOffset1 = calc_ofs(
                switch_points[0], base_points[0], base_points[1],
                RailMetric.cSafegeSwitchWidth * 0.5);
        } else if (is_alweg) {
            function calc_curve_info(cp) {
                return { pos : cp.mPos, dir : cp.mDir, up : cp.mUp, };
            }
            rail.mDrawBlock.mBasePoint0 = calc_curve_info(base_points[0]);
            rail.mDrawBlock.mBasePoint1 = calc_curve_info(base_points[1]);
            rail.mDrawBlock.mSwitchPoint0 = calc_curve_info(
                switch_points[0] || base_points[0]);
            rail.mDrawBlock.mSwitchPoint1 = calc_curve_info(
                switch_points[1] || base_points[1]);
        } else {
            rail.mDrawBlock.mTongueOffset0 = calc_ofs(
                switch_points[1], base_points[1], base_points[0], cTongueOffset);
            rail.mDrawBlock.mTongueOffset1 = calc_ofs(
                switch_points[0], base_points[0], base_points[1], cTongueOffset);
        }
    }
    var args = { curve_factor : rail.mCurveFactor, };
    if (switch_points[0] || switch_points[1]) {
        if (is_alweg) { args.max_div = 4.0; }
        else {
            args.max_div = Math.max(
                v3.CalcDist(base_points[0].mPos, base_points[1].mPos) / 10,
                RailMetric.cGauge);
            if (is_double_slip) { args.max_div *= 0.5; }
        }
    }
    function calc_frog_len(dir0, dir1) {
        var dot = Math.abs(v3.Dot(dir0, dir1));
        var r = Math.sqrt(1 - dot * dot);
        return RailMetric.cWidth * 2 * dot / r;
    }
    var sp0 = switch_points[0], sp1 = switch_points[1];
    if (sp0) {
        is_shift1 = v3.Dot(v3.Sub(sp0.mPos, point_att0.pos), point_att0.left) < 0 ? 1 : -1;
        if (drawer_set.rail && !is_mono) {
            var frog_len = calc_frog_len(point_att0.dir, sp0.mDir);
            var sseg = { pos : point_att0.pos , left : point_att0.left, up : point_att0.up, };
            drawer_set.rail.pushSegment(sseg, { gauge : gauge_type, }, true, false);
            sseg.pos = v3.add(v3.Muls(point_att0.dir, frog_len * 0.5), point_att0.pos);
            drawer_set.rail.pushSegment(sseg, {
                shift_x : is_shift1, bend_x : is_shift1, gauge : gauge_type, }, false, false);
        }
    }
    if (sp1) {
        is_shift0 = v3.Dot(v3.Sub(sp1.mPos, point_att1.pos), point_att1.left) < 0 ? 1 : -1;
        if (drawer_set.rail && !is_mono) {
            var frog_len = calc_frog_len(point_att1.dir, sp1.mDir);
            var tmp_left = v3.Neg(point_att1.left);
            var sseg = { pos : point_att1.pos, left : tmp_left, up : point_att1.up, };
            drawer_set.rail.pushSegment(sseg, { gauge : gauge_type, }, true, false);
            sseg.pos = v3.add(v3.Muls(point_att1.dir, -frog_len * 0.5), point_att1.pos);
            drawer_set.rail.pushSegment(sseg, {
                shift_x : -is_shift0, bend_x : -is_shift0, gauge : gauge_type, }, false, false);
        }
    }
    is_same_side = is_shift0 * is_shift1 > 0;
    var s0 = is_shift0 < 0, s1 = is_shift1 < 0;
    var curve_infos = [];
    function calc_curves(func) {
        for (var i = 0; i <= 3; ++i) {
            var f0 = i & 1, f1 = (i >> 1) & 1;
            var tp0 = f0 ? switch_points[0] : base_points[0];
            var tp1 = f1 ? switch_points[1] : base_points[1];
            if (tp0 && tp1) {
                args.splitters = [];
                d_pivot_len0 = d_pivot_len1 = null;
                func(i, f0, tp0, f1, tp1);
            }
            if (i & 1) { is_shift0 = -is_shift0; }
            is_shift1 = -is_shift1;
        }
    }
    var lr0 = switch_lr[0], lr1 = switch_lr[1];
    calc_curves(function(i, f0, tp0, f1, tp1) {
        acc_len = 0;
        Rail.CalcCurveWithPoints(rail, tp0, tp1, calc_length, args);
        var curve_info = { acc_len : acc_len, };
        curve_infos[i] = curve_info;
        if (!is_double_slip) { return; }
        var mid_len  = acc_len * 0.5;
        var mid_pos  = v3.Makes(0);
        var mid_dir  = v3.Makes(0);
        var mid_left = v3.Makes(0);
        var acc_len2 = 0;
        function calc_mid_dir(seg0, seg1) {
            var delta = v3.CalcDist(seg0.pos, seg1.pos);
            if (mid_len <= acc_len2 + delta) {
                var r = (mid_len - acc_len2) / delta;
                v3.setLerp(mid_pos, seg0.pos, seg1.pos, r);
                v3.setLerp(mid_dir, seg0.dir, seg1.dir, r);
                v3.normalize(v3.setCross(mid_left, v3.ey, mid_dir));
                return true;
            }
            acc_len2 += delta;
        }
        Rail.CalcCurveWithPoints(rail, tp0, tp1, calc_mid_dir, args);
        //Log('mid_pos ['+i+'] = '+v3.ToFixed(mid_pos , 2));
        //Log('mid_dir ['+i+'] = '+v3.ToFixed(mid_dir , 2));
        //Log('mid_left['+i+'] = '+v3.ToFixed(mid_left, 2));
        curve_info.mid_pos  = mid_pos ;
        curve_info.mid_dir  = mid_dir ;
        curve_info.mid_left = mid_left;
    });
    var pivot_pos = null, pivot_dir = null, pivot_left = null;
    var primary_dir = null, secondary_dir = null, pivot_dot = 1;
    var mid_gap = 1.0;
    if (is_double_slip) {
        rail.mDrawBlock.mIsSameSide = is_same_side;
        pivot_pos  = v3.Makes(0);
        pivot_dir  = v3.Makes(0);
        pivot_left = v3.Makes(0);
        for (var i = 0; i <= 3; ++i) {
            var f0 = i & 1, f1 = (i >> 1) & 1;
            if (f0 ^ f1 ^ s0 ^ s1) {
                var curve_info = curve_infos[i];
                v3.add(pivot_pos, curve_info.mid_pos)
                v3.add(pivot_dir, curve_info.mid_dir)
                if (!primary_dir) {
                    primary_dir = curve_info.mid_dir;
                } else {
                    secondary_dir = curve_info.mid_dir;
                }
            }
        }
        v3.muls(pivot_pos, 0.5);
        v3.normalize(pivot_dir, 0.5);
        v3.setCross(pivot_left, v3.ey, pivot_dir);
        pivot_dot = v3.Dot(primary_dir, secondary_dir);
        //Log('pivot_pos ['+i+'] = '+v3.ToFixed(pivot_pos , 2));
        //Log('pivot_dir ['+i+'] = '+v3.ToFixed(pivot_dir , 2));
        //Log('pivot_left['+i+'] = '+v3.ToFixed(pivot_left, 2));
        var sin_theta = Math.sqrt(1 - pivot_dot * pivot_dot);
        mid_gap = RailMetric.cWidth / sin_theta * 1.5;
        rail.mDoubleSlipPivot = pivot_pos;
    } else {
        rail.mDoubleSlipPivot = null;
    }
    if (is_alweg && is_switch_rail) { args.out_m = []; }
    calc_curves(function(i, f0, tp0, f1, tp1) {
        is_curve_left  = (!lr0 || ((lr0 < 0) ^ f0)) && (!lr1 || !((lr1 < 0) ^ f1));
        is_curve_right = (!lr0 || ((lr0 > 0) ^ f0)) && (!lr1 || !((lr1 > 0) ^ f1));
        var curve_info = curve_infos[i];
        acc_len = curve_info.acc_len;
        pier_acc_len = i == 0 ? pier_interval * rail.mPierOffset : -1;
        set_curve_len(acc_len);
        is_switch = f0 || f1;
        seg_id = 0;
        frog_thres0 = frog_thres1 = 0;
        if (sp0 && !is_mono) {
            frog_thres0 = calc_frog_len(base_points[0].mDir, sp0.mDir);
            args.splitters.push(frog_thres0);
        }
        if (sp1 && !is_mono) {
            args.splitters.push(acc_len * tongue_ratio);
        }
        is_switch_from0 = tp0.mSwitchFrom >= 0;
        is_switch_from1 = tp1.mSwitchFrom >= 0;
        if (is_double_slip && (f0 ^ f1 ^ s0 ^ s1) && !is_mono) {
            gap_pos0 = acc_len * 0.5 - mid_gap * 0.5;
            gap_pos1 = acc_len * 0.5 + mid_gap * 0.5;
            cross_len0 = gap_pos0 - mid_gap * 1.2;
            cross_len1 = gap_pos1 + mid_gap * 1.2;
            args.splitters.push(cross_len0);
            //for(var i=1;i<10;++i){
            //    args.splitters.push((cross_len0*(10-i)+gap_pos0*i)/10);
            //}
            args.splitters.push(gap_pos0);
            args.splitters.push(gap_pos1);
            //for(var i=1;i<10;++i){
            //    args.splitters.push((gap_pos1*(10-i)+cross_len1*i)/10);
            //}
            args.splitters.push(cross_len1);
            if (f0 ^ s1) {
                d_pivot_len0 = gap_pos1;
                d_pivot_len1 = gap_pos0;
                cross_type = 0;
            } else {
                d_pivot_len0 = gap_pos0;
                d_pivot_len1 = gap_pos1;
                cross_type = 1;
            }
            //d_pivot_range = acc_len * 0.25;
            d_pivot_range = mid_gap;
            d_pivot_pos = pivot_pos;
            d_pivot_dir = pivot_dir;
        } else {
            gap_pos0 = gap_pos1 = null;
            cross_len0 = cross_len1 = null;
        }
        if (sp0 && !is_mono) {
            args.splitters.push(acc_len * (1 - tongue_ratio));
        }
        if (sp1 && !is_mono) {
            frog_thres1 = calc_frog_len(base_points[1].mDir, sp1.mDir);
            args.splitters.push(acc_len - frog_thres1);
        }
        if (args.splitters) { args.splitters.sort(function(a, b) { return a - b; }); }
        Rail.bakeCurve(rail, f0, tp0, f1, tp1, args);
        curve_end_pos = tp1.mPos;
        Rail.CalcCurveWithPoints(rail, tp0, tp1, draw_segment, args);
        if (args.out_m) {
            if (f0) {
                rail.mDrawBlock.mSwitchPoint0.dir = args.out_m[0];
            } else {
                rail.mDrawBlock.mBasePoint0.dir = args.out_m[0];
                rail.mDrawBlock.mSwitchPoint0.dir ||= args.out_m[0];
            }
            if (f1) {
                rail.mDrawBlock.mSwitchPoint1.dir = args.out_m[1];
            } else {
                rail.mDrawBlock.mBasePoint1.dir = args.out_m[1];
                rail.mDrawBlock.mSwitchPoint1.dir ||= args.out_m[1];
            }
        }
    });
    if (drawer_set.rail  ) { drawer_set.rail  .incrementRailCounter(); }
    if (drawer_set.tie   ) { drawer_set.tie   .incrementRailCounter(); }
    if (drawer_set.girder) { drawer_set.girder.incrementRailCounter(); }
    parts_data.forEach(function(data) {
        if (data.drawer) { data.drawer.incrementRailCounter(); }
    });
};
Rail.writeDynamic = function(rail)
{
    for (var i = 0; i <= 3; ++i) {
        var f0 = i & 1, f1 = (i >> 1) & 1;
        var tp0 = f0 ? rail.mSwitchPoints[0] : rail.mPoints[0];
        var tp1 = f1 ? rail.mSwitchPoints[1] : rail.mPoints[1];
        if (tp0 && tp1) {
            Rail.CalcCurveWithPoints(rail, tp0, tp1, function(seg0, seg1) {
                g_line_drawer.pushLine(
                    v3.add(v3.Muls(v3.ey, RailMetric.cTotalHeight), seg0.pos),
                    v3.add(v3.Muls(v3.ey, RailMetric.cTotalHeight), seg1.pos),
                    v4.Make(RailBuilder.mNearestRail == rail ? 1 : 0,
                            RailBuilder.mSelectedRail == rail ? 1 : 0,
                            0, 1));
            });
        }
    }
};
Rail.proceed = function(anc, dist, args)
{
    if (!args) { args = {}; }
    anc = RailAnchor.copy(anc);
    var ret = {}, rail0 = anc.mRail;
    function reserve_rail(t_rail) {
        var already = false;
        if (t_rail) {
            if (t_rail.mTrainInfo.length > 0) { already = true; }
            var reserve = Rail.pushTrain(t_rail, args.train);
            if (!reserve) {
                ret.mIsBlocked = true;
                if (args.is_sensor) {
                    ret.mRail = con.rail;
                    ret.mPos = v3.Dup(con.point.mPos);
                }
                return null;
            }
            args.rail_reserves.push(reserve);
        }
        return { is_already_reserved : already, };
    }
    var reserve_ret = reserve_rail(rail0)
    if (!reserve_ret) { return ret; }
    while (true)
    {
        if (args.is_sensor && !reserve_ret.is_already_reserved) {
            var settings = con.rail.mStationInfo;
            if (settings && settings.length >= 1) {
                var setting = null, set_dir = anc.mDirSide;
                for (var i = 0; i < settings.length; ++i) {
                    var tset = settings[i];
                    if ((!tset.train_id || args.train.mID == tset.train_id) && (
                        tset.direction == 'all' || tset.direction == (set_dir ? '0' : '1'))) {
                        setting = tset;
                    }
                }
                if (setting && setting.stop) {
                    //Log('train ' + args.train.mID + ' start stop');
                    anc.mRail.mStopTime = setting.duration
                        + Math.random() * setting.duration_rnd;
                    anc.mRail.mStopOffset = setting.offset;
                    anc.mRail.mIsTurnaround = setting.turnaround;
                }
            }
        }
        var is_reverse = anc.mDirSide ? dist < 0 : dist > 0;
        var s_ratio = 1 - anc.mRail.mStopOffset, prev_ratio = 0;
        Rail.traverseCurve(anc.mRail, function(seg0, seg1, curve_len) {
            if (args.is_override_switch && anc.mRail.mStopTime > 0) {
                var t_ratio = is_reverse ? 1 - seg0.len_ratio : seg1.len_ratio;
                if (s_ratio <= t_ratio) {
                    var i_ratio = (s_ratio - prev_ratio) / (t_ratio - prev_ratio);
                    if (is_reverse) { i_ratio = 1 - i_ratio; }
                    var ipos = v3.Lerp(seg0.pos, seg1.pos, i_ratio);
                    if (v3.CalcDist(ipos, anc.mPos) <= Math.abs(dist) + 0.01) {
                        //Log('train ' + args.train.mID + ' stopping ' + args.is_sensor);
                        ret.mIsBlocked = true;
                        ret.mRail = args.train.mSpeed == 0 ? null : anc.mRail;
                        ret.mPos = ipos;
                        ret.mDir = v3.Lerp(seg0.dir, seg1.dir, i_ratio);
                        if (is_reverse) { v3.neg(ret.mDir); }
                        ret.mUp = v3.Dup(anc.mUp);
                        if (args.train.mSpeed == 0) {
                            //Log('train ' + args.train.mID + ' waiting');
                            anc.mRail.mStopTime -= 1 / cFPS;
                            if (anc.mRail.mStopTime <= 0) {
                                if (anc.mRail.mIsTurnaround) { Train.reverse(args.train); }
                            }
                        }
                        return true;
                    }
                }
                prev_ratio = t_ratio;
            }
            var p0 = seg0.pos, d0 = seg0.dir, u0 = seg0.up;
            var p1 = seg1.pos, d1 = seg1.dir, u1 = seg1.up;
            var diff10 = v3.Sub(p1, p0), dist10 = v3.Length(diff10);
            var base_dot = v3.Dot(diff10, anc.mDir);
            if (anc.mDirSide ? base_dot < 0 : base_dot > 0) { return; }
            var diff0 = v3.Sub(p0, anc.mPos), dist0 = v3.Length(diff0);
            var diff1 = v3.Sub(p1, anc.mPos), dist1 = v3.Length(diff1);
            if (v3.Dot(anc.mDir, diff0) < 0) { dist0 = -dist0; }
            if (v3.Dot(anc.mDir, diff1) < 0) { dist1 = -dist1; }
            if (!(dist0 <= dist && dist <= dist1 ||
                  dist1 <= dist && dist <= dist0)) {
                return;
            }
            var m0 = v3.Muls(d0, dist10), m1 = v3.Muls(d1, dist10);
            var s = (dist - dist0) / (dist1 - dist0);
            function calc_curve(t, out_dir, out_up) {
                var t2 = t * t, t3 = t2 * t;
                var h00 =  2 * t3 - 3 * t2     + 1;
                var h10 =      t3 - 2 * t2 + t    ;
                var h01 = -2 * t3 + 3 * t2        ;
                var h11 =      t3 -     t2        ;
                var ret = v3.Muls(p0, h00);
                v3.add(ret, v3.Muls(m0, h10));
                v3.add(ret, v3.Muls(p1, h01));
                v3.add(ret, v3.Muls(m1, h11));
                var h20 =  6 * t2 - 6 * t    ;
                var h30 =  3 * t2 - 4 * t + 1;
                var h21 = -6 * t2 + 6 * t    ;
                var h31 =  3 * t2 - 2 * t    ;
                v3.muls(v3.copy(out_dir, p0), h20);
                v3.add(out_dir, v3.Muls(m0, h30));
                v3.add(out_dir, v3.Muls(p1, h21));
                v3.add(out_dir, v3.Muls(m1, h31));
                v3.normalize(out_dir);
                v3.add(v3.muls(v3.copy(out_up, u0), h00), v3.Muls(u1, h01));
                v3.normalize(v3.Cross(out_dir, v3.Cross(out_up, out_dir)));
                return ret;
            }
            ret.mRail = anc.mRail;
            ret.mDir = v3.Makes(0);
            ret.mUp  = v3.Makes(0);
            ret.mPos = calc_curve(s, ret.mDir, ret.mUp);
            if (!anc.mDirSide) { v3.neg(ret.mDir); }
            return true;
        }, is_reverse);
        if (ret.mRail || ret.mIsBlocked) { break; }
        var rail_end = anc.mDirSide;
        if (dist < 0) { rail_end = 1 - rail_end; }
        var sw = 0;
        if (anc.mRail.mSwitchPoints[rail_end]) {
            var sw_side = 1 - rail_end;
            sw = anc.mRail.mDrawBlock.mSwitchState[sw_side];
        }
        var con = Rail.getConnection(anc.mRail, rail_end, sw);
        if (!con.rail) {
            if (args.is_sensor) {
                //ret.mRail = anc.mRail;
                ret.mPos = v3.Dup(con.point.mPos);
            }
            break;
        }
        if (con.rail == rail0) { break; }
        reserve_ret = reserve_rail(con.rail);
        if (!reserve_ret) { break; }
        if (args.is_override_switch) {
            var end2 = Rail.checkEnd(con.rail, con.point), sw_end2 = 1 - end2;
            if (con.rail.mSwitchPoints[sw_end2]) {
                var state = con.rail.mDrawBlock.mSwitchState, sw2 = state[end2];
                var settings = con.rail.mSwitchInfos[sw_end2], set_sw = 0;
                if (settings && settings.length >= 1) {
                    var setting = settings[0];
                    for (var i = 1; i < settings.length; ++i) {
                        if (args.train.mID == settings[i].train_id) { setting = settings[i]; }
                    }
                    if (setting.schedule == 'alt' || setting.schedule == 'rnd') {
                        if (!reserve_ret.is_already_reserved) {
                            if (setting.schedule == 'alt') {
                                con.rail.mAlternateSwitchState[sw_end2] =
                                    1 - con.rail.mAlternateSwitchState[sw_end2];
                            } else if (setting.schedule == 'rnd') {
                                con.rail.mAlternateSwitchState[sw_end2] =
                                    Math.random() < 0.5 ? 0 : 1;
                            }
                        }
                        set_sw = con.rail.mAlternateSwitchState[sw_end2];
                    } else {
                        set_sw = setting.schedule == 'sub' ? 1 : 0;
                    }
                }
                if (sw2 != set_sw) {
                    state[end2] = set_sw;
                    //Log('Turn switch: rail[' + con.rail.mID
                    //    + '].end[' + end2 + '] => ' + state[end2]);
                }
            }
            if (con.rail.mSwitchPoints[end2]) {
                var state = con.rail.mDrawBlock.mSwitchState;
                var sw2 = state[sw_end2];
                var con2 = Rail.getConnection(con.rail, end2, sw2);
                if (con2.rail != anc.mRail) {
                    state[sw_end2] = 1 - sw2;
                    //Log('Override switch: rail[' + con.rail.mID
                    //    + '].end[' + sw_end2 + '] => ' + state[sw_end2]);
                }
            }
        }
        anc.mRail = con.rail;
        var next_rail_end = Rail.checkEnd(anc.mRail, con.point);
        if (next_rail_end < 0) { break; }
        if (next_rail_end == rail_end) { anc.mDirSide = 1 - anc.mDirSide; }
    }
    ret.mDirSide = anc.mDirSide;
    return ret;
};
Rail.connect = function(rail, point0, point_side0, point1, point_side1)
{
    ControlPoint.setRail(point0, point_side0, rail);
    ControlPoint.setRail(point1, point_side1, rail);
};
Rail.deleteRail = function(rail)
{
    if (Rail.eraseObj(rail)) {
        for (var i = 0; i < 2; ++i) {
            if (rail.mSwitchPoints[i]) {
                rail.mSwitchPoints[i].mSwitchFrom = -1;
            }
        }
        Rail.forEach(function(rail2) {
            Rail.onDeleteRail(rail2, rail);
        });
    }
};
Rail.setSwitchPoint = function(rail, side, point)
{
    rail.mSwitchPoints[side] = point;
    if (point) {
        point.mSwitchFrom = 1 - side;
        point.mRails[point.mSwitchFrom] = rail;
    }
};
Rail.calcSwitchAll = function()
{
    if (IsPause()) { return; }
    Rail.sSwitchRails.forEach(Rail.calcSwitch, this);
};
Rail.writeDynamicAll = function()
{
    if (!IsEnableDebugDraw()) { return; }
    if (!IsEditorMode()) { // check switch point dir
        Rail.forEach(function(rail) {
            for (var i = 0; i < 2; ++i) {
                var sp = rail.mSwitchPoints[i];
                if (sp) {
                    var tp = AddRailTotalHeight(sp.mPos);
                    DrawArrow(tp, v3.Add(tp, sp.mDir), 0.2, v4.Make(1 - i, i, 0, 1));
                }
            }
        });
    }
    Rail.sHiddenRails.forEach(Rail.writeDynamic, this);
};
Rail.writeAll = function()
{
    var gl = g_canvas.getContext();
    ForEachRailDrawer(drawer => drawer.beginWrite());
    Rail.sSwitchRails = [];
    Rail.sHiddenRails = [];
    Rail.forEach(Rail.write);
    ForEachRailDrawer(drawer => drawer.endWrite(gl));
};
Rail.searchNearestEnd = function(wpos, hit_scale)
{
    hit_scale = (hit_scale ? hit_scale : 1) * g_touch_hit_scale;
    var ret = { rail : null, side : -1, sw : 0, dist : -1, };
    Rail.forEach(function(rail) {
        for (var side = 0; side < 2; ++side) {
            for (var sw = 0; sw < 2; ++sw) {
                var point = Rail.getPoint(rail, side, sw);
                if (!point) { continue; }
                var point_side = ControlPoint.checkSide(point, rail);
                var ofs = RailMetric.cWidth * RailMetric.cEndSign[point_side];
                var epos = v3.add(v3.Muls(point.mDir, ofs), point.mPos);
                //var dist = v3.CalcDist(wpos, epos);
                var dist = g_camera.calcSphereIntersection(
                    g_cursor_ray, v4.FromV3(epos, RailMetric.cGauge * hit_scale));
                if (dist >= 0 && (!ret.rail || dist < ret.dist)) {
                    ret.rail = rail;
                    ret.side = side;
                    ret.sw   = sw  ;
                    ret.dist = dist;
                }
            }
        }
    });
    return ret;
};
Rail.searchNearestRail = function(wpos)
{
    var ret = { rail : null, dist : -1, pos : null, dir : null, up : null, };
    Rail.forEach(function(rail) {
        Rail.traverseCurve(rail, function(seg0, seg1) {
            var pos0 = seg0.pos, pos1 = seg1.pos;
            var res = g_camera.calcCapsuleIntersection(
                g_cursor_ray, pos0, pos1, RailMetric.cGauge * g_touch_hit_scale);
            if (res && (!ret.rail || res.dist < ret.dist)) {
                var dist10 = v3.Length(v3.Sub(pos1, pos0));
                ret.rail = rail;
                ret.dist = res.dist;
                ret.pos = res.pos;
                var ofs_ratio = res.ofs / dist10;
                ret.dir = v3.normalize(v3.Lerp(seg0.dir, seg1.dir, ofs_ratio));
                ret.up = v3.normalize(v3.Lerp(seg0.up, seg1.up, ofs_ratio));
            }
        });
    });
    return ret;
};
Rail.getInterpolatedPos = function(rail, ratio)
{
    var ret = null, prev_ratio = 0;
    Rail.traverseCurve(rail, function(seg0, seg1, curve_len) {
        var t_ratio = seg1.acc_len / curve_len;
        if (ratio > t_ratio) {
            prev_ratio = t_ratio;
            return false;
        }
        var i_ratio = (ratio - prev_ratio) / (t_ratio - prev_ratio);
        ret = {};
        ret.pos = v3.Lerp(seg0.pos, seg1.pos, i_ratio);
        ret.dir = v3.Lerp(seg0.dir, seg1.dir, i_ratio);
        ret.up  = v3.Lerp(seg0.up , seg1.up , i_ratio);
        return true;
    }, false, true);
    return ret;
};
Rail.resetDrawBlockColors = function(color)
{
    Rail.forEach(function(rail) {
        if (rail.mDrawBlock) {
            rail.mDrawBlock.mColor = color;
        }
    });
};
Rail.saveAll = function(data)
{
    data.point = ControlPoint.saveInsts(function(point) {
        return {
            id : point.mID,
            pos : v3.ToArray(point.mPos),
            dir : v3.ToArray(point.mDir),
            up : v3.ToArray(point.mUp),
            rails : point.mRails.map(rail => rail ? rail.mID : null),
            switch_from : point.mSwitchFrom,
            left_sign : point.mLeftSign,
        };
    });
    data.rail = this.saveInsts(function(rail) {
        function make_point_data(point) { return point ? point.mID : null; }
        var inst = {
            id : rail.mID,
            points : rail.mPoints.map(make_point_data),
            sinfos : rail.mSwitchInfos,
            alt_sw : rail.mAlternateSwitchState,
            st_info : rail.mStationInfo,
        };
        if (HasValidValue(rail.mSwitchPoints)) {
            inst.spoints = rail.mSwitchPoints.map(make_point_data);
        }
        if (rail.mLeftPart ) { inst.left_part  = rail.mLeftPart ; }
        if (rail.mRightPart) { inst.right_part = rail.mRightPart; }
        this.cRailOptions.forEach(name => inst[name.s] = rail['m' + name.m]);
        if (rail.mSwitchPoints[0] || rail.mSwitchPoints[1]) {
            inst.switch_state = rail.mDrawBlock.mSwitchState;
        }
        if (rail.mDoubleSlipPivot) { inst.ds_pivot = v3.ToArray(rail.mDoubleSlipPivot); }
        return inst;
    });
};
Rail.loadAll = function(data)
{
    var tmp_points = [], tmp_switches = [];
    ControlPoint.loadInsts(data.point, function(inst) {
        var point = {
            mID : inst.id,
            mPos : v3.FromArray(inst.pos),
            mRails : inst.rails,
            mSwitchFrom : inst.switch_from,
            mLeftSign : inst.left_sign,
        };
        this.setDir(point, inst.dir, inst.up);
        tmp_points.push(point);
    });
    this.loadInsts(data.rail, function(inst) {
        function search_point(point_id) {
            return tmp_points.find(point => point.mID == point_id);
        }
        var rail = {
            mID : inst.id,
            mPoints : inst.points.map(search_point),
            mSwitchPoints : inst.spoints && inst.spoints.map(search_point) || [null, null],
            mSwitchInfos : inst.sinfos,
            mAlternateSwitchState : inst.alt_sw,
            mStationInfo : inst.st_info,
        };
        inst.curve_factor ||= 0.5,
        this.createData(rail);
        this.cRailOptions.forEach(name => rail['m' + name.m] = inst[name.s]);
        rail.mPierType = rail.mPierType || 'center';
        if (rail.mStationInfo) {
            rail.mStationInfo.forEach(function(setting) {
                setting.duration_rnd = setting.duration_rnd || 0;
            });
        }
        if (inst.switch_state) { tmp_switches.push({
            rail : rail, switch_state : inst.switch_state, }); }
        if (inst.ds_pivot) { rail.mDoubleSlipPivot = v3.FromArray(inst.ds_pivot); }
        this.sObjs.push(rail);
    });
    tmp_points.forEach(function(point) {
        point.mRails = point.mRails.map(rail_id =>
            Rail.sObjs.find(rail => rail.mID == rail_id));
    });
    this.writeAll();
    tmp_switches.forEach(function(info) {
        info.rail.mDrawBlock.mSwitchState = info.switch_state;
    });
};
g_toggle_debug_draw_callback.push(function() {
    Rail.writeAll();
});
