'use strict';
var menu_id = 0;
var MenuType = {
    Scene  : 0,
    Editor : 1,
};
var MenuItem = {
    File        :  0,
    Watch       :  1,
    BuildRail   :  2,
    EditRail    :  3,
    Schedule    :  4,
    EditModel   :  5,
    TrainModel  :  6,
    TrainList   :  7,
    StructModel :  8,
    StructList  :  9,
    FieldEditor : 10,
};
var MenuItemInfo = [
    { label : cLang.menu_file        , type : MenuType.Scene , },
    { label : cLang.menu_watch       , type : MenuType.Scene , },
    { label : cLang.menu_build_rail  , type : MenuType.Scene , },
    { label : cLang.menu_edit_rail   , type : MenuType.Scene , },
    { label : cLang.menu_schedule    , type : MenuType.Scene , },
    { label : cLang.menu_edit_model  , type : MenuType.Editor, },
    { label : cLang.menu_train_model , type : MenuType.Editor, },
    { label : cLang.menu_train_list  , type : MenuType.Scene , },
    { label : cLang.menu_struct_model, type : MenuType.Editor, },
    { label : cLang.menu_struct_list , type : MenuType.Scene , },
    { label : cLang.menu_field_editor, type : MenuType.Scene , },
];
console.assert(Object.keys(MenuItem).length == MenuItemInfo.length);
WatchMode.initialize();
MenuItemInfo[MenuItem.File       ].list_obj = FileMode.mFilePane;
MenuItemInfo[MenuItem.Watch      ].list_obj = WatchMode.mWatchPane;
MenuItemInfo[MenuItem.BuildRail  ].list_obj = RailBuilder.mRailPane;
MenuItemInfo[MenuItem.EditRail   ].list_obj = RailBuilder.mRailPane;
MenuItemInfo[MenuItem.Schedule   ].list_obj = RailBuilder.mSchedulePane;
MenuItemInfo[MenuItem.EditModel  ].list_obj = EditModel.mListObj;
MenuItemInfo[MenuItem.TrainModel ].list_obj = TrainModel.mListObj;
MenuItemInfo[MenuItem.TrainList  ].list_obj = TrainEditor.mListObj;
MenuItemInfo[MenuItem.StructModel].list_obj = StructModel.mListObj;
MenuItemInfo[MenuItem.StructList ].list_obj = StructEditor.mListObj;
MenuItemInfo[MenuItem.FieldEditor].list_obj = FieldEditor.mEditPane;
var MainMenu = CreateInstance();
MainMenu.mMenuActive = -1;//MenuItem.BuildRail;
MainMenu.initialize = function()
{
    var div_list = CreateElement('div');
    g_mouse.pushCoverElements(div_list);
    div_list.className = 'menu';
    var head = CreateElement('h1');
    head.append(CreateScriptLink(cLang.head_menu, ToggleMenu));
    div_list.append(head);
    var div_on = CreateElement('div');
    div_on.id = 'menu-on';
    var foot = CreateElement('div');
    foot.className = 'edit-foot';
    div_on.append(foot);
    div_list.append(div_on);
    document.body.append(div_list);
    var p = CreateElement('p');
    var link_undo = CreateScriptLink(cLang.menu_undo, Undo);
    var link_redo = CreateScriptLink(cLang.menu_redo, Redo);
    link_undo.id = 'menu-link-undo'; link_undo.className = 'disabled';
    link_redo.id = 'menu-link-redo'; link_redo.className = 'disabled';
    p.append(link_undo, ' / ', link_redo);
    div_on.append(p);
    //p = CreateElement('p');
    //p.append(CreateScriptLink(cLang.menu_save, SaveData));
    //div_on.append(p);
    Object.keys(MenuItem).forEach(function(key) {
        var index = MenuItem[key], item = MenuItemInfo[index];
        item.id = key;
        var p = CreateElement('p');
        item.obj = p;
        if (index == MainMenu.mMenuActive) { p.className = 'active'; }
        var f_change_mode = function(no_toggle_menu) {
            MainMenu.ChangeMode(index);
            if (g_is_touch_device && !no_toggle_menu) { ToggleMenu(); }
        };
        p.append(CreateScriptLink(item.label, function() { f_change_mode(false); }));
        div_on.append(p);
        window['Menu' + key] = f_change_mode;
        window['IsMenu' + key] = function() { return MainMenu.CheckMode(index); };
    });
    var menu_file = MenuItemInfo[MenuItem.File];
    menu_file.obj.append(' / ', CreateScriptLink(cLang.menu_save, function() { SaveData(); }));
};
MainMenu.ChangeMode = function(new_mode)
{
    CancelMouse();
    if (this.CheckMode(new_mode)) { return; }
    if (this.mMenuActive >= 0) {
        var prev_info = MenuItemInfo[this.mMenuActive];
        prev_info.obj.className = '';
        if (prev_info.list_obj) { prev_info.list_obj.style.display = 'none'; }
    }
    var new_info = MenuItemInfo[new_mode];
    new_info.obj.className = 'active';
    if (new_info.list_obj) { new_info.list_obj.style.display = null/*'block'*/; }
    this.mMenuActive = new_mode;
    if (IsEditorMode()) {
        g_cam_ctrl = g_cam_ctrl_model;
        g_smoke_drawer = g_smoke_drawer_model;
        g_canvas.setClearColor(v4.Make(0, 0, 0, 1));
    } else {
        g_cam_ctrl = g_cam_ctrl_default;
        g_smoke_drawer = g_smoke_drawer_default;
        g_canvas.setClearColor(v4.Make(0.5, 0.75, 1, 1));
    }
};
MainMenu.GetListObj = function() {
    if (this.mMenuActive < 0) { return null; }
    return MenuItemInfo[this.mMenuActive].list_obj;
};
MainMenu.CheckMode = function(mode)
{
    return this.mMenuActive == mode;
};
function IsEditorMode()
{
    var info = MenuItemInfo[MainMenu.mMenuActive];
    return info.type == MenuType.Editor;
}
function IsFocusMode()
{
    return IsMenuWatch() || IsMenuFile() || IsMenuTrainList();
}
function ToggleMenu() {
    SetBodyClassName(BodyClassNameSlot.MenuDisplay,
                     ToggleContent('menu') ? 'menu-on' : 'menu-off');
}
SetBodyClassName();
