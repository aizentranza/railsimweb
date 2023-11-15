'use strict';
var g_is_touch_device = window.ontouchstart === null;
var g_touch_hit_scale = g_is_touch_device ? 3 : 1;
var g_mouse = {
    mPos : v2.Makes(0),
    mDomPos : v2.Makes(0),
    mIsDown : false,
    mIsPrevDown : false,
    mIsTrig : false,
    mIsRelease : false,
    mIsFree : false,
    mIsTouchMoved : false,
    mWasShortTouch : false,
    mIsCancel : false,
    mDownPos : v2.Makes(0),
    mDelta : v2.Makes(0),
    mMaxDeltaLen : 0,
    mTouchKeepDist : 0.01,
    mCoverElements : [],
    initialize : function() {
        if (g_is_touch_device)
        {
            g_mouse.mTouchKeepDist = 0.05;
            document.body.addEventListener('touchmove', function(ev) {
                if (ev.touches.length > 0) {
                    g_mouse.onMouseMove(ev.touches[0]);
                }
            });
            document.body.addEventListener('touchstart', function(ev) {
                if (ev.touches.length > 0) {
                    g_mouse.onMouseMove(ev.touches[0]);
                    g_mouse.onMouseDown(ev.touches[0]);
                }
            });
            document.body.addEventListener('touchend', function(ev) {
                if (ev.touches.length == 0) {
                    g_mouse.onMouseUp(ev);
                }
            });
        }
        else
        {
            document.body.addEventListener('mousemove', function(ev) {
                g_mouse.onMouseMove(ev);
            });
            document.body.addEventListener('mousedown', function(ev) {
                g_mouse.onMouseDown(ev);
            });
            document.body.addEventListener('mouseup', function(ev) {
                g_mouse.onMouseUp(ev);
            });
            document.body.addEventListener('mouseleave', function(ev) {
                g_mouse.onMouseUp(ev);
                g_mouse.setCancel();
            });
            document.body.addEventListener('wheel', function(ev) {
                g_mouse.onWheel(ev);
            });
        }
    },
    pushCoverElements : function(el) {
        this.mCoverElements.push(el);
    },
    isTrig : function() { return this.mIsTrig; },
    isHold : function() { return !this.mIsRelease && !this.mIsFree; },
    isRelease : function() { return this.mIsRelease; },
    isFree : function() { return this.mIsFree; },
    isCancel : function() { return this.mIsCancel; },
    isTouchMoved : function() { return this.mIsTouchMoved; },
    wasShortTouch : function() { return this.mWasShortTouch; },
    getPos : function() { return this.mPos; },
    getDownPos : function() {  return this.mDownPos; },
    getDelta : function() { return this.mDelta; },
    getDeltaWithAspect : function() {
        return g_canvas.mIsVerticalMode
            ? v2.mul(v2.Make(1, 1 / g_canvas.getAspect()), this.mDelta)
            : v2.mul(v2.Make(g_canvas.getAspect(), 1), this.mDelta);
    },
    calcDeltaDist : function() { return v2.Length(this.mDelta); },
    setCancel : function() { this.mIsCancel = this.mIsTouchMoved = true; },
    resetDelta : function() {
        v2.copy(this.mDownPos, this.mPos);
        v2.sets(this.mDelta, 0);
    },
    update : function()
    {
        this.mIsTrig = this.mIsDown && !this.mIsPrevDown;
        this.mIsRelease = !this.mIsDown && this.mIsPrevDown;
        this.mIsFree = !this.mIsDown && !this.mIsPrevDown;
        this.mWasShortTouch = this.mIsRelease && !this.mIsTouchMoved;
        this.mIsPrevDown = this.mIsDown;
    },
    onMouseMove : function(ev) {
        if (!g_canvas || !g_canvas.mElement) { return; }
        //var rect = g_canvas.mElement.getBoundingClientRect();
        //v2.set(this.mPos, (ev.pageX - rect.left) / rect.width,
        //       (ev.pageY - rect.top ) / rect.height);
        v2.set(this.mPos, ev.pageX / g_canvas.mDisplayWidth,
               ev.pageY / g_canvas.mDisplayHeight);
        v2.set(this.mDomPos, ev.pageX, ev.pageY);
        if (this.mIsDown) {
            v2.sub(v2.copy(this.mDelta, this.mPos), this.mDownPos);
            this.mMaxDeltaLen = Math.max(this.mMaxDeltaLen, v2.Length(this.mDelta));
            if (this.mMaxDeltaLen > this.mTouchKeepDist) { this.mIsTouchMoved = true; }
            ClearSelection();
        }
    },
    onMouseDown : function(ev) {
        if (!g_is_touch_device && ev.button != 0) { return; }
        if (this.mIsDown) { return; }
        if (this.checkCoverElements()) { return; }
        v2.copy(this.mDownPos, this.mPos);
        v2.sets(this.mDelta, 0);
        this.mIsDown = true;
        this.mIsCancel = false;
        this.mWasShortTouch = false;
        this.mMaxDeltaLen = 0;
        this.mIsTouchMoved = false;
    },
    onMouseUp : function(ev) {
        if (!this.mIsDown) { return; }
        this.mIsDown = false;
        ClearSelection();
    },
    onWheel : function(ev) {
        if (this.mIsDown) { return; }
        if (this.checkCoverElements(true)) { return; }
        if (g_keyboard.isCtrlDown()) {
            g_cam_ctrl.beginDolly();
            g_cam_ctrl.calcDolly(-ev.deltaY * 0.01);
        } else {
            g_cam_ctrl.beginZoom();
            g_cam_ctrl.calcZoom(v2.Make(0, -ev.deltaY * 0.001));
        }
    },
    checkCoverElements : function(detect_log) {
        for (var i = 0; i < this.mCoverElements.length; ++i) {
            var el = this.mCoverElements[i];
            if (el.className == 'log' && !detect_log) { continue; }
            if (el.style.display == 'none') { continue; }
            var rect = el.getBoundingClientRect();
            if (rect.left <= this.mDomPos[0] && this.mDomPos[0] <= rect.right &&
                rect.top <= this.mDomPos[1] && this.mDomPos[1] <= rect.bottom ) {
                return true;
            }
        }
        return false;
    },
};
var g_keyboard = {
    mKeyInfo : {
        Shift  : { code : 16, },
        Ctrl   : { code : 17, },
        Alt    : { code : 18, },
        Cmd    : { code : 91, },
        Delete : { code :  8, },
        BackSp : { code : 46, },
        Escape : { code : 27, },
    },
    mKeyData :  {},
    initialize : function()
    {
        for (var key_name in this.mKeyInfo) {
            var info = this.mKeyInfo[key_name];
            info.is_down = false;
            this.mKeyData[info.code] = info;
        }
        document.body.addEventListener('keydown', function(ev) {
            g_keyboard.onKeyDown(ev.keyCode);
        });
        document.body.addEventListener('keyup', function(ev) {
            g_keyboard.onKeyUp(ev.keyCode);
        });
    },
    isSupportKeyDown : function(info) {
        return info.is_down;
    },
    getSupportKeyTrig : function(info) {
        if (info.is_down) {
            info.is_down = false;
            return true;
        }
        return false;
    },
    onKeyDown : function(code) {
        var info = this.mKeyData[code];
        if (info) { info.is_down = true; }
    },
    onKeyUp : function(code) {
        var info = this.mKeyData[code];
        if (info) { info.is_down = false; }
    },
    isShiftDown : function() {
        return this.isSupportKeyDown(this.mKeyInfo.Shift);
    },
    isCtrlDown : function() {
        return this.isSupportKeyDown(this.mKeyInfo.Ctrl)
            || this.isSupportKeyDown(this.mKeyInfo.Cmd);
    },
    isAltDown : function() {
        return this.isSupportKeyDown(this.mKeyInfo.Alt);
    },
    getCommonDeleteTrig : function() {
        var ret0 = this.getSupportKeyTrig(this.mKeyInfo.Delete);
        var ret1 = this.getSupportKeyTrig(this.mKeyInfo.BackSp);
        return ret0 || ret1;
    },
    getEscapeTrig : function() {
        return this.getSupportKeyTrig(this.mKeyInfo.Escape);
    },
};
function GetFocusElement()
{
    var ret = document.activeElement;
    return ret == document.body ? null : ret;
}
