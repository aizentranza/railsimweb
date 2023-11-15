'use strict';
var RailBuilder = CreateInstance();
RailBuilder.cMinDist = 1.0;
RailBuilder.mFirstRail  = null;
RailBuilder.mFirstPoint = null;
RailBuilder.mIsTooClose = false;
RailBuilder.mSelectedRail = null;
RailBuilder.mSelectedPoint = null;
RailBuilder.mSelectedSwitch = null;
RailBuilder.mSelectedSwitchSide = 0;
RailBuilder.mFieldSettingMgr = UI_Check.createMgr({ fixed : true, });
RailBuilder.mFieldHeightMgr = UI_Slider.createMgr({
    fixed : true, min : -20, max : 20, slide_round : 1, size : 4, })
RailBuilder.mHeightMgr = UI_Slider.createMgr({
    fixed : true, min : -50, max : 50, slide_round : 1, size : 4, })
RailBuilder.mCurveFactorMgr = UI_Slider.createMgr({
    fixed : true, min : 0, max : 1, slide_round : 0.05, size : 4, fixed_range : true,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mCurveFactor', cLang.act_set_curve_factor);
    }, });
RailBuilder.mRailFlagMgr = UI_Check.createMgr({
    fixed : true,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mRailFlag', cLang.act_toggle_rail);
    }, });
RailBuilder.mRailTypeMgr = UI_Select.createMgr({
    fixed : true, clip_name : 'rail-type',
    options : [
        { label : cLang.rail_narrow  , value : 'narrow'  , },
        { label : cLang.rail_standard, value : 'standard', },
        { label : cLang.rail_safege  , value : 'safege'  , },
        { label : cLang.rail_alweg   , value : 'alweg'   , },
    ],
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(
            inst.mValue, 'mRailType', cLang.act_set_rail_type,
            function(rail) {
                if (rail.mSwitchPoints[0] || rail.mSwitchPoints[1]) {
                    rail.mPoints.forEach(point => RailBuilder.updateSwitchPoint(point));
                }
            });
    }, });
RailBuilder.mTieFlagMgr = UI_Check.createMgr({
    fixed : true,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mTieFlag', cLang.act_toggle_tie);
    }, });
RailBuilder.mTieTypeMgr = UI_Select.createMgr({
    fixed : true, clip_name : 'tie-type',
    options : [
        { label : cLang.tie_ballast, value : 'ballast', },
        { label : cLang.tie_slab   , value : 'slab'   , },
    ],
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mTieType', cLang.act_set_tie_type);
    }, });
RailBuilder.mGirderFlagMgr = UI_Check.createMgr({
    fixed : true,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mGirderFlag', cLang.act_toggle_girder);
    }, });
RailBuilder.mGirderTypeMgr = UI_Select.createMgr({
    fixed : true, clip_name : 'girder-type',
    options : [
        { label : cLang.girder_girder, value : 'girder', },
        { label : cLang.girder_tunnel, value : 'tunnel', },
    ],
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mGirderType', cLang.act_set_girder_type);
    }, });
RailBuilder.mPierFlagMgr = UI_Check.createMgr({
    fixed : true,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mPierFlag', cLang.act_toggle_pier);
    }, });
RailBuilder.mPierTypeMgr = UI_Select.createMgr({
    fixed : true, clip_name : 'pier-type',
    options : [
        { label : cLang.pier_center, value : 'center', },
        { label : cLang.pier_both  , value : 'both'  , },
        { label : cLang.pier_left  , value : 'left'  , },
        { label : cLang.pier_right , value : 'right' , },
    ],
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mPierType', cLang.act_set_pier_type);
    }, });
RailBuilder.mPierIntervalMgr = UI_Slider.createMgr({
    fixed : true, size : 4, min : 0, max : 100, slide_round : 0.1,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mPierInterval', cLang.act_set_pier_interval);
    }, });
RailBuilder.mPierOffsetMgr = UI_Slider.createMgr({
    fixed : true, fixed_range : true, size : 4, min : 0, max : 1, slide_round : 0.001,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangeRailFlag(inst.mValue, 'mPierOffset', cLang.act_set_pier_offset);
    }, });
RailBuilder.mRailPartMgr = UI_Struct.createMgr({
    clip_name : 'rail-part', disable_undo : true,
    on_update : function(inst, src_mgr) {
        if (inst == RailBuilder.mLeftPart) {
            RailBuilder.onChangeRailFlag(inst.mValue, 'mLeftPart', cLang.act_set_left_part);
        } else {
            RailBuilder.onChangeRailFlag(inst.mValue, 'mRightPart', cLang.act_set_right_part);
        }
    }, });
RailBuilder.mRailPartMgr.pushStruct({
    key : 'flag', title : cLang.cmn_enable, def_value : false, labeled : 'value',
    mgr : UI_Check.createMgr({ fixed : true, parent_mgr : RailBuilder.mRailPartMgr, }), });
RailBuilder.mRailPartMgr.pushStruct({
    key : 'type', title : cLang.cmn_type, def_value : 'plt', labeled : 'value',
    mgr : UI_Select.createMgr({
        fixed : true, clip_name : 'rail-part-type',
        options : [
            { value : 'plt'  , label : cLang.part_platform, },
            { value : 'wall' , label : cLang.part_wall    , },
            { value : 'floor', label : cLang.part_floor   , },
        ],
        parent_mgr : RailBuilder.mRailPartMgr, }), });
RailBuilder.mRailPartMetricMgr = UI_Struct.createMgr({
    clip_name : 'rail-part-metric', disable_undo : true, });
RailBuilder.mRailPartMetricMgr.pushStruct({
    key : 'offset', title : cLang.cmn_offset, def_value : 1.7, labeled : true,
    mgr : UI_Slider.createMgr({
        fixed : true, size : 4, min : 0, max : 10, slide_round : 0.1,
        parent_mgr : RailBuilder.mRailPartMetricMgr, }), });
RailBuilder.mRailPartMetricMgr.pushStruct({
    key : 'width', title : cLang.cmn_width, def_value : 2.0, labeled : true,
    mgr : UI_Slider.createMgr({
        fixed : true, size : 4, min : 0, max : 10, slide_round : 0.1,
        parent_mgr : RailBuilder.mRailPartMetricMgr, }), });
RailBuilder.mRailPartMetricMgr.pushStruct({
    key : 'height', title : cLang.cmn_height, def_value : 1.5, labeled : true,
    mgr : UI_Slider.createMgr({
        fixed : true, size : 4, min : 0, max : 10, slide_round : 0.1,
        parent_mgr : RailBuilder.mRailPartMetricMgr, }), });
RailBuilder.mRailPartMetricMgr.initializeStruct();
RailBuilder.mRailPartMetricsMgr = UI_Array.createMgr({
    fixed : true, element_mgr : RailBuilder.mRailPartMetricMgr, init_element_value : null,
    min_element_num : 1, parent_mgr : RailBuilder.mRailPartMgr, });
RailBuilder.mRailPartMgr.pushStruct({
    key : 'metrics', title : cLang.part_dimensions, def_value : [
        RailBuilder.mRailPartMetricMgr.makeDefaultValue()], labeled : true,
    mgr : RailBuilder.mRailPartMetricsMgr, });
RailBuilder.mRailPartMgr.initializeStruct();
RailBuilder.onChangeRailFlag = function(new_value, value_name, mes, on_update) {
    var rail = RailBuilder.mSelectedRail;
    if (!rail) { return; }
    var old_value = rail[value_name];
    if (old_value != new_value) {
        PushUndo(function() {
            rail[value_name] = old_value;
            if (on_update) { on_update(rail); }
            Rail.writeAll();
        }, function() {
            rail[value_name] = new_value;
            if (on_update) { on_update(rail); }
            Rail.writeAll();
        }, mes, true, rail);
    }
};
RailBuilder.onChangePointPos = function(new_value, dim, mes) {
    var point = RailBuilder.mSelectedPoint;
    if (!point) { return; }
    var old_value = point.mPos[dim];
    if (old_value != new_value) {
        PushUndo(function() {
            point.mPos[dim] = old_value;
            RailBuilder.updateSwitchPoint(point);
            Rail.writeAll();
        }, function() {
            point.mPos[dim] = new_value;
            RailBuilder.updateSwitchPoint(point);
            Rail.writeAll();
        }, mes, true, point);
    }
};
RailBuilder.mDiableOnChangePointDir = false;
RailBuilder.onChangePointDir = function(dir, slope, cant, mes) {
    if (RailBuilder.mDiableOnChangePointDir) { return; }
    var point = RailBuilder.mSelectedPoint;
    if (!point) { return; }
    var old_dir = v3.Dup(point.mDir), old_up = v3.Dup(point.mUp);
    var xz_len = v3.Length(v3.SetY(old_dir, 0));
    var dir_rad = dir * cDeg2Rad, slope_rad = slope * cDeg2Rad, cant_rad = cant * cDeg2Rad;
    var slope_cos = Math.cos(slope_rad);
    var new_dir = v3.Make(xz_len * Math.cos(dir_rad) * slope_cos, Math.sin(slope_rad),
                          xz_len * Math.sin(dir_rad) * slope_cos);
    var tmp_left = v3.normalize(v3.Cross(v3.ey, new_dir));
    var tmp_up = v3.normalize(v3.Cross(new_dir, tmp_left));
    var new_up = v3.add(v3.Muls(tmp_up, Math.cos(cant_rad)),
                        v3.Muls(tmp_left, Math.sin(cant_rad)));
    Log('up = ' + v3.ToFixed(new_up, 2));
    var cDirEpsilon = 1e-5;
    if (v3.Length(v3.Sub(old_dir, new_dir)) > cDirEpsilon ||
        v3.Length(v3.Sub(old_up, new_up)) > cDirEpsilon)
    {
        PushUndo(function() {
            ControlPoint.setDir(point, old_dir, old_up);
            RailBuilder.updateSwitchPoint(point);
            Rail.writeAll();
        }, function() {
            ControlPoint.setDir(point, new_dir, new_up);
            RailBuilder.updateSwitchPoint(point);
            Rail.writeAll();
        }, mes, true, point);
    }
};
RailBuilder.mPointXMgr = UI_Slider.createMgr({
    fixed : true, min : -1000, max : 1000, slide_round : 0.1,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangePointPos(inst.mValue, 0, cLang.act_set_point_x);
    }, });
RailBuilder.mPointZMgr = UI_Slider.createMgr({
    fixed : true, min : -1000, max : 1000, slide_round : 0.1,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangePointPos(inst.mValue, 2, cLang.act_set_point_z);
    }, });
RailBuilder.mPointHeightMgr = UI_Slider.createMgr({
    fixed : true, min : -50, max : 50, slide_round : 0.1,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangePointPos(inst.mValue, 1, cLang.act_set_point_height);
    }, });
RailBuilder.mPointDirMgr = UI_Slider.createMgr({
    fixed : true, min : -180, max : 180, slide_round : 0.1,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangePointDir(
            inst.mValue, RailBuilder.mPointSlopeMgr.getValue(),
            RailBuilder.mPointCantMgr.getValue(), cLang.act_set_point_dir);
    }, });
RailBuilder.mPointSlopeMgr = UI_Slider.createMgr({
    fixed : true, min : -50, max : 50, slide_round : 0.1,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangePointDir(
            RailBuilder.mPointDirMgr.getValue(), inst.mValue,
            RailBuilder.mPointCantMgr.getValue(), cLang.act_set_point_slope);
    }, });
RailBuilder.mPointCantMgr = UI_Slider.createMgr({
    fixed : true, min : -20, max : 20, slide_round : 0.1,
    on_update : function(inst, src_mgr) {
        RailBuilder.onChangePointDir(
            RailBuilder.mPointDirMgr.getValue(), RailBuilder.mPointSlopeMgr.getValue(),
            inst.mValue, cLang.act_set_point_cant);
    }, });
RailBuilder.mSwitchSettingMgr = UI_Struct.createMgr({
    clip_name : 'schedule-switch-setting', disable_undo : true, });
RailBuilder.mSwitchSettingMgr.pushStruct({
    key : 'train_id', title : LangAppend(cLang.cmn_train, ' ID'), def_value : '', labeled : true,
    get_def_value : function() {
        var v = TrainEditor.getDefaultValue(); return v === null ? '' : v;
    },
    mgr : RailBuilder.mSwitchTrainSelectMgr = TrainEditor.createSelectMgr({
        parent_mgr : RailBuilder.mSwitchSettingMgr, fixed : true, }), });
RailBuilder.mSwitchSettingMgr.pushStruct({
    key : 'schedule', title : cLang.travel_dir, def_value : 'main', labeled : true,
    mgr : RailBuilder.mTurnFlagMgr = UI_Radio.createMgr({
        clip_name : 'switch-turn-flag', fixed : true, dom_name : 'radio-sched-sw-turn-flag',
        parent_mgr : RailBuilder.mSwitchSettingMgr,
        options : [
            { value : 'main', label : cLang.switch_dir_main, },
            { value : 'sub' , label : cLang.switch_dir_sub , },
            { value : 'alt' , label : cLang.switch_dir_alt , },
            { value : 'rnd' , label : cLang.switch_dir_rnd , },
        ], }), });
RailBuilder.mSwitchSettingMgr.initializeStruct();
RailBuilder.mSwitchSettingsMgr = UI_Array.createMgr({
    fixed : true, element_mgr : RailBuilder.mSwitchSettingMgr, init_element_value : null,
    fixed_elements : [cLang.cmn_default],
    on_update : function(inst, src_mgr) {
        var rail = RailBuilder.mSelectedSwitch, rail_side = RailBuilder.mSelectedSwitchSide;
        if (!rail) { return; }
        var old_value = rail.mSwitchInfos[rail_side];
        var new_value = RailBuilder.mSwitchSettingsMgr.getValue();
        PushUndo(function() {
            rail.mSwitchInfos[rail_side] = old_value;
        }, function() {
            rail.mSwitchInfos[rail_side] = new_value;
        }, cLang.act_set_sw_schedule, true, rail);
    }, });
RailBuilder.mSignalNameMgr = UI_Text.createMgr({
    size : 16, fixed : true, type : 'id',
    on_update : function(inst, src_mgr) {
        var rail = RailBuilder.mSelectedRail;
        if (!rail) { return; }
        var old_value = rail.mSignalName;
        var new_value = RailBuilder.mSignalNameMgr.getValue();
        if (old_value == new_value) { return; }
        PushUndo(function() {
            rail.mSignalName = old_value;
        }, function() {
            rail.mSignalName = new_value;
        }, cLang.act_set_signal_name, true, rail);
    }, });
RailBuilder.mStationSettingMgr = UI_Struct.createMgr({
    clip_name : 'schedule-station-setting', disable_undo : true, });
RailBuilder.mStationSettingMgr.pushStruct({
    key : 'train_id', title : LangAppend(cLang.cmn_train, ' ID'), def_value : '', labeled : true,
    get_def_value : function() {
        var v = TrainEditor.getDefaultValue(); return v === null ? '' : v;
    },
    mgr : RailBuilder.mStationTrainSelectMgr = TrainEditor.createSelectMgr({
        parent_mgr : RailBuilder.mStationSettingMgr, fixed : true, }), });
RailBuilder.mStationTrainSelectMgr.mIsEnableEmptyOption = true;
RailBuilder.mStationSettingMgr.pushStruct({
    key : 'direction', title : cLang.travel_dir, def_value : 'all', labeled : true,
    mgr : RailBuilder.mTrainDirectionMgr = UI_Radio.createMgr({
        clip_name : 'train-direction', fixed : true, dom_name : 'radio-sched-train-dir',
        parent_mgr : RailBuilder.mStationSettingMgr,
        options : [
            { value : 'all', label : cLang.station_dir_any, },
            { value : '0', label : '0', },
            { value : '1', label : '1', },
        ], }), });
RailBuilder.mStationSettingMgr.pushStruct({
    key : 'stop', title : cLang.station_stop, def_value : true, labeled : true,
    mgr : UI_Check.createMgr({ parent_mgr : RailBuilder.mStationSettingMgr, fixed : true, }), });
RailBuilder.mStationSettingMgr.pushStruct({
    key : 'turnaround', title : cLang.station_turnaround, def_value : false, labeled : true,
    mgr : UI_Check.createMgr({ parent_mgr : RailBuilder.mStationSettingMgr, fixed : true, }), });
RailBuilder.mStationSettingMgr.pushStruct({
    key : 'duration', def_value : 5,
    title : LangJoin([cLang.station_time, ' [', cLang.cmn_sec, ']']),
    mgr : UI_Slider.createMgr({
        parent_mgr : RailBuilder.mStationSettingMgr, fixed : true,
        min : 0, max : 60, slide_round : 1, }), });
RailBuilder.mStationSettingMgr.pushStruct({
    key : 'duration_rnd', def_value : 0,
    title : LangAppendSp(cLang.station_time, cLang.cmn_random),
    mgr : UI_Slider.createMgr({
        parent_mgr : RailBuilder.mStationSettingMgr, fixed : true,
        min : 0, max : 60, slide_round : 1, }), });
RailBuilder.mStationSettingMgr.pushStruct({
    key : 'offset', title : cLang.cmn_position, def_value : 0,
    mgr : RailBuilder.mStationOffsetMgr = UI_Slider.createMgr({
        parent_mgr : RailBuilder.mStationSettingMgr, fixed : true, fixed_range : true,
        min : 0, max : 1, slide_round : 0.01, }), });
RailBuilder.mStationSettingMgr.initializeStruct();
RailBuilder.mStationSettingsMgr = UI_Array.createMgr({
    fixed : true, element_mgr : RailBuilder.mStationSettingMgr, init_element_value : null,
    on_update : function(inst, src_mgr) {
        var rail = RailBuilder.mSelectedRail;
        if (!rail) { return; }
        var old_value = rail.mStationInfo
        var new_value = RailBuilder.mStationSettingsMgr.getValue();
        PushUndo(function() {
            rail.mStationInfo = old_value;
        }, function() {
            rail.mStationInfo = new_value;
        }, cLang.act_set_stn_schedule, true, rail);
    }, });
RailBuilder.initialize = function()
{
    this.mRailPane = CreateEditPane('rail', cLang.head_rail, function(div_on) {
        this.mFieldSetting = this.mFieldSettingMgr.createActiveInstance({
            parent : div_on, value : true, title : cLang.struct_field_setting, });
        div_on.append(CreateHBR());
        this.mFieldHeight = this.mFieldHeightMgr.createActiveInstance({
            parent : div_on, value : 0, title : cLang.track_field_height, });
        div_on.append(CreateBR());
        this.mRailHintArea = CreateElement('span');
        this.mRailHintArea.append(LangSpan(cLang.desc_select_rail_end));
        this.mRailArea = CreateElement('span');
        this.mHeight = this.mHeightMgr.createActiveInstance({
            parent : this.mRailArea, value : 0, title : cLang.track_elevated, });
        this.mRailArea.append(CreateHBR());
        this.mCurveFactor = this.mCurveFactorMgr.createActiveInstance({
            parent : this.mRailArea, value : 0.5, title : cLang.track_curve_factor, });
        this.mRailArea.append(CreateHBR());
        this.mRailFlag = this.mRailFlagMgr.createActiveInstance({
            parent : this.mRailArea, value : true, title : cLang.track_rail, });
        this.mRailType = this.mRailTypeMgr.createActiveInstance({
            parent : this.mRailArea, value : 'narrow', title : cLang.cmn_type, });
        this.mRailArea.append(CreateHBR());
        this.mTieFlag = this.mTieFlagMgr.createActiveInstance({
            parent : this.mRailArea, value : true, title : cLang.track_tie, });
        this.mTieType = this.mTieTypeMgr.createActiveInstance({
            parent : this.mRailArea, value : 'ballast', title : cLang.cmn_type, });
        this.mRailArea.append(CreateHBR());
        this.mGirderFlag = this.mGirderFlagMgr.createActiveInstance({
            parent : this.mRailArea, value : false, title : cLang.track_girder, });
        this.mGirderType = this.mGirderTypeMgr.createActiveInstance({
            parent : this.mRailArea, value : 'girder', title : cLang.cmn_type, });
        this.mRailArea.append(CreateHBR());
        this.mPierFlag = this.mPierFlagMgr.createActiveInstance({
            parent : this.mRailArea, value : false, title : cLang.track_pier, });
        this.mPierType = this.mPierTypeMgr.createActiveInstance({
            parent : this.mRailArea, value : 'center', title : cLang.cmn_type, });
        this.mRailArea.append(CreateHBR());
        this.mPierInterval = this.mPierIntervalMgr.createActiveInstance({
            parent : this.mRailArea, value : RailMetric.cPierIntervalDefault,
            title : cLang.track_interval, });
        this.mRailArea.append(CreateHBR());
        this.mPierOffset = this.mPierOffsetMgr.createActiveInstance({
            parent : this.mRailArea, value : 0, title : cLang.cmn_position, });
        this.mRailArea.append(CreateHBR());
        this.mLeftPart = this.mRailPartMgr.createInstance({
            parent : this.mRailArea, value : this.mRailPartMgr.makeDefaultValue(),
            title : LangAppendSp(cLang.cmn_left, cLang.track_part), });
        this.mRailArea.append(CreateHBR());
        this.mRightPart = this.mRailPartMgr.createInstance({
            parent : this.mRailArea, value : this.mRailPartMgr.makeDefaultValue(),
            title : LangAppendSp(cLang.cmn_right, cLang.track_part), });
        this.mRailArea.append(CreateHBRVSL());
        this.mRailArea.append(CreateScriptLinkEdit(cLang.cmn_cancel, function() {
            RailBuilder.deleteControlPoint(); }, cLang.desc_delete_last_ctrl_point), ' / ');
        this.mRailArea.append(CreateScriptLinkEdit(cLang.cmn_delete, function() {
            RailBuilder.deleteSelectedRail(); }, cLang.desc_delete_selected_rail));
        this.mPointArea = CreateElement('span');
        this.mPointX = this.mPointXMgr.createActiveInstance({
            parent : this.mPointArea, value : 0,
            title : LangAppend(cLang.cmn_position, ' (X)'), });
        this.mPointArea.append(CreateHBR());
        this.mPointZ = this.mPointZMgr.createActiveInstance({
            parent : this.mPointArea, value : 0,
            title : LangAppend(cLang.cmn_position, ' (Z)'), });
        this.mPointArea.append(CreateHBR());
        this.mPointHeight = this.mPointHeightMgr.createActiveInstance({
            parent : this.mPointArea, value : 0,
            title : LangAppend(cLang.track_elevated, ' (Y)'), });
        this.mPointArea.append(CreateHBR());
        this.mPointDir = this.mPointDirMgr.createActiveInstance({
            parent : this.mPointArea, value : 0, title : cLang.cmn_direction, });
        this.mPointArea.append(CreateHBR());
        this.mPointSlope = this.mPointSlopeMgr.createActiveInstance({
            parent : this.mPointArea, value : 0, title : cLang.cmn_slope, });
        this.mPointArea.append(CreateHBR());
        this.mPointCant = this.mPointCantMgr.createActiveInstance({
            parent : this.mPointArea, value : 0, title : cLang.cmn_cant, });
        this.mActiveRailArea = this.mRailArea;
        div_on.append(this.mActiveRailArea);
        OnNextCalc(function() {
            if (!this.mFieldHeightMgr.isVisible()) { return true; }
            this.mFieldHeightMgr.updateSlider(this.mHeight.mValue);
        }, this);
        OnNextCalc(function() {
            if (!this.mHeightMgr.isVisible()) { return true; }
            this.mHeightMgr.updateSlider(this.mHeight.mValue);
            this.mCurveFactorMgr.updateSlider(this.mCurveFactor.mValue);
            this.mPierIntervalMgr.updateSlider(this.mPierInterval.mValue);
            this.mPierOffsetMgr.updateSlider(this.mPierOffset.mValue);
        }, this);
        OnNextCalc(function() {
            if (!this.mPointHeightMgr.isVisible()) { return true; }
            this.mPointXMgr.updateSlider(this.mPointX.mValue);
            this.mPointZMgr.updateSlider(this.mPointZ.mValue);
            this.mPointHeightMgr.updateSlider(this.mPointHeight.mValue);
            this.mPointDirMgr.updateSlider(this.mPointDir.mValue);
            this.mPointSlopeMgr.updateSlider(this.mPointSlope.mValue);
            this.mPointCantMgr.updateSlider(this.mPointCant.mValue);
        }, this);
    }, this);
    this.mSchedulePane = CreateEditPane('schedule', cLang.head_schedule, function(div_on) {
        this.mScheduleHintArea = CreateElement('span');
        this.mScheduleHintArea.append(LangSpan(cLang.desc_select_rail_switch));
        this.mSwitchArea = CreateElement('span');
        this.mSwitchSettings = this.mSwitchSettingsMgr.createActiveInstance({
            parent : this.mSwitchArea, value : [{ train_id : 'default', schedule : 'main', }],
            title : LangAppendSp(cLang.cmn_turnout, cLang.cmn_settings), });
        this.mStationArea = CreateElement('span');
        this.mSignalName = this.mSignalNameMgr.createActiveInstance({
            parent : this.mStationArea, title : cLang.station_signal_name, value : '', });
        this.mStationArea.append(CreateBR());
        this.mStationSettings = this.mStationSettingsMgr.createActiveInstance({
            parent : this.mStationArea, value : [],
            title : LangAppendSp(cLang.cmn_station, cLang.cmn_settings), });
        this.mActiveScheduleArea = this.mScheduleHintArea;
        div_on.append(this.mActiveScheduleArea);
    }, this);
};
RailBuilder.getCurveFactor  = function() { return this.mCurveFactor .mValue; };
RailBuilder.getRailFlag     = function() { return this.mRailFlag    .mValue; };
RailBuilder.getRailType     = function() { return this.mRailType    .mValue; };
RailBuilder.getTieFlag      = function() { return this.mTieFlag     .mValue; };
RailBuilder.getTieType      = function() { return this.mTieType     .mValue; };
RailBuilder.getGirderFlag   = function() { return this.mGirderFlag  .mValue; };
RailBuilder.getGirderType   = function() { return this.mGirderType  .mValue; };
RailBuilder.getPierFlag     = function() { return this.mPierFlag    .mValue; };
RailBuilder.getPierType     = function() { return this.mPierType    .mValue; };
RailBuilder.getPierInterval = function() { return this.mPierInterval.mValue; };
RailBuilder.getPierOffset   = function() { return this.mPierOffset  .mValue; };
RailBuilder.getLeftPart     = function() { return this.mLeftPart    .mValue; };
RailBuilder.getRightPart    = function() { return this.mRightPart   .mValue; };
RailBuilder.getSignalName   = function() { return this.mSignalName  .mValue; };
RailBuilder.selectRailArea = function(area)
{
    if (this.mActiveRailArea != area) {
        var parent = this.mActiveRailArea.parentNode;
        parent.insertBefore(area, this.mActiveRailArea);
        parent.removeChild(this.mActiveRailArea);
        this.mActiveRailArea = area;
    }
};
RailBuilder.selectScheduleArea = function(area)
{
    if (this.mActiveScheduleArea != area) {
        var parent = this.mActiveScheduleArea.parentNode;
        parent.insertBefore(area, this.mActiveScheduleArea);
        parent.removeChild(this.mActiveScheduleArea);
        this.mActiveScheduleArea = area;
    }
};
RailBuilder.deselectRail = function()
{
    this.mSelectedRail = this.mSelectedPoint = RailBuilder.mSelectedSwitch = null;
    this.selectRailArea(this.mRailHintArea);
    this.selectScheduleArea(this.mScheduleHintArea);
}
RailBuilder.addCtrlPoint = function(wpos)
{
    if (!wpos) { wpos = this.mCursorPos; }
    if (!wpos) { return; }
    var point = null, split_info = this.mRailSplitInfo;
    if (split_info)
    {
        var del_rail = split_info.rail;
        point = ControlPoint.create(split_info.pos);
        ControlPoint.setDir(point, split_info.dir, split_info.up);
        var point0 = del_rail.mPoints[0], point1 = del_rail.mPoints[1];
        var point_side0 = ControlPoint.checkSide(point0, del_rail);
        var point_side1 = ControlPoint.checkSide(point1, del_rail);
        Rail.deleteRail(del_rail);
        var rail0 = Rail.create(point0, point_side0, point, 0);
        var rail1 = Rail.create(point, 1, point1, point_side1);
        Rail.cRailOptions.forEach(name =>
            rail0['m' + name.m] = rail1['m' + name.m] = del_rail['m' + name.m]);
        Rail.writeAll();
        PushUndo(function() {
            Rail.deleteRail(rail0);
            Rail.deleteRail(rail1);
            Rail.connect(del_rail, point0, point_side0, point1, point_side1);
            Rail.pushObj(del_rail);
            Rail.writeAll();
        }, function() {
            Rail.deleteRail(del_rail);
            Rail.connect(rail0, point0, point_side0, point, 0);
            Rail.connect(rail1, point, 1, point1, point_side1);
            Rail.pushObj(rail0);
            Rail.pushObj(rail1);
            Rail.writeAll();
        }, cLang.act_split_rail);
        return;
    }
    var point_side = 0;
    if (this.mNearestEnd) {
        point = Rail.getPoint(this.mNearestEnd.rail,
                              this.mNearestEnd.side, this.mNearestEnd.sw);
        point_side = this.mNearestEndPointSide;
    } else {
        point = ControlPoint.create(wpos);
        point_side = this.mFirstPoint ? 0 : 1;
    }
    if (this.mFirstPoint)
    {
        var dist = v3.CalcDist(this.mFirstPoint.mPos, point.mPos);
        if (dist < this.cMinDist || this.mIsTooClose) {
            this.deleteControlPoint();
        } else if (this.mSwitchPointInfo) {
            var switch_side = 1 - this.mFirstRailSide;
            Log(LangJoin([cLang.act_create_sw_point, ': ' + switch_side]));
            if (switch_side == 0) { v3.neg(this.mSwitchPointInfo.dir); }
            point.mPos = this.mSwitchPointInfo.pos;
            point.mLeftSign = this.mSwitchPointInfo.left_sign;
            ControlPoint.setDir(point, this.mSwitchPointInfo.dir);
            var rail = this.mFirstRail;
            PushUndo(function() {
                Rail.setSwitchPoint(rail, switch_side, null);
                Rail.writeAll();
            }, function() {
                Rail.setSwitchPoint(rail, switch_side, point);
                Rail.writeAll();
            }, cLang.act_create_sw_point, true);
            this.resetControlPoint();
            this.mSwitchPointInfo = null;
        } else {
            Log(LangJoin([cLang.act_build_track, ': ' + v3.ToFixed(wpos, 2)]));
            var point0 = this.mFirstPoint;
            var point_side0 = this.mFirstPointSide;
            var pos0 = point0.mPos, pos1 = point.mPos;
            if (!point0.mDir || !point.mDir) {
                if (point0.mDir) {
                    var cdir = v3.Muls(point0.mDir, point_side0 ? 1 : -1);
                    ControlPoint.setDir(point, this.CalcCounterDir(pos0, cdir, pos1, true));
                } else if (point.mDir) {
                    var cdir = v3.Muls(point.mDir, point_side ? -1 : 1);
                    ControlPoint.setDir(point0, this.CalcCounterDir(pos1, cdir, pos0, false));
                } else {
                    var dir = v3.normalize(v3.Sub(pos1, pos0));
                    ControlPoint.setDir(point0, dir);
                    ControlPoint.setDir(point, dir);
                }
            }
            var rail = Rail.create(point0, point_side0, point, point_side);
            Rail.writeAll();
            PushUndo(function() {
                Rail.deleteRail(rail);
                Rail.writeAll();
            }, function() {
                Rail.connect(rail, point0, point_side0, point, point_side);
                Rail.pushObj(rail);
                Rail.writeAll();
            }, cLang.act_build_track);
            this.resetControlPoint();
        }
    }
    else
    {
        this.mFirstRail     = this.mNearestEnd && this.mNearestEnd.rail;
        this.mFirstRailSide = this.mNearestEnd && this.mNearestEnd.side;
        this.mFirstRailSw   = this.mNearestEnd && this.mNearestEnd.sw  ;
        this.mFirstPoint     = point;
        this.mFirstPointSide = point_side;
        Log(LangJoin([cLang.act_ctrl_point, ': ' + v3.ToFixed(wpos, 2)]));
    }
};
RailBuilder.deleteControlPoint = function()
{
    if (this.mFirstPoint) {
        this.resetControlPoint();
    }
};
RailBuilder.resetControlPoint = function()
{
    this.mFirstRail  = null;
    this.mFirstPoint = null;
};
RailBuilder.CalcCounterDir = function(pos0, dir0, pos1, is_flat)
{
    var dir = v3.normalize(v3.Sub(pos1, pos0));
    v3.muls(dir, v3.Dot(dir, dir0));
    dir = v3.Lerp(dir0, dir, 2);
    if (is_flat) { dir[1] = 0; }
    return v3.normalize(dir);
};
RailBuilder.CalcSwitchPointInfo = function(
    pos0, tpos1, tup1, tdir1, tleft1, left_sign, rail_type)
{
    var gauge = rail_type == 'narrow' ? RailMetric.cGauge
        : rail_type == 'standard' ? RailMetric.cGaugeStd
        : rail_type == 'safege' ? RailMetric.cSafegeWidth
        : rail_type == 'alweg' ? RailMetric.cAlwegSwitchWidth : 0;
    var width = rail_type == 'narrow' || rail_type == 'standard' ? RailMetric.cWidth : 0;
    var pos1 = v3.Add(
        tpos1, v3.Muls(tleft1, left_sign * (gauge + width)));
    var dir1 = this.CalcCounterDir(
        v3.Add(tpos1, v3.Muls(tdir1, v3.CalcDist(pos0, tpos1))), v3.Neg(tdir1), pos1);
    //var dir1 = this.CalcCounterDir(pos0, v3.Neg(tdir1), pos1);
    var left1 = v3.normalize(v3.Cross(tup1, dir1));
    v3.sub(pos1, v3.Muls(tleft1, left_sign * gauge * 0.5));
    v3.sub(pos1, v3.Muls( left1, left_sign * gauge * 0.5));
    return { pos : pos1, dir : dir1, };
};
// for automatic control
RailBuilder.setConnectionPoint = function(wpos)
{
    if (!this.mNearestEnd) {
        var nearest_end = Rail.searchNearestEnd(wpos);
        if (nearest_end.rail) {
            var con = Rail.getConnection(
                nearest_end.rail, nearest_end.side, nearest_end.sw);
            if (/*!con.rail*/true) {
                this.mNearestEnd = nearest_end;
                this.mNearestEndPointSide = con.point_side;
                this.addCtrlPoint(wpos);
                this.mNearestEnd = null;
            }
        }
    }
};
// for automatic control
RailBuilder.completeSwitchPoint = function(wpos)
{
    this.calc(wpos);
    this.addCtrlPoint(wpos);
};
RailBuilder.updateSwitchPoint = function(bpoint) {
    for (var i = 0; i < bpoint.mRails.length; ++i) {
        var rail = bpoint.mRails[i];
        if (!rail) { continue; }
        var rail_end = Rail.checkEnd(rail, bpoint);
        var spoint = Rail.getPoint(rail, rail_end, 1);
        if (!spoint) { continue; }
        var point0 = Rail.getPoint(rail, 1 - rail_end, 0);
        var pos0 = point0.mPos, dir0 = point0.mDir, up0 = point0.mUp;
        if (ControlPoint.checkSide(point0, rail) == 0) {
            dir0 = v3.Neg(dir0);
        }
        var pos1 = bpoint.mPos, up1 = bpoint.mUp;
        var tdir1 = v3.Muls(bpoint.mDir, RailMetric.cEndSign[
            ControlPoint.checkSide(bpoint, rail)]);
        var tleft1 = v3.normalize(v3.Cross(up1, tdir1));
        var left_sign = spoint.mLeftSign;
        var sinfo = RailBuilder.CalcSwitchPointInfo(
            pos0, pos1, up1, tdir1, tleft1, left_sign, rail.mRailType);
        spoint.mPos = sinfo.pos;
        if (rail_end == 0) { v3.neg(sinfo.dir); }
        ControlPoint.setDir(spoint, sinfo.dir, up1);
    }
};
RailBuilder.endMovePoint = function()
{
    var point = this.mMovePoint;
    var prev_pos  = v3.Dup(this.mMoveBasePointPos );
    var prev_dir  = v3.Dup(this.mMoveBasePointDir );
    var prev_left = v3.Dup(this.mMoveBasePointLeft);
    var next_pos  = v3.Dup(this.mMovePoint.mPos );
    var next_dir  = v3.Dup(this.mMovePoint.mDir );
    var next_left = v3.Dup(this.mMovePoint.mLeft);
    var eps = 1.0e-6;
    if (v3.CalcDist(prev_pos , next_pos ) > eps ||
        v3.CalcDist(prev_dir , next_dir ) > eps ||
        v3.CalcDist(prev_left, next_left) > eps) {
        var update_switch_points = function() {
            RailBuilder.updateSwitchPoint(point);
            for (var i = 0; i < point.mRails.length; ++i) {
                var rail = point.mRails[i];
                if (!rail) { continue; }
                var rail_end = Rail.checkEnd(rail, point);
                var cpoint = Rail.getPoint(rail, 1 - rail_end, 0)
                if (!cpoint || cpoint.mSwitchFrom >= 0) { continue; }
                RailBuilder.updateSwitchPoint(cpoint);
            }
            Rail.writeAll();
        }
        function undo_point() {
            point.mPos  = v3.Dup(prev_pos );
            point.mDir  = v3.Dup(prev_dir );
            point.mLeft = v3.Dup(prev_left);
        }
        if (g_mouse.isTouchMoved()) {
            PushUndo(function() {
                undo_point();
                update_switch_points();
            }, function() {
                point.mPos  = v3.Dup(next_pos );
                point.mDir  = v3.Dup(next_dir );
                point.mLeft = v3.Dup(next_left);
                update_switch_points();
            }, cLang.act_move_rail);
            update_switch_points();
        } else {
            undo_point();
        }
    }
};
RailBuilder.endRotatePoint = function()
{
    Rail.writeAll();
};
RailBuilder.turnSwitch = function()
{
    var rail = this.mTurnSwitchRail;
    if (rail) {
        var side = 1 - this.mTurnSwitchRailSide;
        var state = rail.mDrawBlock.mSwitchState;
        state[side] = 1 - state[side];
    }
};
RailBuilder.deleteSelectedRail = function()
{
    if (this.mSelectedRail) {
        var del_rail = this.mSelectedRail;
        var del_info = [[null, null], [null, null]];
        for (var side = 0; side < 2; ++side) {
            for (var sw = 0; sw < 2; ++sw) {
                var point = (sw ? del_rail.mSwitchPoints : del_rail.mPoints)[side];
                if (!point) { continue; }
                del_info[side][sw] = {
                    point : point,
                    pside : point.mRails[0] == del_rail ? 0 : 1,
                    sfrom : sw ? point.mSwitchFrom : -1,
                };
            }
        }
        this.mSelectedRail = null;
        PushUndo(function() {
            Rail.pushObj(del_rail);
            for (var side = 0; side < 2; ++side) {
                for (var sw = 0; sw < 2; ++sw) {
                    var info = del_info[side][sw];
                    if (!info) { continue; }
                    info.point.mRails[info.pside] = del_rail;
                    if (info.sfrom >= 0) { info.point.mSwitchFrom = info.sfrom; }
                }
            }
            Rail.writeAll();
        }, function() {
            Rail.deleteRail(del_rail);
            Rail.writeAll();
        }, cLang.act_delete_rail, true);
    }
};
RailBuilder.calc = function(wpos)
{
    if (this.mFieldSetting.mValue) {
        var field_args = {}, field_height = FieldEditor.getFieldHeight(wpos, field_args);
        if (field_height !== null) { wpos[1] = field_height + this.mFieldHeight.mValue; }
    }
    this.mCursorPos = v3.Dup(wpos);
    if (this.mFirstPoint)
    {
        var dist = g_camera.calcSphereIntersection(
            g_cursor_ray, v4.FromV3(this.mFirstPoint.mPos, this.cMinDist));
        this.mIsTooClose = dist >= 0;
    }
    this.mNearestEnd = null;
    this.mNearestRail = null;
    this.mNearestSwitch = null;
    this.mSwitchPointInfo = null;
    this.mRailSplitInfo = null;
    var nearest_end = Rail.searchNearestEnd(wpos, IsMenuSchedule() ? 10 : 1);
    if (nearest_end.rail) {
        if (nearest_end.dist < this.cMinDist) {
            var con = Rail.getConnection(
                nearest_end.rail, nearest_end.side, nearest_end.sw);
            if (!(IsMenuBuildRail() &&
                  (this.mFirstRail && nearest_end.rail == this.mFirstRail
                   || nearest_end.sw && con.rail
                   || con.rail && nearest_end.rail && Rail.getPoint(
                       nearest_end.rail, 1 - Rail.checkEnd(nearest_end.rail, con.point), 1)))) {
                if (IsMenuEditRail() ? con.point.mSwitchFrom < 0
                    : !this.mFirstPoint || !con.rail) {
                    this.mNearestEnd = nearest_end;
                    this.mNearestEndPointSide = con.point_side;
                }
            }
        }
    }
    function calc_selection() {
        if (RailBuilder.mNearestEnd) { return; }
        var nearest_rail = Rail.searchNearestRail(wpos);
        if (nearest_rail.rail && nearest_rail.dist < RailBuilder.cMinDist) {
            RailBuilder.mNearestRail = nearest_rail.rail;
            Rail.setHighlight(RailBuilder.mNearestRail);
        }
        Rail.setSelected(RailBuilder.mSelectedRail);
    }
    if (IsMenuBuildRail())
    {
        this.selectRailArea(this.mRailArea);
        if (this.mFirstPoint && this.mFirstRail &&
            this.mFirstPoint.mRails[this.mFirstPointSide]) {
            var pos0 = this.mFirstPoint.mPos;
            var dir0 = this.mFirstPoint.mDir;
            var up0 = v3.ey, up1 = v3.ey;
            if (this.mFirstPointSide == 1) {
                dir0 = v3.Neg(dir0);
            }
            //var point1 = this.mFirstRail.mPoints[1 - this.mFirstRailSide];
            var point1 = Rail.getPoint(
                this.mFirstRail, 1 - this.mFirstRailSide, this.mFirstRailSw);
            var pos1 = point1.mPos;
            var tdir1 = v3.Muls(point1.mDir, RailMetric.cEndSign[
                ControlPoint.checkSide(point1, this.mFirstRail)]);
            var tleft1 = v3.normalize(v3.Cross(up0, tdir1));
            var left_sign = 1;
            if (v3.Dot(tleft1, v3.Sub(this.mCursorPos, pos1)) < 0) {
                left_sign = -1;
            }
            var rail_type = this.getRailType();
            this.mSwitchPointInfo = this.CalcSwitchPointInfo(
                pos0, pos1, up1, tdir1, tleft1, left_sign, rail_type);
            this.mSwitchPointInfo.left_sign = left_sign;
        }
        else if (!nearest_end.rail)
        {
            var nearest_rail = Rail.searchNearestRail(wpos);
            if (nearest_rail.rail && nearest_rail.dist < this.cMinDist) {
                for (var i = 0; i < 2; ++i) {
                    if (v3.CalcDist(nearest_rail.rail.mPoints[i].mPos, nearest_rail.pos)
                        < this.cMinDist || nearest_rail.rail.mSwitchPoints[i]) {
                        nearest_rail = null; break;
                    }
                }
                if (nearest_rail) {
                    this.mRailSplitInfo = nearest_rail;
                }
            }
        }
        if (g_keyboard.getEscapeTrig()) {
            RailBuilder.deleteControlPoint();
        }
    }
    else if (IsMenuEditRail())
    {
        this.selectRailArea(this.mSelectedRail ? this.mRailArea :
                            this.mSelectedPoint ? this.mPointArea : this.mRailHintArea);
        calc_selection();
        if (g_ctrl_state == CtrlState.cMouseDown) {
            if (g_mouse.wasShortTouch()) {
                var rail = this.mSelectedRail = this.mNearestRail;
                this.mSelectedPoint = null;
                if (rail) {
                    this.selectRailArea(this.mRailArea);
                    var pos0 = rail.mPoints[0].mPos, pos1 = rail.mPoints[1].mPos;
                    var hpos = CalcCursorRayDist(pos0) < CalcCursorRayDist(pos1) ? pos0 : pos1;
                    this.mHeightMgr.updateValue(this.mHeight, hpos[1]);
                    this.mCurveFactorMgr.updateValue(this.mCurveFactor, rail.mCurveFactor);
                    this.mRailFlagMgr.updateValue(this.mRailFlag, rail.mRailFlag);
                    this.mRailTypeMgr.updateValue(this.mRailType, rail.mRailType);
                    this.mTieFlagMgr.updateValue(this.mTieFlag, rail.mTieFlag);
                    this.mTieTypeMgr.updateValue(this.mTieType, rail.mTieType);
                    this.mGirderFlagMgr.updateValue(this.mGirderFlag, rail.mGirderFlag);
                    this.mGirderTypeMgr.updateValue(this.mGirderType, rail.mGirderType);
                    this.mPierFlagMgr.updateValue(this.mPierFlag, rail.mPierFlag);
                    this.mPierTypeMgr.updateValue(this.mPierType, rail.mPierType);
                    this.mPierIntervalMgr.updateValue(
                        this.mPierInterval, rail.mPierInterval);
                    this.mPierOffsetMgr.updateValue(this.mPierOffset, rail.mPierOffset);
                    this.mRailPartMgr.updateValue(this.mLeftPart, rail.mLeftPart);
                    this.mRailPartMgr.updateValue(this.mRightPart, rail.mRightPart);
                }
            } else if (this.mNearestEnd) {
                g_ctrl_state = g_keyboard.isAltDown()
                    ? CtrlState.cRotatePoint : CtrlState.cMovePoint;
                g_mouse.resetDelta();
                this.mMovePoint = this.mNearestEnd.rail.mPoints[this.mNearestEnd.side];
                this.mMoveBasePointPos = v3.Dup(this.mMovePoint.mPos);
                this.mMoveBasePointDir = v3.Dup(this.mMovePoint.mDir);
                this.mMoveBasePointLeft = v3.Dup(this.mMovePoint.mLeft);
                v3.copy(wpos, this.mMovePoint.mPos);
                this.mMoveBaseCursorPos = v3.Dup(wpos);
                this.mHeightMgr.updateValue(this.mHeight, wpos[1]);
            }
        } else if (g_ctrl_state == CtrlState.cMovePoint) {
            if (g_mouse.wasShortTouch()) {
                this.selectRailArea(this.mPointArea);
                this.mSelectedPoint = this.mMovePoint;
                this.mSelectedRail = null;
                RailBuilder.mDiableOnChangePointDir = true;
                this.mPointXMgr.updateValue(this.mPointX, this.mSelectedPoint.mPos[0]);
                this.mPointZMgr.updateValue(this.mPointZ, this.mSelectedPoint.mPos[2]);
                this.mPointHeightMgr.updateValue(this.mPointHeight, this.mSelectedPoint.mPos[1]);
                this.mPointDirMgr.updateValue(this.mPointDir, Math.atan2(
                    this.mSelectedPoint.mDir[2], this.mSelectedPoint.mDir[0]) * cRad2Deg);
                this.mPointSlopeMgr.updateValue(this.mPointSlope, Math.atan2(
                    this.mSelectedPoint.mDir[1],
                    v3.Length(v3.SetY(this.mSelectedPoint.mDir, 0))) * cRad2Deg);
                var tmp_left = v3.normalize(v3.Cross(v3.ey, this.mSelectedPoint.mDir));
                var tmp_up = v3.normalize(v3.Cross(this.mSelectedPoint.mDir, tmp_left));
                this.mPointCantMgr.updateValue(this.mPointCant, Math.atan2(
                    v3.Dot(tmp_left, this.mSelectedPoint.mUp),
                    v3.Dot(tmp_up, this.mSelectedPoint.mUp)) * cRad2Deg);
                RailBuilder.mDiableOnChangePointDir = false;
            } else if (g_mouse.isTouchMoved()) {
                this.mMovePoint.mPos = v3.add(
                    v3.Sub(wpos, this.mMoveBaseCursorPos),
                    this.mMoveBasePointPos);
                if (g_keyboard.isShiftDown()) {
                    var cSnap = 2.5;
                    function round(x) {
                        return Math.round(x / cSnap) * cSnap;
                    }
                    function round_v3(v) {
                        v[0] = round(v[0]);
                        v[1] = round(v[1]);
                        v[2] = round(v[2]);
                    }
                    round_v3(this.mMovePoint.mPos);
                }
            }
        } else if (g_ctrl_state == CtrlState.cRotatePoint) {
            var theta = g_mouse.getDelta()[0] * 5.0;
            var base_dir = this.mMoveBasePointDir;
            var base_left = this.mMoveBasePointLeft;
            if (g_keyboard.isShiftDown()) {
                var base_up = v3.Cross(base_dir, base_left);
                base_dir = v3.Cross(v3.ex, base_up);
                base_left = v3.Cross(base_up, base_dir);
                var dot_dir = v3.Dot(this.mMoveBasePointDir, base_dir);
                var dot_left = v3.Dot(this.mMoveBasePointDir, base_left);
                var base_theta = Math.atan2(-dot_left, dot_dir);
                theta += base_theta;
                var cSnap = Math.PI / 12;
                theta = Math.round(theta / cSnap) * cSnap;
            }
            var cos_theta = Math.cos(theta);
            var sin_theta = Math.sin(theta);
            this.mMovePoint.mDir = v3.add(
                v3.Muls(base_dir, cos_theta),
                v3.Muls(base_left, -sin_theta));
            v3.setCross(this.mMovePoint.mLeft,
                        this.mMovePoint.mUp, this.mMovePoint.mDir);
        } else if (g_keyboard.getCommonDeleteTrig()) {
            this.deleteSelectedRail();
        }
    }
    else if (IsMenuSchedule())
    {
        calc_selection();
        function select_switch_or_rail() {
            if (nearest_end.rail && nearest_end.rail.mSwitchPoints[nearest_end.side]) {
                var cMaxHitDist = RailMetric.cGauge * 3;
                if (nearest_end.dist < cMaxHitDist) { return true; }
            }
            return false;
        }
        if (g_ctrl_state == CtrlState.cMouseDown) {
            if (g_mouse.wasShortTouch()) {
                this.mSelectedRail = null;
                this.mSelectedSwitch = null;
                if (select_switch_or_rail()) {
                    this.mSelectedSwitch = nearest_end.rail;
                    this.mSelectedSwitchSide = nearest_end.side;
                    this.mSelectedRail = null;
                    this.selectScheduleArea(this.mSwitchArea);
                    var infos = this.mSelectedSwitch.mSwitchInfos;
                    if (!infos[this.mSelectedSwitchSide]) {
                        infos[this.mSelectedSwitchSide] = [
                            {train_id : null, schedule : 'main', }];
                    }
                    this.mSwitchSettingsMgr.updateValue(
                        this.mSwitchSettings, infos[this.mSelectedSwitchSide]);
                } else if (this.mNearestRail) {
                    this.mSelectedRail = this.mNearestRail;
                    this.selectScheduleArea(this.mStationArea);
                    this.mSignalNameMgr.updateValue(
                        this.mSignalName, this.mSelectedRail.mSignalName);
                    this.mStationSettingsMgr.updateValue(
                        this.mStationSettings, this.mSelectedRail.mStationInfo);
                } else {
                    this.selectScheduleArea(this.mScheduleHintArea);
                }
            }
        } else {
            if (select_switch_or_rail()) {
                this.mNearestSwitch = nearest_end.rail;
                this.mNearestSwitchSide = nearest_end.side;
                this.mNearestRail = null;
                Rail.setHighlight(null);
            }
        }
        //this.mTurnSwitchRail = null;
        //Rail.resetDrawBlockColors(v4.cWhite);
        //var rail = nearest_end.rail;
        //if (rail && rail.mDrawBlock
        //    && rail.mSwitchPoints[nearest_end.side]) {
        //    var cMaxHitDist = RailMetric.cGauge * 10;
        //    if (nearest_end.dist < cMaxHitDist) {
        //        rail.mDrawBlock.mColor = v4.cRed;
        //        this.mTurnSwitchRail = rail;
        //        this.mTurnSwitchRailSide = nearest_end.side;
        //    }
        //}
    }
};
RailBuilder.write = function()
{
    if (this.mFirstPoint && IsMenuBuildRail())
    {
        var height = 5.0;
        var mtx = m34.MakeST(v3.Make(1, height, 1),
                             v3.AddY(this.mFirstPoint.mPos, height * 0.5));
        g_box_drawer.pushBox(
            mtx, this.mIsTooClose ? v4.Make(1, 0, 0, 1) : v4.Make(1, 1, 0, 1));
        FieldEditor.drawHeightLine(this.mFirstPoint.mPos);
    }
    var nearest_point = null;
    var con_pos = null, con_dir = null;
    if (this.mNearestEnd)
    {
        var rail = this.mNearestEnd.rail;
        var side = this.mNearestEnd.side;
        var sw   = this.mNearestEnd.sw  ;
        var point_side = this.mNearestEndPointSide;
        var sign = RailMetric.cEndSign[point_side];
        nearest_point = Rail.getPoint(rail, side, sw);
        if (IsMenuBuildRail()) {
            con_pos = AddRailTotalHeight(nearest_point.mPos, nearest_point.mUp);
            con_dir = v3.Muls(nearest_point.mDir, -sign);
            var len = 5.0;
            if (nearest_point.mRails[point_side]) {
                var con_perp = v3.normalize(v3.Cross(v3.ey, con_dir));
                var con_dir0 = v3.normalize(v3.add(v3.Muls(con_dir, 2), con_perp));
                var con_dir1 = v3.normalize(v3.sub(v3.Muls(con_dir, 2), con_perp));
                var color = v4.Make(1, 0.5, 0, 1);
                DrawArrow(con_pos, v3.add(v3.Muls(con_dir0, len), con_pos), 0.5, color);
                DrawArrow(con_pos, v3.add(v3.Muls(con_dir1, len), con_pos), 0.5, color);
            } else {
                DrawArrow(con_pos, v3.add(v3.Muls(con_dir, -len), con_pos),
                          0.5, v4.Make(1, 0, 0, 1));
            }
        }
    }
    var split_info = this.mRailSplitInfo;
    if (split_info)
    {
        g_box_drawer.pushBox(m34.MakeOrtho(
            split_info.dir, split_info.up, split_info.pos,
            v3.muls(v3.Make(4, 4, 0.2), RailMetric.cGauge)), v4.Make(0, 0, 1, 1));
    }
    var line_color = v4.Make(1, 0, 0, 1);
    function draw_line(seg0, seg1) {
        g_line_drawer.pushLine(
            AddRailTotalHeight(seg0.pos, seg0.up),
            AddRailTotalHeight(seg1.pos, seg1.up),
            line_color);
    }
    if (IsMenuBuildRail() && this.mFirstPoint) {
        var args = { curve_factor : this.getCurveFactor(), };
        if (this.mSwitchPointInfo) {
            var seg0 = { pos : this.mFirstPoint.mPos, dir : this.mFirstPoint.mDir,
                         up : v3.ey };
            var seg1 = { pos : this.mSwitchPointInfo.pos, dir : this.mSwitchPointInfo.dir,
                         up : v3.ey, };
            if (this.mFirstPointSide == 1) {
                seg0.dir = v3.Neg(seg0.dir);
            }
            line_color = v4.Make(1, 1, 0, 1);
            Rail.CalcCurve(seg0, seg1, draw_line, args);
        } else if (v3.CalcDist(this.mFirstPoint.mPos, this.mCursorPos) >= this.cMinDist) {
            var seg0 = { pos : this.mFirstPoint.mPos, dir : this.mFirstPoint.mDir,
                         up : v3.ey, };
            if (seg0.dir && this.mFirstPointSide == 0) {
                seg0.dir = v3.Neg(seg0.dir);
            }
            var seg1 = { pos : (con_pos ? con_pos : this.mCursorPos), dir : con_dir,
                         up : v3.ey, };
            if (!seg0.dir || !seg1.dir) {
                if (seg0.dir) {
                    seg1.dir = this.CalcCounterDir(seg0.pos, seg0.dir, seg1.pos, true);
                } else if (seg1.dir) {
                    seg0.dir = this.CalcCounterDir(seg1.pos, seg1.dir, seg0.pos, false);
                } else {
                    seg0.dir = seg1.dir = v3.normalize(v3.Sub(seg1.pos, seg0.pos));
                }
            }
            Rail.CalcCurve(seg0, seg1, draw_line, args);
        }
    }
    if (IsMenuBuildRail() || IsMenuEditRail()) {
        ControlPoint.forEach(function(point) {
            if (point.mSwitchFrom >= 0) { return; }
            var height = 2.0;
            var pos = AddRailTotalHeight(point.mPos, point.mUp);
            var mtx = m34.MakeOrtho(point.mDir, point.mUp, pos, v3.muls(
                v3.Make(0.5, 0.5, 2.0), RailMetric.cGauge));
            var color = v4.Make(0.5, 0.5, 1, 1);
            if (point == nearest_point) {
                color = v4.Make(1, point == this.mSelectedPoint ? 1 : 0, 0, 1);
            } else if (point == this.mSelectedPoint) {
                color = v4.Make(0, 1, 0, 1)
            }
            g_box_drawer.pushBox(mtx, color);
        }, this);
    }
    if (IsMenuEditRail()) {
        if (g_ctrl_state == CtrlState.cMovePoint ||
            g_ctrl_state == CtrlState.cRotatePoint) {
            for (var i = 0; i < this.mMovePoint.mRails.length; ++i) {
                if (this.mMovePoint.mRails[i]) {
                    Rail.calcCurve(
                        this.mMovePoint.mRails[i],
                        /*temp*/0, /*temp*/0, draw_line);
                }
            }
        }
    }
    if (IsMenuSchedule()) {
        function spoint_arrow_pos(pos, up) {
            return AddRailTotalHeight(pos, up);
        };
        function point_arrow_pos(pos, up) {
            return v3.add(AddRailTotalHeight(pos, up), v3.Make(0, 0.01, 0));
        };
        if (this.mSelectedRail &&
            document.body.contains(RailBuilder.mTrainDirectionMgr.mEditArea)) {
            var trdir = RailBuilder.mTrainDirectionMgr.getValue();
            var trofs = RailBuilder.mStationOffsetMgr.getValue();
            for (var i = 0; i < 2; ++i) {
                if (trdir != 'all' && trdir != (i ? '1' : '0')) { continue; }
                var ipos = Rail.getInterpolatedPos(this.mSelectedRail, i ? trofs : 1 - trofs);
                DrawArrow(spoint_arrow_pos(v3.add(v3.Muls(
                    ipos.dir, 2 * (i ? 1 : -1)), ipos.pos)),
                          spoint_arrow_pos(ipos.pos), 0.4, v4.Make(1, 0, 0, 1), ipos.up);
            }
        }
        Rail.forEach(function(rail) {
            for (var i = 0; i < rail.mPoints.length; ++i) {
                var spoint = rail.mSwitchPoints[i];
                if (!spoint) { continue; }
                var point = rail.mPoints[i];
                var state = rail.mDrawBlock.mSwitchState[1 - i];
                var color = v4.Make(1, 1, 0, 1);
                var pcolor = v4.Make(0.5, 0.5, 1, 1), scolor = pcolor;
                var is_poi = this.mNearestSwitch == rail && this.mNearestSwitchSide == i;
                var is_sel = this.mSelectedSwitch == rail && this.mSelectedSwitchSide == i;
                if (is_sel) {
                    pcolor = scolor = v4.Make(0.5, 1, 0.5, 1);
                    if (document.body.contains(RailBuilder.mTurnFlagMgr.mEditArea)) {
                        var c0 = v4.Make(0.9, 1, 0.9, 1), c1 = v4.Make(0, 1, 0, 1);
                        var turn_flag = RailBuilder.mTurnFlagMgr.getValue();
                        if (turn_flag == 'main') { pcolor = c1; scolor = c0; }
                        else if (turn_flag == 'sub') { pcolor = c0; scolor = c1; }
                    }
                    if (is_poi) { pcolor[0] = scolor[0] = 1; }
                } else if (is_poi) {
                    pcolor = scolor = v4.Make(1, 0.5, 0.5, 1);
                }
                var width = 0.2;
                if (rail.mDoubleSlipPivot) {
                    DrawArrow(spoint_arrow_pos(rail.mDoubleSlipPivot),
                              spoint_arrow_pos(spoint.mPos, spoint.mUp),
                              width, scolor, spoint.mUp);
                    DrawArrow(point_arrow_pos(rail.mDoubleSlipPivot),
                              point_arrow_pos(point.mPos, point.mUp),
                              width, pcolor, point.mUp);
                } else {
                    var cpoint = rail.mPoints[1 - i];
                    DrawArrow(
                        spoint_arrow_pos(cpoint.mPos, cpoint.mUp),
                        spoint_arrow_pos(spoint.mPos, spoint.mUp),
                        width, scolor, spoint.mUp);
                    DrawArrow(
                        point_arrow_pos(cpoint.mPos, cpoint.mUp),
                        point_arrow_pos(point.mPos, point.mUp),
                        width, pcolor, point.mUp);
                }
            }
        }, this);
    }
    if (this.mCursorPos) { FieldEditor.drawHeightLine(this.mCursorPos); }
};
RailBuilder.initialize();
g_undo_redo_callback.push(function() {
    RailBuilder.deleteControlPoint();
    RailBuilder.deselectRail();
});
