'use strict';
var FieldEditor = CreateInstance();
FieldEditor.cRotMax = 4;
FieldEditor.mLayerRadioMgr = UI_Radio.createMgr({
    fixed : true, dom_name : 'radio-field-layer-sel',
    options : function(){
        var ret = [];
        for (var unit = g_field_unit_min; unit <= g_field_unit_max; unit *= 2) {
            ret.push({ value : '' + unit, });
        }
        return ret;
    }(), });
FieldEditor.mLayerDrawMgr = UI_Radio.createMgr({
    fixed : true, dom_name : 'radio-field-layer-draw',
    options : [
        { value : 'all'    , label : cLang.field_draw_all    , },
        { value : 'current', label : cLang.field_draw_current, },
        { value : 'others' , label : cLang.field_draw_others , },
    ], });
FieldEditor.mModeMgr = UI_Radio.createMgr({
    fixed : true, dom_name : 'radio-field-layer-draw',
    options : [
        { value : 'write', label : cLang.field_mode_write, },
        { value : 'erase', label : cLang.field_mode_erase, },
        { value : 'pick' , label : cLang.field_mode_pick , },
    ], });
FieldEditor.mHeightMgr = UI_Slider.createMgr({
    fixed : true, min : -100, max : 100, slide_round : 5, size : 4, width : '10em', })
FieldEditor.mSlopeMgr = UI_Vector.createMgr({
    fixed : true, dim : 2, min : -100, max : 100, slide_round : 5, size : 4,
    width : '10em', labels : ['X', 'Z'], });
FieldEditor.mFieldTypeMgr = UI_Select.createMgr({
    fixed : true, clip_name : 'field-type',
    options : [
        { label : cLang.field_grass , value : 'grass' , },
        { label : cLang.field_desert, value : 'desert', },
        { label : cLang.field_rock  , value : 'rock'  , },
        { label : cLang.field_snow  , value : 'snow'  , },
        { label : cLang.field_water , value : 'water' , },
    ], });
FieldEditor.initialize = function()
{
    this.mEditPane = CreateEditPane('field', cLang.head_field_editor, function(div_on) {
        this.mLayerRadio = this.mLayerRadioMgr.createActiveInstance({
            parent : div_on, value : '160', title : cLang.field_layer, });
        div_on.append(CreateHBR());
        this.mLayerDraw = this.mLayerDrawMgr.createActiveInstance({
            parent : div_on, value : 'all', title : cLang.field_draw, });
        div_on.append(CreateHBR());
        this.mMode = this.mModeMgr.createActiveInstance({
            parent : div_on, value : 'write', title : cLang.cmn_mode, });
        div_on.append(CreateHBR());
        this.mHeight = this.mHeightMgr.createActiveInstance({
            parent : div_on, value : 0, title : cLang.cmn_height, });
        div_on.append(CreateHBR());
        this.mSlope = this.mSlopeMgr.createActiveInstance({
            parent : div_on, value : v2.Makes(0), title : cLang.cmn_slope, });
        div_on.append(CreateHBR());
        this.mFieldType = this.mFieldTypeMgr.createActiveInstance({
            parent : div_on, value : 'grass', title : cLang.cmn_type, });
        div_on.append(CreateHBR());
        div_on.append(CreateScriptLinkEdit(
            cLang.field_update_rail, function() { Rail.writeAll(); }));
        OnNextCalc(function() {
            if (!this.mHeightMgr.isVisible()) { return true; }
            this.mHeightMgr.updateSlider(this.mHeight.mValue);
            this.mSlopeMgr.updateSlider(this.mSlope.mValue);
        }, this);
    }, this);
    this.clearField();
    this.mSelectedField = null;
    this.mPreviewInfo = null;
    this.mGridDrawer = GridDrawer.create(5);
};
FieldEditor.initializeGrid = function(gl)
{
    this.mGridDrawer.initialize(gl);
    this.mGridDrawer.beginWrite();
    var gn = 16;
    //var cx = Math.round(g_camera.mAt[0] / move_unit) * move_unit;
    //var cz = Math.round(g_camera.mAt[2] / move_unit) * move_unit;
    var min_x = -gn, max_x = gn, min_z = -gn, max_z = gn;
    for (var i = -gn; i <= gn; ++i) {
        var gx = i, gz = i;
        var c = v4.Make(1, 1, 1, !(i % 4) ? 1 : !(i % 2) ? 0.3 : 0.09);
        if (i) {
            this.mGridDrawer.pushLine(v3.Make(gx, 0, min_z), v3.Make(gx, 0, max_z), c);
            this.mGridDrawer.pushLine(v3.Make(min_x, 0, gz), v3.Make(max_x, 0, gz), c);
        } else {
            this.mGridDrawer.pushLine(v3.Make(gx, 0, min_z), v3.Make(gx, 0, 0), c);
            this.mGridDrawer.pushLine(v3.Make(min_x, 0, gz), v3.Make(0, 0, gz), c);
            var red = v4.Make(1, 0, 0, 1), blue = v4.Make(0, 0, 1, 1);
            this.mGridDrawer.pushLine(v3.Make(gx, 0, 0), v3.Make(gx, 0, max_z), blue);
            this.mGridDrawer.pushLine(v3.Make(0, 0, gz), v3.Make(max_x, 0, gz), red);
        }
    }
    this.mGridDrawer.endWrite(gl);
};
FieldEditor.clearField = function()
{
    this.mFieldMaps = {};
    for (var unit = g_field_unit_min; unit <= g_field_unit_max; unit *= 2) {
        this.mFieldMaps['' + unit] = {};
    }
};
FieldEditor.createTestField = function(gl)
{
    var field_unit = 80;
    this.clearField();
    var n = 4, half_n = n / 2, r = 4, s = v2.Makes(0);
    for (var z = -half_n; z < half_n; ++z) {
        for (var x = -half_n; x < half_n; ++x) {
            this.createField(field_unit, x, z, r, s, 'grass', true);
        }
    }
    this.updateFieldAll(gl);
};
FieldEditor.getFieldUnit = function() { return parseFloat(this.mLayerRadio.mValue); };
FieldEditor.getFieldHeight = function(wpos, args)
{
    var ret = null;
    for (var unit = g_field_unit_min; unit <= g_field_unit_max; unit *= 2) {
        var field_map = this.mFieldMaps['' + unit];
        var ix = this.worldToIndex(wpos[0], unit), iz = this.worldToIndex(wpos[2], unit);
        var fx = wpos[0] / unit - ix, fz = wpos[2] / unit - iz, fvec = [fx - 0.5, fz - 0.5];
        for (var rot = 0; rot <= this.cRotMax; ++rot) {
            var field = field_map[this.getFieldKey(ix, iz, rot)];
            if (!field) { continue; }
            var y = field.y, s = field.s;
            if (rot < this.cRotMax) {
                var rx = this.cSlopeRot[rot], rz = [-rx[1], rx[0]];
                var ux = v2.Dot(rx, fvec), uz = v2.Dot(rz, fvec);
                if (ux + uz > 0) { continue; }
                y += ux * v2.Dot(s, rx) + uz * v2.Dot(s, rz);
                y += FieldDrawer.calcOffset(rot, s);
            } else {
                y += s[0] > 0 ? fx * s[0] : (1 - fx) * -s[0];
                y += s[1] > 0 ? fz * s[1] : (1 - fz) * -s[1];
            }
            if (ret === null) {
                ret = y;
            } else {
                y = Math.max(ret, y);
            }
            if (args) {
                args.nrm = v3.normalize(v3.Make(-s[0], unit, -s[1]));
            }
        }
    }
    return ret;
};
FieldEditor.drawHeightLine = function(wpos)
{
    var field_height = FieldEditor.getFieldHeight(wpos);
    if (field_height !== null) {
        g_line_drawer.pushLine(wpos, v3.SetY(wpos, field_height), v4.Make(0, 1, 0, 1));
    }
};
FieldEditor.calc = function(wpos)
{
    var field_unit = this.getFieldUnit();
    var field_map = this.mFieldMaps['' + field_unit];
    this.mCursorPos = v3.Dup(wpos);
    var kinfo = this.worldToKey(wpos, field_unit);
    var field = field_map[kinfo.key], sel_field = this.mSelectedField;
    this.mPreviewInfo = kinfo;
    var field_drawer = g_field_drawer_map[this.mLayerRadio.mValue];
    if (!field_drawer) { return; }
    field_drawer.setSelected(sel_field ? sel_field.mFieldCounter : 0);
    field_drawer.setHighlight(field ? field.mFieldCounter : 0);
    if (g_ctrl_state == CtrlState.cMouseDown) {
        if (g_mouse.wasShortTouch()) {
            if (this.mMode.mValue == 'pick') {
                if (field) {
                    //this.mSelectedField = field == sel_field ? null : field;
                    this.mHeightMgr.updateValue(this.mHeight, field.y);
                    this.mSlopeMgr.updateValue(this.mSlope, field.s);
                    this.mFieldTypeMgr.updateValue(this.mFieldType, field.type);
                }
            } else {
                if (field) { FieldEditor.deleteField(field_unit, field); }
                var new_field = null;
                if (this.mFieldType.mValue && this.mMode.mValue != 'erase') {
                    new_field = this.createField(
                        field_unit, kinfo.ix, kinfo.iz, kinfo.rot, this.mSlope.mValue,
                        this.mFieldType.mValue);
                    new_field.y = this.mHeightMgr.getValue();
                    FieldEditor.pushField(field_unit, new_field);
                }
                if (field || new_field) {
                    var ex_fields = [];
                    if (new_field) {
                        function get_ex_fields(rots) {
                            rots.forEach(function(rot) {
                                var ex_field = field_map[
                                    FieldEditor.getFieldKey(kinfo.ix, kinfo.iz, rot)];
                                if (ex_field) {
                                    ex_fields.push(ex_field);
                                    FieldEditor.deleteField(field_unit, ex_field);
                                }
                            });
                        };
                        if (new_field.r == 0 || new_field.r == 2) {
                            get_ex_fields([1, 3, 4]);
                        } else if (new_field.r == 1 || new_field.r == 3) {
                            get_ex_fields([0, 2, 4]);
                        } else if (new_field.r == 4) {
                            get_ex_fields([0, 1, 2, 3]);
                        }
                    }
                    PushUndo(function() {
                        if (new_field) { FieldEditor.deleteField(field_unit, new_field); }
                        if (field) { FieldEditor.pushField(field_unit, field); }
                        ex_fields.forEach(f => FieldEditor.pushField(field_unit, f));
                    }, function() {
                        ex_fields.forEach(f => FieldEditor.deleteField(field_unit, f));
                        if (field) { FieldEditor.deleteField(field_unit, field); }
                        if (new_field) { FieldEditor.pushField(field_unit, new_field); }
                    }, cLang.act_create_field);
                }
            }
        }
    } else if (g_keyboard.getCommonDeleteTrig()) {
        if (sel_field) {
            PushUndo(function() {
                FieldEditor.pushField(field_unit, sel_field);
            }, function() {
                FieldEditor.deleteField(field_unit, sel_field);
            }, cLang.act_delete_field, true);
        }
    }
};
FieldEditor.cSlopeRot = [[1, 0], [0, -1], [-1, 0], [0, 1], [1, 0]];
FieldEditor.writeEditor = function()
{
    var field_unit = this.getFieldUnit();
    var move_unit = field_unit * 2;
    var cy = this.mHeightMgr.getValue();
    if (this.mPreviewInfo) {
        var mtx = m34.MakeSRT(
            v3.Make(field_unit, 0, field_unit),
            v3.Make(0, -cPI * 0.5 * this.mPreviewInfo.rot, 0),
            v3.Make(this.indexToWorld(this.mPreviewInfo.ix, field_unit), cy,
                    this.indexToWorld(this.mPreviewInfo.iz, field_unit)));
        var s = this.mSlope.mValue, r = this.mPreviewInfo.rot;
        var slope_rx = this.cSlopeRot[this.mPreviewInfo.rot];
        var slope_rz = [-slope_rx[1], slope_rx[0]];
        mtx[4] = v2.Dot(s, slope_rx); mtx[6] = v2.Dot(s, slope_rz);
        mtx[7] += FieldDrawer.calcOffset(r, s);
        if (r < 4) {
            g_top_line_drawer.pushQuadTriangle(mtx, v4.Make(1, 0, 0, 1));
        } else {
            g_top_line_drawer.pushQuad(mtx, v4.Make(1, 0, 0, 1));
        }
    }
    if (this.mCursorPos && IsEnableDebugDraw()) {
        var cy = this.getFieldHeight(this.mCursorPos);
        if (cy !== null) {
            g_sphere_drawer.pushSphere(
                v3.Make(this.mCursorPos[0], cy, this.mCursorPos[2]), 3, v4.Make(1, 1, 1, 1));
        }
    }
    g_line_drawer.pushLine(
        v3.SetY(g_camera.mAt, g_grid_drawer.mCenterPosY),
        v3.SetY(g_camera.mAt, this.mHeight.mValue), v4.Make(0, 1, 0, 1));
};
FieldEditor.worldToIndex = function(wx, unit) { return Math.floor(wx / unit); };
FieldEditor.indexToWorld = function(ix, unit) { return unit * (ix + 0.5); };
FieldEditor.worldToKey = function(wpos, unit)
{
    var ret = { ix : this.worldToIndex(wpos[0], unit), iz : this.worldToIndex(wpos[2], unit) };
    var fx = wpos[0] / unit - ret.ix, fz = wpos[2] / unit - ret.iz;
    if (0.25 < fx && fx < 0.75 && 0.25 < fz && fz < 0.75) {
        ret.rot = 4;
    } else if (fx < 0.5) {
        ret.rot = fz < 0.5 ? 0 : 1;
    } else {
        ret.rot = fz < 0.5 ? 3 : 2;
    }
    ret.key = this.getFieldKey(ret.ix, ret.iz, ret.rot);
    return ret;
};
FieldEditor.getFieldKey = function(ix, iz, rot) { return ix + ',' + iz + ',' + rot; };
FieldEditor.deselectField = function()
{
    this.mSelectedField = null;
};
FieldEditor.createField = function(field_unit, ix, iz, rot, slope, type, is_push)
{
    var field_map = this.mFieldMaps['' + field_unit];
    var key = this.getFieldKey(ix, iz, rot);
    var field = field_map[key];
    if (!field) {
        field = { x : ix, z : iz , y : 0, r : rot, s : slope, type : type, };
    }
    if (is_push) { field_map[key] = field; }
    return field;
};
FieldEditor.pushField = function(field_unit, field)
{
    if (!field) { return; }
    var field_map = this.mFieldMaps['' + field_unit];
    var key = this.getFieldKey(field.x, field.z, field.r);
    if (field_map[key]) { return; }
    field_map[key] = field;
    this.updateField(g_canvas.getContext(), field_unit);
};
FieldEditor.deleteField = function(field_unit, field)
{
    if (!field) { return; }
    var field_map = this.mFieldMaps['' + field_unit];
    var key = this.getFieldKey(field.x, field.z, field.r);
    if (field_map[key] != field) { return; }
    delete field_map[key];
    this.updateField(g_canvas.getContext(), field_unit);
    if (this.mSelectedField == field) { this.mSelectedField = null; }
};
FieldEditor.updateFieldAll = function(gl)
{
    for (var unit = g_field_unit_min; unit <= g_field_unit_max; unit *= 2) {
        this.updateField(gl, unit);
    }
};
FieldEditor.updateField = function(gl, field_unit)
{
    var field_drawer = g_field_drawer_map['' + field_unit];
    if (!field_drawer) { return; }
    var field_map = this.mFieldMaps['' + field_unit];
    field_drawer.beginWrite();
    for (var key in field_map) {
        var field = field_map[key];
        var min_y = field.y;
        function update_min_y(dx, dz) {
            for (var r = 0; r <= FieldEditor.cRotMax; ++r) {
                var nf = field_map[FieldEditor.getFieldKey(field.x + dx, field.z + dz, r)];
                if (!nf) { continue; }
                min_y = Math.min(min_y, nf.y);
            }
        }
        update_min_y(0, 0);
        update_min_y(1, 0); update_min_y(-1, 0);
        update_min_y(0, 1); update_min_y(0, -1);
        if (field.r < 4) {
            field_drawer.pushField(field, null, min_y);
        } else {
            field_drawer.pushField(field, 2, min_y);
            field_drawer.pushField(field, null, min_y);
        }
    }
    field_drawer.endWrite(gl);
};
FieldEditor.drawField = function(gl, view_ctx)
{
    var field_unit = this.getFieldUnit();
    g_field_drawers.forEach(function(fd) {
        var is_curr = fd.mFieldUnit == field_unit;
        if (this.mLayerDraw.mValue == 'all' ||
            this.mLayerDraw.mValue == 'current' && is_curr ||
            this.mLayerDraw.mValue == 'others' && !is_curr) {
            fd.draw(gl, view_ctx);
        }
    }, this);
};
FieldEditor.drawEditor = function(gl, view_ctx)
{
    var field_unit = this.getFieldUnit();
    this.mGridDrawer.mSnapUnit = field_unit * 4;
    this.mGridDrawer.mDrawScale = field_unit;
    this.mGridDrawer.mCenterPosY = this.mHeight.mValue;
    this.mGridDrawer.draw(gl, view_ctx);
};
FieldEditor.save = function(data)
{
    var ret = { layers : {}, };
    for (var unit = g_field_unit_min; unit <= g_field_unit_max; unit *= 2) {
        var layer = { insts : [], };
        var field_map = this.mFieldMaps['' + unit];
        for (var key in field_map) {
            var inst = field_map[key];
            layer.insts.push(inst);
        }
        ret.layers['' + unit] = layer;
    }
    data.field = ret;
};
FieldEditor.load = function(gl, data)
{
    this.clearField();
    for (var unit = g_field_unit_min; unit <= g_field_unit_max; unit *= 2) {
        var layer = data.field.layers['' + unit];
        var field_map = this.mFieldMaps['' + unit];
        layer.insts.forEach(function(inst) {
            inst.s = inst.s && v2.FromArray(inst.s) || v2.Makes(0);
            field_map[this.getFieldKey(inst.x, inst.z, inst.r)] = inst;
        }, this);
    }
    this.updateFieldAll(gl);
};
FieldEditor.initialize();
g_undo_redo_callback.push(function() {
    FieldEditor.deselectField();
});
