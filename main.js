'use strict';
var cAppVersionMajor = 1;
var cAppVersionMinor = 0;
var cAppVersionMicro = 3;
var g_cam_ctrl_default = CameraControl.create({});
var g_cam_ctrl_model   = CameraControl.create({});
g_cam_ctrl_model.mYaw = cPI / 6;
g_cam_ctrl_model.mPitch = cPI / 4;
var g_cam_ctrl = g_cam_ctrl_default;
var g_camera = Camera.create();
var cGridInterval = 10.0;
var cGridDivNum = 60;
var cGridWidth = cGridInterval * cGridDivNum;
var g_grid_drawer = GridDrawer.create(100);
var g_field_drawers = [], g_field_drawer_map = {};
for (var unit = g_field_unit_min; unit <= g_field_unit_max; unit *= 2) {
    var fd = FieldDrawer.create(unit);
    g_field_drawers.push(fd);
    g_field_drawer_map['' + unit] = fd;
}
var g_line_drawer = LineDrawer.create();
var g_top_line_drawer = LineDrawer.create();
var g_rail_drawer          = RailDrawer.create(RailDrawerType.cDefault     );
var g_rail_switch_drawer   = RailDrawer.create(RailDrawerType.cSwitch      );
var g_rail_ballast_drawer  = RailDrawer.create(RailDrawerType.cBallast     );
var g_rail_slab_drawer     = RailDrawer.create(RailDrawerType.cSlab        );
var g_safege_drawer        = RailDrawer.create(RailDrawerType.cSafege      );
var g_safege_switch_drawer = RailDrawer.create(RailDrawerType.cSafegeSwitch);
var g_alweg_drawer         = RailDrawer.create(RailDrawerType.cAlweg       );
var g_alweg_switch_drawer  = RailDrawer.create(RailDrawerType.cAlwegSwitch );
var g_rail_girder_drawer   = RailDrawer.create(RailDrawerType.cGirder      );
var g_rail_tunnel_drawer   = RailDrawer.create(RailDrawerType.cTunnel      );
var g_rail_platform_drawer = RailDrawer.createPair(RailDrawerType.cPlatform);
var g_rail_wall_drawer     = RailDrawer.createPair(RailDrawerType.cWall    );
var g_rail_floor_drawer    = RailDrawer.createPair(RailDrawerType.cFloor   );
var g_rail_plt_tnl_drawer  = RailDrawer.createPair(RailDrawerType.cPltTnl  );
var g_rail_pier_drawer       = BoxDrawer .create();
var g_rail_debug_line_drawer = LineDrawer.create();
var g_rail_drawers = [
    g_rail_drawer           ,
    g_rail_switch_drawer    ,
    g_safege_drawer         ,
    g_safege_switch_drawer  ,
    g_alweg_drawer          ,
    g_alweg_switch_drawer   ,
    g_rail_ballast_drawer   ,
    g_rail_slab_drawer      ,
    g_rail_girder_drawer    ,
    g_rail_tunnel_drawer    ,
    g_rail_platform_drawer  ,
    g_rail_wall_drawer      ,
    g_rail_floor_drawer     ,
    g_rail_plt_tnl_drawer   ,
    g_rail_pier_drawer      ,
    g_rail_debug_line_drawer,
];
function ForEachRailDrawer(f, a_this)
{
    g_rail_drawers.forEach(function(drawer) {
        if (Array.isArray(drawer)) {
            drawer.forEach(function(d) { f.apply(a_this, [d]); });
        } else {
            f.apply(a_this, [drawer]);
        }
    });
}
var g_box_drawer = BoxDrawer.create();
var g_sphere_drawer = SphereDrawer.create();
var g_smoke_drawer_default = SmokeDrawer.create(true);
var g_smoke_drawer_model = SmokeDrawer.create(false);
var g_smoke_drawer = g_smoke_drawer_default;
var CtrlParam = {
    cSideAreaWidth : 0.2,
    cTopAreaWidth : 0.2,
};
var CtrlState = {
    cIdle            :  0,
    cMouseDown       :  1,
    cBeginCamera     :  2,
    cRotateCamera    :  3,
    cSlideCamera     :  4,
    cPanCamera       :  5,
    cOffCenterCamera :  6,
    cZoomCamera      :  7,
    cDollyCamera     :  8,
    cMovePoint       :  9,
    cRotatePoint     : 10,
};
function InitializeGrid(gl)
{
    g_grid_drawer.initialize(gl);
    g_grid_drawer.beginWrite();
    var cGridOfs = 0.01;
    for (var i = 0; i <= cGridDivNum; ++i) {
        var x = i * cGridInterval - cGridWidth * 0.5;
        var c = !(i % 10) ? 1 : !(i % 5) ? 0.3 : 0.09;
        g_grid_drawer.pushLine(
            v3.Make(x, cGridOfs, -cGridWidth * 0.5),
            v3.Make(x, cGridOfs, (x == 0 ? 0 : cGridWidth * 0.5)),
            v4.Make(1, 1, 1, c));
        g_grid_drawer.pushLine(
            v3.Make(-cGridWidth * 0.5, cGridOfs, x),
            v3.Make((x == 0 ? 0 : cGridWidth * 0.5), cGridOfs, x),
            v4.Make(1, 1, 1, c));
        if (x == 0) {
            g_grid_drawer.pushLine(
                v3.Make(x, cGridOfs, 0),
                v3.Make(x, cGridOfs, cGridWidth * 0.5),
                v4.Make(0, 0, 1, 1));
            g_grid_drawer.pushLine(
                v3.Make(0, cGridOfs, x),
                v3.Make(cGridWidth * 0.5, cGridOfs, x),
                v4.Make(1, 0, 0, 1));
        }
    }
    g_grid_drawer.endWrite(gl);
}
function DrawArrow(from, to, width, color, up)
{
    var dir = v3.Sub(to, from);
    var len = v3.Length(dir);
    if (len == 0) { return; }
    v3.muls(dir, 1 / len);
    if (!up) { up = v3.ey; }
    if (dir[0] == 0 && dir[2] == 0) {
        up = v3.ez;
    }
    var left = v3.normalize(v3.Cross(up, dir));
    function draw_box(a_from, a_dir) {
        var bl = v3.Length(a_dir);
        var bc = v3.add(v3.Muls(a_dir, 0.5), a_from);
        var mtx = m34.MakeOrtho(a_dir, up, bc, v3.Make(width, width, bl));
        g_box_drawer.pushBox(mtx, color)
    }
    draw_box(from, v3.Muls(dir, len - width));
    var dir1 = v3.Sub(dir, left), dir2 = v3.Add(dir, left);
    var diag_ofs = width / Math.sqrt(8), diag_len = width * 2.5;
    draw_box(v3.Sub(to, v3.Muls(dir1, diag_ofs)), v3.Muls(dir2, -diag_len));
    draw_box(v3.Sub(to, v3.Muls(dir2, diag_ofs)), v3.Muls(dir1, -diag_len));
}
function DrawDoubleArrow(from, to, width, color)
{
    var dir = v3.Sub(to, from);
    var len = v3.Length(dir);
    if (len == 0) { return; }
    v3.muls(dir, 1 / len);
    var up = v3.ey;
    if (dir[0] == 0 && dir[2] == 0) {
        up = v3.ez;
    }
    var left = v3.normalize(v3.Cross(up, dir));
    function draw_box(a_from, a_dir) {
        var bl = v3.Length(a_dir);
        var bc = v3.add(v3.Muls(a_dir, 0.5), a_from);
        var mtx = m34.MakeOrtho(a_dir, up, bc, v3.Make(width, width, bl));
        g_box_drawer.pushBox(mtx, color)
    }
    draw_box(v3.Add(from, v3.Muls(dir, width)), v3.Muls(dir, len - width * 2));
    var dir1 = v3.Sub(dir, left), dir2 = v3.Add(dir, left);
    var diag_ofs = width / Math.sqrt(8), diag_len = width * 2.5;
    draw_box(v3.Sub(from, v3.Muls(dir1, -diag_ofs)), v3.Muls(dir2, diag_len));
    draw_box(v3.Sub(from, v3.Muls(dir2, -diag_ofs)), v3.Muls(dir1, diag_len));
    draw_box(v3.Sub(to, v3.Muls(dir1, diag_ofs)), v3.Muls(dir2, -diag_len));
    draw_box(v3.Sub(to, v3.Muls(dir2, diag_ofs)), v3.Muls(dir1, -diag_len));
}
var g_ctrl_state = CtrlState.cIdle;
var g_cursor_ray = v3.Make(0, 0, 1);
var g_cursor_wpos = v3.Makes(0);
var g_model_focuses = [];
function CalcCursorRayDist(wpos)
{
    var dir = v3.Sub(wpos, g_camera.mPos), dist = v3.Dot(dir, g_cursor_ray);
    return v3.Length(v3.sub(v3.Muls(g_cursor_ray, dist), dir)) / dist;
}
function CancelMouse()
{
    g_mouse.onMouseUp();
    g_mouse.setCancel();
}
var g_time_ms = 0, g_calc_num = 0;
function CalcScene()
{
    Train.calcAll();
    Struct.calcAll();
    Rail.calcSwitchAll();
    ProcOnNextCalc();
}
function DrawScene(now_ms)
{
    g_time_ms = now_ms;
    g_fps_calculator.calc(now_ms);
    var sim_speed = WatchMode.getSimSpeed();
    g_calc_num += Math.min(g_fps_calculator.getCalcNum() * sim_speed, 60);
    // calc once per draw
    g_mouse.update();
    var cpos = v2.mul(v2.Sub(g_mouse.getPos(), v2.Makes(0.5)), v2.Make(2, -2));
    g_cursor_ray = g_camera.calcRayDir(cpos);
    var rail_builder_field_setting =
        (IsMenuBuildRail() || IsMenuEditRail()) && !RailBuilder.mFieldSetting.mValue;
    var plane_height = IsMenuFieldEditor() ? FieldEditor.mHeight.mValue
        : rail_builder_field_setting ? RailBuilder.mHeight.mValue : g_grid_drawer.mCenterPosY;
    g_cursor_wpos = g_camera.calcPlaneIntersection(
        g_cursor_ray, v3.Make(0, plane_height, 0), v3.ey);
    if (!g_mouse.isFree()) {
        function calc_touch_border() {
            var down_pos = v2.Dup(g_mouse.getDownPos());
            if (g_canvas.mIsVerticalMode) {
                down_pos[1] = (down_pos[1] * g_canvas.mDisplayHeight -
                               g_canvas.mTouchRectOffset[1]) / g_canvas.mTouchRectSize[1];
            } else {
                down_pos[0] = (down_pos[0] * g_canvas.mDisplayWidth -
                               g_canvas.mTouchRectOffset[0]) / g_canvas.mTouchRectSize[0];
            }
            //Log('down pos '+v2.ToFixed(down_pos, 3));
            var ret = 0;
            if (down_pos[0] <     CtrlParam.cSideAreaWidth) { ret += 1; }
            if (down_pos[0] > 1 - CtrlParam.cSideAreaWidth) { ret += 2; }
            if (down_pos[1] <     CtrlParam.cTopAreaWidth ) { ret += 4; }
            if (down_pos[1] > 1 - CtrlParam.cTopAreaWidth ) { ret += 8; }
            return ret;
        }
        if (g_ctrl_state == CtrlState.cIdle) {
            g_ctrl_state = CtrlState.cMouseDown;
            if (g_is_touch_device && calc_touch_border()) {
                g_ctrl_state = CtrlState.cBeginCamera;
            }
        } else if (g_ctrl_state == CtrlState.cMouseDown
                   || g_ctrl_state == CtrlState.cBeginCamera) {
            var is_slide = false, is_pan = false;
            var is_zoom = false, is_dolly = false, is_offcent = false;
            if (g_is_touch_device) {
                var touch_side = calc_touch_border();
                is_slide   = touch_side == 1 || touch_side == 2;
                is_pan     = touch_side == 9;
                is_zoom    = touch_side == 4 || touch_side == 8;
                is_dolly   = touch_side == 6;
                is_offcent = touch_side == 5 || touch_side == 10;
            } else {
                var shift = g_keyboard.isShiftDown(), alt = g_keyboard.isAltDown();
                var ctrl  = g_keyboard.isCtrlDown();
                is_zoom    =  shift && !alt && !ctrl;
                is_dolly   =  shift && !alt &&  ctrl;
                is_slide   = !shift &&  alt && !ctrl;
                is_pan     =  shift &&  alt && !ctrl;
                is_offcent = !shift && !alt &&  ctrl;
            }
            if (g_mouse.calcDeltaDist() > 0.1) {
                if (is_slide) {
                    g_ctrl_state = CtrlState.cSlideCamera;
                    g_cam_ctrl.beginSlide();
                } else if (is_pan) {
                    g_ctrl_state = CtrlState.cPanCamera;
                    g_cam_ctrl.beginPan();
                } else if (is_offcent) {
                    g_ctrl_state = CtrlState.cOffCenterCamera;
                    g_cam_ctrl.beginOffCenter();
                } else if (is_zoom) {
                    g_ctrl_state = CtrlState.cZoomCamera;
                    g_cam_ctrl.beginZoom();
                } else if (is_dolly) {
                    g_ctrl_state = CtrlState.cDollyCamera;
                    g_cam_ctrl.beginDolly();
                } else {
                    g_ctrl_state = CtrlState.cRotateCamera;
                    g_cam_ctrl.beginRotate();
                }
                g_mouse.resetDelta();
            } else if(g_mouse.wasShortTouch()) {
                g_ctrl_state = CtrlState.cMouseDown;
            }
        } else {
            var delta_with_aspect = g_mouse.getDeltaWithAspect();
            if (g_ctrl_state == CtrlState.cRotateCamera) {
                g_cam_ctrl.calcRotate(delta_with_aspect);
            } else if (g_ctrl_state == CtrlState.cSlideCamera) {
                g_cam_ctrl.calcSlide(delta_with_aspect);
            } else if (g_ctrl_state == CtrlState.cPanCamera) {
                g_cam_ctrl.calcPan(delta_with_aspect);
            } else if (g_ctrl_state == CtrlState.cOffCenterCamera) {
                g_cam_ctrl.calcOffCenter(v2.Dup(g_mouse.getDelta()));
            } else if (g_ctrl_state == CtrlState.cZoomCamera) {
                g_cam_ctrl.calcZoom(delta_with_aspect);
            } else if (g_ctrl_state == CtrlState.cDollyCamera) {
                g_cam_ctrl.calcDolly((delta_with_aspect[0] + delta_with_aspect[1]) * 90);
            }
        }
    } else {
        if (!g_mouse.isCancel()) {
            if (g_ctrl_state == CtrlState.cMouseDown) {
                if (IsMenuWatch()) {
                    PickModel();
                } else if (IsMenuBuildRail()) {
                    RailBuilder.addCtrlPoint(/*g_cursor_wpos*/);
                } else if (IsMenuTrainList()) {
                    TrainSetter.putTrain();
                } else if (IsMenuStructList()) {
                    StructSetter.putStruct();
                } else if (IsMenuSchedule()) {
                    RailBuilder.turnSwitch();
                }
            }
        }
        if (g_ctrl_state == CtrlState.cMovePoint ||
            g_ctrl_state == CtrlState.cRotatePoint)
        {
            RailBuilder.endMovePoint();
        }
        if (IsFocusMode() && g_keyboard.getEscapeTrig()) { PopFocus(); }
        g_ctrl_state = CtrlState.cIdle;
    }
    g_smoke_drawer.mIsPause = IsPause();
    g_smoke_drawer.mIsFade = sim_speed > 1;
    // calc multiple times per draw with sim speed
    do {
        CalcScene();
        if (g_calc_num >= 1) { g_calc_num -= 1; }
    } while (g_calc_num >= 1);
    // calc editor
    if (IsMenuBuildRail() || IsMenuEditRail() || IsMenuSchedule()) {
        RailBuilder.calc(g_cursor_wpos);
    } else if (IsMenuTrainList()) {
        TrainSetter.calc(g_cursor_wpos);
    } else if (IsMenuStructList()) {
        StructSetter.calc(g_cursor_wpos);
    } else if (IsMenuFieldEditor()) {
        FieldEditor.calc(g_cursor_wpos);
    }
    // end calc
    g_canvas.update();
    var gl = g_canvas.getContext();
    g_line_drawer.beginWrite();
    g_top_line_drawer.beginWrite();
    g_box_drawer.beginWrite();
    g_sphere_drawer.beginWrite();
    g_smoke_drawer.beginWrite();
    EditModel.beginWrite();
    function set_inspection_mode(f) {
        function per_drawer(drawers, n) {
            drawers.forEach(drawer => drawer.setDrawProfileNum(n));
        }
        g_rail_girder_drawer  .setDrawProfileNum(f && cGirderTopProfileNum     );
        g_safege_drawer       .setDrawProfileNum(f && cSafegeBottomProfileNum  );
        g_safege_switch_drawer.setDrawProfileNum(f && cSafegeBottomProfileNum  );
        g_alweg_drawer        .setDrawProfileNum(f && cAlwegNonBottomProfileNum);
        g_alweg_switch_drawer .setDrawProfileNum(f && cAlwegNonBottomProfileNum);
        per_drawer(g_rail_platform_drawer, f && cPlatformTopProfileNum);
        per_drawer(g_rail_wall_drawer    , f && cWallTopProfileNum    );
        per_drawer(g_rail_floor_drawer   , f && cFloorTopProfileNum   );
    }
    set_inspection_mode(IsInspectMode());
    if (IsMenuEditModel()) { EditModel.writeEditor(); }
    else if (IsMenuTrainModel()) { TrainModel.writeEditor(); }
    else if (IsMenuStructModel()) { StructModel.writeEditor(); }
    else if (IsMenuStructModel()) { StructModel.writeEditor(); }
    else {
        if (IsMenuFieldEditor()) { FieldEditor.writeEditor(); }
        Train.writeAll();
        Struct.writeAll();
    }
    if (!IsEditorMode() && !IsMenuWatch() && !IsMenuFile()) {
        RailBuilder.write();
        TrainSetter.write();
        if (IsMenuStructList()) { StructEditor.write(); }
        g_line_drawer.pushLine(v3.SetY(g_cursor_wpos, 0), g_cursor_wpos, v4.Make(0, 1, 0, 1));
        if (!IsMenuEditRail() && !IsMenuSchedule() && !IsMenuTrainList()) {
            DrawArrow(v3.add(v3.Make(0, Math.max(10, -g_cursor_wpos[1] + 1), 0),
                             g_cursor_wpos), g_cursor_wpos, 0.5, v4.Makes(1));
        }
    }
    g_cam_ctrl.setAtt();
    g_cam_ctrl.setEnableCalcPos(true);
    if (IsFocusMode() && g_model_focuses.length > 0) {
        var focus_pos = v3.Makes(0), focus_dx = null, focus_dz = null, rot_base = null;
        var aabb_centers = [], dist_factor = 0;
        for (var i_focus = 0; i_focus < g_model_focuses.length; ++i_focus ) {
            var model_focus = g_model_focuses[i_focus];
            var inst = model_focus.inst, i_part = model_focus.part_index;
            var info = inst.mModel.user_data.parts_info[i_part];
            var part_att = inst.mPartsAtt[i_part];
            var mdl = EditModel.mIdToData[info.part.model];
            var drawer = mdl.user_data.drawer;
            if (model_focus.hilite_frame > 0 || IsEnableDebugDraw()) {
                model_focus.hilite_frame -= 1;
                if (!IsPhotoMode()) {
                    g_line_drawer.pushAABB(drawer.mAABB, v4.Make(1, 0, 0, 1), part_att);
                }
            }
            var aabb_center = aabb3.CalcCenter(drawer.mAABB, part_att);
            aabb_centers.push(aabb_center);
            v3.add(focus_pos, aabb_center);
            if (WatchMode.isFocusRot()) {
                if (focus_dz) {
                    var dz = v3.normalize(v3.Sub(aabb_center, rot_base));
                    if (i_focus <= 1) {
                        focus_dz = dz;
                    } else {
                        v3.sub(dz, v3.Muls(focus_dz, v3.Dot(focus_dz, dz)));
                        v3.normalize(v3.add(focus_dz, dz));
                    }
                } else {
                    rot_base = aabb_center;
                    if (info.part.type == 'wheel') {
                        focus_dz = v3.normalize(v3.Cross(m34.GetCol(part_att, 0), v3.ey));
                    } else {
                        focus_dz = v3.normalize(v3.setY(m34.GetCol(part_att, 2), 0));
                    }
                }
            }
        }
        v3.muls(focus_pos, 1 / g_model_focuses.length);
        if (WatchMode.isFocusZoom() && g_model_focuses.length > 1) {
            aabb_centers.forEach(center => dist_factor = Math.max(
                dist_factor, (v3.CalcDist(center, focus_pos) + 20) * 0.1));
        }
        g_cam_ctrl.setDistFactor(dist_factor);
        if (WatchMode.isFixCamera()) {
            g_camera.setAt(focus_pos);
            g_cam_ctrl.setAt(focus_pos);
            g_cam_ctrl.setEnableCalcPos(false);
        } else if (WatchMode.isFocusRot()) {
            focus_dx = v3.normalize(v3.Cross(v3.ey, v3.normalize(focus_dz)));
            g_cam_ctrl.setAtt(focus_dx, focus_dz);
            g_cam_ctrl.setAt(focus_pos);
        } else {
            g_cam_ctrl.setAt(focus_pos);
        }
    } else {
        g_cam_ctrl.setDistFactor(0);
    }
    g_cam_ctrl_default.setFov(FileMode.mCameraFov.mValue * cDeg2Rad);
    g_cam_ctrl.apply(g_camera);
    var field_height = null, is_draw_cam_height = false;
    function get_field_height() {
        if (field_height === null) {
            field_height = FieldEditor.getFieldHeight(g_camera.mAt) || 0;
        }
        return field_height;
    }
    function draw_cam_height() {
        if (is_draw_cam_height) { return; }
        is_draw_cam_height = true;
        g_line_drawer.pushLine(g_camera.mAt, v3.SetY(
            g_camera.mAt, get_field_height()), v4.Make(0, 1, 0, 1));
    }
    g_grid_drawer.mCenterPosY = rail_builder_field_setting
        ? RailBuilder.mHeight.mValue : get_field_height();
    if (!IsMenuWatch() || IsEnableDebugDraw()) {
        g_line_drawer.pushLine(v3.zero, v3.Make(
            0, 10 * cGridInterval * g_grid_drawer.mDrawScale, 0), v4.Make(0, 1, 0, 1));
    }
    if ((g_ctrl_state == CtrlState.cRotateCamera    ||
         g_ctrl_state == CtrlState.cSlideCamera     ||
         g_ctrl_state == CtrlState.cPanCamera       ||
         g_ctrl_state == CtrlState.cOffCenterCamera ||
         g_ctrl_state == CtrlState.cZoomCamera      ) && !IsPhotoMode())
    {
        var mtx = m34.MakeST(v3.Makes(g_cam_ctrl.calcDist() * 0.2), g_camera.mAt);
        g_line_drawer.pushAxis(mtx);
        draw_cam_height();
    }
    Rail.writeDynamicAll();
    g_line_drawer.endWrite(gl);
    g_top_line_drawer.endWrite(gl);
    g_box_drawer.endWrite(gl);
    g_sphere_drawer.endWrite(gl);
    g_smoke_drawer.endWrite(gl);
    EditModel.endWrite(gl);
    g_camera.update();
    var view_ctx = {
        view_mtx : g_camera.getViewMatrix(),
        proj_mtx : g_camera.getProjectionMatrix(),
        view_pos : v3.Dup(g_camera.mPos),
        camera_at : v3.Dup(g_camera.mAt),
    };
    view_ctx.view_proj_mtx = m44.Mul34(view_ctx.proj_mtx, view_ctx.view_mtx);
    EditModel.draw(gl, view_ctx, 'field');
    if (!IsEditorMode()) {
        if (IsMenuFieldEditor()) {
            FieldEditor.drawField(gl, view_ctx);
        } else {
            g_field_drawers.forEach(fd => fd.draw(gl, view_ctx));
        }
        g_rail_tunnel_drawer.draw(gl, view_ctx);
        g_rail_plt_tnl_drawer.forEach(drawer => drawer.draw(gl, view_ctx));
    }
    EditModel.draw(gl, view_ctx, 'tunnel');
    g_box_drawer.draw(gl, view_ctx);
    g_sphere_drawer.draw(gl, view_ctx);
    g_smoke_drawer.draw(gl, view_ctx);
    EditModel.draw(gl, view_ctx, 'default');
    if (IsMenuEditModel()) {}
    else if (IsMenuTrainModel()) { TrainModel.draw(gl, view_ctx); }
    else if (IsMenuStructModel()) { StructModel.draw(gl, view_ctx); }
    else {
        ForEachRailDrawer(function(drawer) {
            if (!drawer.mIsTunnel) { drawer.draw(gl, view_ctx); }
        });
        if (IsMenuFieldEditor()) { FieldEditor.drawEditor(gl, view_ctx); }
    }
    if (!IsMenuWatch() && !IsMenuFieldEditor()) {
        if (g_cam_ctrl.mDist > 500) {
            g_grid_drawer.mSnapUnit = 1000;
            g_grid_drawer.mDrawScale = 10;
        } else {
            g_grid_drawer.mSnapUnit = 100;
            g_grid_drawer.mDrawScale = 1;
        }
        g_grid_drawer.draw(gl, view_ctx);
    }
    g_line_drawer.draw(gl, view_ctx);
    g_top_line_drawer.draw(gl, view_ctx);
    requestAnimationFrame(DrawScene);
}
function PickModel()
{
    var model_focus = null;
    function pick_impl(inst, focus_type) {
        var i = 0;
        inst.mModel.user_data.parts_info.forEach(function(info) {
            var i_part = i++, part_att = inst.mPartsAtt[i_part];
            if (!part_att) { return; }
            if (!info.part.accept_focus) { return; }
            var mdl = EditModel.mIdToData[info.part.model];
            var drawer = mdl.user_data.drawer;
            var bsp = aabb3.CalcBoundingSphere(drawer.mAABB, part_att);
            var hit_dist = g_camera.calcSphereIntersection(g_cursor_ray, bsp);
            if (hit_dist < 0) { return; }
            if (model_focus && hit_dist >= model_focus.dist) { return; }
            model_focus = {
                type : focus_type,
                dist : hit_dist,
                inst : inst,
                part_index : i_part,
            };
        });
    }
    Train.forEachCar(function(train, car) {
        pick_impl(car, 'train');
    });
    Struct.forEach(function(strc) {
        pick_impl(strc, 'struct');
    });
    g_cam_ctrl.setAtt();
    g_cam_ctrl.calcPos();
    if (model_focus) {
        var is_add_focus = true;
        if (g_is_touch_device ? !WatchMode.isMultiFocus()
            : !g_keyboard.isShiftDown() && !g_keyboard.isCtrlDown()) {
            g_model_focuses = [];
        }
        for (var i = 0; i < g_model_focuses.length;) {
            if (g_model_focuses[i].inst == model_focus.inst) {
                if (g_model_focuses[i].part_index == model_focus.part_index) {
                    is_add_focus = false;
                }
                g_model_focuses.splice(i, 1);
            } else {
                ++i;
            }
        }
        if (is_add_focus) {
            if (g_model_focuses.length >= g_max_focus_num) { g_model_focuses.pop(); }
            g_model_focuses.push(model_focus);
        }
    } else {
        PopFocus();
    }
    g_model_focuses.forEach(mf => mf.hilite_frame = 60);
}
function PopFocus()
{
    if (g_model_focuses.length > 0) {
        g_model_focuses.pop();
    } else {
        SetPhotoMode(false);
    }
}
var SplashObj = {
    elem : GetElement('splash'),
    version_elem : GetElement('splash-version'),
    config_elem : GetElement('splash-config'),
    opt_aa : GetElement('opt-aa'),
    opt_reso : GetElements('opt-reso'),
    opt_undo_size : GetElement('opt-undo-size'),
};
SplashObj.opt_aa.checked = g_opt_enable_aa;
SplashObj.opt_reso.forEach(el => { if (el.value == g_opt_resolution) { el.checked = true; } });
SplashObj.opt_undo_size.value = g_opt_undo_stack_size;
function main(lang)
{
    SetBodyClassName(BodyClassNameSlot.Language, 'lang-' + lang);
    SplashObj.elem.style.display = 'none';
    g_opt_enable_aa = SplashObj.opt_aa.checked;
    SplashObj.opt_reso.forEach(el => { if (el.checked) { g_opt_resolution = el.value; } });
    g_opt_undo_stack_size = parseIntWithDefault(SplashObj.opt_undo_size.value, 0);
    g_mouse.initialize();
    g_keyboard.initialize();
    DebugLog.initialize();
    MainMenu.initialize();
    Log('RailSimWeb');
    if (!g_canvas.initialize(GetElement('canvas'))) { return; }
    if (g_is_touch_device) { Log(cLang.desc_touch_device_mode); }
    var gl = g_canvas.getContext();
    webgl.initialize(gl);
    g_fps_calculator.initialize();
    g_camera.initialize();
    InitializeGrid(gl);
    g_line_drawer.initialize(gl);
    g_top_line_drawer.initialize(gl); g_top_line_drawer.setIgnoreDepth(true);
    g_box_drawer.initialize(gl);
    g_sphere_drawer.initialize(gl);
    g_smoke_drawer_default.initialize(gl);
    g_smoke_drawer_model.initialize(gl);
    g_field_drawers.forEach(fd => fd.initialize(gl));
    ForEachRailDrawer(drawer => drawer.initialize(gl));
    TrainModel.createPreviewRail(gl);
    FieldEditor.initializeGrid(gl);
    FieldEditor.createTestField(gl);
    var def_menu_func = window['Menu' + g_default_mode];
    if (def_menu_func) { def_menu_func(true); }
    else { MenuWatch(true); }
    if (g_enable_load_data) { LoadData(gl, g_layout_data); }
    window.addEventListener('beforeunload', function(event) {
        if (!g_is_confirm_navigation) { return; }
        event.preventDefault();
        event.returnValue = '';
    });
    requestAnimationFrame(DrawScene);
}
function GetVersionText()
{
    return 'Version ' + cAppVersionMajor + '.' + cAppVersionMinor + '.' + cAppVersionMicro;
}
function boot()
{
    SplashObj.version_elem.innerText = GetVersionText();
    GetElement('loading').style.display = 'none';
    if (g_is_auto_start) {
        SplashObj.elem.style.display = 'none';
        main(g_language);
    } else {
        SplashObj.config_elem.style.display = 'block';
    }
}
