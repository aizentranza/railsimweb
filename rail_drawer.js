'use strict';
var RailDrawerType = {
    cDefault      :  0,
    cSwitch       :  1,
    cSafege       :  2,
    cSafegeSwitch :  3,
    cAlweg        :  4,
    cAlwegSwitch  :  5,
    cBallast      :  6,
    cSlab         :  7,
    cGirder       :  8,
    cTunnel       :  9,
    cPlatform     : 10,
    cWall         : 11,
    cFloor        : 12,
    cPltTnl       : 13,
};
var RailDrawerInfo = [
    { id : 'rail_drawer'         , use_uv : false, use_col : false, },
    { id : 'rail_switch_drawer'  , use_uv : false, use_col : false, },
    { id : 'safege_drawer'       , use_uv : false, use_col : false, },
    { id : 'safege_switch_drawer', use_uv : false, use_col : false, },
    { id : 'alweg_drawer'        , use_uv : false, use_col : false, },
    { id : 'alweg_switch_drawer' , use_uv : false, use_col : false, },
    { id : 'rail_ballast_drawer' , use_uv : true , use_col : false, },
    { id : 'rail_slab_drawer'    , use_uv : true , use_col : false, },
    { id : 'rail_girder_drawer'  , use_uv : false, use_col : false, },
    { id : 'rail_tunnel_drawer'  , use_uv : false, use_col : false, },
    { id : 'rail_platform_drawer', use_uv : false, use_col : true , },
    { id : 'rail_wall_drawer'    , use_uv : false, use_col : false, },
    { id : 'rail_floor_drawer'   , use_uv : false, use_col : false, },
    { id : 'rail_plt_tnl_drawer' , use_uv : false, use_col : false, },
];
function IsRailDrawerCurve(type) { return type == RailDrawerType.cAlwegSwitch; }
function IsRailDrawerSwitch(type) { return RailDrawerInfo[type].id.endsWith('_switch_drawer'); }
function IsRailDrawerUseUV(type) { return RailDrawerInfo[type].use_uv; }
function IsRailDrawerUseColor(type) { return RailDrawerInfo[type].use_col; }
var cGirderTopProfileNum = 3;
var cSafegeBottomProfileNum = 14;
var cAlwegTopProfileNum = 8;
var cAlwegNonBottomProfileNum = 13;
var cPlatformTopProfileNum = 7;
var cWallTopProfileNum = 4;
var cFloorTopProfileNum = 2;
var RailGaugeType = { cNarrow : 0, cStandard : 1, };
var RailDrawerShader = CreateInstance();
RailDrawerShader.create = function(type)
{ return Shader.create(
    RailDrawerInfo[type].id,
    [
        ['vec4', 'aPos'],
        ['vec3', 'aNrm'],
        IsRailDrawerSwitch(type) && ['vec2', 'aTongue'] ||
            IsRailDrawerUseUV(type) && ['vec2', 'aTexCoord'] ||
            IsRailDrawerUseColor(type) && ['vec3', 'aColor'],
    ],
    [
        ['vec3', 'vWorldNrm'],
        ['vec4', 'vSelectColor'],
        IsRailDrawerUseUV(type) && ['vec4', 'vTexCoord'] ||
            IsRailDrawerUseColor(type) && ['vec3', 'vColor'],
    ],
    [
        ['vec4', 'cViewProjMtx', 4],
        ['vec4', 'cDrawParam0', 1],
        ['vec2', 'cNoiseCenter', 1],
        IsRailDrawerCurve(type) && ['vec3', 'cCurveInfo0', 3] ||
            IsRailDrawerSwitch(type) && ['vec4', 'cTongueOffset0', 1],
        IsRailDrawerCurve(type) && ['vec3', 'cCurveInfo1', 3] ||
            IsRailDrawerSwitch(type) && ['vec4', 'cTongueOffset1', 1],
    ],
    [
        IsRailDrawerSwitch(type) && ['vec4', 'cTestColor', 1],
    ],
    [
        'void main() {',
        'vec3 world_pos = aPos.xyz;',
        ( IsRailDrawerCurve(type)
          ? ['float t = aPos.z;',
             'float t2 = t * t, t3 = t2 * t;',
             'float h00 =  2.0 * t3 - 3.0 * t2     + 1.0;',
             'float h10 =        t3 - 2.0 * t2 + t      ;',
             'float h01 = -2.0 * t3 + 3.0 * t2          ;',
             'float h11 =        t3 -       t2          ;',
             'vec3 pos0 = cCurveInfo0[0], pos1 = cCurveInfo1[0];',
             'vec3 m0   = cCurveInfo0[1], m1   = cCurveInfo1[1];',
             'vec3 up0  = cCurveInfo0[2], up1  = cCurveInfo1[2];',
             'vec3 out_pos = pos0 * h00 + m0 * h10 + pos1 * h01 + m1 * h11;',
             'float h20 =  6.0 * t2 - 6.0 * t      ;',
             'float h30 =  3.0 * t2 - 4.0 * t + 1.0;',
             'float h21 = -6.0 * t2 + 6.0 * t      ;',
             'float h31 =  3.0 * t2 - 2.0 * t      ;',
             'vec3 out_dir = pos0 * h20 + m0 * h30 + pos1 * h21 + m1 * h31;',
             'out_dir = normalize(out_dir);',
             'vec3 out_left = normalize(cross(mix(up0, up1, t), out_dir));',
             'vec3 out_up = normalize(cross(out_dir, out_left));',
             'world_pos = out_pos + out_left * aPos.x + out_up * aPos.y;']
          : IsRailDrawerSwitch(type)
          ? ( 'world_pos += '+
              'cTongueOffset0.xyz * (aTongue.x < 0.0 ? cTongueOffset0.w : 1.0) * aTongue.x +'+
              'cTongueOffset1.xyz * (aTongue.y < 0.0 ? cTongueOffset1.w : 1.0) * aTongue.y;')
          : ''),
        'gl_Position = mulMtx44Vec4(cViewProjMtx, vec4(world_pos, 1));',
        ( IsRailDrawerCurve(type)
          ? 'vWorldNrm = out_left * aNrm.x + out_up * aNrm.y;'
          : 'vWorldNrm = aNrm;'),
        'float highlight = aPos.w == cDrawParam0.x ? 1.0 : 0.0;',
        'float selected  = aPos.w == cDrawParam0.y ? 1.0 : 0.0;',
        'float hl_value = '+(IsRailDrawerUseUV(type) ? '0.8' : '1.0')+';',
        'vSelectColor = vec4(highlight * hl_value, selected * hl_value, 0,'+
            ' min(1.0, highlight + selected));',
        ( IsRailDrawerUseUV(type)
          ? 'vTexCoord.xy = aTexCoord; vTexCoord.zw = world_pos.xz - cNoiseCenter;' : ''),
        ( IsRailDrawerUseColor(type)
          ? 'vColor = aColor;' : ''),
        '}',
    ].flat(3).join('\n'),
    [
        'void main() {',
        'vec3 f_world_normal = normalize(vWorldNrm);',
        'float diffuse_s = calcDiffuse(f_world_normal);',
        ( IsRailDrawerUseUV(type)
          ? [ 'vec2 tie_uv = vTexCoord.xy;',
              ( type == RailDrawerType.cSlab
                ? [ 'float is_tie_sep = 1.0;',
                    'if (tie_uv.x > 5.0) { is_tie_sep = 0.0; tie_uv.x -= 10.0; }'] : []),
              'tie_uv = vec2(saturate(tie_uv.x), fract(tie_uv.y));',
              'gl_FragColor = vec4('+(type == RailDrawerType.cBallast
                                      ? '0.6, 0.4, 0.3' : '0.8, 0.8, 0.8')+', 1);',
              ( type == RailDrawerType.cBallast
                ? 'gl_FragColor.rgb *= mix(0.7, 1.0,'+
                ' IGN(floor(fract(vTexCoord.zw) * 20.0)));' : ''),
              'gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3('+(
                  type == RailDrawerType.cBallast
                      ? '0.4, 0.2, 0.0' : '0.5, 0.5, 0.5')+'),'+
              'step2(0.1, 0.9, tie_uv.x) * step2(0.3, 0.7, tie_uv.y)'+(
                  type == RailDrawerType.cBallast ? ''
                      : ' * (1.0 - is_tie_sep * step2(0.33, 0.67, tie_uv.x))')+');',]
          : IsRailDrawerUseColor(type)           ? 'gl_FragColor = vec4(vColor, 1);'
          : type <= RailDrawerType.cSwitch       ? 'gl_FragColor = vec4(1);'
          : type <= RailDrawerType.cSafegeSwitch ? 'gl_FragColor = vec4(0.9, 0.9, 0.9, 1);'
          : type == RailDrawerType.cAlweg        ? 'gl_FragColor = vec4(0.9, 0.9, 0.9, 1);'
          : type == RailDrawerType.cAlwegSwitch  ? 'gl_FragColor = vec4(0.8, 0.8, 0.8, 1);'
          : type == RailDrawerType.cGirder       ? 'gl_FragColor = vec4(0.7, 0.7, 0.7, 1);'
          : type == RailDrawerType.cTunnel       ? 'gl_FragColor = vec4(0.7, 0.7, 0.7, 1);'
          : type == RailDrawerType.cWall         ? 'gl_FragColor = vec4(0.7, 0.7, 0.7, 1);'
          : type == RailDrawerType.cFloor        ? 'gl_FragColor = vec4(0.7, 0.7, 0.7, 1);'
          : type == RailDrawerType.cPltTnl       ? 'gl_FragColor = vec4(0.7, 0.7, 0.7, 1);'
          : 'gl_FragColor = vec4(0);'),
        ( type == RailDrawerType.cSwitch ? 'gl_FragColor = cTestColor;'
          : type == RailDrawerType.cPlatform ? 'gl_FragColor.rgb = mix('+
          'gl_FragColor.rgb, vec3(0.5), step(f_world_normal.y, 0.5));' : ''),
        'gl_FragColor.rgb *= diffuse_s;',
        'gl_FragColor.rgb = mix(gl_FragColor.rgb, vSelectColor.rgb, vSelectColor.a);',
        '}',
    ].flat(3).join('\n'));
};
var RailDrawer = CreateInstance();
RailDrawer.create = function(type, x_sign)
{
    x_sign = x_sign || 1;
    var inst = CreateInstance();
    inst.mType = type;
    inst.mIsMono = RailDrawerType.cSafege <= type && type <= RailDrawerType.cAlwegSwitch;
    inst.mIsTunnel = type == RailDrawerType.cTunnel || type == RailDrawerType.cPltTnl;
    inst.initialize = function(gl)
    {
        this.mShaderInfo = RailDrawerShader.create(this.mType);
        this.mShLoc = this.mShaderInfo.mLocations;
        this.mStride = this.mShaderInfo.mStride;
        this.mBufferCapacity = 0;
        this.mArrayCapacity = 128;
        this.mSize = 0;
        this.mRailCounterF32 = v1.Make(cMinValueF32);
        this.mHighlightCounterF32 = v4.Makes(0);
        var y_ofs = this.mType <= RailDrawerType.cSwitch ? RailMetric.cBallastHeight : 0;
        function make_vtx(px, py, nx, ny, is_flat) {
            return {
                pos : v2.Make(px, py + y_ofs),
                nrm : v2.normalize(v2.Make(nx, ny)),
                is_flat : is_flat,
            };
        }
        function make_edge(px0, py0, nx0, ny0, f0, px1, py1, nx1, ny1, f1, col) {
            var v0 = make_vtx(px0 * x_sign, py0, nx0 * x_sign, ny0, f0);
            var v1 = make_vtx(px1 * x_sign, py1, nx1 * x_sign, ny1, f1);
            return {
                mVertices : (x_sign > 0 ? [v0, v1] : [v1, v0]),
                mColor : col,
            };
        }
        this.mProfiles = this.mType <= RailDrawerType.cSwitch ? [
            make_edge(
                RailMetric.cHalfOuterWidth, 0, 1, .5, false,
                RailMetric.cHalfOuterWidth, RailMetric.cHeight, 1, 0, false),
            make_edge(
                RailMetric.cHalfOuterWidth, RailMetric.cHeight, 1, 1, false,
                RailMetric.cHalfGauge, RailMetric.cHeight, -1, 1, false),
            make_edge(
                RailMetric.cHalfGauge, RailMetric.cHeight, -1, 0, false,
                RailMetric.cHalfGauge, 0, -1, .5, false),
            make_edge(
                -RailMetric.cHalfGauge, 0, 1, .5, false,
                -RailMetric.cHalfGauge, RailMetric.cHeight, 1, 0, false),
            make_edge(
                -RailMetric.cHalfGauge, RailMetric.cHeight, 1, 1, false,
                -RailMetric.cHalfOuterWidth, RailMetric.cHeight, -1, 1, false),
            make_edge(
                -RailMetric.cHalfOuterWidth, RailMetric.cHeight, -1, 0, false,
                -RailMetric.cHalfOuterWidth, 0, -1, .5, false),
        ] : this.mType == RailDrawerType.cBallast ? [
            make_edge(
                RailMetric.cHalfBallastBottomWidth, 0, 1, .5, true,
                RailMetric.cHalfBallastTopWidth, RailMetric.cBallastHeight, 0.5, 1, false),
            make_edge(
                RailMetric.cHalfBallastTopWidth, RailMetric.cBallastHeight, 0.1, 1, false,
                -RailMetric.cHalfBallastTopWidth, RailMetric.cBallastHeight, -0.1, 1, false),
            make_edge(
                -RailMetric.cHalfBallastTopWidth, RailMetric.cBallastHeight, -0.5, 1, false,
                -RailMetric.cHalfBallastBottomWidth, 0, -1, .5, true),
        ] : this.mType == RailDrawerType.cSlab ? [
            make_edge(
                RailMetric.cHalfSlabWidth, 0, 1, 0, true,
                RailMetric.cHalfSlabWidth, RailMetric.cBallastHeight, 1, 0, false),
            make_edge(
                RailMetric.cHalfSlabWidth, RailMetric.cBallastHeight, 0, 1, false,
                -RailMetric.cHalfSlabWidth, RailMetric.cBallastHeight, 0, 1, false),
            make_edge(
                -RailMetric.cHalfSlabWidth, RailMetric.cBallastHeight, -1, 0, false,
                -RailMetric.cHalfSlabWidth, 0, -1, 0, true),
        ] : this.mType <= RailDrawerType.cSafegeSwitch ? [
            make_edge(
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeMiddleHeight, -1, 0, false,
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeFloorHeight, -1, 0, false),
            make_edge(
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeFloorHeight, 0, 1, false,
                RailMetric.cHalfSafegeOpenTopWidth, RailMetric.cSafegeFloorHeight, 0, 1, false),
            make_edge(
                RailMetric.cHalfSafegeOpenTopWidth,
                RailMetric.cSafegeFloorHeight, -1, -0.5, false,
                RailMetric.cHalfSafegeOpenBottomWidth,
                RailMetric.cSafegeBottomHeight, -1, -0.5, false),
            make_edge(
                RailMetric.cHalfSafegeOpenBottomWidth,
                RailMetric.cSafegeBottomHeight, 0, -1, false,
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeBottomHeight, 0, -1, false),
            make_edge(
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeBottomHeight, 1, -1, false,
                RailMetric.cHalfSafegeWidth, RailMetric.cSafegeFloorHeight, 1, -1, false),
            make_edge(
                RailMetric.cHalfSafegeWidth, RailMetric.cSafegeFloorHeight, 1, 0, false,
                RailMetric.cHalfSafegeWidth, RailMetric.cSafegeMiddleHeight, 1, 0, false),
            make_edge(
                RailMetric.cHalfSafegeWidth, RailMetric.cSafegeMiddleHeight, 0, 1, false,
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeMiddleHeight, 0, 1, false),
            make_edge(
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeMiddleHeight, 0, 1, false,
                -RailMetric.cHalfSafegeWidth, RailMetric.cSafegeMiddleHeight, 0, 1, false),
            make_edge(
                -RailMetric.cHalfSafegeWidth, RailMetric.cSafegeMiddleHeight, -1, 0, false,
                -RailMetric.cHalfSafegeWidth, RailMetric.cSafegeFloorHeight, -1, 0, false),
            make_edge(
                -RailMetric.cHalfSafegeWidth, RailMetric.cSafegeFloorHeight, -1, -1, false,
                -RailMetric.cHalfSafegeInnerWidth,
                RailMetric.cSafegeBottomHeight, -1, -1, false),
            make_edge(
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeBottomHeight, 0, -1, false,
                -RailMetric.cHalfSafegeOpenBottomWidth,
                RailMetric.cSafegeBottomHeight, 0, -1, false),
            make_edge(
                -RailMetric.cHalfSafegeOpenBottomWidth,
                RailMetric.cSafegeBottomHeight, 1, -0.5, false,
                -RailMetric.cHalfSafegeOpenTopWidth,
                RailMetric.cSafegeFloorHeight, 1, -0.5, false),
            make_edge(
                -RailMetric.cHalfSafegeOpenTopWidth, RailMetric.cSafegeFloorHeight, 0, 1, false,
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeFloorHeight, 0, 1, false),
            make_edge(
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeFloorHeight, 1, 0, false,
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeMiddleHeight, 1, 0, false),
            // upper wall
            make_edge(
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeCeilHeight, -1, 0, false,
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeMiddleHeight, -1, 0, false),
            make_edge(
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeMiddleHeight, 0, -1, false,
                RailMetric.cHalfSafegeBorderWidth, RailMetric.cSafegeMiddleHeight, 0, -1, false),
            make_edge(
                RailMetric.cHalfSafegeBorderWidth, RailMetric.cSafegeMiddleHeight, 1, 0, false,
                RailMetric.cHalfSafegeBorderWidth, RailMetric.cSafegeBorderHeight, 1, 0, false),
            make_edge(
                RailMetric.cHalfSafegeBorderWidth, RailMetric.cSafegeBorderHeight, 0, -1, false,
                RailMetric.cHalfSafegeWidth, RailMetric.cSafegeBorderHeight, 0, -1, false),
            make_edge(
                RailMetric.cHalfSafegeWidth, RailMetric.cSafegeBorderHeight, 1, 0, false,
                RailMetric.cHalfSafegeWidth, RailMetric.cSafegeCeilHeight, 1, 0, false),
            make_edge(
                -RailMetric.cHalfSafegeWidth, RailMetric.cSafegeCeilHeight, -1, 0, false,
                -RailMetric.cHalfSafegeWidth, RailMetric.cSafegeBorderHeight, -1, 0, false),
            make_edge(
                -RailMetric.cHalfSafegeWidth, RailMetric.cSafegeBorderHeight, 0, -1, false,
                -RailMetric.cHalfSafegeBorderWidth,
                RailMetric.cSafegeBorderHeight, 0, -1, false),
            make_edge(
                -RailMetric.cHalfSafegeBorderWidth, RailMetric.cSafegeBorderHeight, -1, 0, false,
                -RailMetric.cHalfSafegeBorderWidth,
                RailMetric.cSafegeMiddleHeight, -1, 0, false),
            make_edge(
                -RailMetric.cHalfSafegeBorderWidth, RailMetric.cSafegeMiddleHeight, 0, -1, false,
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeMiddleHeight, 0, -1, false),
            make_edge(
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeMiddleHeight, 1, 0, false,
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeCeilHeight, 1, 0, false),
            // roof
            make_edge(
                RailMetric.cHalfSafegeWidth, RailMetric.cSafegeCeilHeight, 1, 1, false,
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeTopHeight, 1, 1, false),
            make_edge(
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeTopHeight, 0, 1, false,
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeTopHeight, 0, 1, false),
            make_edge(
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeTopHeight, -1, 1, false,
                -RailMetric.cHalfSafegeWidth, RailMetric.cSafegeCeilHeight, -1, 1, false),
            make_edge(
                -RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeCeilHeight, 0, -1, false,
                RailMetric.cHalfSafegeInnerWidth, RailMetric.cSafegeCeilHeight, 0, -1, false),
        ] : this.mType <= RailDrawerType.cAlwegSwitch ? [
            make_edge(
                RailMetric.cHalfAlwegMiddleWidth, RailMetric.cAlwegLowMiddleHeight, 1, 0, false,
                RailMetric.cHalfAlwegMiddleWidth,
                RailMetric.cAlwegHighMiddleHeight, 1, 0, false),
            make_edge(
                RailMetric.cHalfAlwegMiddleWidth,
                RailMetric.cAlwegHighMiddleHeight, 1, -1, false,
                RailMetric.cHalfAlwegWidth, RailMetric.cAlwegMiddleTopHeight, 1, -1, false),
            make_edge(
                RailMetric.cHalfAlwegWidth, RailMetric.cAlwegMiddleTopHeight, 1, 0, false,
                RailMetric.cHalfAlwegWidth, RailMetric.cAlwegTopHeight, 1, 0, false),
            make_edge(
                RailMetric.cHalfAlwegWidth, RailMetric.cAlwegTopHeight, 0, 1, false,
                RailMetric.cHalfAlwegMiddleWidth, RailMetric.cAlwegTopHeight, 0, 1, false),
            make_edge(
                -RailMetric.cHalfAlwegMiddleWidth, RailMetric.cAlwegTopHeight, 0, 1, false,
                -RailMetric.cHalfAlwegWidth, RailMetric.cAlwegTopHeight, 0, 1, false),
            make_edge(
                -RailMetric.cHalfAlwegWidth, RailMetric.cAlwegTopHeight, -1, 0, false,
                -RailMetric.cHalfAlwegWidth, RailMetric.cAlwegMiddleTopHeight, -1, 0, false),
            make_edge(
                -RailMetric.cHalfAlwegWidth, RailMetric.cAlwegMiddleTopHeight, -1, -1, false,
                -RailMetric.cHalfAlwegMiddleWidth,
                RailMetric.cAlwegHighMiddleHeight, -1, -1, false),
            make_edge(
                -RailMetric.cHalfAlwegMiddleWidth,
                RailMetric.cAlwegHighMiddleHeight, -1, 0, false,
                -RailMetric.cHalfAlwegMiddleWidth,
                RailMetric.cAlwegLowMiddleHeight, -1, 0, false),
            // bottom
            make_edge(
                -RailMetric.cHalfAlwegMiddleWidth,
                RailMetric.cAlwegLowMiddleHeight, -1, 1, false,
                -RailMetric.cHalfAlwegWidth, RailMetric.cAlwegMiddleBottomHeight, -1, 1, false),
            make_edge(
                -RailMetric.cHalfAlwegWidth, RailMetric.cAlwegMiddleBottomHeight, -1, 0, false,
                -RailMetric.cHalfAlwegWidth, RailMetric.cAlwegBottomHeight, -1, 0, false),
            make_edge(
                RailMetric.cHalfAlwegWidth, RailMetric.cAlwegBottomHeight, 1, 0, false,
                RailMetric.cHalfAlwegWidth, RailMetric.cAlwegMiddleBottomHeight, 1, 0, false),
            make_edge(
                RailMetric.cHalfAlwegWidth, RailMetric.cAlwegMiddleBottomHeight, 1, 1, false,
                RailMetric.cHalfAlwegMiddleWidth, RailMetric.cAlwegLowMiddleHeight, 1, 1, false),
            make_edge(
                RailMetric.cHalfAlwegMiddleWidth, RailMetric.cAlwegTopHeight, 0, 1, false,
                -RailMetric.cHalfAlwegMiddleWidth, RailMetric.cAlwegTopHeight, 0, 1, false),
            make_edge(
                -RailMetric.cHalfAlwegWidth, RailMetric.cAlwegBottomHeight, 0, -1, false,
                RailMetric.cHalfAlwegWidth, RailMetric.cAlwegBottomHeight, 0, -1, false),
        ] : this.mType == RailDrawerType.cGirder ? [
            make_edge(
                RailMetric.cHalfGirderWidth, -RailMetric.cGirderHeight, 1, 0, true,
                RailMetric.cHalfGirderWidth, 0, 1, 0, true),
            make_edge(
                RailMetric.cHalfGirderWidth, 0, 0, 1, true,
                -RailMetric.cHalfGirderWidth, 0, 0, 1, true),
            make_edge(
                -RailMetric.cHalfGirderWidth, 0, -1, 0, true,
                -RailMetric.cHalfGirderWidth, -RailMetric.cGirderHeight, -1, 0, true),
            make_edge(
                -RailMetric.cHalfGirderWidth, -RailMetric.cGirderHeight, 0, -1, true,
                RailMetric.cHalfGirderWidth, -RailMetric.cGirderHeight, 0, -1, true),
        ] : this.mType == RailDrawerType.cTunnel ? [
            make_edge(
                RailMetric.cHalfTunnelWidth, RailMetric.cTunnelHeight, -1, 0, true,
                RailMetric.cHalfTunnelWidth, RailMetric.cTunnelBottom, -1, 0, true),
            make_edge(
                RailMetric.cHalfTunnelWidth, RailMetric.cTunnelBottom, 0, 1, true,
                -RailMetric.cHalfTunnelWidth, RailMetric.cTunnelBottom, 0, 1, true),
            make_edge(
                -RailMetric.cHalfTunnelWidth, RailMetric.cTunnelBottom, 1, 0, true,
                -RailMetric.cHalfTunnelWidth, RailMetric.cTunnelHeight, 1, 0, true),
            make_edge(
                -RailMetric.cHalfTunnelWidth, RailMetric.cTunnelHeight, 0, -1, true,
                RailMetric.cHalfTunnelWidth, RailMetric.cTunnelHeight, 0, -1, true),
        ] : this.mType == RailDrawerType.cPlatform ? [
            make_edge(1.0  , -0.1,  1,  0, true,
                      1.0  ,  1  ,  1,  0, true, v3.Make(0.5, 0.5, 0.5)),
            make_edge(1.0  ,  1  ,  0,  1, true,
                      0.9  ,  1  ,  0,  1, true, v3.Make(0.5, 0.5, 0.5)),
            make_edge(0.9  ,  1  ,  0,  1, true,
                      0.6  ,  1  ,  0,  1, true, v3.Make(0.9, 0.8, 0.0)),
            make_edge(0.6  ,  1  ,  0,  1, true,
                      0.1  ,  1  ,  0,  1, true, v3.Make(0.7, 0.7, 0.7)),
            make_edge(0.1  ,  1  ,  0,  1, true,
                      0.001,  1  ,  0,  1, true, v3.Make(1.0, 1.0, 1.0)),
            make_edge(0.001,  1  , -1,  0, true,
                      0.001,  0.1, -1,  0, true, v3.Make(0.5, 0.5, 0.5)),
            make_edge(0.001,  0.1,  0,  1, true,
                      0.0  ,  0.1,  0,  1, true, v3.Make(0.7, 0.7, 0.7)),
            make_edge(0.0  , -0.1,  0, -1, true,
                      1.0  , -0.1,  0, -1, true, v3.Make(0.7, 0.7, 0.7)),
        ] : this.mType == RailDrawerType.cWall ? [
            make_edge(0.2  , -0.1,  1,  0, true,
                      0.2  ,  1.0,  1,  0, true),
            make_edge(0.2  ,  1.0,  0,  1, true,
                      0.001,  1.0,  0,  1, true),
            make_edge(0.001,  1.0, -1,  0, true,
                      0.001,  0.1, -1,  0, true),
            make_edge(0.001,  0.1,  0,  1, true,
                      0    ,  0.1,  0,  1, true),
            make_edge(0    , -0.1,  0, -1, true,
                      0.2  , -0.1,  0, -1, true),
        ] : this.mType == RailDrawerType.cFloor ? [
            make_edge(0.2  , -0.1,  1,  0, true,
                      0.2  ,  0.1,  1,  0, true),
            make_edge(0.2  ,  0.1,  0,  1, true,
                      0    ,  0.1,  0,  1, true),
            make_edge(0    , -0.1,  0, -1, true,
                      0.2  , -0.1,  0, -1, true),
        ] : this.mType == RailDrawerType.cPltTnl ? [
            make_edge(
                1.0, RailMetric.cTunnelHeight, -1, 0, true,
                1.0, 0, -1, 0, true),
            make_edge(
                1.0, 0, 0, 1, true,
                0.0, 0, 0, 1, true),
            make_edge(
                0.0, 0, 1, 0, true,
                0.0, RailMetric.cTunnelHeight, 1, 0, true),
            make_edge(
                0.0, RailMetric.cTunnelHeight, 0, -1, true,
                1.0, RailMetric.cTunnelHeight, 0, -1, true),
        ] : null;
        for (var i = 0; i < this.mProfiles.length; ++i) {
            var profile = this.mProfiles[i];
            profile.mVertexArray = new Float32Array(this.mArrayCapacity * this.mStride * 2);
            profile.mLastPos = v3.Makes(0);
            profile.mLastTongueParam = v2.Makes(0);
            this.mProfiles[i] = profile;
        }
    };
    inst.beginWrite = function()
    {
        this.mSize = 0;
        this.mDrawBlocks = [];
        for (var i = 0; i < this.mProfiles.length; ++i) {
            var profile = this.mProfiles[i];
            v3.sets(profile.mLastPos, 0);
            v2.sets(profile.mLastTongueParam, 0);
        }
        this.mRailCounterF32[0] = cMinValueF32;
    };
    inst.incrementRailCounter = function() { this.mRailCounterF32[0] *= cMinStepF32; };
    inst.getRailCounter = function() { return this.mRailCounterF32[0]; };
    inst.setHighlight = function(hl) { this.mHighlightCounterF32[0] = hl; };
    inst.setSelected  = function(hl) { this.mHighlightCounterF32[1] = hl; };
    inst.pushDrawBlock = function()
    {
        var block = CreateInstance();
        block.mOffset = this.mSize;
        block.mColor = v4.Makes(1);
        block.mSwitchState = [0, 0];
        block.mSwitchAnim = [1, 1];
        this.mDrawBlocks.push(block);
        return block;
    };
    inst.pushSegment = function(seg, args, is_first, is_last, is_end)
    {
        if (is_first && !is_end) {
            this.pushSegment(seg, args, true, false, 5);
            this.pushSegment(seg, args, false, false, 1);
            is_first = false;
        } else if (is_last && !is_end) {
            this.pushSegment(seg, args, false, false, 0);
            this.pushSegment(seg, args, false, false, 2);
            is_end = 6;
        }
        var end_y = 0;
        var gauge_ofs = args.gauge ? (RailMetric.cHalfGaugeStd - RailMetric.cHalfGauge)
            * (this.mType <= RailDrawerType.cSwitch ? 1 : RailMetric.cHalfBallastTopWidth
               / (RailMetric.cHalfWidth + RailMetric.cGauge * 0.4)) : 0;
        if (this.mType <= RailDrawerType.cSwitch) { end_y = RailMetric.cBallastHeight; }
        else if (this.mType <= RailDrawerType.cSafegeSwitch) {
            end_y = RailMetric.cSafegeFloorHeight; }
        else if (this.mType <= RailDrawerType.cAlwegSwitch) {
            end_y = RailMetric.cAlwegTopHeight; }
        else if (this.mType <= RailDrawerType.cSlab) { end_y = 0; }
        else if (this.mType == RailDrawerType.cGirder) { end_y = args.girder_ofs_y || 0; }
        else if (this.mType >= RailDrawerType.cPlatform) { end_y = args.part_ofs_y || 0; }
        var is_safege = this.mType == RailDrawerType.cSafege
            || this.mType == RailDrawerType.cSafegeSwitch;
        var is_alweg = this.mType == RailDrawerType.cAlweg
            || this.mType == RailDrawerType.cAlwegSwitch;
        var is_curve = IsRailDrawerCurve(type);
        var skip_seg = args && args.skip_seg;
        var n = is_first || skip_seg ? 2 : 1;
        var cShiftOffset = IsRailDrawerUseUV(this.mType) ? 0
            : RailMetric.cWidth * (args && (args.tongue_ofs0 || args.tongue_ofs1) ? 1 : 2);
        var cShiftOffsetThin = cShiftOffset - RailMetric.cWidth;
        var rc = this.mRailCounterF32;
        var new_size = this.mSize + n;
        if (this.mArrayCapacity < new_size) {
            while (this.mArrayCapacity < new_size) { this.mArrayCapacity *= 2; }
            for (var i = 0; i < this.mProfiles.length; ++i) {
                var profile = this.mProfiles[i];
                var new_array = new Float32Array(this.mArrayCapacity * this.mStride * 2);
                new_array.set(profile.mVertexArray);
                profile.mVertexArray = new_array;
            }
            CapacityLog(RailDrawerInfo[this.mType].id
                        + ' array capacity => ' + this.mArrayCapacity);
        }
        var seg_stride = this.mStride * 2;
        var ofs0 = this.mSize * seg_stride;
        var ofs1 = ofs0 + this.mStride;
        var ofs2 = ofs0 + (n > 1 ? seg_stride : 0);
        var ofs3 = ofs2 + this.mStride;
        for (var i = 0; i < this.mProfiles.length; ++i) {
            if (is_safege && i == cSafegeBottomProfileNum) {
                end_y = RailMetric.cSafegeCeilHeight;
            } else if (is_alweg && i == cAlwegTopProfileNum) {
                end_y = RailMetric.cAlwegBottomHeight;
            }
            var tseg = seg;
            if (args) {
                if (i < 3) {
                    if (args.seg_l) { tseg = args.seg_l; }
                } else {
                    if (args.seg_r) { tseg = args.seg_r; }
                }
            }
            var shift_x = !this.mIsMono && args && cShiftOffset * (
                i < 3 ? -Math.max(0, -args.shift_x) : Math.max(0, args.shift_x)) || 0;
            var bend_x = !this.mIsMono && args && cShiftOffset * (
                i < 3 ? -Math.max(0, -args.bend_x) : Math.max(0, args.bend_x)) || 0;
            function calc_thin(vtx, wpos) {
                var ppos = vtx.pos;
                function thin_curve(x) {
                    if (args.is_mid_gap) { return x; }
                    var sign = Math.sign(x);
                    x *= sign / RailMetric.cWidth;
                    x = Math.min(1, x * 1.2);
                    x = x * x;
                    return x * sign * RailMetric.cWidth;
                }
                if (ppos[0] < -RailMetric.cHalfMidWidth
                    && shift_x > 0) {
                    v3.add(wpos, v3.Muls(tseg.left, thin_curve(Math.max(
                        0, shift_x - cShiftOffsetThin))));
                }
                if (ppos[0] > RailMetric.cHalfMidWidth
                    && shift_x < 0) {
                    v3.add(wpos, v3.Muls(tseg.left, thin_curve(Math.min(
                        0, shift_x + cShiftOffsetThin))));
                }
            }
            var profile = this.mProfiles[i];
            var vtx0 = profile.mVertices[0], x0 = vtx0.pos[0], y0 = vtx0.pos[1], bo0 = 0;
            var vtx1 = profile.mVertices[1], x1 = vtx1.pos[0], y1 = vtx1.pos[1], bo1 = 0;
            var mx = (x0 + x1) * 0.5;
            var is_safege_tongue = is_safege && i < this.mProfiles.length - 4
                && (mx < 0 ? args.no_wall0 > 0 || args.no_wall1 > 0
                    : args.no_wall0 < 0 || args.no_wall1 < 0);
            var is_cross_tongue = is_safege_tongue && args.tongue_ex_ofs0 !== undefined;
            if (RailDrawerType.cGirder <= this.mType && this.mType <= RailDrawerType.cTunnel) {
                if (args.girder_ofs_y) {
                    function calc_ofs_y(y) {
                        return args.girder_ofs_y + (y > 0.01 && args.girder_ofs_y2 || 0);
                    }
                    y0 += calc_ofs_y(y0); y1 += calc_ofs_y(y1);
                }
            } else if (this.mType >= RailDrawerType.cPlatform) {
                function calc_ofs_x(x) {
                    var abs_x = Math.abs(x);
                    return (abs_x > 0 ? args.part_ofs : 0) + (
                        abs_x >= 1 ? args.part_width - Math.sign(x) * 1 : 0);
                }
                x0 += calc_ofs_x(x0);
                x1 += calc_ofs_x(x1);
                y0 += y0 >= 1 ? args.part_height - 1 : 0;
                y1 += y1 >= 1 ? args.part_height - 1 : 0;
                if (args.part_ofs_y) { y0 += args.part_ofs_y; y1 += args.part_ofs_y; }
            }
            if (gauge_ofs) {
                function calc_ofs_x(x) { return (x < 0 ? -1 : 1) * gauge_ofs; }
                x0 += calc_ofs_x(x0);
                x1 += calc_ofs_x(x1);
            } else if (this.mType == RailDrawerType.cSafegeSwitch) {
                function calc_ofs_x(x) {
                    if (!is_safege_tongue || is_cross_tongue) { return 0; }
                    var ret = RailMetric.cSafegeSwitchWidth;
                    if (Math.abs(x) > RailMetric.cHalfSafegeOpenBottomWidth + 0.01) {
                        ret += RailMetric.cSafegeSingleSideWidth;
                    }
                    ret *= mx > 0
                        ? (args.no_wall0 < 0 && args.tongue_ofs0 || 0)
                        + (args.no_wall1 < 0 && args.tongue_ofs1 || 0)
                        : (args.no_wall0 > 0 && args.tongue_ofs0 || 0)
                        + (args.no_wall1 > 0 && args.tongue_ofs1 || 0);
                    return ret * (x < 0 ? 1 : -1) * 0.5;
                }
                x0 += calc_ofs_x(x0);
                x1 += calc_ofs_x(x1);
            }
            if (this.mType >= RailDrawerType.cBallast &&
                this.mType < RailDrawerType.cPlatform && args && args.ballast_ofs) {
                function calc_ofs_x(x) { return args.ballast_ofs[x < 0 ? 0 : 1]; }
                var cTieAdjust = this.mType == RailDrawerType.cBallast ? 0.17 : 0.24;
                x0 += bo0 = calc_ofs_x(x0); bo0 = max_abs(bo0, calc_ofs_x(-x0)) * cTieAdjust;
                x1 += bo1 = calc_ofs_x(x1); bo1 = max_abs(bo1, calc_ofs_x(-x1)) * cTieAdjust;
            }
            function adjust_y(y) {
                if (is_end & 4) { y = end_y; }
                if (is_safege && args) { return is_safege_tongue ? Math.min(
                    y, RailMetric.cSafegeFloorHeight) : y; }
                return y;
            }
            var end_nrm = is_end ? v3.muls(v3.normalize(v3.Cross(
                tseg.left, tseg.up)), is_end & 2 ? 1 : -1) : null;
            var left0 = is_curve ? v3.ex : vtx0.is_flat ? tseg.fleft : tseg.left;
            var up0   = is_curve ? v3.ey : vtx0.is_flat ? tseg.fup   : tseg.up  ;
            var p0 = v3.Muls(left0, x0 + shift_x - bend_x);
            v3.add(p0, v3.Muls(up0, adjust_y(y0)));
            v3.add(p0, is_curve ? v3.Make(0, 0, tseg.ratio) : tseg.pos);
            calc_thin(vtx0, p0);
            var n0 = end_nrm || v3.add(v3.Muls(left0, vtx0.nrm[0]),
                                       v3.Muls(up0  , vtx0.nrm[1]));
            var left1 = is_curve ? v3.ex : vtx1.is_flat ? tseg.fleft : tseg.left;
            var up1   = is_curve ? v3.ey : vtx1.is_flat ? tseg.fup   : tseg.up  ;
            var p1 = v3.Muls(left1, x1 + shift_x - bend_x);
            v3.add(p1, v3.Muls(up1, adjust_y(y1)));
            v3.add(p1, is_curve ? v3.Make(0, 0, tseg.ratio) : tseg.pos);
            calc_thin(vtx1, p1);
            var n1 = end_nrm || v3.add(v3.Muls(left1, vtx1.nrm[0]),
                                       v3.Muls(up1  , vtx1.nrm[1]));
            var tongue_param;
            if (this.mType == RailDrawerType.cSwitch) {
                var tongue_x0 = args &&
                    Math.max(0, i < 3 ? -args.tongue_ofs0 : args.tongue_ofs0) || 0;
                var tongue_x1 = args &&
                    Math.max(0, i < 3 ? -args.tongue_ofs1 : args.tongue_ofs1) || 0;
                tongue_param = v2.Make(tongue_x0, tongue_x1);
            } else if (this.mType == RailDrawerType.cSafegeSwitch) {
                if (is_safege_tongue) {
                    var tongue_f0 = mx > 0 ? args.no_wall0 < 0 : args.no_wall0 > 0;
                    var tongue_x0 = tongue_f0 && args.tongue_ofs0 || 0;
                    var tongue_f1 = mx > 0 ? args.no_wall1 < 0 : args.no_wall1 > 0;
                    var tongue_x1 = tongue_f1 && args.tongue_ofs1 || 0;
                    if (tongue_f0 && is_cross_tongue) {
                        v3.add(p0, args.tongue_ex_ofs0);
                        v3.add(p1, args.tongue_ex_ofs0);
                        tongue_x0 = -(1 - tongue_x0) * RailMetric.cSafegeTongueCrossFactor2
                            / RailMetric.cSafegeTongueCrossFactor;
                    }
                    if (tongue_f1 && is_cross_tongue) {
                        v3.add(p0, args.tongue_ex_ofs1);
                        v3.add(p1, args.tongue_ex_ofs1);
                        tongue_x1 = -(1 - tongue_x1) * RailMetric.cSafegeTongueCrossFactor2
                            / RailMetric.cSafegeTongueCrossFactor;
                    }
                    tongue_param = v2.Make(tongue_x0, tongue_x1);
                } else {
                    tongue_param = v2.Makes(0);
                }
            } else if (this.mType == RailDrawerType.cAlwegSwitch) {
                tongue_param = v2.Makes(0);
            }
            function calc_tex_u(a_vtx, bo) {
                return (a_vtx.pos[0]) / (RailMetric.cBallastTopWidth + bo) + 0.5
                    + (args.is_tie_switch ? 10 : 0);
            }
            if (is_first || skip_seg) {
                profile.mVertexArray.set(profile.mLastPos, ofs0);
                profile.mVertexArray.set(rc, ofs0 + 3);
                profile.mVertexArray.set(n0, ofs0 + 4);
                profile.mVertexArray.set(p0, ofs1    );
                profile.mVertexArray.set(rc, ofs1 + 3);
                profile.mVertexArray.set(n0, ofs1 + 4);
                if (IsRailDrawerSwitch(this.mType)) {
                    profile.mVertexArray.set(
                        profile.mLastTongueParam, ofs0 + 7);
                    profile.mVertexArray.set(tongue_param, ofs1 + 7);
                } else if (IsRailDrawerUseUV(this.mType)) {
                    profile.mVertexArray.set(v2.Make(
                        calc_tex_u(vtx0, bo0), seg.ballast_v), ofs0 + 7);
                    profile.mVertexArray.set(v2.Make(
                        calc_tex_u(vtx1, bo1), seg.ballast_v), ofs1 + 7);
                } else if (IsRailDrawerUseColor(this.mType)) {
                    profile.mVertexArray.set(profile.mColor, ofs0 + 7);
                    profile.mVertexArray.set(profile.mColor, ofs1 + 7);
                }
            }
            profile.mVertexArray.set(p0, ofs2    );
            profile.mVertexArray.set(rc, ofs2 + 3);
            profile.mVertexArray.set(n0, ofs2 + 4);
            profile.mVertexArray.set(p1, ofs3    );
            profile.mVertexArray.set(rc, ofs3 + 3);
            profile.mVertexArray.set(n1, ofs3 + 4);
            v3.copy(profile.mLastPos, p1);
            if (IsRailDrawerSwitch(this.mType)) {
                profile.mVertexArray.set(tongue_param, ofs2 + 7);
                profile.mVertexArray.set(tongue_param, ofs3 + 7);
                v2.copy(profile.mLastTongueParam, tongue_param);
            } else if (IsRailDrawerUseUV(this.mType)) {
                profile.mVertexArray.set(v2.Make(
                    calc_tex_u(vtx0, bo0), seg.ballast_v), ofs2 + 7);
                profile.mVertexArray.set(v2.Make(
                    calc_tex_u(vtx1, bo1), seg.ballast_v), ofs3 + 7);
            } else if (IsRailDrawerUseColor(this.mType)) {
                profile.mVertexArray.set(profile.mColor, ofs2 + 7);
                profile.mVertexArray.set(profile.mColor, ofs3 + 7);
            }
        }
        this.mSize = new_size;
    };
    inst.endWrite = function(gl)
    {
        var seg_stride = this.mStride * 2;
        if (this.mBufferCapacity < this.mArrayCapacity) {
            this.mBufferCapacity = this.mArrayCapacity;
            CapacityLog(RailDrawerInfo[this.mType].id
                        + ' buffer capacity => ' + this.mBufferCapacity);
            for (var i = 0; i < this.mProfiles.length; ++i) {
                var profile = this.mProfiles[i];
                profile.mVertexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, profile.mVertexBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, profile.mVertexArray, gl.DYNAMIC_DRAW);
            }
        }
        for (var i = 0; i < this.mProfiles.length; ++i) {
            var profile = this.mProfiles[i];
            gl.bindBuffer(gl.ARRAY_BUFFER, profile.mVertexBuffer);
            gl.bufferSubData(
                gl.ARRAY_BUFFER, 0,
                new Float32Array(profile.mVertexArray.buffer,
                                 0, this.mSize * seg_stride));
        }
    };
    inst.getCapacityText = function() { return '' + this.mSize + '/' + this.mArrayCapacity; };
    inst.setDrawProfileNum = function(n) { this.mDrawProfileNum = n; };
    inst.draw = function(gl, view_ctx)
    {
        if (this.mSize <= 0) { return; }
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);
        if (this.mIsTunnel) { gl.depthFunc(gl.GREATER); }
        gl.useProgram(this.mShaderInfo.mShader);
        webgl.uniform4fx4(gl, this.mShLoc.cViewProjMtx, view_ctx.view_proj_mtx);
        gl.uniform4fv(this.mShLoc.cDrawParam0, this.mHighlightCounterF32);
        gl.uniform2f(this.mShLoc.cNoiseCenter,
                     Math.floor(view_ctx.camera_at[0] * 0.1) * 10,
                     Math.floor(view_ctx.camera_at[2] * 0.1) * 10);
        for (var i = 0; i < this.mProfiles.length; ++i) {
            if (this.mDrawProfileNum && i >= this.mDrawProfileNum) { break; }
            var profile = this.mProfiles[i];
            gl.bindBuffer(gl.ARRAY_BUFFER, profile.mVertexBuffer);
            this.mShaderInfo.activateAttrib(gl, 'aPos');
            this.mShaderInfo.activateAttrib(gl, 'aNrm');
            if (IsRailDrawerSwitch(this.mType) && this.mShLoc.aTongue >= 0) {
                this.mShaderInfo.activateAttrib(gl, 'aTongue');
            } else if (IsRailDrawerUseUV(this.mType) && this.mShLoc.aTexCoord >= 0) {
                this.mShaderInfo.activateAttrib(gl, 'aTexCoord');
            } else if (IsRailDrawerUseColor(this.mType) && this.mShLoc.aColor >= 0) {
                this.mShaderInfo.activateAttrib(gl, 'aColor');
            }
            if (this.mDrawBlocks.length == 0) {
                gl.drawArrays(
                    gl.TRIANGLE_STRIP,
                    0, // offset
                    this.mSize * 2 // count
                );
            } else {
                var is_color = IsMenuSchedule();
                for (var j = 0; j < this.mDrawBlocks.length; ++j) {
                    var block = this.mDrawBlocks[j];
                    var next_block = this.mDrawBlocks[j + 1];
                    var size = next_block ? next_block.mOffset : this.mSize;
                    size -= block.mOffset;
                    var color = is_color ? block.mColor : v4.ones;
                    if (IsRailDrawerCurve(this.mType)) {
                        function set_curve_info(cvloc, cvb, cvs, ratio) {
                            gl.uniform3fv(cvloc[0], v3.Lerp(cvb.pos, cvs.pos, ratio));
                            gl.uniform3fv(cvloc[1], v3.Lerp(cvb.dir, cvs.dir, ratio));
                            gl.uniform3fv(cvloc[2], v3.Lerp(cvb.up , cvs.up , ratio));
                        }
                        set_curve_info(this.mShLoc.cCurveInfo0, block.mBasePoint0,
                                       block.mSwitchPoint0, 0.5 - block.mSwitchAnim[1] * 0.5);
                        set_curve_info(this.mShLoc.cCurveInfo1, block.mBasePoint1,
                                       block.mSwitchPoint1, 0.5 - block.mSwitchAnim[0] * 0.5);
                    } else if (IsRailDrawerSwitch(this.mType)) {
                        var scale = 1, cross_factor = 0;
                        if (this.mType == RailDrawerType.cSafegeSwitch) {
                            var t_sw0 = block.mSwitchAnim[0], t_sw1 = block.mSwitchAnim[1];
                            if (block.mIsSameSide) { t_sw0 = -t_sw0; }
                            if (t_sw0 < 0 && t_sw1 < 0) {
                                cross_factor = -Math.max(t_sw0, t_sw1);
                                scale = 1 + cross_factor * (
                                    RailMetric.cSafegeTongueCrossFactor - 1);
                            }
                        }
                        gl.uniform4fv(
                            this.mShLoc.cTongueOffset0,
                            v4.FromV3(v3.Muls(
                                block.mTongueOffset0, block.mSwitchAnim[0] * scale),
                                      cross_factor));
                        gl.uniform4fv(
                            this.mShLoc.cTongueOffset1,
                            v4.FromV3(v3.Muls(
                                block.mTongueOffset1, block.mSwitchAnim[1] * scale),
                                      cross_factor));
                        gl.uniform4fv(this.mShLoc.cTestColor, color);
                    }
                    gl.drawArrays(
                        gl.TRIANGLE_STRIP,
                        block.mOffset * 2, // offset
                        size * 2 // count
                    );
                }
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        v4.set(this.mHighlightCounterF32, 0, 0, 0, 0);
        if (this.mIsTunnel) { gl.depthFunc(gl.LESS); }
    };
    return inst;
};
RailDrawer.createPair = function(type)
{
    return [this.create(type, 1), this.create(type, -1)];
};
