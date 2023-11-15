'use strict';
var UI_KeyCode = {
    Enter : 13,
    Esc   : 27,
};
var UI_Radios = CreateSingleton();
UI_Radios.createMgr = function(args)
{
    var mgr = CreateInstance();
    mgr.mName = args.name;
    mgr.mTitle = args.title;
    mgr.createInstance = function(args)
    {
        var inst = CreateInstance();
        var node = CreateElement('input');
        inst.mParentNode = args.parent;
        inst.mNode = node;
        node.type = 'radio';
        node.name = this.mName;
        node.value = args.id;
        node.title = mgr.mTitle;
        if (args.prepend) {
            args.parent.prepend(node, ' ');
        } else {
            args.parent.append(' ', node);
        }
        return inst;
    };
    mgr.updateCheck = function()
    {
        var first_inst = null, is_checked = false;
        this.forEach(function(inst) {
            if (!first_inst) { first_inst = inst; }
            if (UI_Radios.isChecked(inst)) { is_checked = true; }
        });
        if (!is_checked && first_inst) {
            UI_Radios.setCheck(first_inst);
        }
    };
    mgr.getChecked = function()
    {
        var ret = null;
        this.forEach(function(inst) {
            if (!inst) { debugger; }
            if (UI_Radios.isChecked(inst)) { ret = inst; }
        });
        return ret;
    };
    mgr.getValue = function()
    {
        var inst = this.getChecked();
        return inst && inst.mNode.value;
    };
    mgr.forEach = args.for_each;
    return mgr;
};
UI_Radios.isChecked = function(inst) { return inst.mNode.checked; };
UI_Radios.setCheck = function(inst) { inst.mNode.checked = true; };
var UI_Replace = CreateSingleton();
UI_Replace.createMgr = function(args)
{
    var mgr = CreateInstance();
    console.assert(args.fixed || args.disable_undo ? !args.name : args.name);
    mgr.mValueName = args.name;
    if (args.parent_mgr) { mgr.mParentMgr = args.parent_mgr; }
    if (args.fixed) { mgr.mIsFixed = args.fixed; mgr.mIsDisableUndo = true; }
    if (args.root) { mgr.mIsRoot = args.root; }
    else if (args.disable_undo) { mgr.mIsDisableUndo = args.disable_undo; }
    mgr.mControlSpan = CreateElement('span');
    mgr.mControlSpan.className = 'ui-ctrl';
    function ctrl_br() {
        if (!args.no_ctrl_br) { mgr.mControlSpan.append(CreateBR()); }
    }
    mgr.mEditArea = CreateElement('span');
    mgr.mEditObj = CreateElement('span');
    if (args.is_block) { mgr.mEditObj.className = 'ui-replace-block'; }
    if (args.is_break_title) { mgr.mBreakTitle = CreateBR(); }
    mgr.mEditArea.append(mgr.mEditObj);
    if (!mgr.mIsFixed) {
        ctrl_br();
        if (!args.no_apply_button) {
            mgr.mControlSpan.append(' ', CreateScriptLink('&check;', function() {
                mgr.activate(mgr.mActiveInst);
            }, cLang.cmn_apply));
        }
        mgr.mControlSpan.append(' ', CreateScriptLink('&times;', function() {
            mgr.activate(null);
        }, cLang.cmn_cancel));
    }
    mgr.mClipName = args.clip_name;
    if (mgr.mClipName) {
        ctrl_br();
        mgr.mCopyLink = CreateScriptLinkButton('C', function() {
            mgr.copyValue()
        }, cLang.ui_copy);
        mgr.mPasteLink = CreateScriptLinkButton('P', function() {
            mgr.pasteValue();
        }, cLang.ui_paste);
        mgr.mControlSpan.append(' ', mgr.mCopyLink, ' ', mgr.mPasteLink);
    }
    if (args.on_activate) { mgr.mOnActivate = args.on_activate; }
    mgr.mActiveInst = null;
    mgr.mOldValue = null;
    mgr.onCreateInstance = null;
    mgr.onUpdateValue = null;
    if (args.on_create_instance) { mgr.mOnCreateInstance = args.on_create_instance; }
    if (args.on_update) { mgr.mOnUpdate = args.on_update; }
    mgr.isActive = function(inst) { return this.mActiveInst == inst; };
    mgr.isVisible = function() { return this.mEditObj.offsetWidth > 0; };
    mgr.copyValue = function()
    {
        if (this.mClipName) {
            SetClipboard(this.mClipName, this.dupValue(this.getValue()));
        }
    };
    mgr.pasteValue = function()
    {
        if (this.mClipName) {
            var v = GetClipboard(this.mClipName);
            if (v) {
                var new_v = this.dupValue(v);
                if (this.mActiveInst.mValue.user_data !== undefined) {
                    new_v.user_data = this.mActiveInst.mValue.user_data;
                }
                this.updateValue(this.mActiveInst, new_v);
            } else {
                Log(cLang.desc_cannot_paste);
            }
        }
    };
    mgr.onKeyPress = function(ev)
    {
        if (!this.mActiveInst) { return; }
        if (ev.keyCode === UI_KeyCode.Enter) {
            var t_mgr = mgr;
            while (t_mgr.mParentMgr && t_mgr.mIsFixed) { t_mgr = t_mgr.mParentMgr; }
            if (!t_mgr.mIsFixed) { t_mgr.activate(t_mgr.mActiveInst); }
        }
    };
    mgr.createInstance = function(args)
    {
        var inst = CreateInstance();
        inst.mValue = args.value === null ? this.makeDefaultValue() : args.value;
        inst.mDiv = CreateElement(mgr.mIsDivLabel ? 'label' : 'div');
        inst.mDiv.className = 'ui-fix';
        inst.mTitleObj = CreateElement('span');
        inst.mTitleObj.className = 'title';
        inst.mDiv.append(inst.mTitleObj, ' ');
        if (args.title) { inst.mTitleObj.append(LangSpan(args.title)); }
        if (!this.mIsFixed) {
            inst.mLabelObj = CreateScriptLink('', function() { mgr.activate(inst); });
            inst.mDiv.append(' ', inst.mLabelObj);
        }
        args.parent.append(' ', inst.mDiv);
        this.updateLabel(inst);
        if (this.onCreateInstance) { this.onCreateInstance(inst); }
        if (this.mOnCreateInstance) { this.mOnCreateInstance(inst); }
        if (this.onUpdateValue) { this.onUpdateValue(inst); }
        if (this.mOnUpdate) { this.mOnUpdate(inst); }
        return inst;
    };
    mgr.createActiveInstance = function(args)
    {
        var inst = this.createInstance(args);
        this.activate(inst);
        return inst;
    };
    mgr.activate = function(inst)
    {
        var prev_inst = this.mActiveInst;
        if (prev_inst) {
            if (inst) {
                var new_value = this.getValue();
                if (new_value !== null && !this.isEqual(this.mOldValue, new_value)) {
                    var old_value = this.saveValueForUndo(this.mOldValue);
                    if (!this.mIsDisableUndo) {
                        PushUndo(function() {
                            mgr.updateValue(prev_inst, old_value);
                        }, function() {
                            mgr.updateValue(prev_inst, new_value);
                        }, 'edit value: ' + mgr.mValueName
                                 //+ ' = ' + this.getLabel(old_value)
                                 //+ ' => ' + this.getLabel(new_value)
                                );
                    }
                    this.updateValue(prev_inst, new_value, true);
                }
            } else {
                this.updateValue(prev_inst, this.mOldValue, true);
            }
        }
        this.mActiveInst = null;
        if (prev_inst) {
            prev_inst.mDiv.className = 'ui-fix';
            if (prev_inst.mLabelObj) { prev_inst.mLabelObj.style.display = 'inline'; }
        }
        if (prev_inst == inst || !inst) {
            prev_inst.mTitleObj.removeChild(this.mControlSpan);
            if (this.mBreakTitle) { prev_inst.mDiv.removeChild(this.mBreakTitle); }
            prev_inst.mDiv.removeChild(this.mEditArea);
            this.mActiveInst = null;
            return;
        }
        this.mActiveInst = inst;
        inst.mDiv.className = 'ui-edit';
        inst.mTitleObj.append(this.mControlSpan);
        if (this.mBreakTitle) { inst.mDiv.append(this.mBreakTitle); }
        if (this.mIsPrepend) {
            inst.mDiv.prepend(this.mEditArea);
        } else {
            inst.mDiv.append(this.mEditArea);
        }
        if (inst.mLabelObj) { inst.mLabelObj.style.display = 'none'; }
        if (this.mIsRoot) {
            inst.mDiv.className = 'root-list';
        } else {
            this.mOldValue = this.saveValueForUndo(inst.mValue);
            this.setValue(inst.mValue, true);
        }
        if (this.mOnActivate) { this.mOnActivate(this.mActiveInst); }
    };
    mgr.isEqual = function(a, b) { return a == b; };
    if (mgr.mIsRoot) {
        mgr.updateLabel = function() {};
        return mgr;
    }
    mgr.getValue = function() { return null; };
    mgr.setValue = function(value) {};
    mgr.dupValue = function(value) { return value; };
    mgr.saveValueForUndo = mgr.dupValue;
    mgr.saveData = function(value) { return value; };
    mgr.getLabel = function(value) { return value.toString(); };
    mgr.updateLabel = function(inst) {
        if (inst.mLabelObj) {
            ClearChildren(inst.mLabelObj);
            inst.mLabelObj.append(LangSpan(this.getLabel(inst.mValue), null, true));
            if (this.onUpdateLabel) { this.onUpdateLabel(inst); }
        }
    };
    mgr.updateValue = function(inst, value, skip_self, from_child, src_mgr)
    {
        if (!inst) { debugger; }
        if (this.mActiveInst == inst && !skip_self && !from_child) { this.setValue(value); }
        inst.mValue = value;
        this.updateLabel(inst);
        if (this.onUpdateValue) { this.onUpdateValue(inst, src_mgr); }
        if (this.mOnUpdate) { this.mOnUpdate(inst, src_mgr); }
        if (this.updateVisible && this.mActiveInst == inst) { this.updateVisible(inst); }
        if (this.mActiveInst == inst && this.mParentMgr && this.mParentMgr.mActiveInst
            && !this.mParentMgr.mIsRoot) {
            this.mParentMgr.updateValue(
                this.mParentMgr.mActiveInst, this.mParentMgr.getValue(),
                skip_self, true, src_mgr);
        }
    };
    mgr.updateActive = function() {
        this.updateValue(this.mActiveInst, this.getValue(), true, false, this);
    };
    return mgr;
};
var UI_Select = CreateSingleton();
UI_Select.createMgr = function(args)
{
    //args.is_block = true;
    //args.no_apply_button = true;
    var mgr = UI_Replace.createMgr(args);
    if (args.update_options) { mgr.mUpdateOptions = args.update_options; }
    mgr.mSelectObj = CreateElement('span', 'selector');
    mgr.mEditObj.append(mgr.mSelectObj);
    mgr.mIsCollapsed = args.no_collapse ? null : true;
    mgr.mCloseButton = CreateScriptLink('&times;', function() {
        mgr.mIsCollapsed = true;
        mgr.activateOption(mgr.getValue());
    }, cLang.cmn_cancel);
    mgr.mNullButton = CreateScriptLink(cAltEmptyText, function() {
        mgr.unCollapse();
        mgr.activateOption(mgr.getValue());
    });
    mgr.clear = function() {
        ClearChildren(this.mSelectObj);
        this.mUserData = {};
        this.mLabelMap = {};
        this.mOptions = [];
        this.mActiveOption = null;
        if (!this.mIsCollapsed) {
            mgr.mSelectObj.append(mgr.mCloseButton, ' ');
        }
    };
    mgr.clear();
    mgr.unCollapse = function()
    {
        mgr.mIsCollapsed = false;
        ClearChildren(mgr.mSelectObj);
        mgr.mSelectObj.append(mgr.mCloseButton, ' ');
        mgr.mOptions.forEach(function(topt) {
            topt.className = 'unselected';
            mgr.mSelectObj.append(topt, ' ');
        });
    };
    mgr.addOption = function(opt_args)
    {
        var opt = CreateScriptLink(opt_args.label || opt_args.value, function() {
            if (mgr.mIsCollapsed) {
                mgr.unCollapse();
                opt.className = 'selected';
            } else {
                if (mgr.mIsCollapsed !== null) { mgr.mIsCollapsed = true; }
                mgr.activateOption(opt_args.value);
                mgr.updateActive();
            }
        });
        this.mUserData[opt_args.value] = opt_args.user_data;
        this.mLabelMap[opt_args.value] = {
            label : opt_args.label, elem : opt, author : opt_args.author,
        };
        if (mgr.mIsCollapsed) {
            if (this.mSelectorValue == opt_args.value) {
                this.mActiveOption = opt;
                this.mSelectObj.append(opt);
                FileMode.appendAuthorLink(this.mSelectObj, opt_args.author);
            }
        } else {
            opt.className = this.mSelectorValue == opt_args.value ? 'selected' : 'unselected';
            this.mSelectObj.append(opt, ' ');
        }
        this.mOptions.push(opt);
    };
    mgr.activateOption = function(value)
    {
        if (mgr.mIsCollapsed) { ClearChildren(this.mSelectObj); }
        if (mgr.mActiveOption) { mgr.mActiveOption.className = (
            mgr.mIsCollapsed ? null : 'unselected'); }
        var info = this.mLabelMap[value], opt = info && info.elem;
        mgr.mSelectorValue = value;
        mgr.mActiveOption = opt;
        if (mgr.mActiveOption) {
            if (mgr.mIsCollapsed) {
                this.mSelectObj.append(mgr.mActiveOption);
                mgr.mActiveOption.className = null;
                FileMode.appendAuthorLink(this.mSelectObj, info.author);
            } else { mgr.mActiveOption.className = 'selected'; }
        } else if (mgr.mIsCollapsed) {
            this.mSelectObj.append(mgr.mNullButton);
        }
    };
    mgr.getValue = function() { return this.mSelectorValue; };
    mgr.setValue = function(value) {
        if (this.mUpdateOptions) { this.mUpdateOptions(this, value); }
        var info = this.mLabelMap[value];
        mgr.activateOption(value);
    };
    mgr.getLabel = function(value)
    {
        var ret = cAltEmptyText;
        if (this.mUpdateOptions) { this.mUpdateOptions(this, value); }
        var info = this.mLabelMap[value];
        if (info) { ret = info.label; }
        return ret;
    };
    mgr.onUpdateValue = function(inst) { inst.mUserData = this.mUserData[inst.mValue] };
    if (args.options) {
        args.options.forEach(function(option) { mgr.addOption(option); });
    }
    return mgr;
};
var UI_Text = CreateSingleton();
UI_Text.createMgr = function(args)
{
    if (!args.no_clip) { args.clip_name = 'text'; }
    var mgr = UI_Replace.createMgr(args);
    //if (args.allow_empty) { mgr.mIsAllowEmpty = args.allow_empty; }
    var inp = mgr.mInputObj = CreateElement('input');
    inp.value = 0;
    inp.size = args.size || 16;
    inp.addEventListener('focus', function() { this.select(); });
    inp.addEventListener('keypress', function(ev) { mgr.onKeyPress(ev); });
    if (args.on_input) { mgr.mOnInput = args.on_input; }
    inp.addEventListener('input', function(ev) {
        if (mgr.mOnInput) { mgr.mOnInput(); }
        else { mgr.updateActive(); }
    });
    mgr.mValueType = args.type;
    mgr.mEditObj.append(inp);
    mgr.getValue = function() {
        var ret = this.mInputObj.value;
        //if (ret == '' && !this.mIsAllowEmpty) { return null; }
        if (mgr.mValueType == 'id') {
            ret = ret.replace(/^ *(.*?) *$/, '$1')
            var match = ret.match(/[a-z0-9_\-]*/i)
            var new_ret = match ? match[0] : '';
            if (ret != new_ret) {
                LangAlert(LangJoin([
                    cLang.desc_replaced_invalid_id, ': [' + ret + '] => [' + new_ret + '].\n',
                    cLang.desc_valid_letters, ': A~Z a~z 0~9 _ -']));
                ret = new_ret;
                this.mInputObj.value = ret;
            }
        } else if (mgr.mValueType == 'ids') {
            ret = ret.replace(/^ *(.*?) *$/, '$1')
            var match = ret.match(/[a-z0-9_\-,]*/i)
            var new_ret = match ? match[0] : '';
            if (ret != new_ret) {
                LangAlert(LangJoin([
                    cLang.desc_replaced_invalid_id, ': [' + ret + '] => [' + new_ret + '].\n',
                    cLang.desc_valid_letters, ': A~Z a~z 0~9 _ - ,\n',
                    cLang.desc_comma_separated]));
                ret = new_ret;
                this.mInputObj.value = ret;
            }
            ret = ret.split(',');
        }
        return ret;
    };
    mgr.setValue = function(value) {
        if (mgr.mValueType == 'ids') {
            this.mInputObj.value = value.join(',');
        } else {
            this.mInputObj.value = value;
        }
    };
    mgr.getLabel = function(value) {
        if (mgr.mValueType == 'ids') {
            return '[' + value.join(',') + ']';
        } else {
            return value == '' ? '""' : value;
        }
    };
    return mgr;
};
var UI_LangText = CreateSingleton();
UI_LangText.createMgr = function(args)
{
    args.clip_name = 'lang-text';
    var mgr = UI_Replace.createMgr(args);
    mgr.mInputObjs = [];
    for (var il = 0; il < cLanguages.length; ++il) {
        var span = CreateElement('span', 'il-' + cLanguages[il]);
        var inp = CreateElement('input');
        inp.value = 0;
        inp.size = args.size || 16;
        inp.addEventListener('focus', function() { this.select(); });
        inp.addEventListener('keypress', function(ev) { mgr.onKeyPress(ev); });
        if (args.on_input) { mgr.mOnInput = args.on_input; }
        inp.addEventListener('input', function(ev) {
            if (mgr.mOnInput) { mgr.mOnInput(); }
            else { mgr.updateActive(); }
        });
        mgr.mInputObjs.push(inp);
        span.append('[' + cLanguages[il] + '] ', inp);
        mgr.mEditObj.append(span);
    }
    mgr.isEqual = function(a, b) {
        for (var il = 0; il < cLanguages.length; ++il) {
            var ta = Array.isArray(a) ? a[il] : g_language == cLanguages[il] ? a : '';
            var tb = Array.isArray(b) ? b[il] : g_language == cLanguages[il] ? b : '';
            if (ta != tb) { return false; }
        }
        return true;
    };
    mgr.getValue = function() {
        return this.mInputObjs.map(inp => inp.value);
    };
    mgr.setValue = function(value)
    {
        for (var il = 0; il < cLanguages.length; ++il) {
            this.mInputObjs[il].value = Array.isArray(value) ? value[il]
                : g_language == cLanguages[il] ? value : '';
        }
    };
    mgr.getLabel = function(value) {
        if (!Array.isArray(value)) { return value == '' ? '""' : value; }
        var ret = [], def_label = '';
        for (var il = 0; il < cLanguages.length; ++il) {
            var label = value[il];
            if (def_label == '' && label != '') { def_label = label; }
            ret.push(label);
        }
        if (def_label == '') { def_label = '""'; }
        return ret.map(label => label == '' ? def_label : label);
    };
    return mgr;
};
var UI_Check = CreateSingleton();
UI_Check.createMgr = function(args)
{
    var mgr = UI_Replace.createMgr(args);
    var inp = mgr.mInputObj = CreateElement('input');
    inp.type = 'checkbox';
    inp.addEventListener('change', function(ev) { mgr.updateActive(); });
    mgr.mEditObj.append(inp, ' ');
    mgr.mIsDivLabel = true;
    mgr.mIsPrepend = true;
    mgr.getValue = function() {
        return this.mInputObj.checked;
    };
    mgr.setValue = function(value) { this.mInputObj.checked = value; };
    mgr.getLabel = function(value) { return value ? cLang.cmn_true : cLang.cmn_false; };
    return mgr;
};
var UI_Radio = CreateSingleton();
UI_Radio.createMgr = function(args)
{
    var mgr = UI_Replace.createMgr(args);
    mgr.mValueMap = {};
    mgr.mOptions = args.options;
    mgr.mOptions.forEach(function(option) {
        mgr.mValueMap[option.value] = option;
        var label = CreateElement('label');
        var inp = CreateElement('input');
        inp.name = args.dom_name;
        inp.type = 'radio';
        inp.value = option.value;
        inp.addEventListener('change', function(ev) { mgr.updateActive(); });
        option.input_obj = inp;
        label.append(inp, ' ');
        label.append(LangSpan(option.label || option.value));
        mgr.mEditObj.append(label, ' ');
    });
    mgr.getValue = function() {
        for (var i = 0; i < mgr.mOptions.length; ++i) {
            var option = mgr.mOptions[i];
            if (option.input_obj.checked) { return option.value; }
        }
        return '';
    };
    mgr.setValue = function(value) {
        for (var i = 0; i < mgr.mOptions.length; ++i) {
            var option = mgr.mOptions[i];
            if (option.value == value) { option.input_obj.checked = true; }
            else if (option.input_obj.checked) { option.input_obj.checked = false; }
        }
    };
    mgr.getLabel = function(value) {
        var option = mgr.mValueMap[value];
        return option ? option.label : cAltEmptyText;
    };
    return mgr;
};
var UI_Slider = CreateSingleton();
UI_Slider.createMgr = function(args)
{
    if (args.clip_name !== null) { args.clip_name = args.is_int ? 'int' : 'float'; }
    var mgr = UI_Replace.createMgr(args);
    mgr.mIsInt = args.is_int;
    mgr.mMinValue = args.min;
    mgr.mMaxValue = args.max;
    mgr.mRoundUnit = args.slide_round;
    mgr.mFixedDigits = args.fixed_digits;
    mgr.mOnSlide = args.on_slide;
    mgr.mValueRange = mgr.mMaxValue - mgr.mMinValue;
    mgr.round = function(v) {
        var ret = mgr.mIsInt ? Math.round(v): v;
        return this.mRoundUnit ? Math.round(ret / mgr.mRoundUnit) * mgr.mRoundUnit : ret;
    };
    mgr.clamp = function(v) { return clamp(v, mgr.mMinValue, mgr.mMaxValue); };
    var inp = mgr.mInputObj = CreateElement('input');
    inp.className = 'slider';
    inp.value = 0;
    inp.size = args.size || 8;
    inp.addEventListener('focus', function() { this.select(); });
    inp.addEventListener('keypress', function(ev) { mgr.onKeyPress(ev); });
    inp.addEventListener('input', function(ev) {
        if (mgr.mInputObj.value != '') {
            mgr.updateSlider(mgr.getValue());
            mgr.updateActive();
            if (mgr.mOnSlide) { mgr.mOnSlide(); }
        }
    });
    var slider_box = CreateElement('div');
    slider_box.className = 'ui-slider-box';
    var slider = mgr.mSliderObj = CreateElement('div');
    slider.className = 'ui-slider';
    if (args.width) { slider.style.width = args.width; }
    mgr.onSlide = function(ev) {
        var ofs_x = ev.clientX - slider.getBoundingClientRect().left;
        var cMargin = 5;
        mgr.setValue(mgr.clamp(mgr.round(
            ((ofs_x - cMargin) / (slider.clientWidth - cMargin * 2))
                * mgr.mValueRange + mgr.mMinValue)));
        mgr.updateActive();
        if (mgr.mOnSlide) { mgr.mOnSlide(); }
    };
    mgr.endSlide = function() {
        if (mgr.mSliding) { mgr.mSliding = false; }
    };
    mgr.mSliding = false;
    if (g_is_touch_device) {
        slider.addEventListener('touchstart', function(ev) {
            if (ev.touches.length > 0) {
                mgr.mSliding = true;
                //mgr.onMouseMove(ev.touches[0]);
                mgr.onSlide(ev.touches[0]);
            }
        });
        slider.addEventListener('touchmove', function(ev) {
            if (ev.touches.length > 0) {
                if (mgr.mSliding) { mgr.onSlide(ev.touches[0]); }
            }
        });
        slider.addEventListener('touchend', function(ev) {
            if (ev.touches.length == 0) { mgr.endSlide(); }
        });
    }
    slider.addEventListener('mousedown', function(ev) {
        mgr.mSliding = true;
        mgr.onSlide(ev);
    });
    slider.addEventListener('mousemove', function(ev) {
        if (mgr.mSliding) { mgr.onSlide(ev); }
    });
    slider.addEventListener('mouseleave', mgr.endSlide);
    slider.addEventListener('mouseup', mgr.endSlide);
    var handle = mgr.mHandleObj = CreateElement('div');
    if (args.handle_color) { handle.style.backgroundColor = args.handle_color; }
    slider.append(handle)
    slider_box.append(slider);
    mgr.mEditObj.append(inp, ' ');
    mgr.mEditObj.append(slider_box);
    mgr.getValue = function()
    {
        return this.clamp(this.mIsInt ? parseInt(this.mInputObj.value)
                         : parseFloat(this.mInputObj.value));
    };
    mgr.setValue = function(value)
    {
        this.mInputObj.value = value.toFixed(
            this.mFixedDigits ? this.mFixedDigits : 4).replace(/\.?0*$/, '');
        this.updateSlider(value);
        if (this.mRangeCtrl) {
            var abs_value = Math.abs(parseFloat(this.mInputObj.value));
            if (this.mRangeLinks) {
                this.mRangeLinks.forEach(linked_mgr => abs_value = Math.max(
                    abs_value, Math.abs(parseFloat(linked_mgr.mInputObj.value))));
            }
            while (this.mMaxValue < abs_value) { this.extendRange(); }
        }
    };
    mgr.getLabel = function(value)
    {
        return this.mIsInt || Number.isInteger(value) ? value.toString() : value.toFixed(3);
    };
    mgr.updateSlider = function(value)
    {
        if (this.mIsInt) {
            this.mHandleObj.style.width = '' + Math.max(
                2, Math.round(this.mSliderObj.clientWidth / (this.mValueRange + 1))) + 'px';
        }
        this.mHandleObj.style.left = '' + (
            (this.mSliderObj.clientWidth - this.mHandleObj.clientWidth)
                * (value - this.mMinValue) / this.mValueRange) + 'px';
    };
    mgr.updateRange = function(ext)
    {
        if (ext) {
            if (this.mIsInt && ext < 1 && max_abs(
                this.mMinValue, this.mMaxValue) <= 1) { return; }
            if (this.mMinValue * this.mMaxValue < 0) {
                this.mMinValue *= ext;
                this.mMaxValue *= ext;
            } else if (this.mMaxValue > 0) {
                this.mMaxValue *= ext;
            } else {
                this.mMinValue *= ext;
            }
            this.mValueRange = this.mMaxValue - this.mMinValue;
            this.mRangeExtendTurn = (this.mRangeExtendTurn + (ext > 1 ? 1 : 2)) % 3;
            this.updateSlider(this.getValue());
            if (this.mRangeLinks) {
                this.mRangeLinks.forEach(function(linked_mgr) {
                    linked_mgr.mMaxValue = this.mMaxValue;
                    linked_mgr.mMinValue = this.mMinValue;
                    linked_mgr.mValueRange = this.mValueRange;
                    linked_mgr.updateSlider(linked_mgr.getValue());
                }, this);
            }
        }
        this.mMinLabel.innerText = this.getLabel(this.mMinValue);
        this.mMaxLabel.innerText = this.getLabel(this.mMaxValue);
    };
    mgr.addRangeLink = function(linked_mgr)
    {
        if (!this.mRangeLinks) { this.mRangeLinks = []; }
        this.mRangeLinks.push(linked_mgr);
    };
    if (!args.no_label) {
        mgr.mMinLabel = CreateElement('p');
        mgr.mMinLabel.className = 'min';
        mgr.mMaxLabel = CreateElement('p');
        mgr.mMaxLabel.className = 'max';
        mgr.updateRange();
        var tmp_max = max_abs(mgr.mMinValue, mgr.mMaxValue);
        tmp_max /= Math.round(Math.pow(10, Math.floor(Math.log10(tmp_max) + 0.1)));
        mgr.mRangeExtendTurn = tmp_max == 2 ? 1 : tmp_max == 5 ? 2 : 0;
        slider_box.append(CreateBR(), mgr.mMinLabel, mgr.mMaxLabel);
        if (!args.fixed_range) {
            mgr.mRangeCtrl = CreateElement('p');
            mgr.mRangeCtrl.className = 'range';
            mgr.shortenRange = function() {
                mgr.updateRange(1 / (mgr.mRangeExtendTurn == 2 ? 2.5 : 2));
            };
            mgr.extendRange = function() {
                mgr.updateRange(mgr.mRangeExtendTurn == 1 ? 2.5 : 2);
            };
            mgr.mRangeCtrl.append(CreateScriptLink(
                '&darr;', mgr.shortenRange, cLang.ui_shorten_range));
            mgr.mRangeCtrl.append(CreateScriptLink(
                '&uarr;', mgr.extendRange, cLang.ui_extend_range));
            slider_box.append(mgr.mRangeCtrl);
        }
    }
    return mgr;
};
var UI_Vector = CreateSingleton();
UI_Vector.cValueTypes = [null, null, v2, v3, v4];
UI_Vector.cDimLabels = ['X', 'Y', 'Z', 'W'];
UI_Vector.createMgr = function(args)
{
    args.is_block = true;
    args.clip_name = 'v' + args.dim;
    var mgr = UI_Replace.createMgr(args);
    mgr.mDim = args.dim;
    mgr.mValueType = this.cValueTypes[mgr.mDim];
    mgr.mSliderMgrs = [];
    var slider_args = Object.assign({
        parent_mgr : mgr, fixed : true,
        on_slide : function() { mgr.updateActive(); },
    }, args);
    slider_args.clip_name = null;
    var labels = args.labels || this.cDimLabels;
    for (var i = 0; i < mgr.mDim; ++i) {
        slider_args.no_label = i < mgr.mDim - 1;
        var s_mgr = UI_Slider.createMgr(slider_args);
        mgr.mSliderMgrs[i] = s_mgr;
        var slider = s_mgr.createInstance({
            parent : mgr.mEditObj, title : labels[i], value : 0, });
        s_mgr.activate(slider);
        mgr.mEditObj.append(CreateBR());
    }
    for (var i = 0; i < mgr.mDim - 1; ++i) {
        mgr.mSliderMgrs[mgr.mDim - 1].addRangeLink(mgr.mSliderMgrs[i]);
    }
    mgr.isEqual = function(a, b) { return this.mValueType.IsEqual(a, b); };
    mgr.getValue = function()
    {
        var ret = this.mValueType.Makes(0);
        for (var i = 0; i < this.mDim; ++i) {
            ret[i] = this.mSliderMgrs[i].getValue();
        }
        return ret;
    };
    mgr.setValue = function(value)
    {
        for (var i = 0; i < this.mDim; ++i) {
            this.mSliderMgrs[i].setValue(value[i]);
        }
    };
    mgr.dupValue = function(value) { return this.mValueType.Dup(value); };
    mgr.saveData = function(value) { return this.mValueType.ToArray(value); };
    mgr.getLabel = function(value)
    {
        var ret = '(';
        for (var i = 0; i < this.mDim; ++i) {
            if (i) { ret += ', '; }
            ret += this.mSliderMgrs[i].getLabel(value[i]);
        }
        return ret + ')';
    };
    mgr.updateSlider = function(value)
    {
        for (var i = 0; i < this.mDim; ++i) {
            this.mSliderMgrs[i].updateSlider(value[i]);
        }
    };
    return mgr;
};
var UI_Color = CreateSingleton();
UI_Color.cElementNames = ['R', 'G', 'B', 'A'];
UI_Color.cElementColors = ['#ff0000', '#00ff00', '#0000ff', '#808080'];
UI_Color.floatToString = function(v) { return v.toFixed(3); };
UI_Color.stringToFloat = function(v) { return parseFloat(v); };
UI_Color.calcY = function(v) { return v[0] * 0.299 + v[1] * 0.587 + v[2] * 0.114; };
UI_Color.createMgr = function(args)
{
    args.is_block = true;
    args.clip_name = 'color';
    var mgr = UI_Replace.createMgr(args);
    mgr.mIsRGBA = args.is_rgba;
    mgr.mElementNum = mgr.mIsRGBA ? 4 : 3;
    mgr.mValueType = mgr.mIsRGBA ? v4 : v3;
    mgr.mSliderMgrs = [];
    var slider_args = {
        parent_mgr : mgr, fixed : true, min : 0, max : 1, size : 5, width : '6em',
        slide_round : 0.001, fixed_digits : 3,
        on_slide : function() { mgr.updateSample(); },
    };
    slider_args.clip_name = null;
    for (var i = 0; i < mgr.mElementNum; ++i) {
        slider_args.no_label = i < mgr.mElementNum - 1;
        slider_args.handle_color = this.cElementColors[i];
        var s_mgr = UI_Slider.createMgr(slider_args);
        mgr.mSliderMgrs[i] = s_mgr;
        var slider = s_mgr.createInstance({
            parent : mgr.mEditObj, title : this.cElementNames[i], value : 0, });
        s_mgr.activate(slider);
        mgr.mEditObj.append(CreateBR());
    }
    for (var i = 0; i < mgr.mElementNum - 1; ++i) {
        mgr.mSliderMgrs[mgr.mElementNum - 1].addRangeLink(mgr.mSliderMgrs[i]);
    }
    mgr.mSampleObj = CreateElement('div');
    mgr.mSampleObj.className = 'ui-color';
    mgr.mEditArea.insertBefore(mgr.mSampleObj, mgr.mEditObj.nextSibling);
    mgr.onCreateInstance = function(inst)
    {
        if (inst.mLabelObj) { inst.mLabelObj.className = 'ui-color'; }
    };
    mgr.onUpdateLabel = function(inst)
    {
        var bg = v3.ToColorCode(inst.mValue);
        var col = v3.ToColorCode(v3.Makes(step(UI_Color.calcY(inst.mValue), 0.5)));
        inst.mLabelObj.style.backgroundColor = bg;
        inst.mLabelObj.style.borderColor = col;
        inst.mLabelObj.style.color = col;
    };
    mgr.isEqual = function(a, b) { return this.mValueType.IsEqual(a, b); };
    mgr.getValue = function()
    {
        var ret = this.mValueType.Makes(0);
        for (var i = 0; i < this.mElementNum; ++i) {
            ret[i] = this.mSliderMgrs[i].getValue();
        }
        return ret;
    };
    mgr.setValue = function(value)
    {
        for (var i = 0; i < this.mElementNum && i < value.length; ++i) {
            this.mSliderMgrs[i].setValue(value[i]);
        }
        this.updateSample();
    };
    mgr.dupValue = function(value) { return this.mValueType.Dup(value); };
    mgr.saveData = function(value) { return this.mValueType.ToArray(value); };
    mgr.getLabel = function(value)
    {
        var ret = '';
        for (var i = 0; i < this.mElementNum; ++i) {
            ret += (i == 0 ? '(' : ', ') + this.mSliderMgrs[i].getLabel(value[i]);
        }
        return ret + ')';
    };
    mgr.updateSample = function() {
        var new_val = this.getValue();
        //mgr.updateValue(this.mActiveInst, new_val, true);
        this.mSampleObj.style.backgroundColor = v3.ToColorCode(new_val);
    };
    return mgr;
};
