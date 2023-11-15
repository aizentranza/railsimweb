'use strict';
var StructModel = CreateIDMgr(null, true);
StructModel.mModelsObj = null;
StructModel.mRadioMgr = UI_Radios.createMgr({
    name : 'struct-model-default',
    title : 'preview model',
    for_each : function(f) {
        StructModel.forEach(function(mdl) { f(mdl.user_data.def_radio); });
    }, });
StructModel.mIdToData = {};
StructModel.mSelectMgr = UI_Select.createMgr({
    clip_name : 's-model-sel', no_ctrl_br : true, disable_undo : true, fixed : true, });
StructModel.mInstMgr = UI_Struct.createMgr({
    name : 'struct model', clip_name : 's-model',
    on_create_instance : function(elem_inst) {
        var val = elem_inst.mValue;
        val.user_data = StructModel.issueID(val.user_data);
        val.user_data.def_radio = StructModel.mRadioMgr.createInstance({
            parent : elem_inst.mTitleObj, prepend : true, id : val.user_data.uuid, });
        UI_Radios.setCheck(val.user_data.def_radio);
    },
    on_update : function(inst) {
        StructModel.updateList();
        StructModel.updateMatrix(inst.mValue);
    },
    on_activate : function(inst) { UI_Radios.setCheck(inst.mValue.user_data.def_radio); }, });
StructModel.mInstMgr.getUUID = function(value) { return value.user_data.uuid; };
StructModel.mInstMgr.pushStruct({
    key : 'name', title : cLang.cmn_name, def_value : 's-model', labeled : 'value',
    mgr : UI_LangText.createMgr({ parent_mgr : StructModel.mInstMgr, fixed : true, }), });
StructModel.mInstMgr.pushStruct({
    key : 'author', title : cLang.cmn_author, def_value : null,
    mgr : FileMode.createAuthorInfoMgr(StructModel.mInstMgr), });
StructModel.mPartMgr = UI_Struct.createMgr({ clip_name : 'part', disable_undo : true, });
StructModel.mPartMgr.pushStruct({
    key : 'model', title : cLang.struct_model, def_value : '', labeled : 'value',
    get_def_value : function() {
        var v = EditModel.getDefaultValue(); return v === null ? '' : v;
    },
    mgr : EditModel.createSelectMgr({
        parent_mgr : StructModel.mPartMgr, fixed : true, no_ctrl_br : true, }), });
StructModel.mPartMgr.pushStruct({
    key : 'scale', title : cLang.cmn_scale, def_value : v3.Makes(1),
    mgr : UI_Vector.createMgr({
        parent_mgr : StructModel.mPartMgr, fixed : true, dim : 3, min : 0, max : 10, }), });
StructModel.mPartMgr.pushStruct({
    key : 'rotate', title : cLang.cmn_rotate, def_value : v3.Makes(0),
    mgr : UI_Vector.createMgr({
        parent_mgr : StructModel.mPartMgr, fixed : true,
        dim : 3, min : -180, max : 180, size : 4, slide_round : 0.1, }), });
StructModel.mPartMgr.pushStruct({
    key : 'trans', title : cLang.cmn_trans, def_value : v3.Makes(0),
    mgr : UI_Vector.createMgr({
        parent_mgr : StructModel.mPartMgr, fixed : true, dim : 3, min : -50, max : 50, }), });
StructModel.mPartMgr.pushStruct({
    key : 'accept_focus', title : cLang.model_accept_focus, def_value : true,
    mgr : UI_Check.createMgr({ parent_mgr : StructModel.mPartMgr, fixed : true, }), });
StructModel.mPartMgr.pushStruct({
    key : 'condition', title : cLang.cmn_condition, def_value : null,
    mgr : ModelSwitch.createConditionMgr(StructModel.mPartMgr), });
StructModel.mPartMgr.initializeStruct();
StructModel.mPartsMgr = UI_Array.createMgr({
    parent_mgr : StructModel.mInstMgr, fixed : true,
    element_mgr : StructModel.mPartMgr, init_element_value : null, });
StructModel.mInstMgr.pushStruct({
    key : 'parts', title : cLang.cmn_parts, labeled : true, def_value : [],
    get_def_value : function() {
        return [StructModel.mPartMgr.makeDefaultValue()];
    },
    mgr : StructModel.mPartsMgr, });
StructModel.mInstMgr.pushStruct({
    key : 'smokes', title : cLang.cmn_smokes, labeled : true, def_value : [],
    mgr : ModelSmoke.createSmokesMgr(StructModel, StructModel.mInstMgr), });
StructModel.mInstMgr.pushStruct({
    key : 'switches', title : cLang.cmn_switches, labeled : true, def_value : [],
    mgr : ModelSwitch.createSwitchesMgr(StructModel, StructModel.mInstMgr), });
StructModel.mInstMgr.initializeStruct();
StructModel.mInstsMgr = UI_Array.createMgr({
    fixed : true, root : true, element_mgr : StructModel.mInstMgr, init_element_value : null,
    on_update_array : function() {
        StructModel.updateList();
    },
    is_deletable : function(inst) {
        var ret = true;
        Struct.forEach(function(strc) {
            if (strc.mEditObj.model != inst.mValue.uuid) { return; }
            Log(LangJoin([cLang.error_not_deletable, ': ', inst.mValue.name, ' (',
                          cLang.error_used_by, ': ', strc.mEditObj.name, ')']));
            if (!ret) { return; }
            DebugLog.show();
            ret = false;
        });
        return ret;
    }, });
StructModel.initialize = function()
{
    this.mListObj = CreateEditPane(
        'struct-model', cLang.head_struct_model, function(div_on) {
            this.mInsts = this.mInstsMgr.createInstance({
                parent : div_on, value : [], });
            this.mInstsMgr.activate(this.mInsts);
        }, this);
};
StructModel.forEach = function(f, a_this)
{
    this.mInstsMgr.mElements.forEach(function(elem_inst) {
        f.apply(a_this, [elem_inst.mValue]);
    });
};
StructModel.clear = function() { this.mInstsMgr.deleteAll(); };
StructModel.updateList = function()
{
    this.mRadioMgr.updateCheck();
    this.mIdToData = {};
    this.mSelectMgr.clear();
    this.forEach(function(mdl) {
        this.mIdToData[mdl.user_data.uuid] = mdl;
        this.mSelectMgr.addOption({
            label : mdl.name, value : mdl.user_data.uuid, user_data : mdl,
            author : mdl.author, });
    }, this);
    if (StructEditor.mInstMgr.mActiveInst) {
        StructEditor.mInstMgr.updateLabel(StructEditor.mInstMgr.mActiveInst);
    }
};
StructModel.updateMatrix = function(mdl)
{
    mdl.user_data = CreateInstance(mdl.user_data);
    mdl.user_data.parts_info = [];
    mdl.user_data.smokes_info = [];
    var i_part = 0, half_len = mdl.length * 0.5;
    mdl.parts.forEach(function(part) {
        var part_info = {
            index : i_part++,
            part : part,
            mtx : m34.MakeSRTDeg(part.scale, part.rotate, part.trans),
            world_mtx : null,
        };
        mdl.user_data.parts_info.push(part_info);
    });
    mdl.smokes.forEach(function(smoke) {
        var smoke_info = {
            smoke : smoke,
            mtx : m34.MakeSRTDeg(smoke.scale, v3.Makes(0), smoke.trans),
            world_mtx : null,
        };
        mdl.user_data.smokes_info.push(smoke_info);
    });
};
StructModel.write = function(mdl, base_mtx, parts_sw, smokes_sw)
{
    var parts_info = mdl.user_data.parts_info;
    for (var i = 0; i < parts_info.length; ++i) {
        var part_info = parts_info[i], part = part_info.part;
        var mdl_mtx = part_info.mtx;
        var mtx = m34.Mul(base_mtx, mdl_mtx);
        var part_sw = parts_sw[part_info.index]
        part_info.visible = false;
        if (!part_sw || part_sw.enabled) {
            part_info.visible = true;
            EditModel.write(EditModel.mIdToData[part.model], mtx,
                            part_sw && part_sw.insert_colors);
        }
        //part_info.work_att = att;
        part_info.world_mtx = mtx;
    }
    var smokes_info = mdl.user_data.smokes_info;
    for (var i = 0; i < smokes_info.length; ++i) {
        var smoke_sw = smokes_sw[i];
        if (smoke_sw && !smoke_sw.enabled) { continue; }
        var smoke_info = smokes_info[i];
        var smoke = smoke_info.smoke;
        if (Math.random() > smoke.emit_ratio) { continue; }
        var smoke_pos = m34.MulV3(base_mtx, smoke.trans);
        var smoke_dir = m34.RotV3(base_mtx, smoke.direction);
        g_smoke_drawer.pushSmoke(smoke_pos, smoke_dir, smoke);
    }
};
StructModel.writeAABB = function(mdl, base_mtx, parts_sw)
{
    var parts_info = mdl.user_data.parts_info;
    for (var i = 0; i < parts_info.length; ++i) {
        var part_info = parts_info[i], part = part_info.part;
        var part_sw = parts_sw[part_info.index]
        if (!part_sw || part_sw.enabled) {
            var mdl_mtx = part_info.mtx;
            var mtx = m34.Mul(base_mtx, mdl_mtx);
            var e_mdl = EditModel.mIdToData[part.model];
            if (!e_mdl) { continue; }
            g_line_drawer.pushAABB(e_mdl.user_data.drawer.mAABB, v4.Make(1, 0, 0, 1), mtx);
        }
    }
};
StructModel.writeEditor = function()
{
    var mdl = StructModel.getDefault();
    if (mdl) {
        var tmp_state = StructModel.applySwitches(mdl, [], true);
        var tmp_smoke_state = ModelSmoke.applySmokeSwitches(mdl, [], true);
        StructModel.write(mdl, m34.MakeIdent(), tmp_state, tmp_smoke_state);
    }
};
StructModel.applySwitches = function(mdl, values, is_preview)
{
    //Log('applySwitches ' + mdl.name);
    var ret = [];
    mdl.parts.forEach(function(part) {
        var e_mdl = EditModel.mIdToData[part.model];
        ret.push(EditModel.applySwitches(mdl, values, is_preview, part, e_mdl));
    });
    return ret;
};
StructModel.draw = function(gl, view_ctx)
{
};
StructModel.getDefaultValue = function() { return this.mRadioMgr.getValue(); };
StructModel.getDefault = function()
{
    var def = this.getDefaultValue(), ret = null;
    this.forEach(function(mdl) {
        if (mdl.user_data.uuid == def) { ret = mdl; }
    });
    return ret;
};
StructModel.getName = function(uuid) {
    return this.mIdToData[uuid].name;
};
StructModel.getDefaultSwitches = function(uuid)
{
    var ret = [], mdl = StructModel.mIdToData[uuid];
    if (!mdl) { return ret; }
    mdl.switches.forEach(function(a_switch) {
        ret.push(a_switch.id + ':' + a_switch.default_value_id);
    });
    return ret;
};
StructModel.saveAll = function(data)
{
    this.mInstsMgr.updateArray();
    data.struct_models = StructModel.saveInsts(function(mdl) {
        if (data.type == cFileType_Model && !mdl.user_data.is_checked) { return null; }
        var ret = this.mInstMgr.saveData(mdl);
        ret.uuid = mdl.user_data.uuid;
        ret.parts.forEach(function(part) {
            part.model = EditModel.mIdToData[part.model].user_data.uuid;
        });
        return ret;
    });
};
StructModel.loadAll = function(gl, data)
{
    this.loadInsts(data.struct_models, function(inst) {
        if (data.type == cFileType_Model && this.mIdToData[inst.uuid]) {
            Log(LangJoin([cLang.warn_tag, cLang.warn_already_exist,
                          ': ', cLang.menu_struct_model, ' [', inst.uuid, '] ',
                          this.mIdToData[inst.uuid].name]));
            return;
        }
        this.mInstMgr.setDefaultValues(inst);
        inst.user_data = CreateInstance(inst.user_data);
        inst.user_data.uuid = inst.uuid;
        inst.parts.forEach(function(part) {
            this.mPartMgr.setDefaultValues(part);
        }, this);
        inst.smokes.forEach(function(smoke) {
            this.mSmokeMgr.setDefaultValues(smoke);
        }, this);
        inst.switches.forEach(function(a_switch) {
            this.mSwitchMgr.setDefaultValues(a_switch);
            a_switch.values.forEach(function(a_value) {
                this.mValueMgr.setDefaultValues(a_value);
            }, this);
        }, this);
        var elem_inst = this.mInstsMgr.createElementInst(inst);
        this.updateMatrix(elem_inst.mValue);
    });
    this.mInstsMgr.updateArray();
    this.updateList();
};
StructModel.initialize();
function AddStructModel() { StructModel.mInstsMgr.birthElement(); }
