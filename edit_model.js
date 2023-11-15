'use strict';
// common switch
var ModelSwitch = CreateInstance();
ModelSwitch.createSwitchesMgr = function(parent, parent_mgr)
{
    parent.mSwitchMgr = UI_Struct.createMgr({
        clip_name : 'mdl-switch', disable_undo : true, });
    parent.mSwitchMgr.pushStruct({
        key : 'id', title : LangAppend(cLang.cmn_switch, ' ID'),
        def_value : 'switch_id', labeled : 'value',
        mgr : UI_Text.createMgr({
            parent_mgr : parent.mSwitchMgr, fixed : true, type : 'id', }), });
    parent.mSwitchMgr.pushStruct({
        key : 'label', title : LangAppendSp(cLang.cmn_switch, cLang.cmn_label),
        def_value : 'Switch Label', labeled : 'value',
        mgr : UI_LangText.createMgr({ parent_mgr : parent.mSwitchMgr, fixed : true, }), });
    parent.mSwitchMgr.pushStruct({
        key : 'default_value_id', title : LangAppend(cLang.model_default_value, ' ID'),
        def_value : 'value_id',
        mgr : UI_Text.createMgr({
            parent_mgr : parent.mSwitchMgr, fixed : true, type : 'id', }), });
    parent.mSwitchMgr.pushStruct({
        key : 'preview_value_id', title : LangAppend(cLang.model_preview_value, ' ID'),
        def_value : 'value_id',
        mgr : UI_Text.createMgr({
            parent_mgr : parent.mSwitchMgr, fixed : true, type : 'id', }), });
    parent.mValueMgr = UI_Struct.createMgr({
        clip_name : 'mdl-switch', disable_undo : true, });
    parent.mValueMgr.pushStruct({
        key : 'id', def_value : 'value_id', labeled : 'value',
        title : LangAppend(cLang.cmn_value, ' ID'),
        mgr : UI_Text.createMgr({
            parent_mgr : parent.mValueMgr, fixed : true, type : 'id', }), });
    parent.mValueMgr.pushStruct({
        key : 'label', title : LangAppendSp(cLang.cmn_value, cLang.cmn_label),
        def_value : 'Value Label', labeled : 'value',
        mgr : UI_LangText.createMgr({ parent_mgr : parent.mValueMgr, fixed : true, }), });
    parent.mSwitchColorMgr = UI_Struct.createMgr({
        clip_name : 'mdl-switch', disable_undo : true, });
    parent.mSwitchColorMgr.pushStruct({
        key : 'id', def_value : 'color_id', labeled : 'value',
        title : LangAppend(cLang.cmn_color, ' ID'),
        mgr : UI_Text.createMgr({
            parent_mgr : parent.mSwitchColorMgr, fixed : true, type : 'id', }), });
    parent.mSwitchColorMgr.pushStruct({
        key : 'color', title : cLang.cmn_color, def_value : v4.Makes(1), labeled : 'value',
        mgr : UI_Color.createMgr({
            parent_mgr : parent.mSwitchColorMgr, fixed : true, is_rgba : true, }), });
    parent.mSwitchColorMgr.initializeStruct();
    parent.mSwitchColorsMgr = UI_Array.createMgr({ parent_mgr : parent.mValueMgr, fixed : true,
        element_mgr : parent.mSwitchColorMgr, init_element_value : null, });
    parent.mValueMgr.pushStruct({
        key : 'colors', title : cLang.cmn_colors, def_value : [], labeled : true,
        mgr : parent.mSwitchColorsMgr, });
    parent.mValueMgr.initializeStruct();
    parent.mValuesMgr = UI_Array.createMgr({ parent_mgr : parent.mSwitchMgr, fixed : true,
        element_mgr : parent.mValueMgr, init_element_value : null, });
    parent.mSwitchMgr.pushStruct({
        key : 'values', title : cLang.cmn_values, def_value : [], labeled : true,
        mgr : parent.mValuesMgr, });
    parent.mSwitchMgr.initializeStruct();
    parent.mSwitchesMgr = UI_Array.createMgr({ parent_mgr : parent_mgr, fixed : true,
        element_mgr : parent.mSwitchMgr, init_element_value : null, });
    return parent.mSwitchesMgr;
};
ModelSwitch.createConditionMgr = function(parent, parent_mgr)
{
    var condition_mgr = UI_Struct.createMgr({
        clip_name : 'mdl-condition', fixed : true, parent_mgr : parent_mgr, });
    condition_mgr.pushStruct({
        key : 'switch_id', def_value : '', labeled : true,
        title : LangAppend(cLang.cmn_switch, ' ID'),
        mgr : UI_Text.createMgr({
            parent_mgr : condition_mgr, fixed : true, type : 'id', }), });
    condition_mgr.pushStruct({
        key : 'op', title : cLang.model_compare, def_value : 'is', labeled : true,
        mgr : UI_Select.createMgr({
            parent_mgr : condition_mgr, clip_name : 'switch-op',
            fixed : true,
            options : [
                { label : '=', value : 'is'    , },
                { label : '≠', value : 'is_not', },
            ], }), });
    condition_mgr.pushStruct({
        key : 'value_id', def_value : [], labeled : true,
        title : LangJoin([cLang.cmn_value, ' ', cLang.cmn_ids]),
        mgr : UI_Text.createMgr({
            parent_mgr : condition_mgr, fixed : true, type : 'ids', }), });
    condition_mgr.getLabel = function(value)
    {
        var ret = '{';
        var op_labels = { is : 'is', is_not : 'is not', };
        ret += '[' + value.switch_id + '] ' + op_labels[value.compare]
            + ' [' + value.value_id + ']';
        return ret + '}';
    };
    condition_mgr.initializeStruct();
    return condition_mgr;
};
ModelSwitch.evaluateCondition = function(condition, vid)
{
    for (var i = 0; i < condition.value_id.length; ++i) {
        if (condition.value_id[i] == vid) { return condition.op == 'is'; }
    }
    return condition.op != 'is';
};
ModelSwitch.createInsertColorMgr = function(parent_mgr)
{
    var mgr = UI_Struct.createMgr({
        clip_name : 'mdl-insert-color', fixed : true, parent_mgr : parent_mgr, });
    mgr.pushStruct({
        key : 'default_value', title : cLang.model_default_color,
        def_value : v4.Make(1, 0, 0, 1),
        mgr : UI_Color.createMgr({ parent_mgr : mgr, fixed : true, is_rgba : true, }), });
    mgr.pushStruct({
        key : 'override_color_id', title : LangAppend(cLang.model_override_color, ' ID'),
        def_value : '', labeled : true,
        mgr : UI_Text.createMgr({ parent_mgr : mgr, fixed : true, type : 'id', }), });
    mgr.initializeStruct();
    return mgr;
};
ModelSwitch.createSwitchSelectsMgr = function(parent, parent_mgr, update_switches, update_sel)
{
    parent.mSwitchSelectMgr = UI_Select.createMgr({
        clip_name : 'switch-sel', no_ctrl_br : true, no_collapse : true, disable_undo : true,
        update_options : update_sel, });
    parent.mSwitchSelectsMgr = UI_Array.createMgr({
        parent_mgr : parent_mgr, fixed : true, element_mgr : parent.mSwitchSelectMgr,
        init_element_value : '-', update_element_names : update_switches, })
    return parent.mSwitchSelectsMgr;
};
// common model
var EditModel = CreateIDMgr(null, true);
EditModel.mModelsObj = null;
EditModel.mRadioMgr = UI_Radios.createMgr({
    name : 'edit-model-default', title : 'preview model',
    for_each : function(f) {
        EditModel.forEach(function(mdl) { f(mdl.user_data.def_radio); });
    }, });
EditModel.mIdToData = {};
EditModel.mSelectMgrs = [];
EditModel.createSelectMgr = function(args) {
    var mgr = UI_Select.createMgr(Object.assign({ clip_name : 'e-model', }, args));
    this.mSelectMgrs.push(mgr);
    return mgr;
};
EditModel.mInstMgr = UI_Struct.createMgr({
    name : 'model data', clip_name : 'e-model',
    on_create_instance : function(elem_inst) {
        var val = elem_inst.mValue;
        val.user_data = EditModel.issueID(val.user_data);
        val.user_data.def_radio = EditModel.mRadioMgr.createInstance({
            parent : elem_inst.mTitleObj, prepend : true, id : val.user_data.uuid, });
        UI_Radios.setCheck(val.user_data.def_radio);
    },
    on_update : function(inst) {
        EditModel.updateList();
        EditModel.createDrawer(g_canvas.getContext(), inst.mValue);
    },
    on_activate : function(inst) { UI_Radios.setCheck(inst.mValue.user_data.def_radio); }, });
EditModel.mInstMgr.getUUID = function(value) { return value.user_data.uuid; };
EditModel.mInstMgr.pushStruct({
    key : 'name', title : cLang.cmn_name, def_value : 'e-model', labeled : 'value',
    mgr : UI_LangText.createMgr({ parent_mgr : EditModel.mInstMgr, fixed : true, }), });
EditModel.mInstMgr.pushStruct({
    key : 'author', title : cLang.cmn_author, def_value : null,
    mgr : FileMode.createAuthorInfoMgr(EditModel.mInstMgr), });
EditModel.mInstMgr.pushStruct({
    key : 'draw_pass', title : cLang.model_draw_pass, def_value : 'default',
    mgr : UI_Select.createMgr({
        parent_mgr : EditModel.mInstMgr, fixed : true, clip_name : 'draw-pass',
        options : [
            { label : cLang.model_pass_field  , value : 'field'  , },
            { label : cLang.model_pass_tunnel , value : 'tunnel' , },
            { label : cLang.model_pass_default, value : 'default', },
        ], }), });
EditModel.mPrimitiveMgr = UI_Struct.createMgr({ clip_name : 'primitive', disable_undo : true, });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'comment', title : cLang.cmn_comment, def_value : '', labeled : 'value',
    mgr : UI_Text.createMgr({ parent_mgr : EditModel.mPrimitiveMgr, fixed : true, }), });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'type', title : cLang.cmn_type, def_value : 'cube', labeled : true,
    mgr : UI_Select.createMgr({
        parent_mgr : EditModel.mPrimitiveMgr, fixed : true, clip_name : 'model-primitive',
        options : [
            { label : cLang.primitive_plane   , value : 'plane'   , },
            { label : cLang.primitive_prism   , value : 'prism'   , },
            { label : cLang.primitive_cube    , value : 'cube'    , },
            { label : cLang.primitive_cylinder, value : 'cylinder', },
            { label : cLang.primitive_sphere  , value : 'sphere'  , },
        ], }), });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'face', title : cLang.model_face, def_value : 'front',
    mgr : UI_Select.createMgr({
        parent_mgr : EditModel.mPrimitiveMgr, fixed : true, clip_name : 'model-face',
        options : [
            { label : cLang.face_front, value : 'front', },
            { label : cLang.face_back , value : 'back' , },
            { label : cLang.face_both , value : 'both' , },
        ], }), });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'split', title : cLang.model_split, def_value : 6,
    mgr : UI_Slider.createMgr({
        parent_mgr : EditModel.mPrimitiveMgr, fixed : true,
        min : 1, max : 16, is_int : true, width : '4em', }), });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'taper', title : cLang.model_taper, def_value : 0,
    mgr : UI_Slider.createMgr({
        parent_mgr : EditModel.mPrimitiveMgr, fixed : true, fixed_range : true,
        min : -1, max : 1, slide_round : 0.001, width : '4em', }), });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'scale', title : cLang.cmn_scale, def_value : v3.Makes(1), labeled : true,
    mgr : UI_Vector.createMgr({
        parent_mgr : EditModel.mPrimitiveMgr, fixed : true, dim : 3, min : 0, max : 50, }), });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'rotate', title : cLang.cmn_rotate, def_value : v3.Makes(0),
    mgr : UI_Vector.createMgr({
        parent_mgr : EditModel.mPrimitiveMgr, fixed : true,
        dim : 3, min : -180, max : 180, size : 4, slide_round : 0.1, }), });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'trans', title : cLang.cmn_trans, def_value : v3.Makes(0),
    mgr : UI_Vector.createMgr({
        parent_mgr : EditModel.mPrimitiveMgr, fixed : true, dim : 3, min : -50, max : 50, }), });
EditModel.mPrimitiveMgr.pushStruct({
    key : 'base_color', title : cLang.model_base_color, def_value : v4.Makes(1),
    mgr : UI_Color.createMgr({ parent_mgr : EditModel.mPrimitiveMgr, fixed : true, }), });
EditModel.mSlicerMgr = UI_Struct.createMgr({ clip_name : 'slicer', disable_undo : true, });
EditModel.mSlicerMgr.pushStruct({
    key : 'type', title : cLang.cmn_type, def_value : 'erase_gt', labeled : true,
    mgr : UI_Select.createMgr({
        parent_mgr : EditModel.mSlicerMgr, fixed : true,
        options : [
            { label : cLang.slicer_erase_lt  , value : 'erase_lt', },
            { label : cLang.slicer_erase_gt  , value : 'erase_gt', },
            { label : cLang.slicer_reshape_lt, value : 'reshape_lt', },
            { label : cLang.slicer_reshape_gt, value : 'reshape_gt', },
        ], }), });
EditModel.mSlicerMgr.pushStruct({
    key : 'solid', title : cLang.model_solid, def_value : true,
    mgr : UI_Check.createMgr({ parent_mgr : EditModel.mSlicerMgr, fixed : true, }), });
EditModel.mSlicerMgr.pushStruct({
    key : 'reshapable', title : cLang.model_reshapable, def_value : true,
    mgr : UI_Check.createMgr({ parent_mgr : EditModel.mSlicerMgr, fixed : true, }), });
EditModel.mSlicerMgr.pushStruct({
    key : 'offset', title : cLang.cmn_offset, def_value : 0,
    mgr : UI_Slider.createMgr({
        parent_mgr : EditModel.mSlicerMgr, fixed : true,
        min : -20, max : 20, slide_round : 0.001, }), });
EditModel.mSlicerMgr.pushStruct({
    key : 'angle', title : cLang.cmn_angle, def_value : v3.Makes(0), labeled : true,
    mgr : UI_Vector.createMgr({
        parent_mgr : EditModel.mSlicerMgr, fixed : true,
        dim : 3, min : -180, max : 180, size : 4, slide_round : 0.1, }), });
EditModel.mSlicerMgr.pushStruct({
    key : 'pos', title : cLang.cmn_position, def_value : v3.Makes(0), labeled : true,
    mgr : UI_Vector.createMgr({
        parent_mgr : EditModel.mSlicerMgr, fixed : true, dim : 3, min : -50, max : 50, }), });
EditModel.mSlicerMgr.initializeStruct();
EditModel.mPrimitiveMgr.pushStruct({
    key : 'slicers', title : cLang.model_slicers, def_value : [], labeled : true,
    mgr : UI_Array.createMgr({
        parent_mgr : EditModel.mPrimitiveMgr, fixed : true,
        element_mgr : EditModel.mSlicerMgr, init_element_value : null, }), });
EditModel.mPrimitiveMgr.initializeStruct();
EditModel.mPrimitivesMgr = UI_Array.createMgr({
    parent_mgr : EditModel.mInstMgr, fixed : true,
    element_mgr : EditModel.mPrimitiveMgr, init_element_value : null, });
EditModel.mInstMgr.pushStruct({
    key : 'primitives', title : cLang.model_primitives, labeled : true,
    def_value : [EditModel.mPrimitiveMgr.makeDefaultValue()],
    mgr : EditModel.mPrimitivesMgr, });
EditModel.mPainterMgr = UI_Struct.createMgr({ clip_name : 'painter', disable_undo : true, });
EditModel.mPainterMgr.pushStruct({
    key : 'comment', title : cLang.cmn_comment, def_value : '', labeled : 'value',
    mgr : UI_Text.createMgr({ parent_mgr : EditModel.mPainterMgr, fixed : true, }), });
EditModel.mPainterMgr.pushStruct({
    key : 'color', title : cLang.cmn_color, def_value : null, labeled : true,
    mgr : ModelSwitch.createInsertColorMgr(EditModel.mPainterMgr), });
EditModel.mPainterBoundMgr = UI_Struct.createMgr({
    clip_name : 'painter-bound', disable_undo : true, });
EditModel.mPainterBoundMgr.pushStruct({
    key : 'type', title : cLang.cmn_type, def_value : 'mask_gt', labeled : true,
    mgr : UI_Select.createMgr({
        parent_mgr : EditModel.mPainterBoundMgr, fixed : true,
        options : [
            { label : cLang.painter_mask_lt , value : 'mask_lt' , },
            { label : cLang.painter_mask_gt , value : 'mask_gt' , },
            { label : cLang.painter_paint_lt, value : 'paint_lt', },
            { label : cLang.painter_paint_gt, value : 'paint_gt', },
            { label : cLang.painter_alt_lt  , value : 'alt_lt'  , },
            { label : cLang.painter_alt_gt  , value : 'alt_gt'  , },
        ], }), });
EditModel.mPainterBoundMgr.pushStruct({
    key : 'shape', title : cLang.cmn_shape, def_value : 'plane', labeled : true,
    mgr : UI_Select.createMgr({
        parent_mgr : EditModel.mPainterBoundMgr, fixed : true,
        options : [
            { label : cLang.painter_shape_plane , value : 'plane' , },
            { label : cLang.painter_shape_circle, value : 'circle', },
            { label : cLang.painter_shape_sphere, value : 'sphere', },
        ], }), });
EditModel.mPainterBoundMgr.pushStruct({
    key : 'bound', title : cLang.model_bound, def_value : 0,
    mgr : UI_Slider.createMgr({
        parent_mgr : EditModel.mPainterBoundMgr, fixed : true,
        min : -20, max : 20, slide_round : 0.01, }), });
EditModel.mPainterBoundMgr.pushStruct({
    key : 'width', title : cLang.cmn_width, def_value : 0,
    mgr : UI_Slider.createMgr({
        parent_mgr : EditModel.mPainterBoundMgr, fixed : true,
        min : 0, max : 20, slide_round : 0.01, }), });
EditModel.mPainterBoundMgr.pushStruct({
    key : 'angle', title : cLang.cmn_angle, def_value : v3.Make(90, 0, 0), labeled : true,
    mgr : UI_Vector.createMgr({
        parent_mgr : EditModel.mPainterBoundMgr, fixed : true,
        dim : 3, min : -180, max : 180, size : 4, slide_round : 0.1, }), });
EditModel.mPainterBoundMgr.pushStruct({
    key : 'pos', title : cLang.cmn_position, def_value : v3.Makes(0), labeled : true,
    mgr : UI_Vector.createMgr({
        parent_mgr : EditModel.mPainterBoundMgr, fixed : true, dim : 3,
        min : -50, max : 50, }), });
EditModel.mPainterBoundMgr.pushStruct({
    key : 'alt_color', title : cLang.model_alt_color, def_value : null,
    condition : function(value) { return value.type.startsWith('alt'); },
    mgr : ModelSwitch.createInsertColorMgr(EditModel.mPainterBoundMgr), });
EditModel.mPainterBoundMgr.initializeStruct();
EditModel.mPainterMgr.pushStruct({
    key : 'bounds', title : cLang.model_bounds, def_value : [], labeled : true,
    mgr : UI_Array.createMgr({
        parent_mgr : EditModel.mPainterMgr, fixed : true,
        element_mgr : EditModel.mPainterBoundMgr, init_element_value : null, }), });
EditModel.mPainterMgr.initializeStruct();
EditModel.mPaintersMgr = UI_Array.createMgr({
    parent_mgr : EditModel.mInstMgr, fixed : true,
    element_mgr : EditModel.mPainterMgr, init_element_value : null, });
EditModel.mInstMgr.pushStruct({
    key : 'painters', title : cLang.model_painters, def_value : [], labeled : true,
    mgr : EditModel.mPaintersMgr, });
EditModel.mInstMgr.initializeStruct();
EditModel.mInstsMgr = UI_Array.createMgr({
    fixed : true, root : true, element_mgr : EditModel.mInstMgr, init_element_value : null,
    on_update_array : function() {
        EditModel.updateList();
    },
    is_deletable : function(inst) {
        var ret = true;
        function impl(class_name) {
            class_name.forEach(function(mdl) {
                var ret_mdl = true;
                mdl.parts.forEach(function(part) {
                    if (part.model != inst.mValue.uuid || !ret_mdl) { return; }
                    Log(LangJoin([cLang.error_not_deletable, ': ', inst.mValue.name, ' (',
                                  cLang.error_used_by, ': ', mdl.name, ')']));
                    if (!ret) { return; }
                    DebugLog.show();
                    ret = ret_mdl = false;
                });
            });
        }
        impl(TrainModel);
        impl(StructModel);
        return ret;
    }, });
EditModel.cDrawPassTypes = ['field', 'tunnel', 'default'];
EditModel.mDrawPassMap = {};
EditModel.initialize = function()
{
    this.mListObj = CreateEditPane('edit-model', cLang.head_edit_model, function(div_on) {
        this.mInsts = this.mInstsMgr.createInstance({
            parent : div_on, value : [], });
        this.mInstsMgr.activate(this.mInsts);
    }, this);
};
EditModel.forEach = function(f, a_this)
{
    this.mInstsMgr.mElements.forEach(function(elem_inst) {
        f.apply(a_this, [elem_inst.mValue]);
    });
};
EditModel.clear = function() { this.mInstsMgr.deleteAll(); };
EditModel.updateList = function()
{
    this.mRadioMgr.updateCheck();
    this.mIdToData = {};
    this.mSelectMgrs.forEach(function(mgr) {
        mgr.clear();
        mgr.addOption({ label : cLang.cmn_none, value : '', });
    });
    this.forEach(function(mdl) {
        this.mIdToData[mdl.user_data.uuid] = mdl;
        this.mSelectMgrs.forEach(
            mgr => mgr.addOption({
                label : mdl.name, value : mdl.user_data.uuid, user_data : mdl,
                author : mdl.author, }));
    }, this);
    if (TrainModel.mPartsMgr.mActiveInst) {
        TrainModel.mPartsMgr.mElements.forEach(function(elem) {
            TrainModel.mPartMgr.updateLabel(elem);
        });
    }
};
EditModel.createDrawer = function(gl, mdl) {
    mdl.user_data = CreateInstance(mdl.user_data);
    mdl.user_data.insert_color_num = 0;
    mdl.user_data.insert_colors = {};
    mdl.user_data.insert_colors_default = [];
    function push_insert_color(cdata) {
        var id = cdata.override_color_id
        if (!id || mdl.user_data.insert_colors[id]) { return; }
        if (mdl.user_data.insert_color_num >= webgl.MAX_FRAGMENT_UNIFORM_VECTORS) { return; }
        var info = mdl.user_data.insert_colors[id] = {
            index : mdl.user_data.insert_color_num++,
        };
        mdl.user_data.insert_colors_default.push(cdata.default_value);
    }
    mdl.painters.forEach(function(painter) {
        push_insert_color(painter.color);
        painter.bounds.forEach(function(bound) {
            push_insert_color(bound.alt_color);
        });
    });
    mdl.user_data.drawer = ModelDrawer.create();
    mdl.user_data.drawer.initialize(gl, mdl);
    Train.requestResetAll();
};
EditModel.beginWrite = function()
{
    this.cDrawPassTypes.forEach(pass => EditModel.mDrawPassMap[pass] = []);
    this.forEach(function(mdl) {
        mdl.user_data.drawer.beginWrite();
    });
};
EditModel.write = function(mdl, mtx, insert_colors)
{
    if (!mdl) { return; }
    mdl.user_data.drawer.pushModel(
        mtx, insert_colors ? insert_colors : mdl.user_data.insert_colors_default);
};
EditModel.endWrite = function()
{
    this.forEach(function(mdl) {
        mdl.user_data.drawer.endWrite();
        this.mDrawPassMap[mdl.draw_pass].push(mdl);
    }, this);
};
EditModel.writeEditor = function()
{
    var mdl = EditModel.getDefault();
    function draw_slicer_plane(pos, angle, ofs, col) {
        var left = pitchYawRollDegV(v3.AddZ(angle, 90));
        var dir = pitchYawRollDegV(angle), up = v3.normalize(v3.Cross(dir, left));
        var len = 128, tx = v3.Muls(left, len), ty = v3.Muls(up, len);
        var base = v3.add(v3.Muls(dir, ofs), pos), itv = 5;
        g_line_drawer.pushLine(base, v3.add(v3.Muls(dir, len), base), v4.ones);
        for (var u = 0; u <= len; u = u ? u * 2 : 0.25) {
            for (var s = 0; s < (u ? 2 : 1); ++s) {
                var v = s ? u : -u, c = u ? col : v4.ones;
                var bx = v3.add(v3.Muls(up  , v), base);
                var by = v3.add(v3.Muls(left, v), base);
                g_line_drawer.pushLine(v3.Sub(bx, tx), v3.Add(bx, tx), c);
                g_line_drawer.pushLine(v3.Sub(by, ty), v3.Add(by, ty), c);
            }
        }
    }
    if (mdl) {
        this.write(mdl, m34.MakeIdent(), mdl.user_data.insert_colors_default);
        if (document.body.contains(EditModel.mSlicerMgr.mEditArea)) {
            var slicer = EditModel.mSlicerMgr.getValue();
            draw_slicer_plane(slicer.pos, slicer.angle, slicer.offset, v4.Make(1, 0.5, 0.5, 1));
        }
        if (document.body.contains(EditModel.mPainterBoundMgr.mEditArea)) {
            var bound = EditModel.mPainterBoundMgr.getValue();
            draw_slicer_plane(
                bound.pos, bound.angle, bound.shape == 'plane' ? bound.bound : 0,
                v4.Make(0.5, 1, 0.5, 1));
        }
    }
};
EditModel.applySwitchCondition = function(mdl, values, is_preview, condition)
{
    var state = { enabled : true, };
    if (condition.switch_id) {
        var prefix = condition.switch_id + ':', value = null;
        for (var iv = 0; iv < values.length; ++iv) {
            if (values[iv].startsWith(prefix)) {
                value = values[iv].slice(prefix.length);
                break;
            }
        }
        if (value === null) {
            for (var i = 0; i < mdl.switches.length; ++i) {
                var a_switch = mdl.switches[i];
                if (a_switch.id == condition.switch_id) {
                    value = is_preview ? a_switch.preview_value_id
                        : a_switch.default_value_id;
                    //Log('use default value ' + value);
                    break;
                }
            }
        }
        state.enabled = ModelSwitch.evaluateCondition(condition, value);
    }
    return state;
};
EditModel.applySwitches = function(mdl, values, is_preview, part, e_mdl)
{
    if (!e_mdl) { return null; }
    var state = this.applySwitchCondition(mdl, values, is_preview, part.condition);
    state.insert_colors = Array.from(e_mdl.user_data.insert_colors_default);
    if (state.enabled) {
        for (var i = 0; i < mdl.switches.length; ++i) {
            var a_switch = mdl.switches[i];
            var prefix = a_switch.id + ':', value = is_preview
                ? a_switch.preview_value_id : a_switch.default_value_id;
            for (var iv = 0; iv < values.length; ++iv) {
                if (values[iv].startsWith(prefix)) {
                    value = values[iv].slice(prefix.length);
                    break;
                }
            }
            for (var iv = 0; iv < a_switch.values.length; ++iv) {
                var a_value = a_switch.values[iv];
                if (a_value.id == value) {
                    a_value.colors.forEach(function(sw_color) {
                        var info = e_mdl.user_data.insert_colors[sw_color.id];
                        if (info) { state.insert_colors[info.index] = sw_color.color; }
                    });
                    break;
                }
            }
        }
    }
    return state;
};
EditModel.draw = function(gl, view_ctx, draw_pass)
{
    this.mDrawPassMap[draw_pass].forEach(function(mdl) {
        mdl.user_data.drawer.draw(gl, view_ctx);
    });
};
EditModel.getDefaultValue = function() { return this.mRadioMgr.getValue(); };
EditModel.getDefault = function()
{
    var def = this.getDefaultValue(), ret = null;
    this.forEach(function(mdl) {
        if (mdl.user_data.uuid == def) { ret = mdl; }
    });
    return ret;
};
EditModel.getName = function(uuid) {
    return this.mIdToData[uuid].name;
};
EditModel.saveAll = function(data)
{
    this.mInstsMgr.updateArray();
    data.edit_models = EditModel.saveInsts(function(mdl) {
        if (data.type == cFileType_Model && !mdl.user_data.is_checked) { return null; }
        var ret = this.mInstMgr.saveData(mdl);
        ret.uuid = mdl.user_data.uuid;
        return ret;
    });
};
EditModel.loadAll = function(gl, data)
{
    this.loadInsts(data.edit_models, function(inst) {
        if (data.type == cFileType_Model && this.mIdToData[inst.uuid]) {
            Log(LangJoin([cLang.warn_tag, cLang.warn_already_exist,
                          ': ', cLang.menu_edit_model, ' [', inst.uuid, '] ',
                          this.mIdToData[inst.uuid].name]));
            return;
        }
        this.mInstMgr.setDefaultValues(inst);
        inst.user_data = CreateInstance(inst.user_data);
        inst.user_data.uuid = inst.uuid;
        inst.primitives.forEach(function(primitive) {
            this.mPrimitiveMgr.setDefaultValues(primitive);
            primitive.slicers.forEach(function(slicer) {
                this.mSlicerMgr.setDefaultValues(slicer);
            }, this);
        }, this);
        inst.painters.forEach(function(painter) {
            this.mPainterMgr.setDefaultValues(painter);
            painter.bounds.forEach(function(bound) {
                this.mPainterBoundMgr.setDefaultValues(bound);
            }, this);
        }, this);
        var elem_inst = this.mInstsMgr.createElementInst(inst);
        this.createDrawer(gl, elem_inst.mValue);
    });
    this.mInstsMgr.updateArray();
    this.updateList();
};
EditModel.initialize();
function AddEditModel() { EditModel.mInstsMgr.birthElement(); }
