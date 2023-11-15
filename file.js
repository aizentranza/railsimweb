'use strict';
var cFileVersion = 1;
var cFileType_Layout = 'RailSimWeb-layout-data';
var cFileType_Model = 'RailSimWeb-model-data';
var cJsEmbedBegin = '//embedded-data-begin';
var cJsEmbedEnd   = '//embedded-data-end';
var cJsAssignHead = 'var g_layout_data = ';
var g_undo_stack = [];
var g_redo_stack = [];
var g_undo_redo_callback = CreateCallbackSet();
var g_clipboard = null;
function SetClipboard(type, value) {
    g_clipboard = { type : type, value : value, };
}
function GetClipboard(type) {
    return g_clipboard && g_clipboard.type == type ? g_clipboard.value : null;
}
function UpdateUndoRedoMenu()
{
    ToggleLinkColor('menu-link-undo', g_undo_stack.length > 0);
    ToggleLinkColor('menu-link-redo', g_redo_stack.length > 0);
}
function PushUndo(undo_func, redo_func, act_label, is_invoke_redo, target_inst)
{
    if (is_invoke_redo) { redo_func(); }
    if (g_opt_undo_stack_size == 0) { return; }
    var last_undo = g_undo_stack.length > 0 ? g_undo_stack[g_undo_stack.length - 1] : null;
    if (last_undo && target_inst && last_undo.label == act_label
        && last_undo.inst == target_inst) {
        last_undo.redo = redo_func;
    } else {
        g_undo_stack.push({ undo : undo_func, redo : redo_func, label : act_label,
                            inst : target_inst, });
    }
    g_redo_stack = [];
    if (g_opt_undo_stack_size >= 0) {
        while (g_undo_stack.length > g_opt_undo_stack_size) { g_undo_stack.shift(); }
    }
    UpdateUndoRedoMenu();
}
function Undo()
{
    CancelMouse();
    g_undo_redo_callback.invoke();
    if (g_undo_stack.length > 0) {
        var f = g_undo_stack.pop();
        f.undo();
        g_redo_stack.push(f);
        Log(LangJoin([cLang.file_undo, ' "', f.label,
                      '" (' + g_redo_stack.length + '/'
                      + (g_undo_stack.length + g_redo_stack.length) + ')']));
    }
    UpdateUndoRedoMenu();
}
function Redo()
{
    CancelMouse();
    g_undo_redo_callback.invoke();
    if (g_redo_stack.length > 0) {
        var f = g_redo_stack.pop();
        f.redo();
        g_undo_stack.push(f);
        Log(LangJoin([cLang.file_redo, ' "', f.label,
                      '" (' + g_redo_stack.length + '/'
                      + (g_undo_stack.length + g_redo_stack.length) + ')']));
    }
    UpdateUndoRedoMenu();
}
var FileMode = CreateInstance();
FileMode.createAuthorInfoMgr = function(parent_mgr)
{
    var mgr = UI_Struct.createMgr({
        clip_name : 'author-info', fixed : true, parent_mgr : parent_mgr, });
    mgr.pushStruct({
        key : 'name', title : cLang.cmn_name, def_value : '',
        mgr : UI_Text.createMgr({ parent_mgr : mgr, fixed : true, no_clip : true, }), });
    mgr.pushStruct({
        key : 'url', title : 'URL', def_value : '',
        mgr : UI_Text.createMgr({ parent_mgr : mgr, fixed : true, no_clip : true, }), });
    mgr.initializeStruct();
    return mgr;
};
FileMode.appendAuthorLink = function(parent, author)
{
    if (!author || !(author.name || author.url)) { return; }
    parent.append(' (', author.url ? CreateLink(
        author.name || 'link', author.url, cLang.cmn_author) : author.name, ')');
};
FileMode.updateLayoutName = function()
{
    WatchMode.setTitle(this.mLayoutNameMgr.getValue(), this.mLayoutAuthorMgr.getValue());
};
FileMode.mLayoutNameMgr = UI_LangText.createMgr({
    fixed : true, on_update : function(inst) { FileMode.updateLayoutName(); },
})
FileMode.mLayoutAuthorMgr = FileMode.createAuthorInfoMgr();
FileMode.mLayoutAuthorMgr.mOnUpdate = function(inst) { FileMode.updateLayoutName(); };
FileMode.mExportPartModelMgr = UI_Check.createMgr({ fixed : true, })
FileMode.mExportTrainModelMgr = UI_Check.createMgr({ fixed : true, })
FileMode.mExportStructModelMgr = UI_Check.createMgr({ fixed : true, })
FileMode.mExportTrainFormMgr = UI_Check.createMgr({ fixed : true, })
FileMode.mCameraFovMgr = UI_Slider.createMgr({
    fixed : true, size : 4, min : 1, max : 179, slide_round : 1, fixed_range : true, });
FileMode.initialize = function()
{
    FileMode.mFilePane = CreateEditPane('file', cLang.head_file, function(div_on) {
        if (!g_is_touch_device)
        {
            var drop_class = 'file-drop', div_drop = CreateElement('div', drop_class);
            div_drop.append(LangSpan(cLang.desc_drop_file));
            div_drop.addEventListener('dragover', function(event) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'copy';
                div_drop.className = drop_class + ' dropping';
            });
            div_drop.addEventListener('dragleave', function(event) {
                div_drop.className = drop_class;
            });
            div_drop.addEventListener('drop', function(event) {
                event.preventDefault();
                div_drop.className = drop_class;
                if (event.dataTransfer.items) {
                    for (var item of event.dataTransfer.items) {
                        var { kind, type } = item;
                        if (kind === 'file') {
                            FileMode.loadFile(item.getAsFile());
                        } else {
                            Log(cLang.desc_invalid_data);
                        }
                        return;
                    }
                }
            });
            div_on.append(div_drop);
        }
        var file_elem = CreateElement('input', 'file-hidden');
        file_elem.type = 'file';
        file_elem.addEventListener('change', async function(event) {
            if (file_elem.files.length > 0) {
                var file = file_elem.files[0];
                FileMode.loadFile(file);
                file_elem.value = '';
            }
        });
        div_on.append(file_elem);
        div_on.append(CreateScriptLinkEdit(
            cLang.file_load_scene, function() {
                file_elem.accept = 'application/json';
                file_elem.click();
            }));
        div_on.append(CreateHBRVSL(), CreateScriptLinkEdit(
            cLang.file_new_scene,
            function() { ClearData(false); }));
        div_on.append(CreateHBRVSL(), CreateScriptLinkEdit(
            LangJoin([cLang.file_new_scene, ' (', cLang.file_keep_model_data, ')']),
            function() { ClearData(true); }));
        div_on.append(CreateHBRVSL(), CreateScriptLinkEdit(
            LangAppend(cLang.file_save_scene, ' (.json)'),
            function() { SaveData(null); }));
        div_on.append(CreateHBRVSL(), CreateScriptLinkEdit(
            cLang.file_save_for_embedding, function() {
                file_elem.accept = 'text/html;text/javascript';
                file_elem.click();
            }));
        var info_p = CreateElement('p', 'group');
        this.mLayoutName = this.mLayoutNameMgr.createActiveInstance({
            parent : info_p, title : cLang.file_layout_name,
            value : ['New Layout', '新規レイアウト'], });
        info_p.append(CreateHBRVSL());
        this.mLayoutAuthor = this.mLayoutAuthorMgr.createActiveInstance({
            parent : info_p, title : cLang.cmn_author, value : null, });
        div_on.append(info_p);
        var export_p = CreateElement('p', 'group');
        export_p.append(CreateScriptLinkEdit(
            cLang.file_export_data, function() { ExportData(); }));
        export_p.append(CreateHBRVSL());
        this.mExportPartModel = this.mExportPartModelMgr.createActiveInstance({
            parent : export_p, value : true, title : cLang.file_export_part_model, });
        export_p.append(CreateHBRVSL());
        this.mExportTrainModel = this.mExportTrainModelMgr.createActiveInstance({
            parent : export_p, value : true, title : cLang.file_export_train_model, });
        export_p.append(CreateHBRVSL());
        this.mExportStructModel = this.mExportStructModelMgr.createActiveInstance({
            parent : export_p, value : true, title : cLang.file_export_struct_model, });
        export_p.append(CreateHBRVSL());
        this.mExportTrainForm = this.mExportTrainFormMgr.createActiveInstance({
            parent : export_p, value : true, title : cLang.file_export_train_form, });
        div_on.append(export_p);
        var config_p = CreateElement('p', 'group');
        this.mCameraFov = this.mCameraFovMgr.createActiveInstance({
            parent : config_p, value : g_default_camera_fov, title : cLang.file_fov, });
        config_p.append(CreateHBRVSL());
        config_p.append(CreateScriptLinkEdit(
            cLang.file_reset_camera, function() { FileMode.resetCamera(); }));
        config_p.append(CreateHBRVSL());
        config_p.append(CreateScriptLinkEdit(
            cLang.cam_guide_open, function() {
                WatchMode.setCameraGuideVisible(!WatchMode.isCameraGuideVisible());
            }));
        div_on.append(config_p);
        var version_p = CreateElement('p', 'group');
        div_on.append(version_p);
        OnNextCalc(function() {
            version_p.innerText = GetVersionText();
            if (!this.mCameraFovMgr.isVisible()) { return true; }
            this.mCameraFovMgr.updateSlider(this.mCameraFov.mValue);
        }, this);
    }, this);
};
FileMode.resetCamera = function()
{
    function new_ctrl() { return CameraControl.create({}); }
    var is_def_cam = g_cam_ctrl == g_cam_ctrl_default;
    g_cam_ctrl_default = new_ctrl();
    g_cam_ctrl_model = new_ctrl();
    g_cam_ctrl = is_def_cam ? g_cam_ctrl_default : g_cam_ctrl_model;
    this.setFov(g_default_camera_fov);
};
FileMode.requestUpdateCameraSlider = function()
{
    if (!this.mIsRequestUpdateCameraSlider) {
        this.mIsRequestUpdateCameraSlider = true;
        OnNextCalc(function() {
            if (!this.mCameraFovMgr.isVisible()) { return true; }
            this.mCameraFovMgr.updateSlider(this.mCameraFov.mValue);
            this.mIsRequestUpdateCameraSlider = false;
        }, this);
    }
};
FileMode.setFov = function(fov)
{
    this.mCameraFovMgr.updateValue(FileMode.mCameraFov, fov);
    this.requestUpdateCameraSlider();
};
FileMode.loadFile = function(file)
{
    var reader = new FileReader();
    reader.readAsText(file);
    reader.addEventListener('load', function(event) {
        Log(LangAppend(cLang.desc_load_data, ': ' + file.name));
        var text = reader.result;
        if (text.indexOf(cJsEmbedBegin) >= 0 && text.indexOf(cJsEmbedEnd) >= 0)
        {
            var embed_info = { pre : '', post : '', name : file.name, };
            var step = 0;
            text.split('\n').forEach(function(line) {
                if (step == 0) {
                    embed_info.pre += line + '\n';
                    if (!line.startsWith(cJsEmbedBegin)) { return; }
                    step = 1;
                } else if (step == 1) {
                    if (!line.startsWith(cJsEmbedEnd)) { return; }
                    embed_info.post += line + '\n';
                    step = 2;
                } else if (step == 2) {
                    if (line != '') { embed_info.post += line + '\n'; }
                }
            });
            if (step == 2) {
                SaveData(embed_info);
            } else {
                Log(cLang.desc_embed_failed);
            }
            return;
        }
        if (file.name.endsWith('.js') && text.startsWith(cJsAssignHead)) {
            text = text.slice(cJsAssignHead.length);
        }
        try {
            var loaded_data = JSON.parse(text);
            if (loaded_data) {
                var gl = g_canvas.getContext();
                if (loaded_data.type == cFileType_Layout) {
                    if (!ClearData(false)) { return; }
                } else if (loaded_data.type == cFileType_Model) {
                } else {
                    Log(LangAppend(cLang.error_tag, cLang.error_file_type));
                    return;
                }
                LoadData(gl, loaded_data);
            }
        } catch (error) {
            Log(cLang.desc_invalid_data);
        }
    });
    reader.addEventListener('error', function(event) {
        Log('ERROR: ' + reader.error);
    });
};
FileMode.initialize();
function ClearData(is_keep_model_data)
{
    if (!LangConfirm(cLang.file_confirm_clear_scene)) { return false; }
    Log(cLang.file_new_scene);
    Rail.clear();
    Train.clear();
    Struct.clear();
    TrainEditor.clear();
    StructEditor.clear();
    Rail.writeAll();
    FieldEditor.createTestField(g_canvas.getContext());
    if (!is_keep_model_data) {
        TrainModel.clear();
        StructModel.clear();
        EditModel.clear();
        FileMode.resetCamera();
        //WatchMode.setCameraGuideVisible(true);
    }
    g_undo_stack = [];
    g_redo_stack = [];
    UpdateUndoRedoMenu();
    return true;
}
function ExportData()
{
    Log(LangAppend(cLang.file_export_data, '...'));
    var is_available = false;
    function apply_check(cls, is_export) {
        cls.mInstsMgr.mElements.forEach(function(elem_inst) {
            var mdl = elem_inst.mValue;
            mdl.user_data.is_checked = is_export && elem_inst.mArrayCheck.checked;
            if (!mdl.user_data.is_checked) { return; }
            is_available = true;
            Log(LangJoin([cLang.cmn_checked, ': ', mdl.name]));
            if (!mdl.parts) { return; }
            mdl.parts.forEach(function(part) {
                var dep_mdl = EditModel.mIdToData[part.model];
                if (dep_mdl && !dep_mdl.user_data.is_checked) {
                    dep_mdl.user_data.is_checked = true;
                    Log(LangJoin([cLang.cmn_depended, ': ', dep_mdl.name]));
                }
            });
        });
    }
    apply_check(EditModel  , FileMode.mExportPartModel  .mValue);
    apply_check(TrainModel , FileMode.mExportTrainModel .mValue);
    apply_check(StructModel, FileMode.mExportStructModel.mValue);
    apply_check(TrainEditor, FileMode.mExportTrainForm  .mValue);
    if (!is_available) {
        Log(LangAppend(cLang.error_tag, cLang.error_file_no_export_data));
        return;
    }
    SaveData(null, true);
}
function SaveData(embed_info, is_export)
{
    var data = {
        version : cFileVersion,
    };
    if (is_export) {
        data.type = cFileType_Model;
        EditModel.saveAll(data);
        TrainModel.saveAll(data);
        TrainEditor.saveAll(data);
        StructModel.saveAll(data);
        delete data.trains.cur_id;
    } else {
        data.name = FileMode.mLayoutNameMgr.getValue();
        data.author = FileMode.mLayoutAuthorMgr.getValue();
        data.type = cFileType_Layout;
        data.is_pause = WatchMode.mIsPause.mValue;
        data.cam_guide = WatchMode.isCameraGuideVisible();
        data.cam_ctrl = g_cam_ctrl_default.save();
        data.cam_fov = FileMode.mCameraFov.mValue;
        FieldEditor.save(data);
        Rail.saveAll(data);
        EditModel.saveAll(data);
        TrainModel.saveAll(data);
        TrainEditor.saveAll(data);
        StructModel.saveAll(data);
        StructEditor.saveAll(data);
        Log(LangJoin([cLang.desc_save_data, ': ', data.name]));
    }
    var time_str = FormatDateTimeForFile(new Date)
    var json = JSON.stringify(data) + '\n';
    var name = time_str + '.rsw.layout.json';
    if (embed_info) {
        json = embed_info.pre + cJsAssignHead + json + embed_info.post;
        name = embed_info.name;
    } else if (is_export) {
        name = time_str + '.rsw.model.json';
    }
    Log(LangAppend(cLang.file_download, ': ' + name));
    var blob = new Blob([json], { type : 'application/json', });
    var dummy_a_el = document.createElement('a');
    document.body.appendChild(dummy_a_el);
    var obj_url = dummy_a_el.href = window.URL.createObjectURL(blob);
    dummy_a_el.download = name;
    dummy_a_el.click();
    document.body.removeChild(dummy_a_el);
    URL.revokeObjectURL(obj_url);
}
function LoadData(gl, data)
{
    if (!data) { return; }
    if (typeof(data) !== 'object' || (
        data.type != cFileType_Layout && data.type != cFileType_Model)) {
        Log(LangAppend(cLang.error_tag, cLang.error_file_type));
        return;
    }
    if (data.version > cFileVersion) {
        Log(LangJoin([cLang.error_tag, cLang.error_file_version, data.version]));
        return;
    }
    if (data.type == cFileType_Layout) {
        FileMode.mLayoutNameMgr.setValue(data.name);
        FileMode.mLayoutAuthorMgr.setValue(data.author);
        FileMode.updateLayoutName();
    }
    FieldEditor.load(gl, data);
    Rail.loadAll(data);
    EditModel.loadAll(gl, data);
    TrainModel.loadAll(gl, data);
    TrainEditor.loadAll(data);
    StructModel.loadAll(gl, data);
    StructEditor.loadAll(data);
    SetPause(data.is_pause);
    if (data.type == cFileType_Model) {
        Log(cLang.desc_import_data);
    } else {
        WatchMode.setCameraGuideVisible(data.cam_guide);
        g_cam_ctrl_default.load(data.cam_ctrl);
        FileMode.mCameraFovMgr.updateValue(FileMode.mCameraFov, data.cam_fov);
        Log(LangJoin([cLang.desc_load_data, ': ', data.name]));
    }
}
