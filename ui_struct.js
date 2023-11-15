'use strict';
var UI_Array = CreateSingleton();
UI_Array.createMgr = function(args)
{
    args.is_block = true;
    args.no_ctrl_br = true;
    args.is_break_title = true;
    if (args.element_mgr.mClipName) { args.clip_name = args.element_mgr.mClipName + '[]'; }
    var mgr = UI_Replace.createMgr(args);
    mgr.mIsArray = true;
    mgr.mDim = args.dim;
    mgr.mElementMgr = args.element_mgr;
    mgr.mElementMgr.mParentMgr = mgr;
    console.assert(mgr.mElementMgr.mIsDisableUndo || args.fixed);
    mgr.mLabelElements = args.label_elements;
    if (args.element_names) { mgr.mElementNames = args.element_names; }
    if (args.fixed_elements) { mgr.mFixedElements = args.fixed_elements; }
    mgr.mMinElementNum = args.min_element_num || 0;
    if (args.update_element_names) {
        mgr.mElementNames = [];
        mgr.mUpdateElementNames = args.update_element_names;
    }
    mgr.mInitElementValue = args.init_element_value;
    if (args.on_update_array) { mgr.mOnUpdateArray = args.on_update_array; }
    if (args.is_deletable) { mgr.mIsDeletable = args.is_deletable; }
    mgr.mElements = [];
    if (!mgr.mElementNames) {
        mgr.mControlSpan.append(' ', CreateScriptLinkButton(
            'A', function() { mgr.selectAll(!mgr.isSelectAll()); }, cLang.ui_select_all));
        mgr.mControlSpan.append(' ', CreateScriptLink(
            '+', function() { mgr.birthElement(); }, cLang.ui_add_element));
        mgr.mControlSpan.append(' ', CreateScriptLink(
            '&minus;', function() { mgr.deleteElements(); }, cLang.ui_del_elements));
        mgr.mControlSpan.append(' ', CreateScriptLink(
            '&darr;', function() { mgr.moveElements(1); }, cLang.ui_move_down));
        mgr.mControlSpan.append(' ', CreateScriptLink(
            '&uarr;', function() { mgr.moveElements(-1); }, cLang.ui_move_up));
    }
    mgr.mControlSpan.append(' [');
    mgr.mArrayObj = CreateElement('span');
    mgr.mEditObj.append(mgr.mArrayObj, ']');
    mgr.getFixedElementsNum = function() {
        return this.mFixedElements ? this.mFixedElements.length : 0;
    };
    mgr.saveStateForUndo = function()
    {
        if (!this.mIsRoot) { return null; }
        return Array.from(this.mElements);
    };
    mgr.pushUndo = function(old_state, action)
    {
        if (!old_state) { return; }
        var all_same = old_state.length == this.mElements.length;
        if (all_same) {
            for (var i = 0; i < this.mElements.length; ++i) {
                if (old_state[i] === this.mElements[i]) { continue; }
                all_same = false; break;
            }
        }
        if (all_same) return;
        var new_state = this.saveStateForUndo();
        function close_deleted_element(old_st, new_st) {
            for (var i = 0; i < old_st.length; ++i) {
                var tmp_elem = old_st[i], found = false;
                for (var j = 0; j < new_st.length; ++j) {
                    if (tmp_elem == new_st[j]) { found = true; break; }
                }
                if (!found && mgr.mElementMgr.mActiveInst == tmp_elem) {
                    mgr.mElementMgr.activate(null);
                    break;
                }
            }
        }
        PushUndo(function() {
            close_deleted_element(mgr.mElements, old_state);
            mgr.mElements = old_state;
            mgr.updateArray();
        }, function() {
            close_deleted_element(mgr.mElements, new_state);
            mgr.mElements = new_state;
            mgr.updateArray();
        }, action + ': ' + mgr.mValueName);
    };
    mgr.copyValue = function()
    {
        if (this.mClipName) {
            var clip = [];
            this.mElements.forEach(function(elem_inst) {
                if (elem_inst.mArrayCheck.checked) {
                    clip.push(this.mElementMgr.dupValue(elem_inst.mValue));
                }
            }, this);
            SetClipboard(this.mClipName, clip);
            this.selectAll(false);
        }
    };
    mgr.pasteValue = function()
    {
        if (this.mClipName) {
            var clip = GetClipboard(this.mClipName);
            if (!clip) {
                if (clip = GetClipboard(this.mElementMgr.mClipName)) { clip = [clip]; }
            }
            if (clip) {
                var old_state = this.saveStateForUndo();
                var first_sel = this.getFirstSelectedElement();
                this.selectAll(false);
                clip.forEach(function(cv) {
                    var elem_inst = this.createElementInst(
                        this.mElementMgr.dupValue(cv), first_sel);
                    //this.mElementMgr.updateValue(elem_inst, elem_inst.mValue);
                    elem_inst.mArrayCheck.checked = true;
                }, this);
                this.updateArray();
                this.pushUndo(old_state, 'paste elements');
            } else {
                Log(cLang.desc_cannot_paste);
            }
        }
    };
    mgr.getFirstSelectedElement = function()
    {
        for (var i = 0; i < this.mElements.length; ++i) {
            var elem_inst = this.mElements[i];
            if (elem_inst.mArrayCheck.checked) { return elem_inst; }
        }
        return null;
    };
    mgr.birthElement = function()
    {
        var old_state = this.saveStateForUndo();
        var new_val = this.mElementMgr.dupValue(this.mInitElementValue);
        var new_inst = this.createElementInst(new_val, this.getFirstSelectedElement());
        this.updateArray();
        this.pushUndo(old_state, 'birth element');
        this.mElementMgr.activate(new_inst);
    };
    mgr.deleteElements = function()
    {
        var old_state = this.saveStateForUndo(), i = 0;
        this.mElements = this.mElements.filter(function(elem_inst) {
            if (i++ < mgr.getFixedElementsNum() || !elem_inst.mArrayCheck.checked ||
                mgr.mIsDeletable && !mgr.mIsDeletable(elem_inst)) { return true; }
            if (mgr.mElementMgr.mActiveInst == elem_inst) { mgr.mElementMgr.activate(null); }
            return false;
        });
        while (this.mElements.length < mgr.mMinElementNum) { this.birthElement(); }
        this.updateArray();
        this.pushUndo(old_state, 'delete elements');
    };
    mgr.moveElements = function(ofs)
    {
        var checked = [], not_checked = [], first = -1;
        for (var i = 0; i < this.mElements.length; ++i) {
            var elem_inst = this.mElements[i];
            if (elem_inst.mArrayCheck.checked && i >= this.getFixedElementsNum()) {
                checked.push(elem_inst);
                if (first < 0) { first = not_checked.length; }
            } else {
                not_checked.push(elem_inst);
            }
        }
        if (first >= 0) {
            var old_state = this.saveStateForUndo();
            this.mElements = [];
            var new_first = -1, insert_pos = first + ofs;
            if (this.mFixedElements) {
                insert_pos = Math.max(this.mFixedElements.length, insert_pos);
            }
            for (var i = -1; i <= not_checked.length + 1; ++i) {
                if (insert_pos == i) {
                    new_first = this.mElements.length;
                    checked.forEach(e => this.mElements.push(e));
                }
                if (0 <= i && i < not_checked.length) { this.mElements.push(not_checked[i]); }
            }
            this.updateArray();
            for (var i = 0; i < checked.length; ++i) {
                this.mElements[new_first + i].mArrayCheck.checked = true;
            }
            this.pushUndo(old_state, 'move elements');
        }
    };
    mgr.isSelectAll = function()
    {
        for (var i = this.getFixedElementsNum(); i < this.mElements.length; ++i) {
            if (!this.mElements[i].mArrayCheck.checked) { return false; }
        }
        return true;
    };
    mgr.selectAll = function(sel)
    {
        for (var i = this.getFixedElementsNum(); i < this.mElements.length; ++i) {
            this.mElements[i].mArrayCheck.checked = sel;
        }
    };
    mgr.deleteAll = function()
    {
        this.selectAll(true);
        this.deleteElements();
    };
    mgr.createElementInst = function(elem_value, insert_before)
    {
        var cur_len = this.mElements.length;
        if (cur_len > 0) { this.mArrayObj.append(CreateBR()); }
        var title = CreateElement('label'), check = null;
        if (!this.mElementNames) {
            check = CreateElement('input');
            check.type = 'checkbox';
            if (cur_len >= this.getFixedElementsNum()) { title.append(check, ' '); }
        }
        title.append(this.mElementNames ? LangSpan(this.mElementNames[cur_len]) : (
            cur_len < this.getFixedElementsNum()
                ? LangSpan(this.mFixedElements[cur_len]) : cur_len.toString()));
        var elem_inst = this.mElementMgr.createInstance({
            parent : this.mArrayObj, title : title, value : elem_value, });
        elem_inst.mArrayCheck = check;
        do {
            if (insert_before) {
                var insert_at = this.mElements.indexOf(insert_before);
                if (insert_at >= 0) {
                    this.mElements.splice(insert_at, 0, elem_inst);
                    break;
                }
            }
            this.mElements.push(elem_inst);
        } while (false);
        this.mArrayObj.append(' ');
        return elem_inst;
    };
    mgr.makeDefaultValue = function()
    {
        if (!this.mElementNames) { return null; }
        var ret = [];
        for (var i = 0; i < this.mElementNames.length; ++i) {
            ret.push(this.mInitElementValue
                     ? this.mElementMgr.dupValue(this.mInitElementValue)
                     : this.mElementMgr.makeDefaultValue());
        }
        return ret;
    };
    mgr.isEqual = function(a, b)
    {
        if (a.length != b.length) { return false; }
        for (var i = 0; i < a.length; ++i) {
            if (!this.mElementMgr.isEqual(a[i], b[i])) { return false; }
        }
        return true;
    };
    if (mgr.mIsRoot) {
        mgr.updateArray = function()
        {
            ClearChildren(this.mArrayObj);
            this.mActiveInst.mValue = [];
            for (var i = 0; i < this.mElements.length; ++i) {
                var elem_inst = this.mElements[i];
                var label = elem_inst.mArrayCheck.parentNode;
                ClearChildren(label);
                label.append(elem_inst.mArrayCheck, ' ');
                var title_str = '' + i;
                if (this.mElementMgr.getUUID) {
                    var uuid_span = CreateElement('span');
                    uuid_span.append(title_str);
                    uuid_span.title = 'UUID: ' + this.mElementMgr.getUUID(elem_inst.mValue);
                    label.append(uuid_span);
                } else {
                    label.append(title_str);
                }
                if (i > 0) { this.mArrayObj.append(CreateBR()); }
                this.mArrayObj.append(elem_inst.mDiv);
                this.mActiveInst.mValue.push(elem_inst.mValue);
            }
            if (this.mOnUpdateArray) { this.mOnUpdateArray(); }
        };
        return mgr;
    }
    mgr.mArrayObj.className = 'ui-array';
    mgr.updateArray = function()
    {
        this.setValue(this.getValue());
        this.updateActive();
    }
    mgr.getValue = function()
    {
        var ret = [];
        this.mElementMgr.getValue();
        for (var i = 0; i < this.mElements.length; ++i) {
            ret[i] = this.mElements[i].mValue;
        }
        return ret;
    };
    mgr.setValue = function(value)
    {
        ClearChildren(this.mArrayObj);
        if (this.mUpdateElementNames) { this.mUpdateElementNames(this, value); }
        this.mElements = [];
        for (var i = 0; i < value.length; ++i) {
            this.createElementInst(value[i]);
        }
    };
    mgr.dupValue = function(value) {
        if (!value) { return null; }
        // @todo treat user_data
        var ret = [];
        for (var i = 0; i < value.length; ++i) {
            ret.push(this.mElementMgr.dupValue(value[i]));
        }
        return ret;
    };
    mgr.saveData = function(value) {
        var ret = [];
        for (var i = 0; i < value.length; ++i) {
            ret.push(this.mElementMgr.saveData(value[i]));
        }
        return ret;
    };
    mgr.getLabel = function(value)
    {
        if (value === undefined) { debugger; }
        var ret = '[';
        if (this.mLabelElements) {
            for (var i = 0; i < value.length; ++i) {
                if (i) { ret += ', '; }
                if (this.mElementNames) { ret += this.mElementNames[i] + ': '; }
                ret += this.mElementMgr.getLabel(value[i]);
            }
        } else {
            ret += value.length;
        }
        return ret + ']';
    };
    return mgr;
};
var UI_Struct = CreateSingleton();
UI_Struct.createMgr = function(args)
{
    args.is_block = true;
    args.no_ctrl_br = true;
    args.is_break_title = true;
    var mgr = UI_Replace.createMgr(args);
    mgr.mStruct = [];
    mgr.pushStruct = function(elem)
    {
        if (elem.condition) { elem.is_visible = true; }
        this.mStruct.push(elem);
    };
    mgr.mControlSpan.append(' {');
    mgr.initializeStruct = function()
    {
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (elem.mgr) {
                if (i > 0 && elem.mgr.mIsArray) { this.mEditObj.append(CreateBR()); }
                var elem_title = elem.title;
                if (elem.title_sub) { elem_title = LangAppend(elem_title, elem.title_sub); }
                elem.inst = elem.mgr.createInstance({
                    parent : this.mEditObj, title : elem_title, value : elem.def_value, });
                if (elem.mgr.mIsFixed) { elem.mgr.activate(elem.inst); }
            } else {
                var elem_cmd = elem.cmd;
                this.mEditObj.append(CreateScriptLink(elem.title, function() {
                    elem_cmd(mgr.mActiveInst.mValue);
                }, elem.link_title));
            }
            this.mEditObj.append(', ');
        }
        this.mEditObj.append('}');
    };
    mgr.makeDefaultValue = function()
    {
        var ret = {};
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.mgr) { continue; }
            ret[elem.key] = elem.get_def_value ? elem.get_def_value() : (
                elem.def_value !== null
                    ? elem.mgr.dupValue(elem.def_value) : elem.mgr.makeDefaultValue());
        }
        return ret;
    };
    mgr.isEqual = function(a, b)
    {
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.mgr) { continue; }
            if (!elem.mgr.isEqual(a[elem.key], b[elem.key])) { return false; }
        }
        return true;
    };
    mgr.getValue = function()
    {
        var ret = {};
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.mgr) { continue; }
            ret[elem.key] = elem.mgr.mEditArea.style.display == 'none'
                ? null : elem.mgr.getValue();
        }
        if (this.mUserData) { ret.user_data = this.mUserData; }
        return ret;
    };
    mgr.setValue = function(value)
    {
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.mgr) { continue; }
            var elem_val = value[elem.key];
            if (elem_val === null) {
                elem.mgr.mEditArea.style.display = 'none';
                elem.inst.mTitleObj.style.display = 'none';
            } else {
                elem.mgr.mEditArea.style.display = null;
                elem.inst.mTitleObj.style.display = null;
                elem.mgr.setValue(elem_val);
            }
        }
        this.mUserData = value.user_data;
        if (this.mActiveInst) { this.updateVisible(this.mActiveInst); }
    };
    mgr.dupValue = function(value) {
        if (!value) { return null; }
        var ret = {};
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.mgr) { continue; }
            ret[elem.key] = elem.mgr.dupValue(value[elem.key]);
        }
        return ret;
    };
    mgr.saveData = function(value) {
        var ret = {};
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.mgr) { continue; }
            ret[elem.key] = elem.mgr.saveData(value[elem.key]);
        }
        return ret;
    };
    mgr.saveValueForUndo = function(value)
    {
        var ret = this.dupValue(value);
        if (ret && value.user_data) { ret.user_data = value.user_data; }
        return ret;
    };
    mgr.setDefaultValues = function(value)
    {
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.mgr) { continue; }
            if (value[elem.key] !== undefined) { continue; }
            value[elem.key] = elem.get_def_value ? elem.get_def_value() : (
                elem.def_value !== null
                    ? elem.mgr.dupValue(elem.def_value) : elem.mgr.makeDefaultValue());
            //Log('set def value [' + elem.key + '] = ' + value[elem.key]);
        }
    };
    mgr.getLabel = function(value)
    {
        var ret = LangAppendTo(['', ''], '{'), n = 0;
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.mgr) { continue; }
            if (!elem.labeled) { continue; }
            var elem_val = value[elem.key];
            if (elem_val === null) { continue; }
            if (n) { LangAppendTo(ret, ', '); }
            if (elem.labeled != 'value') { ret = LangJoin([ret, elem.title, ': ']); }
            LangAppendTo(ret, elem.mgr.getLabel(elem_val));
            ++n;
        }
        return LangAppendTo(ret, '}');
    };
    mgr.updateVisible = function(inst)
    {
        for (var i = 0; i < this.mStruct.length; ++i) {
            var elem = this.mStruct[i];
            if (!elem.condition) { continue; }
            var vis = elem.condition(inst.mValue);
            if (vis == elem.is_visible) { continue; }
            elem.is_visible = vis;
            elem.inst.mDiv.style.display = vis ? null : 'none';
        }
    };
    return mgr;
};
