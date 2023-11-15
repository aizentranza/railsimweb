'use strict';
var cAltEmptyText = 'N/A';
function GetElement(id) { return document.getElementById(id); }
function GetElements(name) { return document.getElementsByName(name); }
function CreateElement(tagName, className)
{
    var ret = document.createElement(tagName);
    if (className) { ret.className = className; }
    return ret;
}
function SetClass(node, name)
{
    if (node) { node.className = name; }
    return node;
}
function LangSpan(text, className, fill_default)
{
    if (!Array.isArray(text) && !className) { return text; }
    var ps = CreateElement('span');
    if (className) { ps.className = className; }
    if (Array.isArray(text)) {
        var def = '';
        if (fill_default) {
            for (var il = 0; il < cLanguages.length; ++il) {
                def = text[il];
                if (def) { break; }
            };
        }
        for (var il = 0; il < cLanguages.length; ++il) {
            var sp = CreateElement('span', 'il-' + cLanguages[il]);
            sp.innerText = text[il] || def;
            ps.append(sp);
        };
    } else {
        ps.innerText = text;
    }
    return ps;
}
function LangAppendTo(text, data)
{
    if (!Array.isArray(text)) {
        if (!Array.isArray(data)) { return text + data; }
        text = cLanguages.map(t => text);
    }
    for (var il = 0; il < cLanguages.length; ++il) {
        text[il] += Array.isArray(data) ? data[il] : data;
    };
    return text;
}
function LangAppend(text, data)
{
    text = Array.isArray(text) ? Array.from(text) : text;
    return LangAppendTo(text, data);
}
function LangJoin(texts)
{
    var ret = texts[0];
    for (var i = 1; i < texts.length; ++i) {
        ret = LangAppend(ret, texts[i]);
    }
    return ret;
}
function LangAppendSp(text, data)
{
    return LangJoin([text, cLang.cmn_sp, data]);
}
function LangGet(text)
{
    if (!Array.isArray(text)) { return text; }
    var ret = text[0];
    for (var i = 1; i < text.length; ++i) {
        if (g_language == cLanguages[i]) {
            var tmp = text[i];
            if (tmp !== null && tmp !== undefined) {
                ret = tmp;
                break;
            }
        }
    }
    return ret;
}
function LangAlert(text) { alert(LangGet(text)); }
function LangConfirm(text) { return confirm(LangGet(text)); }
function CreateLinkImpl(label, title, impl)
{
    if (!Array.isArray(label) && !(title && Array.isArray(title)))
    {
        var a = CreateElement('a');
        a.innerHTML = label;
        impl(a);
        if (title) { a.title = title; }
        return a;
    }
    var ps = CreateElement('span');
    for (var il = 0; il < cLanguages.length; ++il) {
        var link_text = label;
        if (Array.isArray(label)) {
            link_text = label[il];
            if (!link_text) {
                for (var il2 = 0; il2 < cLanguages.length; ++il2) {
                    link_text = label[il2];
                    if (link_text) { break; }
                }
            }
        }
        var a = CreateLinkImpl(
            link_text, title && Array.isArray(title) ? title[il] : title, impl);
        a.className = (a.className ? a.className + ' ' : '') + 'il-' + cLanguages[il];
        ps.append(a);
    };
    return ps;
}
function CreateLink(label, url, title)
{
    return CreateLinkImpl(label, title, function(a) {
        a.href = url;
        a.target = '_blank';
    });
}
function CreateScriptLink(label, f, title)
{
    return CreateLinkImpl(label, title, function(a) {
        a.href = 'javascript:void(0);';
        a.onclick = f;
    });
}
function CreateScriptLinkButton(label, f, title)
{
    return CreateLinkImpl(label, title, function(a) {
        a.href = 'javascript:void(0);';
        a.className = 'button';
        a.onclick = f;
    });
}
function CreateScriptLinkEdit(label, f, title)
{
    return CreateEditDiv(CreateScriptLink(label, f, title));
}
function ClearChildren(node)
{
    while (node.firstChild) { node.firstChild.remove() }
}
function ClearSelection()
{
    if (document.selection && document.selection.empty) {
        document.selection.empty();
    } else if (window.getSelection) {
        window.getSelection().removeAllRanges();
    }
}
function ToggleContent(id, mode, force_visible)
{
    if (typeof CancelMouse !== 'undefined') { CancelMouse(); }
    var obj_on = GetElement(id+'-on'), obj = obj_on.parentElement;
    if (obj_on.style.display == 'none' || force_visible == 'show') {
        obj_on.style.display = null/*'block'*/;
        obj.className = obj.className.replace(/ *hide/, '');
        if (mode == 'left') { obj.style.right = obj.style.bottom = null; }
        else if (mode == 'right') { obj.style.left = obj.style.bottom = null; }
        else if (mode == 'log') { obj.style.height = null; }
        return true;
    } else {
        obj_on.style.display = 'none';
        obj.className += ' hide';
        if (mode == 'left') { obj.style.right = obj.style.bottom = 'auto'; }
        else if (mode == 'right') { obj.style.left = obj.style.bottom = 'auto'; }
        else if (mode == 'log') { obj.style.height = 'auto'; }
        return false;
    }
}
function ToggleLinkColor(id, f)
{
    var elem = GetElement(id);
    elem.className = f ? '' : 'disabled';
}
var BodyClassNameSlot = {
    MenuDisplay  : 0,
    LogDisplay   : 1,
    VerticalMode : 2,
    Language     : 3,
    PhotoMode    : 4,
    Num          : 5,
};
var g_body_class_names = [
    'menu-on', 'log-on', 'horizontal', 'en', 'photo-off',
];
function GetBodyClassName(slot)
{
    return g_body_class_names[slot];
}
function SetBodyClassName(slot, name)
{
    if (slot !== undefined) { g_body_class_names[slot] = name; }
    var tmp = '';
    for (var i = 0; i < BodyClassNameSlot.Num; ++i) {
        tmp += (tmp == '' ? '' : ' ') + g_body_class_names[i];
    }
    document.body.className = tmp;
}
function CreateEditDiv(cont)
{
    var div_edit = CreateElement('div', 'ui-edit');
    div_edit.append(cont);
    return div_edit;
};
function CreateEditPane(name, title, f, a_this)
{
    var div_list = CreateElement('div');
    g_mouse.pushCoverElements(div_list);
    div_list.className = 'edit-pane';
    div_list.style.display = 'none';
    var head = CreateElement('h1');
    var f_toggle = function() { ToggleContent(name, 'left'); };
    head.append(CreateScriptLink(title, f_toggle));
    div_list.append(head);
    var div_on = CreateElement('div');
    div_on.id = name + '-on';
    div_on.style.width = '100%';
    div_on.style.display = 'none';
    f.apply(a_this, [div_on]);
    var foot = CreateElement('div');
    foot.className = 'edit-foot';
    div_on.append(foot);
    div_list.append(div_on, CreateBR('horizontal-only'));
    document.body.append(div_list);
    f_toggle();
    return div_list;
}
function CreateBR(className) { return CreateElement('br', className); }
function CreateHBR(vert_txt)
{
    var ret = CreateElement('span');
    ret.append(CreateBR('horizontal-only'));
    var vert = CreateElement('span', 'vertical-only');
    vert.append(vert_txt || ' ');
    ret.append(vert);
    return ret;
}
function CreateHBRVSL() { return CreateHBR(' / '); }
