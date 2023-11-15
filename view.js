'use strict';
var cFPS = 60;
var cSmoothFrameNum = 5;
var FPSCalculator = CreateInstance();
FPSCalculator.create = function()
{
    var inst = CreateInstance();
    inst.mLastKeyTime = -1;
    inst.mLastFrameTime = -1;
    inst.mFPS = 0;
    inst.mFrameCount = 0;
    inst.mCalcDeltaTime = 0;
    inst.mDeltaHistory = [];
    inst.mCalcNum = 1;
    inst.initialize = function()
    {
        this.mSpanElement = DebugLog.mSpanFPS;
        for (var i = 0; i < cSmoothFrameNum; ++i) {
            this.mDeltaHistory.push(1000 / cFPS);
        }
    };
    inst.getCalcNum = function() { return this.mCalcNum; }
    inst.calc = function(t_ms)
    {
        if (this.mLastKeyTime < 0) {
            this.mLastKeyTime = t_ms;
        } else {
            ++this.mFrameCount;
            var dt = t_ms - this.mLastKeyTime;
            if (dt >= 1000) {
                this.mFPS = this.mFrameCount * 1000 / dt;
                var span = this.mSpanElement;
                span.innerText = this.mFPS.toFixed(1);
                this.mLastKeyTime = t_ms;
                this.mFrameCount = 0;
            }
        }
        if (this.mLastFrameTime < 0) {
            this.mLastFrameTime = t_ms;
            this.mCalcNum = 1;
        } else {
            var dt = t_ms - this.mLastFrameTime;
            this.mDeltaHistory.shift();
            this.mDeltaHistory.push(dt);
            var t_history = Array.from(this.mDeltaHistory);
            t_history.sort();
            dt = t_history[Math.floor(t_history.length / 2)];
            this.mCalcDeltaTime += dt;
            this.mLastFrameTime = t_ms;
            this.mCalcNum = Math.round(this.mCalcDeltaTime * cFPS / 1000);
            if (this.mCalcNum > g_max_calc_per_frame) {
                this.mCalcNum = g_max_calc_per_frame;
                this.mCalcDeltaTime = 0;
            } else {
                this.mCalcDeltaTime -= this.mCalcNum * 1000 / cFPS;
            }
            //Log('dt = ' + dt.toFixed(1) + ', CalcNum = ' + this.mCalcNum
            //    + ', Delta = ' + this.mCalcDeltaTime.toFixed(1));
        }
    };
    return inst;
};
var g_fps_calculator = FPSCalculator.create();
var Canvas = CreateObjMgr();
Canvas.create = function()
{
    var inst = Canvas.createObj();
    inst.getAspect = function()
    {
        return this.mDisplayWidth / this.mDisplayHeight;
    };
    inst.getContext = function() { return this.mContext; };
    inst.initialize = function(element)
    {
        element.style.display = 'block';
        var opt_aa = SplashObj.opt_aa.checked;
        var gl = element.getContext('webgl', { antialias : opt_aa, });
        if (!gl) { return false; }
        this.mElement = element;
        this.mContext = gl;
        this.mHandle = gl.canvas;
        this.mClearColor = v4.Make(0, 0, 0, 1);
        this.mDisplayWidth = this.mDisplayHeight = 1;
        this.mFrameBufferWidth = this.mFrameBufferHeight = 1;
        this.mIsVerticalMode = false;
        this.mTouchRectOffset = v2.Make(0, 0);
        this.mTouchRectSize = v2.Make(1, 1);
        return true;
    };
    inst.setClearColor = function(col) { this.mClearColor = col; };
    inst.update = function()
    {
        var gl = this.mContext;
        if (g_is_touch_device) {
            this.mDisplayWidth  = window.outerWidth;
            this.mDisplayHeight = window.outerHeight;
        } else {
            this.mDisplayWidth  = window.innerWidth;
            this.mDisplayHeight = window.innerHeight;
        }
        this.mElement.style.width  = this.mDisplayWidth  + 'px';
        this.mElement.style.height = this.mDisplayHeight + 'px';
        var reso_div = 1;
        if      (g_opt_resolution == 'half'   ) { reso_div = 2; }
        else if (g_opt_resolution == 'third'  ) { reso_div = 3; }
        else if (g_opt_resolution == 'quarter') { reso_div = 4; }
        this.mFrameBufferWidth  = Math.ceil(this.mDisplayWidth  / reso_div);
        this.mFrameBufferHeight = Math.ceil(this.mDisplayHeight / reso_div);
        if (this.mHandle.width  !== this.mFrameBufferWidth ||
            this.mHandle.height !== this.mFrameBufferHeight) {
            this.mHandle.width  = this.mFrameBufferWidth;
            this.mHandle.height = this.mFrameBufferHeight;
            this.mIsVerticalMode = this.mDisplayWidth < this.mDisplayHeight;
            SetBodyClassName(BodyClassNameSlot.VerticalMode,
                             this.mIsVerticalMode ? 'vertical' : 'horizontal');
        }
        var list_obj = MainMenu.GetListObj();
        v2.set(this.mTouchRectOffset, 0, 0);
        v2.set(this.mTouchRectSize, this.mDisplayWidth, this.mDisplayHeight);
        if (list_obj && list_obj.className.indexOf('hide') < 0) {
            var rect = list_obj.getBoundingClientRect();
            if (this.mIsVerticalMode) {
                this.mTouchRectOffset[1] = rect.bottom;
                this.mTouchRectSize  [1] = this.mDisplayHeight - rect.bottom;
            } else {
                this.mTouchRectOffset[0] = rect.right;
                this.mTouchRectSize  [0] = this.mDisplayWidth - rect.right;
            }
        }
        if (!this.mTouchRectOffsetPrev ||
            !v2.IsEqual(this.mTouchRectOffsetPrev, this.mTouchRectOffset) ||
            !v2.IsEqual(this.mTouchRectSizePrev  , this.mTouchRectSize  )) {
            WatchMode.mCameraGuide.style.width  = this.mTouchRectSize[0] + 'px';
            WatchMode.mCameraGuide.style.height = this.mTouchRectSize[1] + 'px';
            if (!this.mTouchRectOffsetPrev) {
                document.body.append(WatchMode.mCameraGuide);
                this.mTouchRectOffsetPrev = v2.MakeUndef();
                this.mTouchRectSizePrev   = v2.MakeUndef();
            }
            v2.copy(this.mTouchRectOffsetPrev, this.mTouchRectOffset);
            v2.copy(this.mTouchRectSizePrev  , this.mTouchRectSize  );
        }
        gl.viewport(0, 0, this.mHandle.width, this.mHandle.height);
        //gl.depthRange(0.0, 1.0);
        var col = this.mClearColor;
        gl.clearColor(col[0], col[1], col[2], col[3]);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    };
    return inst;
};
var g_canvas = Canvas.create();
var Camera = CreateObjMgr();
Camera.create = function()
{
    var cam = Camera.createObj();
    cam.mPos  = v3.Make(0, 0, 1);
    cam.mAt   = v3.Make(0, 0, 0);
    cam.mUp   = v3.Make(0, 1, 0);
    cam.mAttLeft = v3.Make(1, 0, 0);
    cam.mAttUp   = v3.Make(0, 1, 0);
    cam.mAttDir  = v3.Make(0, 0, 1);
    cam.mFov = g_default_camera_fov * cDeg2Rad;
    cam.mFovx = cam.mFov;
    cam.mFovy = cam.mFov;
    cam.mNear = 1.0;
    cam.mFar  = 10000.0;
    cam.mOffCenter = v2.Makes(0);
    cam.mEffectOffCenter = v2.Makes(0);
    cam.initialize = function()
    {
        this.mViewMatrix = m34.MakeIdent();
        this.mProjectionMatrix = m44.MakeIdent();
    };
    cam.setPos = function(pos) { this.mPos = pos; };
    cam.setAt  = function(at ) { this.mAt  = at ; };
    cam.setUp  = function(up ) { this.mUp  = up ; };
    cam.setOffCenter = function(offcent) { this.mOffCenter = offcent; };
    cam.setFov = function(fov) { this.mFov = fov; };
    cam.getEffectOffCenter = function() { return this.mEffectOffCenter; };
    cam.calcDir = function() {
        return v3.normalize(v3.Sub(this.mAt, this.mPos));
    };
    cam.calcDist = function() {
        return v3.Length(v3.Sub(this.mAt, this.mPos));
    };
    cam.getViewMatrix = function() { return this.mViewMatrix; };
    cam.getProjectionMatrix = function() { return this.mProjectionMatrix; };
    cam.update = function()
    {
        this.mAttDir = this.calcDir();
        this.mAttLeft = v3.normalize(v3.Cross(this.mUp, this.mAttDir));
        this.mAttUp = v3.normalize(v3.Cross(this.mAttDir, this.mAttLeft));
        m34.setLookAt(this.mViewMatrix, this.mPos, this.mAt, this.mUp);
        if (g_canvas.mIsVerticalMode) {
            this.mFovx = this.mFov;
            this.mFovy = Math.atan(Math.tan(this.mFovx * 0.5) / g_canvas.getAspect()) * 2;
        } else {
            this.mFovy = this.mFov;
            this.mFovx = Math.atan(Math.tan(this.mFovy * 0.5) * g_canvas.getAspect()) * 2;
        }
        v2.copy(this.mEffectOffCenter, this.mOffCenter);
        var list_obj = MainMenu.GetListObj();
        if (list_obj && list_obj.className.indexOf('hide') < 0) {
            var rect = list_obj.getBoundingClientRect();
            if (g_canvas.mIsVerticalMode) {
                this.mEffectOffCenter[1] = lerp(
                    this.mEffectOffCenter[1], 1, rect.bottom / g_canvas.mDisplayHeight);
            } else {
                this.mEffectOffCenter[0] = lerp(
                    this.mEffectOffCenter[0], -1, rect.right / g_canvas.mDisplayWidth);
            }
        }
        var nf_factor = 1 / Math.tan(this.mFov * 0.5);
        m44.setPerspective(
            this.mProjectionMatrix,
            this.mFovy, g_canvas.getAspect(),
            this.mNear * nf_factor, this.mFar * nf_factor,
            this.mEffectOffCenter);
    };
    // screen_pos: [-1,-1]~[+1,+1]
    cam.calcRayDir = function(screen_pos)
    {
        var ty = Math.tan(this.mFovy * 0.5);
        var tx = ty * g_canvas.getAspect();
        var ofs_screen_pos = v2.Add(screen_pos, g_camera.getEffectOffCenter());
        var ray_dir = v3.add(v3.Muls(this.mAttLeft, -tx * ofs_screen_pos[0]),
                             v3.Muls(this.mAttUp, ty * ofs_screen_pos[1]));
        return v3.normalize(v3.add(ray_dir, this.mAttDir));
    };
    cam.calcPlaneIntersection = function(ray_dir, plane_pos, plane_nrm)
    {
        var plane_dist = v3.Dot(v3.Sub(this.mPos, plane_pos), plane_nrm);
        var dot = v3.Dot(ray_dir, plane_nrm);
        return v3.Sub(this.mPos, v3.Muls(ray_dir, plane_dist / dot));
    };
    cam.calcSphereIntersection = function(ray_dir, sphere)
    {
        var delta = v3.Sub(sphere, this.mPos), dist = v3.Length(delta), r = sphere[3];
        if (dist <= r) { return dist; }
        var dot = v3.Dot(delta, ray_dir);
        if (dot <= 0) { return -1; }
        var ret = Math.sqrt(dist * dist - dot * dot);
        return ret <= r ? ret : -1;
    };
    cam.calcCapsuleIntersection = function(ray_dir, pos0, pos1, r)
    {
        var delta = v3.Sub(pos1, pos0), len = v3.Length(delta);
        var res = calcNearestPointsOnLines(this.mPos, ray_dir, pos0, delta);
        if (res && res.dist0 >= 0 && res.dist1 >= 0 && res.dist1 <= len) {
            if (res.dist > r) { return null; }
            return { dist : res.dist, ofs : res.dist1, pos : res.pivot1, };
        }
        return null;
        var t = this.calcSphereIntersection(ray_dir, v4.FromV3(pos0, r));
        if (t >= 0) { return { dist : t, ofs : 0, pos : pos0, }; }
        t = this.calcSphereIntersection(ray_dir, v4.FromV3(pos1, r));
        if (t >= 0) { return { dist : t, ofs : len, pos : pos1, }; }
        return null;
    };
    return cam;
};
var CameraControl = CreateSingleton();
CameraControl.create = function(args)
{
    var inst = {
        mAt    : v3.Makes(0),
        mDist  : 50.0,
        mDistFactor : 1,
        //mDist  : 15,
        mYaw   : cPI / 2,
        mPitch : cPI * .4,//cPI / 4,
        mMaxPitch :  cPI * 0.49,
        mMinPitch : -cPI * 0.49,
        mFov : g_default_camera_fov * cDeg2Rad,
        mDownAt    : v3.Makes(0),
        mDownPos   : v3.Makes(0),
        mDownDist  : 0.0,
        mDownFov   : 0.0,
        mDownYaw   : 0.0,
        mDownPitch : 0.0,
        mDownOffCenter : v2.Makes(0),
        mOffCenter     : v2.Makes(0),
        mAttX : null,
        mAttZ : null,
        mIsEnableCalcPos : true,
    };
    inst.setYaw = function(yaw) {
        this.mYaw = yaw - Math.floor(yaw / cPI2) * cPI2;
    };
    inst.beginRotate = function()
    {
        this.mDownYaw   = this.mYaw  ;
        this.mDownPitch = this.mPitch;
    };
    inst.calcRotate = function(delta)
    {
        if (!this.mIsEnableCalcPos) { return; }
        this.setYaw(this.mDownYaw + delta[0] * 4.0);
        this.mPitch = this.mDownPitch + delta[1] * 4.0;
        this.mPitch = clamp(this.mPitch, this.mMinPitch, this.mMaxPitch);
    };
    inst.beginSlide = function()
    {
        if (this.mIsEnableCalcPos) { v3.copy(this.mDownAt, this.mAt); }
    };
    inst.calcSlide = function(delta)
    {
        var flat_dir = v3.normalize(v3.SetY(g_camera.calcDir(), 0));
        var flat_left = v3.Make(flat_dir[2], 0, -flat_dir[0]);
        var speed = this.mDist * 2.0;
        var p_curr;
        if (this.mIsEnableCalcPos) {
            p_curr = this.mAt;
            v3.copy(p_curr, this.mDownAt);
        } else {
            p_curr = g_camera.mPos;
            g_mouse.resetDelta();
        }
        v3.add(p_curr, v3.Muls(flat_left, delta[0] * speed));
        v3.add(p_curr, v3.Muls(flat_dir, delta[1] * speed * Math.sign(this.mPitch)));
        if (!this.mIsEnableCalcPos) { this.calcInverse(); }
    };
    inst.beginPan = function()
    {
        if (this.mIsEnableCalcPos) { v3.copy(this.mDownAt, this.mAt); }
    };
    inst.calcPan = function(delta)
    {
        var flat_dir = v3.normalize(v3.SetY(g_camera.calcDir(), 0));
        var cam_left = v3.normalize(v3.Cross(v3.ey, flat_dir));
        var speed = this.mDist * 2.0;
        var p_curr;
        if (this.mIsEnableCalcPos) {
            p_curr = this.mAt;
            v3.copy(p_curr, this.mDownAt);
        } else {
            p_curr = g_camera.mPos;
            g_mouse.resetDelta();
        }
        var pan_y = delta[1];
        if (g_is_touch_device) {
            pan_y += delta[0];
            //pan_y = pan_y > 0 ? Math.max(0, pan_y - 0.1) : Math.min(0, pan_y + 0.1);
            v3.add(p_curr, v3.Muls(v3.ey, pan_y * speed));
        } else {
            v3.add(p_curr, v3.Muls(cam_left, delta[0] * speed));
            v3.add(p_curr, v3.Muls(v3.ey, pan_y * speed));
        }
        if (!this.mIsEnableCalcPos) { this.calcInverse(); }
    };
    inst.beginOffCenter = function()
    {
        v3.copy(this.mDownOffCenter, this.mOffCenter);
    };
    inst.calcOffCenter = function(delta)
    {
        this.mOffCenter = v2.Clamps(v2.add(v2.muls(v2.Make(
            -delta[0], delta[1]), 2), this.mDownOffCenter), -1, 1);
    };
    inst.beginZoom = function()
    {
        this.mDownDist = this.mDist;
        if (!this.mIsEnableCalcPos) { this.calcInverse(); }
    },
    inst.calcZoom = function(delta)
    {
        this.mDist = this.mDownDist * Math.pow(8, -delta[1]);
        this.mDist = Math.max(this.mDist, 1);
        this.mDist = Math.min(this.mDist, 10000);
        if (!this.mIsEnableCalcPos) {
            g_camera.mPos = v3.add(v3.muls(g_camera.calcDir(), -this.mDist), g_camera.mAt);
            g_mouse.resetDelta();
            this.mDownDist = this.mDist;
            this.calcInverse();
        }
    };
    inst.beginDolly = function()
    {
        this.mDownFov = this.mFov;
    },
    inst.calcDolly = function(delta)
    {
        delta = delta < 0 ? Math.min(delta, -1) : delta > 0 ? Math.max(delta, 1) : 0;
        var fov_rad = clamp(Math.round(this.mDownFov * cRad2Deg + delta), 1, 179);
        this.mFov = fov_rad * cDeg2Rad;
        FileMode.setFov(fov_rad);
    };
    inst.calcInverse = function()
    {
        this.mDist = g_camera.calcDist();
    };
    inst.getAt = function() { return this.mAt; };
    inst.setAt = function(at) { this.mAt = at; };
    inst.setAtt = function(dx, dz) { this.mAttX = dx; this.mAttZ = dz; };
    inst.calcDist = function() { return this.mDist * (this.mDistFactor || 1); };
    inst.setDistFactor = function(df) { this.mDistFactor = df; };
    inst.resetDistFactor = function(df) {
        this.mDist *= this.mDistFactor;
    };
    inst.setFov = function(fov) { this.mFov = fov; };
    inst.setEnableCalcPos = function(f) { this.mIsEnableCalcPos = f; };
    inst.calcPos = function()
    {
        if (this.mAttX && !this.mPrevAttX) {
            var focus_yaw = Math.atan2(this.mAttX[2], this.mAttX[0]);
            this.setYaw(this.mYaw - focus_yaw);
        } else if (!this.mAttX && this.mPrevAttX) {
            var focus_yaw = Math.atan2(this.mPrevAttX[2], this.mPrevAttX[0]);
            this.setYaw(this.mYaw + focus_yaw);
        }
        if (this.mDistFactor && !this.mPrevDistFactor) {
            this.mDist /= this.mDistFactor;
        } else if(!this.mDistFactor && this.mPrevDistFactor) {
            this.mDist *= this.mPrevDistFactor;
        }
        var pos = v3.Make(
            Math.cos(this.mPitch) * Math.cos(this.mYaw),
            Math.sin(this.mPitch),
            Math.cos(this.mPitch) * Math.sin(this.mYaw));
        if (this.mAttX) {
            pos = v3.setY(v3.add(v3.Muls(this.mAttX, pos[0]),
                                 v3.Muls(this.mAttZ, pos[2])), pos[1]);
        }
        this.mPrevAttX = this.mAttX;
        this.mPrevDistFactor = this.mDistFactor;
        return v3.add(v3.muls(pos, this.mDist * (this.mDistFactor || 1)
                              / Math.tan(this.mFov * 0.5)), this.mAt);
    };
    inst.apply = function(camera)
    {
        camera.setAt(this.getAt());
        if (this.mIsEnableCalcPos) {
            camera.setPos(this.calcPos());
        }
        camera.setOffCenter(this.mOffCenter);
        camera.setFov(this.mFov);
    };
    inst.save = function()
    {
        return {
            at : v3.ToArray(this.mAt),
            pitch : this.mPitch,
            yaw : this.mYaw,
            dist : this.mDist,
            off_center : v2.ToArray(this.mOffCenter),
        };
    };
    inst.load = function(data)
    {
        this.mAt = v3.Dup(data.at);
        this.mPitch = data.pitch;
        this.mYaw = data.yaw;
        this.mDist = data.dist;
        this.mOffCenter = data.off_center;
    };
    return inst;
};
var WatchMode = CreateInstance();
WatchMode.mIsPauseMgr = UI_Check.createMgr({ fixed : true, })
WatchMode.mSimSpeedMgr = UI_Select.createMgr({
    fixed : true,
    options : [
        { value : 'x1/60', }, { value : 'x1/20', }, { value : 'x1/10', },
        { value : 'x1/5' , }, { value : 'x1/2' , }, { value : 'x1.0' , },
        { value : 'x2.0' , }, { value : 'x5.0' , }, { value : 'x10'  , },
        { value : 'x20'  , }, { value : 'x60'  , },
    ], });
WatchMode.mIsFixCameraMgr = UI_Check.createMgr({ fixed : true, })
WatchMode.mIsFocusRotMgr = UI_Check.createMgr({ fixed : true, })
WatchMode.mIsFocusZoomMgr = UI_Check.createMgr({ fixed : true, })
WatchMode.mIsMultiFocusMgr = UI_Check.createMgr({ fixed : true, })
WatchMode.mIsInspectMgr = UI_Check.createMgr({ fixed : true, })
WatchMode.initialize = function()
{
    WatchMode.mWatchPane = CreateEditPane('watch', cLang.head_watch, function(div_on) {
        this.mLayoutNameP = CreateElement('p');
        div_on.append(this.mLayoutNameP);
        this.mIsPause = this.mIsPauseMgr.createActiveInstance({
            parent : div_on, value : false, title : cLang.watch_pause, });
        div_on.append(CreateHBR());
        this.mSimSpeed = this.mSimSpeedMgr.createActiveInstance({
            parent : div_on, value : 'x1.0', title : cLang.watch_sim_speed, });
        div_on.append(CreateHBR());
        this.mIsFixCamera = this.mIsFixCameraMgr.createActiveInstance({
            parent : div_on, value : false, title : cLang.watch_fix_camera, });
        div_on.append(CreateHBR());
        this.mIsFocusRot = this.mIsFocusRotMgr.createActiveInstance({
            parent : div_on, value : true, title : cLang.watch_rot_focus, });
        div_on.append(CreateHBR());
        this.mIsFocusZoom = this.mIsFocusZoomMgr.createActiveInstance({
            parent : div_on, value : true, title : cLang.watch_zoom_focus, });
        div_on.append(CreateHBR());
        if (g_is_touch_device) {
            this.mIsMultiFocus = this.mIsMultiFocusMgr.createActiveInstance({
                parent : div_on, value : false, title : cLang.watch_multi_focus, });
        } else {
            div_on.append(CreateEditDiv(
                LangSpan(LangAppend(cLang.watch_multi_focus, ': shift'))));
        }
        div_on.append(CreateHBR());
        this.mIsInspect = this.mIsInspectMgr.createActiveInstance({
            parent : div_on, value : false, title : cLang.watch_inspect_mode, });
        div_on.append(CreateHBR());
        div_on.append(CreateScriptLinkEdit(cLang.watch_photo_mode, function() {
            SetPhotoMode(true);
        }));
    }, this);
    var cam_guide = CreateElement('table', 'camera-guide');
    var guide_text = [
        'offcent', 'forward', 'fov'    ,
        'slide'  , 'rotate' , 'slide'  ,
        'pan'    , 'forward', 'offcent',
    ];
    for (var irow = 0, icell = 0; irow < 3; ++irow) {
        var row = CreateElement('tr');
        if (irow != 1 && g_is_touch_device) { row.className = 'edge'; }
        for (var icol = 0; icol < 3; ++icol, ++icell) {
            var cell = CreateElement('td');
            if (icol != 1 && g_is_touch_device) { cell.className = 'edge'; }
            var text = cLang['cam_guide_' + guide_text[icell]];
            if (g_is_touch_device) {
                cell.append(LangSpan(text));
            } else {
                cell.append(LangSpan(text), ':', CreateBR());
                cell.append(LangSpan(cLang['cam_key_' + guide_text[icell]]));
            }
            if (icell == 4) {
                var close_link = CreateScriptLink(cLang.cam_guide_close, function() {
                    cam_guide.style.display = 'none';
                })
                cell.append(CreateBR(), close_link);
                g_mouse.pushCoverElements(close_link);
            }
            row.append(cell);
        }
        cam_guide.append(row);
    }
    this.mCameraGuide = cam_guide;
};
WatchMode.isCameraGuideVisible = function() {
    return this.mCameraGuide.style.display != 'none';
};
WatchMode.setCameraGuideVisible = function(f) {
    this.mCameraGuide.style.display = f ? null/*'table'*/ : 'none';
};
WatchMode.setTitle = function(title, author)
{
    if (!this.mLayoutNameP) { return; }
    ClearChildren(this.mLayoutNameP);
    this.mLayoutNameP.append(LangSpan(title, null, true), CreateHBR());
    FileMode.appendAuthorLink(this.mLayoutNameP, author);
};
WatchMode.getSimSpeed = function()
{
    var ret = this.mSimSpeed.mValue;
    return ret.startsWith('x1/') ? 1 / parseInt(ret.substr(3)) : parseInt(ret.substr(1));
};
WatchMode.isFixCamera = function() { return this.mIsFixCamera.mValue; };
WatchMode.isFocusRot = function() { return this.mIsFocusRot.mValue; };
WatchMode.isFocusZoom = function() { return this.mIsFocusZoom.mValue; };
WatchMode.isMultiFocus = function() { return this.mIsMultiFocus.mValue; };
function IsPause() { return WatchMode.mIsPause.mValue || g_calc_num < 1; }
function SetPause(p) { WatchMode.mIsPauseMgr.updateValue(WatchMode.mIsPause, p); }
function IsInspectMode()
{
    return !IsMenuWatch() || IsEnableDebugDraw() || WatchMode.mIsInspect.mValue;
}
var g_is_photo_mode = false;
function IsPhotoMode() { return g_is_photo_mode; }
function SetPhotoMode(f)
{
    g_is_photo_mode = f;
    SetBodyClassName(BodyClassNameSlot.PhotoMode, 'photo-' + (f ? 'on' : 'off'));
}
