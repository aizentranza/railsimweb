'use strict';
function CreateCallbackSet()
{
    return {
        mCallbacks : [],
        push : function(func)
        {
            this.mCallbacks.push(func);
        },
        invoke : function()
        {
            for (var i = 0; i < this.mCallbacks.length; ++i)
            {
                this.mCallbacks[i]();
            }
        },
    };
}
function CreateSingleton()
{
    return {};
}
function CreateInstance(inst)
{
    return inst || {};
}
function CreateIDMgr(mgr, is_uuid)
{
    mgr = CreateInstance(mgr);
    if (is_uuid) {
        mgr.mIsUUID = true;
        mgr.issueID = function(obj) {
            obj = CreateInstance(obj);
            if (!obj.uuid) {
                obj.uuid = getRandomUUID();
                //Log('issueID: ' + obj.uuid);
            }
            return obj;
        };
    } else {
        mgr.sID = 0;
        mgr.sLoadingID = -1;
        mgr.addID = function() {
            if (this.sLoadingID >= 0) {
                var ret = this.sLoadingID;
                this.sLoadingID = -1;
                return ret;
            }
            return this.sID++;
        };
    }
    mgr.saveInsts = function(f)
    {
        var entry = {
            insts : [],
        };
        if (!this.mIsUUID) {
            entry.cur_id = this.sID;
        }
        this.forEach(function(obj) {
            var inst = f.apply(this, [obj]);
            if (inst) { entry.insts.push(inst); }
        }, this);
        return entry;
    };
    mgr.loadInsts = function(entry, f) {
        if (!entry) { return; }
        if (!this.mIsUUID && entry.cur_id !== undefined) {
            this.sID = entry.cur_id;
        }
        entry.insts.forEach(f, this);
    };
    mgr.setLoadingID = function(id) { this.sLoadingID = id; };
    return mgr;
}
function CreateObjMgr(mgr)
{
    mgr = CreateIDMgr(mgr);
    mgr.sObjs = [];
    mgr.objNum = function() { return mgr.sObjs.length; };
    mgr.clear = function()
    {
        this.sID = 0;
        this.sObjs = [];
        if (this.onClear) { this.onClear(); }
    };
    mgr.createObj = function()
    {
        var obj = CreateInstance();
        obj.mID = mgr.addID();
        mgr.sObjs.push(obj);
        return obj;
    };
    mgr.pushObj = function(obj)
    {
        mgr.sObjs.push(obj);
    };
    mgr.eraseObj = function(obj)
    {
        for (var i = 0; i < this.sObjs.length; ++i)
        {
            if (this.sObjs[i] == obj) {
                this.sObjs.splice(i, 1);
                return true;
            }
        }
        return false;
    };
    mgr.searchObj = function(id)
    {
        for (var i = 0; i < this.sObjs.length; ++i)
        {
            if (this.sObjs[i].mID == id) { return this.sObjs[i]; }
        }
        return null;
    };
    mgr.forEach = function(f, a_this)
    {
        mgr.sObjs.forEach(f, a_this);
    };
    return mgr;
}
function HasValidValue(arr)
{
    if (!arr) { return false; }
    for (var i = 0; i < arr.length; ++i) { if (arr[i]) { return true; } }
    return false;
}
function ForEachReversed(arr, is_reverse, f, a_this)
{
    if (is_reverse) {
        for (var i = arr.length - 1; i >= 0; --i) { f.apply(a_this, [arr[i]]); }
    } else {
        for (var i = 0; i < arr.length; ++i) { f.apply(a_this, [arr[i]]); }
    }
}
var g_on_next_calc = [];
function OnNextCalc(f, a_this) { g_on_next_calc.push({ func : f, from : a_this, }); }
function ProcOnNextCalc() {
    var carry = [];
    g_on_next_calc.forEach(function(t) {
        if (t.func.apply(t.from)) { carry.push(t); }
    });
    g_on_next_calc = carry;
}
function parseIntWithDefault(v, def)
{
    var ret = parseInt(v);
    return isNaN(ret) ? def : ret;
}
function getRandomUUID() {
    var seed = new Date().getTime(), seed2 = 0, uuid = '';
    if (performance && performance.now) { seed2 = performance.now() * 1000; }
    for (var d = 0; d < 32; ++d) {
        if (8 <= d && d <= 20 && d % 4 == 0) { uuid += '-'; }
        if (d == 12) { uuid += '4'; continue; }
        var hex = Math.random() * 16;
        hex = Math.floor((seed + hex) % 16);
        seed = Math.floor(seed / 16);
        if (seed == 0) { seed = seed2; seed2 = 0; }
        if (d == 16) { hex = hex % 4 + 8; }
        uuid += hex.toString(16);
    }
    return uuid;
}
function FormatDateTimeImpl(date, d_sep, m_sep, t_sep)
{
    if (!d_sep) { d_sep = '/'; }
    if (!m_sep) { m_sep = ' '; }
    if (!t_sep) { t_sep = ':'; }
    function fmt(t) { return (t < 10 ? '0' : '') + t; }
    return date.getFullYear()
        + d_sep + fmt(date.getMonth() + 1)
        + d_sep + fmt(date.getDate())
        + m_sep + fmt(date.getHours())
        + t_sep + fmt(date.getMinutes())
        + t_sep + fmt(date.getSeconds());
}
function FormatDateTimeForLog (date) { return FormatDateTimeImpl(date, '/', ' ', ':'); }
function FormatDateTimeForFile(date) { return FormatDateTimeImpl(date, '-', '_', '-'); }
