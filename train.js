'use strict';
var RailAnchor = CreateInstance();
RailAnchor.create = function(rail, dir_side, pos, dir, up)
{
    var anc = CreateInstance();
    anc.mRail    = rail    ;
    anc.mDirSide = dir_side;
    anc.mPos     = pos     ;
    anc.mDir     = dir     ;
    anc.mUp      = up      ;
    return anc;
};
RailAnchor.createDefault = function()
{
    return RailAnchor.create(
        null, 0, v3.Makes(0), v3.Make(0, 0, 1), v3.Make(0, 1, 0));
};
RailAnchor.copy = function(anc)
{
    return RailAnchor.create(
        anc.mRail   ,
        anc.mDirSide,
        anc.mPos    ,
        anc.mDir    ,
        anc.mUp     );
};
RailAnchor.turn = function(anc)
{
    var anc2 = RailAnchor.copy(anc);
    anc2.mDirSide = 1 - anc2.mDirSide;
    anc2.mDir     = v3.neg(anc2.mDir);
    return anc2;
};
var TrainCar = CreateInstance();
TrainCar.create = function(edit_obj)
{
    var car = CreateInstance();
    car.mEditObj = edit_obj;
    car.mHeadPos = v3.Makes(0);
    car.mTailPos = v3.Makes(0);
    car.mWheelsAtt = [];
    car.mPartsAtt = [];
    car.mPartsSwitchState = [];
    car.mSmokesSwitchState = [];
    car.mModel = this.getModelData(car);
    this.applySwitches(car);
    return car;
};
TrainCar.getModelData = function(car)
{
    return TrainModel.mIdToData[car.mEditObj.model];
};
TrainCar.write = function(car, mtx)
{
    var mdl = car.mModel;
    car.mPartsAtt = [];
    if (!mdl) { return; }
    TrainModel.write(mdl, car.mWheelsAtt, car.mPartsSwitchState, car.mSmokesSwitchState);
    mdl.user_data.parts_info.forEach(info => car.mPartsAtt.push(
        info.visible ? info.world_mtx : null));
};
TrainCar.applySwitches = function(car)
{
    if (!car.mModel) { return; }
    car.mPartsSwitchState = TrainModel.applySwitches(car.mModel, car.mEditObj.switches);
    car.mSmokesSwitchState = ModelSmoke.applySmokeSwitches(car.mModel, car.mEditObj.switches);
};
var Train = CreateObjMgr();
Train.create = function(edit_obj)
{
    var train = Train.createObj();
    train = CreateInstance(train);
    train.mEditObj = edit_obj;
    train.mHeadAnchor = RailAnchor.createDefault();
    train.mTailAnchor = RailAnchor.createDefault();
    train.mSensorAnchor = RailAnchor.createDefault();
    train.mSpeed = 0;
    train.mReverse = false;
    train.mCars = [];
    //train.mCollisionObjs = [];
    train.mRailReserves = [];
    train.mRailSensors = [];
    return train;
};
Train.clearCar = function(train) { train.mCars = []; };
Train.pushCar = function(train, car) { train.mCars.push(car); };
Train.insertCar = function(train, index, car) { train.mCars.splice(index, 0, car); };
Train.removeCar = function(train, car)
{
    var index = train.mCars.indexOf(car);
    if (index < 0) { return; }
    train.mCars.splice(index, 1);
    if (train.mCars.length <= 0) { Train.remove(train); }
};
Train.put = function(train, rail, rail_dir, pos, dir, up)
{
    train.mHeadAnchor.mRail = rail;
    train.mHeadAnchor.mDirSide = rail_dir;
    train.mTailAnchor.mRail = null;
    train.mSpeed = 0;
    train.mReverse = train.mEditObj.back;
    v3.copy(train.mHeadAnchor.mPos, pos);
    v3.copy(train.mHeadAnchor.mDir, dir);
    v3.copy(train.mHeadAnchor.mUp , up );
};
Train.isPut = function(train) { return train.mHeadAnchor.mRail != null; };
Train.remove = function(train)
{
    if (!Train.isPut(train)) { return; }
    Log(LangJoin([cLang.desc_train_removed, ': [' + train.mID + '] ', train.mEditObj.name]));
    train.mHeadAnchor.mRail = train.mTailAnchor.mRail = train.mSensorAnchor.mRail = null;
    Train.eraseCollisionObjs(train);
    Train.eraseRailReserves(train);
    Train.eraseRailSensors(train);
};
Train.eraseCollisionObjs = function(train) {
    if (!train.mCollisionObjs) { return; }
    train.mCollisionObjs.forEach(obj => RailCollision.erase(obj));
    train.mCollisionObjs = [];
};
Train.eraseRailReserves = function(train, new_data) {
    train.mRailReserves.forEach(reserve => Rail.eraseTrainInfo(reserve));
    train.mRailReserves = new_data || [];
};
Train.eraseRailSensors = function(train, new_data) {
    train.mRailSensors.forEach(sensor => Rail.eraseTrainInfo(sensor));
    train.mRailSensors = new_data || [];
};
Train.calc = function(train)
{
    if (!train.mHeadAnchor.mRail) { return; }
    var speed_mpf = 0, abs_speed = 0, speed_sign = 0;
    Train.eraseCollisionObjs(train);
    var proceed_args = { train : train, rail_reserves : [], };
    var sensor_args = {
        train : train, is_sensor : true, is_override_switch : true,
        rail_reserves : [],
    };
    var is_pause = IsPause();
    if ((train.mEditObj.go || train.mSpeed > 0) && train.mTailAnchor.mRail)
    {
        var accel = 1;//train.mEditObj.accel / cFPS;
        var decel = 1;//train.mEditObj.decel / cFPS;
        if (!train.mEditObj.go) {
            train.mSpeed = Math.max(train.mSpeed - decel, 0);
        } else if (train.mHeadAnchor.mRail && train.mTailAnchor.mRail) {
            if (train.mEditObj.back != train.mReverse) {
                if (train.mSpeed > 0) {
                    train.mSpeed = Math.max(train.mSpeed - decel, 0);
                } else {
                    train.mReverse = train.mEditObj.back;
                    train.mHeadAnchor = RailAnchor.turn(train.mTailAnchor);
                }
            } else if (train.mSpeed < train.mEditObj.speed) {
                train.mSpeed = Math.min(train.mSpeed + accel, train.mEditObj.speed);
            } else if (train.mSpeed > train.mEditObj.speed) {
                train.mSpeed = Math.max(train.mSpeed - decel, train.mEditObj.speed);
            }
        }
        speed_mpf = train.mSpeed / 216; // meter per frame
        var sensor_mpf = speed_mpf * Math.ceil(Math.abs(train.mSpeed) / decel) * 0.5;
        var sensor_margin = 0.1, switch_margin = 5, sensor_blocked = false;
        sensor_mpf += sensor_margin + switch_margin;
        var sensor_unit = 10, sensor_n = Math.ceil(sensor_mpf / sensor_unit);
        sensor_unit = sensor_n ? sensor_mpf / sensor_n : 0;
        var sensor_reach = 0;
        train.mSensorAnchor = train.mHeadAnchor;
        for (var i = 0; i < sensor_n; ++i) {
            var sr = Rail.proceed(train.mSensorAnchor, sensor_unit, sensor_args);
            if (sr.mRail && !sr.mIsBlocked) {
                sensor_reach += sensor_unit;
                train.mSensorAnchor = sr;
            } else {
                sensor_reach += v3.Length(v3.Sub(sr.mPos, train.mSensorAnchor.mPos));
                train.mSensorAnchor = sr;
                train.mSpeed *= Math.min(Math.sqrt(
                    Math.max(0, sensor_reach - sensor_margin)
                        / (Math.abs(sensor_mpf) - sensor_margin - switch_margin)), 1);
                sensor_blocked = !sr.mRail;
                break;
            }
        }
        proceed_args.is_override_switch = true;
        var ret = is_pause ? train.mHeadAnchor
            : Rail.proceed(train.mHeadAnchor, speed_mpf, proceed_args);
        proceed_args.is_override_switch = false;
        abs_speed = Math.abs(speed_mpf);
        speed_sign = Math.sign(speed_mpf);
        if (ret.mRail) {
            train.mHeadAnchor = ret;
            if (sensor_blocked && train.mSpeed == 0) {
                Train.reverse(train);
            }
        } else if (train.mTailAnchor.mRail) {
            if (ret.mIsBlocked) {
                speed_mpf = abs_speed = 0;
            } else {
                Train.reverse(train);
            }
        } else {
            Train.remove(train);
        }
    }
    Train.eraseRailReserves(train, proceed_args.rail_reserves);
    Train.eraseRailSensors(train, sensor_args.rail_reserves);
    var is_valid = false, prev_anc = RailAnchor.create(
        train.mHeadAnchor, 0, null, null, null);
    for (var i = 0; i < train.mCars.length; ++i) {
        var car = train.mCars[train.mReverse ? train.mCars.length - 1 - i : i];
        var mdl = car.mModel;
        if (!mdl) { continue; }
        is_valid = true;
        var length = mdl.length;
        if (i == 0) {
            prev_anc = RailAnchor.copy(train.mHeadAnchor);
            v3.copy(car.mHeadPos, train.mHeadAnchor.mPos);
        }
        if (!prev_anc.mRail) { break; }
        v3.copy(car.mHeadPos, prev_anc.mPos);
        var wheels_info = mdl.user_data.wheels_info, cur_z = 0;
        if (car.mWheelsAtt.length != wheels_info.length) {
            car.mWheelsAtt = [];
            wheels_info.forEach(wheel_info => car.mWheelsAtt.push({
                rot : 0,
            }));
        }
        function calc_wheel(iw, is_rev, sign) {
            var wheel_info = wheels_info[iw], radius = wheel_info.radius;
            var next_z = wheel_info.z, att = car.mWheelsAtt[iw];
            if (is_rev) { next_z = length - next_z; }
            prev_anc = Rail.proceed(prev_anc, cur_z - next_z, proceed_args);
            if (!prev_anc.mRail) { return false; }
            cur_z = next_z;
            if (radius && !is_pause) { att.rot -= sign * speed_sign * (1 - Math.exp(
                -abs_speed / (radius * cPI))) * cPI; }
            att.pos = v3.Dup(prev_anc.mPos);
            att.dir = v3.Muls(prev_anc.mDir, sign);
            att.up = v3.Dup(prev_anc.mUp);
            return true;
        }
        if (car.mEditObj.flip ^ train.mReverse) {
            for (var iw = wheels_info.length - 1; iw >= 0; --iw) {
                if (!calc_wheel(iw, true, -1)) { break; }
            }
        } else {
            for (var iw = 0; iw < wheels_info.length; ++iw) {
                if (!calc_wheel(iw, false, 1)) { break; }
            }
        }
        if (!prev_anc.mRail) { break; }
        prev_anc = Rail.proceed(prev_anc, cur_z - length, proceed_args);
        if (!prev_anc.mRail) { break; }
        v3.copy(car.mTailPos, prev_anc.mPos);
    }
    if (prev_anc.mRail && is_valid) {
        train.mTailAnchor = prev_anc;
    } else {
        Train.remove(train);
    }
};
Train.reverse = function(train)
{
    //Log('Train[' + train.mID + '] reverse.');
    train.mEditObj.back = train.mReverse = !train.mReverse;
    var editor_active = TrainEditor.mInstMgr.mActiveInst;
    if (editor_active && editor_active.mValue.user_data.sim_obj == train) {
        TrainEditor.mBackMgr.setValue(train.mReverse);
    }
    train.mHeadAnchor = RailAnchor.turn(train.mTailAnchor);
};
Train.requestResetAll = function() { this.sRequestResetAll = true; };
Train.calcAll = function()
{
    if (!IsEditorMode()) {
        if (this.sRequestResetAll) {
            this.sRequestResetAll = false;
            Train.forEach(train => TrainEditor.updateTrain(train.mEditObj));
        }
        Train.forEach(Train.calc);
    }
};
Train.write = function(train)
{
    if (!train.mHeadAnchor.mRail) { return; }
    //var up = train.mHeadAnchor.mUp;
    for (var i = 0; i < train.mCars.length; ++i) {
        var car = train.mCars[i];
        TrainCar.write(car);
    }
    if (IsEnableDebugDraw() && train.mSensorAnchor.mRail) {
        g_sphere_drawer.pushSphere(AddRailTotalHeight(
            train.mSensorAnchor.mPos, train.mSensorAnchor.mUp), 2, v4.Make(0, 1, 1, 1));
    }
};
Train.writeAll = function()
{
    Train.forEach(Train.write);
};
Train.forEachCar = function(f, a_this)
{
    this.forEach(function(train) {
        train.mCars.forEach(function(car) {
            f.apply(a_this, [train, car]);
        });
    });
};
var TrainSetter = CreateInstance();
TrainSetter.cMinDist = 5.0;
TrainSetter.mCursorPos = v3.Makes(0);
TrainSetter.mCursorDir = v3.Makes(0);
TrainSetter.mCursorDirBasePos = v3.Makes(0);
TrainSetter.mIsTooClose = false;
TrainSetter.putTrain = function()
{
    if (this.mNearestRail) {
        var con = this.mNearestRail;
        var tr = TrainEditor.getSelected();
        if (!tr) return;
        var train = tr.user_data.sim_obj;
        Log(LangJoin([cLang.desc_train_set, ': [' + train.mID + '] ', train.mEditObj.name]));
        var pos = v3.add(v3.Muls(con.up, RailMetric.cTotalHeight), con.pos);
        Train.put(train, con.rail, this.mNearestRailDirSide,
                  pos, con.dir, con.up);
        this.mNearestRail = null;
    }
};
TrainSetter.calc = function(wpos)
{
    this.mCursorPos = v3.Dup(wpos);
    if (v3.CalcDist(this.mCursorDirBasePos, wpos) > 0.5) {
        this.mCursorDir = v3.Sub(wpos, this.mCursorDirBasePos);
        this.mCursorDirBasePos = v3.Dup(wpos);
    }
    this.mNearestRail = null;
    var nearest_rail = Rail.searchNearestRail(wpos);
    if (nearest_rail.rail) {
        if (nearest_rail.dist < this.cMinDist) {
            if (IsMenuTrainList()) {
                this.mNearestRail = nearest_rail;
                if (v3.Dot(this.mNearestRail.dir, this.mCursorDir) < 0) {
                    v3.neg(this.mNearestRail.dir);
                    this.mNearestRailDirSide = 0;
                } else {
                    this.mNearestRailDirSide = 1;
                }
            }
        }
    }
};
TrainSetter.write = function()
{
    var nearest_point = null;
    var con_pos = null, con_dir = null;
    if (this.mNearestRail)
    {
        if (IsMenuTrainList()) {
            var rail = this.mNearestRail.rail;
            var pos = v3.add(v3.Muls(
                this.mNearestRail.up, RailMetric.cTotalHeight), this.mNearestRail.pos);
            DrawArrow(pos,
                      v3.add(v3.Muls(this.mNearestRail.dir, 2.5), pos),
                      0.5, v4.Make(1, 0, 0, 1), this.mNearestRail.up);
        }
    }
};
