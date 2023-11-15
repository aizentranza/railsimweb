'use strict';
var Struct = CreateObjMgr();
Struct.create = function(edit_obj)
{
    var strc = this.createObj();
    strc.mEditObj = edit_obj;
    strc.mPartsSwitchState = [];
    strc.mSmokesSwitchState = [];
    strc.mModel = this.getModelData(strc);
    strc.mIsPut = false;
    this.updateMatrix(strc);
    this.applySwitches(strc);
    return strc;
};
Struct.getModelData = function(strc)
{
    return StructModel.mIdToData[strc.mEditObj.model];
};
Struct.updateStruct = function(strc)
{
    strc.mModel = this.getModelData(strc);
    this.updateByField(strc);
    this.updateMatrix(strc);
    this.applySwitches(strc);
};
Struct.write = function(strc)
{
    if (!strc.mIsPut) { return; }
    var mdl = strc.mModel;
    strc.mPartsAtt = [];
    if (!mdl) { return; }
    StructModel.write(mdl, strc.mMtx, strc.mPartsSwitchState, strc.mSmokesSwitchState);
    mdl.user_data.parts_info.forEach(info => strc.mPartsAtt.push(
        info.visible ? info.world_mtx : null));
};
Struct.writeAABB = function(strc)
{
    if (!strc.mIsPut) { return; }
    var mdl = strc.mModel;
    if (!mdl) { return; }
    StructModel.writeAABB(mdl, strc.mMtx, strc.mPartsSwitchState);
};
Struct.applySwitches = function(strc)
{
    if (!strc.mModel) { return; }
    strc.mPartsSwitchState = StructModel.applySwitches(strc.mModel, strc.mEditObj.switches);
    strc.mSmokesSwitchState = ModelSmoke.applySmokeSwitches(strc.mModel, strc.mEditObj.switches);
};
Struct.updateMatrix = function(strc)
{
    var tmp_ofs = m34.MakeST(v3.ones, strc.mEditObj.offset);
    if (strc.mFieldNrm) {
        var tmp_r = m34.MakeSRTDeg(v3.ones, strc.mEditObj.rotate, v3.zero);
        var field_dir = v3.normalize(v3.Cross(v3.ex, strc.mFieldNrm));
        var field_mtx = m34.MakeOrtho(
            field_dir, strc.mFieldNrm, strc.mEditObj.position, v3.ones);
        strc.mMtx = m34.setMul(tmp_r, tmp_r, tmp_ofs);
        m34.setMul(strc.mMtx, field_mtx, strc.mMtx);
    } else {
        var tmp_rt = m34.MakeSRTDeg(v3.ones, strc.mEditObj.rotate, strc.mEditObj.position);
        strc.mMtx = m34.setMul(tmp_rt, tmp_rt, tmp_ofs);
    }
};
Struct.updateByField = function(strc)
{
    strc.mFieldNrm = null;
    var pos = strc.mEditObj.position;
    var field_args = {}, field_height = FieldEditor.getFieldHeight(pos, field_args);
    if (field_height !== null) {
        var field_setting = strc.mEditObj.field_setting;
        if (field_setting == 'pos' || field_setting == 'nrm') {
            pos[1] = field_height;
            if (field_setting == 'nrm') {
                strc.mFieldNrm = field_args.nrm;
            }
        }
    }
};
Struct.put = function(strc, pos)
{
    strc.mIsPut = true;
    v3.copy(strc.mEditObj.position, pos);
    this.updateByField(strc);
    var editor_active = StructEditor.mInstMgr.mActiveInst;
    if (editor_active && editor_active.mValue.user_data.sim_obj == strc) {
        StructEditor.mPositionMgr.setValue(pos);
    }
    this.updateMatrix(strc);
};
Struct.isPut = function(strc) { return strc.mIsPut; };
Struct.remove = function(strc)
{
    if (!this.isPut(strc)) { return; }
    strc.mIsPut = false;
};
Struct.calc = function(strc)
{
    if (!this.isPut(strc)) { return; }
    var mdl = strc.mModel;
    if (!mdl) { return; }
    //var parts_info = mdl.user_data.parts_info;
};
Struct.requestResetAll = function() { this.sRequestResetAll = true; };
Struct.calcAll = function()
{
    if (!IsEditorMode()) {
        if (this.sRequestResetAll) {
            this.sRequestResetAll = false;
            this.forEach(strc => StructEditor.updateStruct(strc.mEditObj));
        }
        this.forEach(this.calc, this);
    }
};
Struct.writeAll = function()
{
    Struct.forEach(Struct.write);
};
var StructSetter = CreateInstance();
StructSetter.mCursorPos = v3.Makes(0);
StructSetter.mCursorDir = v3.Make(0, 0, 1);
StructSetter.putStruct = function()
{
    var strc = StructEditor.getSelected();
    if (!strc) return;
    var active_inst = StructEditor.mInstMgr.mActiveInst;
    if (active_inst && active_inst.mValue == strc) {
        StructEditor.mInstMgr.activate(active_inst);
    }
    var sim_obj = strc.user_data.sim_obj;
    Log(LangJoin([cLang.struct_put_struct,
                  ' [' + sim_obj.mID + ']: ' + v3.ToFixed(this.mCursorPos, 2)]));
    var prev_is_put = sim_obj.mIsPut;
    var prev_pos = v3.Dup(sim_obj.mEditObj.position);
    var new_pos = v3.Dup(this.mCursorPos);
    PushUndo(function() {
        if (prev_is_put) {
            Struct.put(sim_obj, prev_pos);
        } else {
            Struct.remove(sim_obj);
        }
    }, function() {
        Struct.put(sim_obj, new_pos);
    }, cLang.struct_put_struct, true);
};
StructSetter.calc = function(wpos)
{
    this.mCursorPos = v3.Dup(wpos);
};
StructSetter.write = function()
{
    if (IsMenuStructList()) {
        DrawArrow(this.mCursorPos,
                  v3.add(v3.Muls(this.mCursorDir, 2.5), this.mCursorPos),
                  0.5, v4.Make(1, 0, 0, 1));
    }
};
