'use strict';
var StructEditor = CreateInstance();
StructEditor.mRadioMgr = UI_Radios.createMgr({
    name : 'struct-list-default',
    title : 'put struct',
    for_each : function(f) {
        StructEditor.forEach(function(tr) { f(tr.user_data.def_radio); });
    }, });
StructEditor.mIdToData = {};
StructEditor.mSelectMgrs = [];
StructEditor.createSelectMgr = function(args) {
    var mgr = UI_Select.createMgr(Object.assign({ clip_name : 't-selection', }, args));
    this.mSelectMgrs.push(mgr);
    return mgr;
};
StructEditor.mInstMgr = UI_Struct.createMgr({
    name : 'struct', clip_name : 'struct',
    on_create_instance : function(elem_inst) {
        var val = elem_inst.mValue, sim_obj = Struct.create(val);
        val.user_data = CreateInstance(val.user_data);
        val.user_data.sim_obj = sim_obj;
        val.user_data.def_radio = StructEditor.mRadioMgr.createInstance({
            parent : elem_inst.mTitleObj, prepend : true, id : sim_obj.mID, });
        UI_Radios.setCheck(val.user_data.def_radio);
    },
    on_update : function(inst, src_mgr) {
        StructEditor.updateList();
        StructEditor.updateStruct(inst.mValue);
    },
    on_activate : function(inst) { UI_Radios.setCheck(inst.mValue.user_data.def_radio); }, });
StructEditor.mInstMgr.pushStruct({
    title : cLang.cmn_remove, link_title : 'remove struct from scene',
    cmd : function(inst) { Struct.remove(inst.user_data.sim_obj); }, });
StructEditor.mInstMgr.pushStruct({
    key : 'name', title : cLang.cmn_name, def_value : 'struct', labeled : 'value',
    mgr : UI_LangText.createMgr({ parent_mgr : StructEditor.mInstMgr, fixed : true, }), });
StructModel.mSelectMgr.mParentMgr = StructEditor.mInstMgr;
StructEditor.mInstMgr.pushStruct({
    key : 'model', title : cLang.struct_model, def_value : '', labeled : true,
    get_def_value : function() {
        var v = StructModel.getDefaultValue(); return v === null ? '' : v;
    },
    mgr : StructModel.mSelectMgr, });
StructEditor.mInstMgr.pushStruct({
    key : 'field_setting', title : cLang.struct_field_setting, def_value : 'pos',
    mgr : UI_Select.createMgr({
        parent_mgr : StructEditor.mInstMgr, fixed : true,
        options : [
            { label : cLang.struct_fs_none  , value : 'none', },
            { label : cLang.struct_fs_height, value : 'pos' , },
            { label : cLang.struct_fs_normal, value : 'nrm' , },
        ], }), });
StructEditor.mInstMgr.pushStruct({
    key : 'position', title : cLang.cmn_position, def_value : v3.Makes(0),
    mgr : StructEditor.mPositionMgr = UI_Vector.createMgr({
        parent_mgr : StructEditor.mInstMgr, fixed : true, dim : 3, min : -500, max : 500, }), });
StructEditor.mInstMgr.pushStruct({
    key : 'rotate', title : cLang.cmn_rotate, def_value : v3.Makes(0),
    mgr : UI_Vector.createMgr({
        parent_mgr : StructEditor.mInstMgr, fixed : true,
        dim : 3, min : -180, max : 180, size : 4, slide_round : 5, }), });
StructEditor.mInstMgr.pushStruct({
    key : 'offset', title : cLang.cmn_offset, def_value : v3.Makes(0),
    mgr : UI_Vector.createMgr({
        parent_mgr : StructEditor.mInstMgr, fixed : true, dim : 3, min : -50, max : 50, }), });
StructEditor.mSwitchSelectsMgr = ModelSwitch.createSwitchSelectsMgr(
    StructEditor, StructEditor.mInstMgr,
    // update_switches
    function(mgr, value) {
        mgr.mElementNames = [];
        var t_value = [];
        var mdl = StructModel.mIdToData[StructModel.mSelectMgr.getValue()];
        if (mdl) {
            mdl.switches.forEach(function(a_switch) {
                mgr.mElementNames.push(a_switch.label);
                var switch_value = ':';
                for (var i = 0; i < value.length; ++i) {
                    if (value[i].startsWith(a_switch.id + ':')) {
                        switch_value = value[i].match(/:.*$/)[0];
                    }
                }
                t_value.push(a_switch.id + switch_value);
            });
        }
        value.splice(0, value.length);
        t_value.forEach(v => value.push(v));
    },
    // update_sel
    function(mgr, value) {
        mgr.clear();
        var mdl = StructModel.mIdToData[StructModel.mSelectMgr.getValue()];
        if (!mdl) { return; }
        mdl.switches.forEach(function(a_switch) {
            if (!value.startsWith(a_switch.id + ':')) { return; }
            a_switch.values.forEach(function(a_value) {
                mgr.addOption({ label : a_value.label,
                                value : a_switch.id + ':' + a_value.id, });
            });
        });
        mgr.activateOption(value);
    });
StructEditor.mInstMgr.pushStruct({
    key : 'switches', title : cLang.cmn_switches, def_value : null,
    get_def_value : function() {
        return StructModel.getDefaultSwitches(StructModel.getDefaultValue());
    },
    mgr : StructEditor.mSwitchSelectsMgr, });
StructModel.mSelectMgr.mOnUpdate = function(inst, src_mgr) {
    var sels = StructEditor.mSwitchSelectsMgr;
    if (!sels.mActiveInst) { return; }
    sels.updateValue(sels.mActiveInst, StructModel.getDefaultSwitches(inst.mValue));
};
StructEditor.mInstMgr.initializeStruct();
StructEditor.mInstsMgr = UI_Array.createMgr({
    fixed : true, root : true, element_mgr : StructEditor.mInstMgr, init_element_value : null,
    on_update_array : function() {
        StructEditor.updateList();
    }, });
StructEditor.initialize = function()
{
    this.mListObj = CreateEditPane('struct', cLang.head_struct_list, function(div_on) {
        this.mInsts = this.mInstsMgr.createInstance({
            parent : div_on, value : [], });
        this.mInstsMgr.activate(this.mInsts);
    }, this);
};
StructEditor.write = function()
{
    var editor_active = StructEditor.mInstMgr.mActiveInst;
    if (editor_active) {
        var strc = editor_active.mValue.user_data.sim_obj;
        Struct.writeAABB(strc);
    }
};
StructEditor.forEach = function(f, a_this)
{
    this.mInstsMgr.mElements.forEach(function(elem_inst) {
        f.apply(a_this, [elem_inst.mValue]);
    });
};
StructEditor.clear = function() { this.mInstsMgr.deleteAll(); };
StructEditor.updateList = function()
{
    this.mRadioMgr.updateCheck();
    this.mIdToData = {};
    this.mSelectMgrs.forEach(function(mgr) {
        mgr.clear();
        if (mgr.mIsEnableEmptyOption) { mgr.addOption({ label : cLang.cmn_any, value : '', }); }
    });
    var prev_objs = {};
    Struct.forEach(struct => prev_objs[struct.mID] = struct);
    Struct.sObjs = [];
    var strc_idx = 0;
    this.forEach(function(strc) {
        var sim_id = strc.user_data.sim_obj.mID;
        Struct.sObjs.push(strc.user_data.sim_obj);
        this.mIdToData[sim_id] = strc;
        delete prev_objs[sim_id];
        this.mSelectMgrs.forEach(
            mgr => mgr.addOption({
                label : LangAppend(strc_idx + ': ', strc.name), value : sim_id, }));
        ++strc_idx;
    }, this);
    for (var id in prev_objs) { Struct.remove(prev_objs[id]); }
};
StructEditor.updateStruct = function(strc)
{
    if (!strc.user_data) { return; }
    var sim_obj = strc.user_data.sim_obj;
    sim_obj.mEditObj = strc;
    Struct.updateStruct(sim_obj);
};
StructEditor.getDefaultValue = function() { return this.mRadioMgr.getValue(); };
StructEditor.getSelected = function() {
    var v = this.mRadioMgr.getValue();
    return v === null ? null : this.mIdToData[v];
};
StructEditor.saveAll = function(data)
{
    this.mInstsMgr.updateArray();
    data.structs = Struct.saveInsts(function(strc) {
        var ret = StructEditor.mInstMgr.saveData(strc.mEditObj);
        ret.id = strc.mID;
        ret.is_put = Struct.isPut(strc);
        ret.model = StructModel.mIdToData[ret.model].user_data.uuid;
        return ret;
    });
};
StructEditor.loadAll = function(data)
{
    Struct.loadInsts(data.structs, function(inst) {
        Struct.setLoadingID(inst.id);
        StructEditor.mInstMgr.setDefaultValues(inst);
        var elem_inst = StructEditor.mInstsMgr.createElementInst(inst);
        StructEditor.updateStruct(elem_inst.mValue);
        var strc = inst.user_data.sim_obj;
        if (inst.is_put) { Struct.put(strc, inst.position); }
    });
    this.mInstsMgr.updateArray();
    this.updateList();
};
StructEditor.initialize();
function AddStruct() { StructEditor.mInstsMgr.birthElement(); }
