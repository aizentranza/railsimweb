'use strict';
var TrainModel = CreateIDMgr(null, true);
TrainModel.mModelsObj = null;
TrainModel.mRadioMgr = UI_Radios.createMgr({
    name : 'train-model-default',
    title : 'preview model',
    for_each : function(f) {
        TrainModel.forEach(function(mdl) { f(mdl.user_data.def_radio); });
    }, });
TrainModel.mIdToData = {};
TrainModel.mSelectMgr = UI_Select.createMgr({
    clip_name : 't-model-sel', no_ctrl_br : true, disable_undo : true, fixed : true, });
TrainModel.mInstMgr = UI_Struct.createMgr({
    name : 'train model', clip_name : 't-model',
    on_create_instance : function(elem_inst) {
        var val = elem_inst.mValue;
        val.user_data = TrainModel.issueID(val.user_data);
        val.user_data.def_radio = TrainModel.mRadioMgr.createInstance({
            parent : elem_inst.mTitleObj, prepend : true, id : val.user_data.uuid, });
        UI_Radios.setCheck(val.user_data.def_radio);
    },
    on_update : function(inst) {
        TrainModel.updateList();
        TrainModel.updateMatrix(inst.mValue);
    },
    on_activate : function(inst) { UI_Radios.setCheck(inst.mValue.user_data.def_radio); }, });
TrainModel.mInstMgr.getUUID = function(value) { return value.user_data.uuid; };
TrainModel.mInstMgr.pushStruct({
    key : 'name', title : cLang.cmn_name, def_value : 't-model', labeled : 'value',
    mgr : UI_LangText.createMgr({ parent_mgr : TrainModel.mInstMgr, fixed : true, }), });
TrainModel.mInstMgr.pushStruct({
    key : 'author', title : cLang.cmn_author, def_value : null,
    mgr : FileMode.createAuthorInfoMgr(TrainModel.mInstMgr), });
TrainModel.mInstMgr.pushStruct({
    key : 'length', def_value : 20, labeled : true,
    title : cLang.train_length, title_sub : ' [m]',
    mgr : UI_Slider.createMgr({
        parent_mgr : TrainModel.mInstMgr, fixed : true,
        min : 0, max : 50, slide_round : 0.01, }), });
TrainModel.mInstMgr.pushStruct({
    key : 'rail_type', def_value : 'narrow',
    title : cLang.train_railtype,
    mgr : UI_Select.createMgr({
        fixed : true, clip_name : 'preview-rail-type',
        options : [
            { label : cLang.cmn_none     , value : 'none'    , },
            { label : cLang.rail_narrow  , value : 'narrow'  , },
            { label : cLang.rail_standard, value : 'standard', },
            { label : cLang.rail_safege  , value : 'safege'  , },
            { label : cLang.rail_alweg   , value : 'alweg'   , },
        ], }), });
TrainModel.mPartMgr = UI_Struct.createMgr({ clip_name : 'part', disable_undo : true, });
TrainModel.mPartMgr.pushStruct({
    key : 'model', title : cLang.cmn_model, def_value : '', labeled : 'value',
    get_def_value : function() {
        var v = EditModel.getDefaultValue(); return v === null ? '' : v;
    },
    mgr : EditModel.createSelectMgr({
        parent_mgr : TrainModel.mPartMgr, fixed : true, no_ctrl_br : true, }), });
TrainModel.mPartMgr.pushStruct({
    key : 'type', title : cLang.cmn_type, def_value : 'wheel',
    mgr : UI_Select.createMgr({
        parent_mgr : TrainModel.mPartMgr, fixed : true, clip_name : 't-model-part-type',
        options : [
            { label : cLang.train_part_wheel    , value : 'wheel'    , },
            { label : cLang.train_part_bogie    , value : 'bogie'    , },
            { label : cLang.train_part_body     , value : 'body'     , },
            { label : cLang.train_part_rod_tri  , value : 'rod_tri'  , },
            { label : cLang.train_part_rod_slide, value : 'rod_slide', },
        ], }), });
TrainModel.mPartMgr.pushStruct({
    key : 'id', title : 'ID', def_value : '', labeled : true,
    mgr : UI_Text.createMgr({
        parent_mgr : TrainModel.mPartMgr, fixed : true, size : 8, type : 'id', }), });
TrainModel.mPartMgr.pushStruct({
    key : 'mount_ids', def_value : [], labeled : true,
    title : LangJoin([cLang.train_fixed_to, ' ', cLang.cmn_ids]),
    mgr : UI_Text.createMgr({
        parent_mgr : TrainModel.mPartMgr, fixed : true, size : 8, type : 'ids', }), });
TrainModel.mPartMgr.pushStruct({
    key : 'scale', title : cLang.cmn_scale, def_value : v3.Makes(1),
    condition : function(value) { return !value.type.startsWith('rod'); },
    mgr : UI_Vector.createMgr({
        parent_mgr : TrainModel.mPartMgr, fixed : true, dim : 3, min : 0, max : 10, }), });
TrainModel.mPartMgr.pushStruct({
    key : 'rotate', title : cLang.cmn_rotate, def_value : v3.Makes(0),
    condition : function(value) { return !value.type.startsWith('rod'); },
    mgr : UI_Vector.createMgr({
        parent_mgr : TrainModel.mPartMgr, fixed : true,
        dim : 3, min : -180, max : 180, size : 4, slide_round : 0.1, }), });
TrainModel.mPartMgr.pushStruct({
    key : 'trans', title : cLang.cmn_trans, def_value : v3.Makes(0),
    condition : function(value) { return !value.type.startsWith('rod'); },
    mgr : UI_Vector.createMgr({
        parent_mgr : TrainModel.mPartMgr, fixed : true, dim : 3, min : -50, max : 50, }), });
TrainModel.mSubPartMgr = UI_Struct.createMgr({
    clip_name : 'sub-part', fixed : true, parent_mgr : TrainModel.mPartMgr, });
TrainModel.mSubPartMgr.pushStruct({
    key : 'model', title : LangAppend(cLang.cmn_model, ' 2'), def_value : '', labeled : 'value',
    mgr : EditModel.createSelectMgr({
        parent_mgr : TrainModel.mSubPartMgr, fixed : true, no_ctrl_br : true, }), });
TrainModel.mSubPartMgr.pushStruct({
    key : 'id', title : 'ID 2', def_value : '', labeled : true,
    mgr : UI_Text.createMgr({
        parent_mgr : TrainModel.mSubPartMgr, fixed : true, size : 8, type : 'id', }), });
TrainModel.mSubPartMgr.pushStruct({
    key : 'fix_to_pos1', title : LangAppend(cLang.train_fixed_to_pos, ' 1'),
    def_value : v3.Makes(0),
    mgr : UI_Vector.createMgr({
        parent_mgr : TrainModel.mSubPartMgr, fixed : true, dim : 3, min : -10, max : 10, }), });
TrainModel.mSubPartMgr.pushStruct({
    key : 'rod_len1', title : LangAppend(cLang.train_rod_length, ' 1'),
    def_value : 1, mgr : UI_Slider.createMgr({
        parent_mgr : TrainModel.mSubPartMgr, fixed : true, min : 0, max : 10, }), });
TrainModel.mSubPartMgr.pushStruct({
    key : 'fix_to_pos2', title : LangAppend(cLang.train_fixed_to_pos, ' 2'),
    def_value : v3.Makes(0),
    mgr : UI_Vector.createMgr({
        parent_mgr : TrainModel.mSubPartMgr, fixed : true, dim : 3, min : -10, max : 10, }), });
TrainModel.mSubPartMgr.pushStruct({
    key : 'rod_len2', title : LangAppend(cLang.train_rod_length, ' 2'),
    def_value : 1, mgr : UI_Slider.createMgr({
        parent_mgr : TrainModel.mSubPartMgr, fixed : true, min : 0, max : 10, }), });
TrainModel.mSubPartMgr.initializeStruct();
TrainModel.mPartMgr.pushStruct({
    key : 'sub_part', title : '', def_value : null,
    condition : function(value) { return value.type.startsWith('rod'); },
    mgr : TrainModel.mSubPartMgr, });
TrainModel.mPartMgr.pushStruct({
    key : 'accept_focus', title : cLang.model_accept_focus, def_value : true,
    mgr : UI_Check.createMgr({ parent_mgr : TrainModel.mPartMgr, fixed : true, }), });
TrainModel.mPartMgr.pushStruct({
    key : 'condition', title : cLang.cmn_condition, def_value : null,
    mgr : ModelSwitch.createConditionMgr(TrainModel.mPartMgr), });
TrainModel.mPartMgr.initializeStruct();
TrainModel.mPartsMgr = UI_Array.createMgr({
    parent_mgr : TrainModel.mInstMgr, fixed : true,
    element_mgr : TrainModel.mPartMgr, init_element_value : null, });
TrainModel.mInstMgr.pushStruct({
    key : 'parts', title : cLang.cmn_parts, labeled : true, def_value : [],
    get_def_value : function() {
        return [TrainModel.mPartMgr.makeDefaultValue()];
    },
    mgr : TrainModel.mPartsMgr, });
TrainModel.mInstMgr.pushStruct({
    key : 'smokes', title : cLang.cmn_smokes, labeled : true, def_value : [],
    mgr : ModelSmoke.createSmokesMgr(TrainModel, TrainModel.mInstMgr, true), });
TrainModel.mInstMgr.pushStruct({
    key : 'switches', title : cLang.cmn_switches, labeled : true, def_value : [],
    mgr : ModelSwitch.createSwitchesMgr(TrainModel, TrainModel.mInstMgr), });
TrainModel.mInstMgr.initializeStruct();
TrainModel.mInstsMgr = UI_Array.createMgr({
    fixed : true, root : true, element_mgr : TrainModel.mInstMgr, init_element_value : null,
    on_update_array : function() {
        TrainModel.updateList();
    },
    is_deletable : function(inst) {
        var ret = true;
        Train.forEachCar(function(train, car) {
            if (car.mEditObj.model != inst.mValue.uuid) { return; }
            Log(LangJoin([cLang.error_not_deletable, ': ', inst.mValue.name, ' (',
                          cLang.error_used_by, ': ', train.mEditObj.name, ')']));
            if (!ret) { return; }
            DebugLog.show();
            ret = false;
        });
        return ret;
    }, });
TrainModel.initialize = function()
{
    this.mListObj = CreateEditPane('train-model', cLang.head_train_model, function(div_on) {
        this.mInsts = this.mInstsMgr.createInstance({
            parent : div_on, value : [], });
        this.mInstsMgr.activate(this.mInsts);
    }, this);
};
TrainModel.forEach = function(f, a_this)
{
    this.mInstsMgr.mElements.forEach(function(elem_inst) {
        f.apply(a_this, [elem_inst.mValue]);
    });
};
TrainModel.clear = function() { this.mInstsMgr.deleteAll(); };
TrainModel.updateList = function()
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
    if (TrainEditor.mCarsMgr.mActiveInst) {
        TrainEditor.mCarsMgr.mElements.forEach(function(elem) {
            TrainEditor.mCarMgr.updateLabel(elem);
        });
    }
};
TrainModel.updateMatrix = function(mdl)
{
    mdl.user_data = CreateInstance(mdl.user_data);
    mdl.user_data.parts_info = [];
    mdl.user_data.wheels_info = [];
    mdl.user_data.bodies_info = [];
    mdl.user_data.smokes_info = [];
    var i_part = 0, half_len = mdl.length * 0.5;
    mdl.parts.forEach(function(part) {
        var part_info = {
            index : i_part++,
            sub_index : -1,
            part : part,
            mtx : m34.MakeSRTDeg(part.scale, part.rotate,
                                 v3.Make(part.trans[0], part.trans[1], 0)),
            world_mtx : null,
            z : half_len - part.trans[2],
            radius : part.type == 'wheel' ? part.trans[1] : 0,
        };
        part_info.mounts = [];
        var sub_mdl = TrainModel.getSubModel(part);
        if (sub_mdl) { part_info.sub_index = i_part++; }
        part.mount_ids.forEach(function(mount_id) {
            if (mount_id == '') { return; }
            function do_push(o) { part_info.mounts.push(o); }
            for (var i = 0; i < mdl.user_data.parts_info.length; ++i) {
                var part_info2 = mdl.user_data.parts_info[i];
                if (part_info2.part.id == mount_id) { do_push(part_info2); }
                var sub_mdl2 = TrainModel.getSubModel(part_info2.part);
                if (sub_mdl2 && part_info2.part.sub_part.id == mount_id) {
                    do_push({ is_sub : true, part : part_info2, });
                }
            }
        });
        mdl.user_data.parts_info.push(part_info);
        if (part_info.mounts.length == 0) {
            mdl.user_data.wheels_info.push(part_info);
        } else {
            var z_min = null, z_max = null;
            part_info.mounts.forEach(function(part_info2) {
                if (part_info2.is_sub) { return; }
                var part2 = part_info2.part;
                if (z_min === null) {
                    z_min = z_max = part2.trans[2];
                } else {
                    z_min = Math.min(z_min, part2.trans[2]);
                    z_max = Math.max(z_max, part2.trans[2]);
                }
            });
            if (z_min === null) {
                mdl.user_data.wheels_info.push(part_info);
            } else {
                part_info.z_ofs = part.trans[2] - (z_max + z_min) / 2;
                mdl.user_data.bodies_info.push(part_info);
            }
        }
    });
    mdl.smokes.forEach(function(smoke) {
        var smoke_info = {
            smoke : smoke,
            mtx : m34.MakeSRTDeg(smoke.scale, v3.Makes(0), smoke.trans),
            world_mtx : null,
        };
        if (smoke.mount_id) {
            for (var i = 0; i < mdl.user_data.parts_info.length; ++i) {
                var part_info2 = mdl.user_data.parts_info[i];
                if (part_info2.part.id == smoke.mount_id) {
                    smoke_info.mount = part_info2;
                }
            }
        }
        mdl.user_data.smokes_info.push(smoke_info);
    });
    mdl.user_data.wheels_info.sort(function(a, b) {
        var dz = a.z - b.z;
        if (dz) { return dz; }
        return a.index - b.index;
    });
    Train.forEachCar(function(train, car) {
        if (car.mEditObj.model == mdl.user_data.uuid) {
            car.mWheelsAtt = [];
        }
    });
};
TrainModel.getSubModel = function(part)
{
    if (!part.type.startsWith('rod')) { return null; }
    var ret = EditModel.mIdToData[part.sub_part.model];
    return ret || { is_dummy : true, };
};
TrainModel.write = function(mdl, wheels_att, parts_sw, smokes_sw)
{
    var wheels_info = mdl.user_data.wheels_info, bodies_info = mdl.user_data.bodies_info;
    for (var i = 0; i < wheels_info.length; ++i) {
        var wheel_info = wheels_info[i], part = wheel_info.part, att = wheels_att[i];
        var mdl_mtx = m34.MakeSRT(part.scale, v3.addX(v3.Muls(part.rotate, cDeg2Rad), att.rot),
                                  m34.GetTrans(wheel_info.mtx));
        var mtx = m34.MakeOrtho(
            att.dir, att.up, v3.add(v3.Muls(att.up, RailMetric.cTotalHeight), att.pos));
        m34.setMul(mtx, mtx, mdl_mtx);
        var part_sw = parts_sw[wheel_info.index]
        wheel_info.visible = false;
        if (!part_sw || part_sw.enabled) {
            wheel_info.visible = true;
            EditModel.write(EditModel.mIdToData[part.model], mtx,
                            part_sw && part_sw.insert_colors);
        }
        wheel_info.work_att = att;
        wheel_info.world_mtx = mtx;
    }
    function get_part_att(part_ref) {
        if (part_ref.is_sub) { return part_ref.part.work_att; }
        return part_ref.work_att;
    }
    function get_part_mtx(part_ref) {
        if (part_ref.is_sub) { return part_ref.part.world_mtx2; }
        return part_ref.world_mtx;
    }
    for (var i = 0; i < bodies_info.length; ++i) {
        var body_info = bodies_info[i], part = body_info.part;
        var att = get_part_att(body_info.mounts[0]);
        if (body_info.mounts.length > 1) {
            var att1 = get_part_att(body_info.mounts[body_info.mounts.length - 1]);
            var mdir = v3.normalize(v3.Add(att.dir, att1.dir));
            att = {
                pos : v3.Lerp(att.pos, att1.pos, 0.5),
                dir : v3.normalize(v3.Sub(att.pos, att1.pos)),
                up : v3.normalize(v3.Add(att.up, att1.up)),
            };
            if (v3.Dot(mdir, att.dir) < 0) { v3.neg(att.dir); }
        } else {
            att = Object.assign({}, att);
        }
        att.pos = v3.Add(att.pos, v3.Muls(att.dir, body_info.z_ofs));
        var mtx = m34.MakeOrtho(
            att.dir, att.up, v3.add(v3.Muls(att.up, RailMetric.cTotalHeight), att.pos));
        m34.setMul(mtx, mtx, body_info.mtx);
        var part_sw = parts_sw[body_info.index];
        body_info.visible = false;
        if (!part_sw || part_sw.enabled) {
            body_info.visible = true;
            var sub_mdl = TrainModel.getSubModel(part);
            if (sub_mdl) {
                var sub_part = part.sub_part, mtx2, npos;
                var sub_part_sw = parts_sw[body_info.sub_index];
                var fix_to_mtx1 = get_part_mtx(body_info.mounts[0]);
                var fix_to_mtx2 = get_part_mtx(body_info.mounts[body_info.mounts.length - 1]);
                if (!fix_to_mtx1 || !fix_to_mtx2) { continue; }
                var fpos1 = m34.MulV3(fix_to_mtx1, sub_part.fix_to_pos1);
                var fpos2 = m34.MulV3(fix_to_mtx2, sub_part.fix_to_pos2);
                var mleft = m34.GetCol(fix_to_mtx1, 0);
                var nleft = m34.GetCol(fix_to_mtx2, 0);
                if (part.type.endsWith('tri')) {
                    var ddir = v3.Sub(fpos2, fpos1), rdist = v3.Length(ddir);
                    if (sub_part.rod_len1 + sub_part.rod_len2 < rdist) {
                        npos = v3.Mid(fpos1, fpos2);
                    } else {
                        var ddist = this.solveTriangle(
                            sub_part.rod_len1, sub_part.rod_len2, rdist);
                        v3.muls(ddir, 1 / rdist);
                        var adist = Math.sqrt(
                            sub_part.rod_len1 * sub_part.rod_len1 - ddist * ddist);
                        var dup = v3.normalize(v3.Cross(v3.Mid(mleft, nleft), ddir));
                        npos = v3.add(v3.add(v3.Muls(ddir, adist), fpos1),
                                          v3.Muls(dup, ddist));
                    }
                    ndir = v3.Sub(fpos2, npos);
                } else {
                    mtx = m34.MakeST(v3.ones, fpos1);
                    var sdir = get_part_att(body_info.mounts[0]).dir;
                    var cdir = v3.Sub(fpos2, fpos1), cdist = v3.Dot(cdir, sdir);
                    npos = v3.Add(fpos1, v3.Muls(sdir, cdist));
                    //mtx2 = m34.MakeST(v3.ones, fpos2);
                    var ndir = v3.Sub(npos, fpos2), ndist = v3.Length(ndir);
                    var clen = sub_part.rod_len2;
                    if (clen <= 0) {
                        npos = fpos2;
                    } else if (ndist < clen) {
                        var zofs = Math.sqrt(clen * clen - ndist * ndist);
                        v3.add(npos, v3.Muls(sdir, zofs));
                        ndir = v3.Sub(fpos2, npos);
                    }
                }
                body_info.fpos1 = fpos1;
                body_info.fpos2 = fpos2;
                body_info.npos = npos;
                var mdir = v3.Sub(fpos1, npos);
                var mup = v3.Cross(mdir, mleft);
                mtx = m34.MakeOrtho(mdir, mup, npos, v3.ones);
                var nup = v3.Cross(ndir, nleft);
                mtx2 = m34.MakeOrtho(ndir, nup, npos, v3.ones);
                if (!sub_mdl.is_dummy) {
                    EditModel.write(sub_mdl, mtx2, sub_part_sw && sub_part_sw.insert_colors);
                }
                body_info.world_mtx2 = mtx2;
            }
            EditModel.write(EditModel.mIdToData[part.model], mtx,
                            part_sw && part_sw.insert_colors);
        }
        body_info.work_att = att;
        body_info.world_mtx = mtx;
    }
    var smokes_info = mdl.user_data.smokes_info;
    for (var i = 0; i < smokes_info.length; ++i) {
        var smoke_sw = smokes_sw[i];
        if (smoke_sw && !smoke_sw.enabled) { continue; }
        var smoke_info = smokes_info[i];
        var smoke = smoke_info.smoke;
        if (!smoke_info.mount) { continue; }
        var fix_to_mtx = get_part_mtx(smoke_info.mount);
        if (!fix_to_mtx) { continue; }
        if (Math.random() > smoke.emit_ratio) { continue; }
        var smoke_pos = m34.MulV3(fix_to_mtx, smoke.trans);
        var smoke_dir = m34.RotV3(fix_to_mtx, smoke.direction);
        g_smoke_drawer.pushSmoke(smoke_pos, smoke_dir, smoke);
    }
};
TrainModel.solveTriangle = function(a, b, c)
{
    var a2 = a * a, b2 = b * b, c2 = c * c, t = a2 + b2 - c2;
    return Math.sqrt(4 * a2 * b2 - t * t) / (2 * c);
};
TrainModel.writeEditor = function()
{
    var mdl = TrainModel.getDefault();
    if (mdl) {
        var wheels_att = [], half_len = mdl.length * 0.5
        mdl.user_data.wheels_info.forEach(function(wheel_info) {
            wheels_att.push({
                rot : 0,
                pos : v3.Make(0, 0, half_len - wheel_info.z),
                dir : v3.Make(0, 0, 1),
                up : v3.Make(0, 1, 0),
            });
        });
        var tmp_state = TrainModel.applySwitches(mdl, [], true);
        var tmp_smoke_state = ModelSmoke.applySmokeSwitches(mdl, [], true);
        TrainModel.write(mdl, wheels_att, tmp_state, tmp_smoke_state);
        if (document.body.contains(TrainModel.mSubPartMgr.mEditArea)) {
            function draw_joint_pos(pos) {
                g_line_drawer.pushDualAxis(m34.MakeST(v3.ones, pos));
            }
            if (this.mInstMgr.mActiveInst.mValue.user_data == mdl.user_data) {
                var i_part = 0;
                this.mPartsMgr.mElements.forEach(function(elem) {
                    if (elem == this.mPartMgr.mActiveInst) {
                        mdl.user_data.bodies_info.forEach(function(body_info) {
                            if (i_part != body_info.index) { return; }
                            if (body_info.fpos1) { draw_joint_pos(body_info.fpos1); }
                            if (body_info.fpos2) { draw_joint_pos(body_info.fpos2); }
                            if (body_info.npos ) { draw_joint_pos(body_info.npos ); }
                        });
                    }
                    ++i_part;
                    if (this.getSubModel(elem.mValue)) { ++i_part; }
                }, this);
            }
        }
    }
};
TrainModel.applySwitches = function(mdl, values, is_preview)
{
    //Log('applySwitches ' + mdl.name);
    var ret = [];
    mdl.parts.forEach(function(part) {
        var e_mdl = EditModel.mIdToData[part.model];
        ret.push(EditModel.applySwitches(mdl, values, is_preview, part, e_mdl));
        var sub_mdl = TrainModel.getSubModel(part);
        if (sub_mdl) {
            if (sub_mdl.is_dummy) { ret.push(null); }
            else { ret.push(EditModel.applySwitches(mdl, values, is_preview, part, sub_mdl)); }
        }
    });
    return ret;
};
TrainModel.draw = function(gl, view_ctx)
{
    var mdl = this.getDefault();
    if (!mdl) { return; }
    var t_mdl = this.mInstMgr.getValue();
    var drawers = this.mPreviewRailDrawers[
        t_mdl.user_data && t_mdl.user_data.uuid == mdl.user_data.uuid
            ? t_mdl.rail_type : mdl.rail_type];
    if (!drawers) { return; }
    drawers.rail_drawer.draw(gl, view_ctx);
    if (drawers.ballast_drawer) { drawers.ballast_drawer.draw(gl, view_ctx); }
};
TrainModel.getDefaultValue = function() { return this.mRadioMgr.getValue(); };
TrainModel.getDefault = function()
{
    var def = this.getDefaultValue(), ret = null;
    this.forEach(function(mdl) {
        if (mdl.user_data.uuid == def) { ret = mdl; }
    });
    return ret;
};
TrainModel.getName = function(uuid) {
    return this.mIdToData[uuid].name;
};
TrainModel.getDefaultSwitches = function(uuid)
{
    var ret = [], mdl = TrainModel.mIdToData[uuid];
    if (!mdl) { return ret; }
    mdl.switches.forEach(function(a_switch) {
        ret.push(a_switch.id + ':' + a_switch.default_value_id);
    });
    return ret;
};
TrainModel.saveAll = function(data)
{
    this.mInstsMgr.updateArray();
    data.train_models = TrainModel.saveInsts(function(mdl) {
        if (data.type == cFileType_Model && !mdl.user_data.is_checked) { return null; }
        var ret = this.mInstMgr.saveData(mdl);
        ret.uuid = mdl.user_data.uuid;
        ret.parts.forEach(function(part) {
            part.model = EditModel.mIdToData[part.model].user_data.uuid;
        });
        return ret;
    });
};
TrainModel.loadAll = function(gl, data)
{
    this.loadInsts(data.train_models, function(inst) {
        if (data.type == cFileType_Model && this.mIdToData[inst.uuid]) {
            Log(LangJoin([cLang.warn_tag, cLang.warn_already_exist,
                          ': ', cLang.menu_train_model, ' [', inst.uuid, '] ',
                          this.mIdToData[inst.uuid].name]));
            return;
        }
        this.mInstMgr.setDefaultValues(inst);
        inst.user_data = CreateInstance(inst.user_data);
        inst.user_data.uuid = inst.uuid;
        inst.parts.forEach(function(part) {
            this.mPartMgr.setDefaultValues(part);
            this.mSubPartMgr.setDefaultValues(part.sub_part);
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
TrainModel.createPreviewRailImpl = function(gl, args)
{
    var ret = {};
    ret.rail_drawer = RailDrawer.create(args.rail);
    ret.rail_drawer.initialize(gl, 32);
    ret.rail_drawer.beginWrite();
    if (args.tie >= 0) {
        ret.ballast_drawer = RailDrawer.create(args.tie);
        ret.ballast_drawer.initialize(gl, 32);
        ret.ballast_drawer.beginWrite();
    }
    var length = cGridWidth, acc_len = 0;
    for (var i = 0; i < 2; ++i ) {
        var seg = { pos : v3.Make(0, 0, (i - 0.5) * length),
                    left : v3.Make(1, 0, 0), up : v3.Make(0, 1, 0),
                    fleft : v3.Make(1, 0, 0), fup : v3.Make(0, 1, 0),
                    ballast_v : acc_len * RailMetric.calcTieNum(acc_len) / length, };
        var d_args = { gauge : args.gauge, ballast_ofs : [0, 0], };
        ret.rail_drawer.pushSegment(seg, d_args, i == 0, i == 1);
        if (args.tie >= 0) { ret.ballast_drawer.pushSegment(seg, d_args, i == 0, i == 1); }
        acc_len += length;
    }
    ret.rail_drawer.endWrite(gl);
    if (args.tie >= 0) { ret.ballast_drawer.endWrite(gl); }
    return ret;
};
TrainModel.createPreviewRail = function(gl)
{
    this.mPreviewRailDrawers = {};
    [
        { type : 'narrow'  , rail : RailDrawerType.cDefault,
          tie : RailDrawerType.cBallast, gauge : 0, },
        { type : 'standard', rail : RailDrawerType.cDefault,
          tie : RailDrawerType.cBallast, gauge : 1, },
        { type : 'safege'  , rail : RailDrawerType.cSafege ,
          tie : -1, gauge : 0, },
        { type : 'alweg'   , rail : RailDrawerType.cAlweg  ,
          tie : -1, gauge : 0, },
    ].forEach(function(args) {
        this.mPreviewRailDrawers[args.type] = this.createPreviewRailImpl(gl, args);
    }, this);
    this.mPreviewRailDrawers.safege.rail_drawer.setDrawProfileNum(cSafegeBottomProfileNum  );
    this.mPreviewRailDrawers.alweg .rail_drawer.setDrawProfileNum(cAlwegNonBottomProfileNum);
};
TrainModel.initialize();
function AddTrainModel() { TrainModel.mInstsMgr.birthElement(); }
