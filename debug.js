'use strict';
var DebugLog = CreateInstance();
DebugLog.cLogMax = 1000;
DebugLog.mCount = 0;
DebugLog.mTime = new Date;
DebugLog.initialize = function()
{
    this.mLogElem = CreateElement('div');
    //g_mouse.pushCoverElements(this.mLogElem);
    this.mLogElem.className = 'log';
    g_mouse.pushCoverElements(this.mLogElem);
    var div_on = CreateElement('div');
    div_on.id = 'log-on';
    this.mLogBody = CreateElement('div');
    this.mLogBody.className = 'log-body';
    div_on.append(this.mLogBody);
    this.mLogElem.append(div_on);
    var head = CreateElement('h1');
    function ToggleLog() {
        SetBodyClassName(BodyClassNameSlot.LogDisplay,
                         ToggleContent('log', 'log') ? 'log-on' : 'log-off');
        DebugLog.mLogElem.scrollBy(0, DebugLog.mLogBody.scrollHeight);
    }
    head.append(CreateScriptLink(cLang.head_log, ToggleLog));
    this.mLogElem.append(head);
    document.body.append(this.mLogElem);
    if (!g_is_show_log_default) { ToggleLog(); }
    // info
    this.mInfoElem = CreateElement('div');
    //g_mouse.pushCoverElements(this.mInfoElem);
    this.mInfoElem.className = 'info';
    var div_on = CreateElement('div');
    div_on.id = 'info-on';
    div_on.style.width = '7em';
    var p_fps = CreateElement('p');
    this.mSpanFPS = CreateElement('span');
    this.mSpanFPS.innerText = '0';
    p_fps.append(this.mSpanFPS);
    div_on.append(p_fps);
    var p_detail = CreateElement('p', 'detail');
    function ToggleDebugDraw() {
        CancelMouse();
        g_debug_draw.toggle();
    }
    p_detail.append(CreateScriptLink(cLang.debug_draw, ToggleDebugDraw), ' ');
    function ToggleLanguage() {
        CancelMouse();
        var next_lang = cLanguages[0];
        for (var il = 0; il < cLanguages.length; ++il) {
            if (cLanguages[il] == g_language) {
                g_language = cLanguages[(il + 1) % cLanguages.length];
                break;
            }
        }
        SetBodyClassName(BodyClassNameSlot.Language, 'lang-' + g_language);
    }
    p_detail.append(CreateScriptLink(LangJoin([
        cLang.debug_set_lang, '\n(', cLanguages, ')']), ToggleLanguage), ' ');
    div_on.append(p_detail);
    this.mInfoElem.append(div_on);
    var head = CreateElement('h1');
    function ToggleInfo() {
        ToggleContent('info');
    }
    head.append(CreateScriptLink(cLang.head_info, ToggleInfo));
    this.mInfoElem.append(head);
    document.body.append(this.mInfoElem);
};
DebugLog.show = function()
{
    ToggleContent('log', 'log', 'show');
    SetBodyClassName(BodyClassNameSlot.LogDisplay, 'log-on');
};
DebugLog.push = function(text)
{
    if (this.mCount >= this.cLogMax) {
        var old_obj = GetElement('log' + (this.mCount - this.cLogMax));
        old_obj.parentNode.removeChild(old_obj);
    }
    var prev_h = this.mLogBody.scrollHeight;
    this.mTime.setTime(Date.now());
    var log = CreateElement('p');
    log.id = 'log' + this.mCount;
    log.append(LangSpan(text));
    var t_time = '[' + FormatDateTimeForLog(this.mTime) + ']';
    if (this.mLastLogTime != t_time) {
        this.mLastLogTime = t_time;
        log.prepend(t_time, CreateBR());
    }
    this.mLogBody.appendChild(log);
    var diff_h = this.mLogBody.scrollHeight - prev_h;
    this.mLogElem.scrollBy(0, diff_h);
    ++this.mCount;
};
function Log(text) { DebugLog.push(text); }
function CapacityLog(text) { if (0) { DebugLog.push(text); } }
var g_toggle_debug_draw_callback = CreateCallbackSet();
var g_debug_draw = {
    mIsEnabled : false,
    toggle : function()
    {
        this.mIsEnabled = !this.mIsEnabled;
        //Log(LangAppend(cLang.debug_draw, ': ' + (this.mIsEnabled ? 'on' : 'off')));
        g_toggle_debug_draw_callback.invoke();
    },
};
function IsEnableDebugDraw() { return g_debug_draw.mIsEnabled; }
