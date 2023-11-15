'use strict';
var TrainEditor = CreateInstance();
TrainEditor.mRadioMgr = UI_Radios.createMgr({
    name : 'train-list-default',
    title : 'put train',
    for_each : function(f) {
        TrainEditor.forEach(function(tr) { f(tr.user_data.def_radio); });
    }, });
TrainEditor.mIdToData = {};
TrainEditor.mSelectMgrs = [];
TrainEditor.createSelectMgr = function(args) {
    var mgr = UI_Select.createMgr(Object.assign({ clip_name : 't-selection', }, args));
    this.mSelectMgrs.push(mgr);
    return mgr;
};
TrainEditor.mInstMgr = UI_Struct.createMgr({
    name : 'train', clip_name : 'train',
    on_create_instance : function(elem_inst) {
        var val = elem_inst.mValue, sim_obj = Train.create(val);
        val.user_data = CreateInstance(val.user_data);
        val.user_data.sim_obj = sim_obj;
        val.user_data.def_radio = TrainEditor.mRadioMgr.createInstance({
            parent : elem_inst.mTitleObj, prepend : true, id : sim_obj.mID, });
        UI_Radios.setCheck(val.user_data.def_radio);
    },
    on_update : function(inst, src_mgr) {
        TrainEditor.updateList();
        TrainEditor.updateTrain(
            inst.mValue, !src_mgr || src_mgr == TrainEditor.mGoMgr
                || src_mgr == TrainEditor.mBackMgr || src_mgr == TrainEditor.mSpeedMgr
                || src_mgr == TrainEditor.mSwitchSelectMgr
                || src_mgr == TrainEditor.mSwitchSelectsMgr);
    },
    on_activate : function(inst) { UI_Radios.setCheck(inst.mValue.user_data.def_radio); }, });
TrainEditor.mInstMgr.pushStruct({
    title : cLang.cmn_remove, link_title : cLang.desc_remove_train,
    cmd : function(inst) { Train.remove(inst.user_data.sim_obj); }, });
TrainEditor.mInstMgr.pushStruct({
    key : 'name', title : cLang.cmn_name, def_value : 'train', labeled : 'value',
    mgr : UI_LangText.createMgr({ parent_mgr : TrainEditor.mInstMgr, fixed : true, }), });
TrainEditor.mInstMgr.pushStruct({
    key : 'go', title : cLang.train_go, def_value : true,
    mgr : TrainEditor.mGoMgr = UI_Check.createMgr({
        parent_mgr : TrainEditor.mInstMgr, fixed : true, }), });
TrainEditor.mInstMgr.pushStruct({
    key : 'back', title : cLang.train_back, def_value : false,
    mgr : TrainEditor.mBackMgr = UI_Check.createMgr({
        parent_mgr : TrainEditor.mInstMgr, fixed : true, }), });
TrainEditor.mInstMgr.pushStruct({
    key : 'speed', def_value : 80, labeled : true,
    title : cLang.train_speed, title_sub : ' [km/h]',
    mgr : TrainEditor.mSpeedMgr = UI_Slider.createMgr({
        parent_mgr : TrainEditor.mInstMgr, fixed : true,
        min : 0, max : 300, slide_round : 10, }), });
/*TrainEditor.mInstMgr.pushStruct({
    key : 'accel', def_value : 3, labeled : true,
    title : cLang.train_accel, title_sub : ' [km/h/s]',
    mgr : TrainEditor.mAccelMgr = UI_Slider.createMgr({
        parent_mgr : TrainEditor.mInstMgr, fixed : true,
        min : 1, max : 60, slide_round : 0.5, }), });
TrainEditor.mInstMgr.pushStruct({
    key : 'decel', def_value : 4, labeled : true,
    title : cLang.train_decel, title_sub : ' [km/h/s]',
    mgr : TrainEditor.mDecelMgr = UI_Slider.createMgr({
        parent_mgr : TrainEditor.mInstMgr, fixed : true,
        min : 1, max : 60, slide_round : 0.5, }), });*/
TrainEditor.mCarMgr = UI_Struct.createMgr({ clip_name : 'car', disable_undo : true, });
TrainModel.mSelectMgr.mParentMgr = TrainEditor.mCarMgr;
TrainEditor.mCarMgr.pushStruct({
    key : 'model', title : cLang.train_model, def_value : '', labeled : true,
    get_def_value : function() {
        var v = TrainModel.getDefaultValue(); return v === null ? '' : v;
    },
    mgr : TrainModel.mSelectMgr, });
TrainEditor.mCarMgr.pushStruct({
    key : 'flip', title : cLang.train_flip, def_value : false, labeled : true,
    mgr : UI_Check.createMgr({
        parent_mgr : TrainEditor.mCarMgr, fixed : true, no_ctrl_br : true, }), });
TrainEditor.mSwitchSelectsMgr = ModelSwitch.createSwitchSelectsMgr(
    TrainEditor, TrainEditor.mCarMgr,
    // update_switches
    function(mgr, value) {
        mgr.mElementNames = [];
        var t_value = [];
        var mdl = TrainModel.mIdToData[TrainModel.mSelectMgr.getValue()];
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
        var mdl = TrainModel.mIdToData[TrainModel.mSelectMgr.getValue()];
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
TrainEditor.mCarMgr.pushStruct({
    key : 'switches', title : cLang.cmn_switches, def_value : null,
    get_def_value : function() {
        return TrainModel.getDefaultSwitches(TrainModel.getDefaultValue());
    },
    mgr : TrainEditor.mSwitchSelectsMgr, });
TrainEditor.mCarMgr.initializeStruct();
TrainEditor.mCarsMgr = UI_Array.createMgr({
    parent_mgr : TrainEditor.mInstMgr, fixed : true,
    element_mgr : TrainEditor.mCarMgr, init_element_value : null, });
TrainEditor.mInstMgr.pushStruct({
    key : 'cars', title : cLang.train_cars, labeled : true, def_value : [],
    get_def_value : function() {
        return [TrainEditor.mCarMgr.makeDefaultValue()];
    },
    mgr : TrainEditor.mCarsMgr, });
TrainModel.mSelectMgr.mOnUpdate = function(inst, src_mgr) {
    var sels = TrainEditor.mSwitchSelectsMgr;
    sels.updateValue(sels.mActiveInst, TrainModel.getDefaultSwitches(inst.mValue));
};
TrainEditor.mInstMgr.initializeStruct();
TrainEditor.mInstsMgr = UI_Array.createMgr({
    fixed : true, root : true, element_mgr : TrainEditor.mInstMgr, init_element_value : null,
    on_update_array : function() {
        TrainEditor.updateList();
    }, });
TrainEditor.initialize = function()
{
    this.mListObj = CreateEditPane('train', cLang.head_train_list, function(div_on) {
        this.mInsts = this.mInstsMgr.createInstance({
            parent : div_on, value : [], });
        this.mInstsMgr.activate(this.mInsts);
    }, this);
};
TrainEditor.forEach = function(f, a_this)
{
    this.mInstsMgr.mElements.forEach(function(elem_inst) {
        f.apply(a_this, [elem_inst.mValue]);
    });
};
TrainEditor.clear = function() { this.mInstsMgr.deleteAll(); };
TrainEditor.updateList = function()
{
    this.mRadioMgr.updateCheck();
    this.mIdToData = {};
    this.mSelectMgrs.forEach(function(mgr) {
        mgr.clear();
        if (mgr.mIsEnableEmptyOption) { mgr.addOption({
            label : cLang.cmn_any, value : '', }); }
    });
    var prev_objs = {};
    Train.forEach(train => prev_objs[train.mID] = train);
    Train.sObjs = [];
    var tr_idx = 0;
    this.forEach(function(tr) {
        var sim_id = tr.user_data.sim_obj.mID;
        Train.sObjs.push(tr.user_data.sim_obj);
        this.mIdToData[sim_id] = tr;
        delete prev_objs[sim_id];
        this.mSelectMgrs.forEach(
            mgr => mgr.addOption({
                label : LangAppend(tr_idx + ': ', tr.name), value : sim_id, }));
        ++tr_idx;
    }, this);
    for (var id in prev_objs) { Train.remove(prev_objs[id]); }
};
TrainEditor.updateTrain = function(tr, keep_wheels_att)
{
    if (!tr.user_data) { return; }
    var sim_obj = tr.user_data.sim_obj, old_cars = sim_obj.mCars;
    sim_obj.mEditObj = tr;
    Train.clearCar(sim_obj);
    tr.cars.forEach(function(car) {
        Train.pushCar(sim_obj, TrainCar.create(car));
    });
    function if_car_focus(f) {
        for (var i_focus = 0; i_focus < g_model_focuses.length; ++i_focus) {
            var model_focus = g_model_focuses[i_focus];
            if (model_focus.type != 'train') { continue; }
            for (var i_car = 0; i_car < old_cars.length; ++i_car) {
                if (model_focus.inst == old_cars[i_car]) {
                    f(i_focus, i_car); return;
                }
            }
        }
    }
    if (keep_wheels_att && old_cars.length == sim_obj.mCars.length) {
        for (var i = 0; i < old_cars.length; ++i) {
            sim_obj.mCars[i].mWheelsAtt = old_cars[i].mWheelsAtt;
        }
        if_car_focus(function(i_focus, i_car) {
            g_model_focuses[i_focus].inst = sim_obj.mCars[i_car];
        });
    } else {
        if_car_focus(function(i_focus, i_car) {
            g_model_focuses.splice(i_focus, 1);
        });
    }
};
TrainEditor.getDefaultValue = function() { return this.mRadioMgr.getValue(); };
TrainEditor.getSelected = function() {
    var v = this.mRadioMgr.getValue();
    return v === null ? null : this.mIdToData[v];
};
TrainEditor.saveAll = function(data)
{
    this.mInstsMgr.updateArray();
    data.trains = Train.saveInsts(function(tr) {
        if (data.type == cFileType_Model && !tr.mEditObj.user_data.is_checked) { return null; }
        var ret = TrainEditor.mInstMgr.saveData(tr.mEditObj);
        ret.id = tr.mID;
        ret.cars.forEach(function(car) {
            car.model = TrainModel.mIdToData[car.model].user_data.uuid;
        })
        if (tr.mHeadAnchor.mRail) {
            ret.head_anchor = {
                rail : tr.mHeadAnchor.mRail.mID,
                dir_side : tr.mHeadAnchor.mDirSide,
                pos : v3.ToArray(tr.mHeadAnchor.mPos),
                dir : v3.ToArray(tr.mHeadAnchor.mDir),
                up : v3.ToArray(tr.mHeadAnchor.mUp),
            };
            ret.sim_speed = tr.mSpeed;
            ret.sim_reverse = tr.mReverse;
        }
        return ret;
    });
};
TrainEditor.loadAll = function(data)
{
    Train.loadInsts(data.trains, function(inst) {
        if (data.type != cFileType_Model) { Train.setLoadingID(inst.id); }
        TrainEditor.mInstMgr.setDefaultValues(inst);
        inst.cars.forEach(function(car) {
            TrainEditor.mCarMgr.setDefaultValues(car);
        });
        var elem_inst = TrainEditor.mInstsMgr.createElementInst(inst);
        TrainEditor.updateTrain(elem_inst.mValue);
        if (!inst.head_anchor) { return; }
        var tr = inst.user_data.sim_obj;
        tr.mHeadAnchor.mRail = Rail.searchObj(inst.head_anchor.rail);
        if (!tr.mHeadAnchor.mRail) { Log('Load train failed: invalid rail ID'); return; }
        tr.mHeadAnchor.mDirSide = inst.head_anchor.dir_side;
        tr.mHeadAnchor.mPos = v3.FromArray(inst.head_anchor.pos);
        tr.mHeadAnchor.mDir = v3.FromArray(inst.head_anchor.dir);
        tr.mHeadAnchor.mUp = v3.FromArray(inst.head_anchor.up);
        tr.mSpeed = inst.sim_speed;
        tr.mReverse = inst.sim_reverse;
    });
    this.mInstsMgr.updateArray();
    this.updateList();
};
TrainEditor.initialize();
function AddTrain() { TrainEditor.mInstsMgr.birthElement(); }
