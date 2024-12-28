"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var console_1 = require("console");
var PromiseStateType;
(function (PromiseStateType) {
    PromiseStateType["pending"] = "pending";
    PromiseStateType["reject"] = "reject";
    PromiseStateType["fulfilled"] = "fulfilled";
})(PromiseStateType || (PromiseStateType = {}));
var CustomPromise = /** @class */ (function () {
    function CustomPromise(excutor) {
        var _this = this;
        this.excutor = excutor;
        this.PromiseFulFilledHandler = function (data) { }; //if user don't set anything it'll run, preventing undifiend excess in later code
        this.PromiseRejectRecord = function () {
            throw (0, console_1.error)('please handle promise error!!');
        };
        //    so this is the function which will set promise state to full fill and will put fulfilledHandler in microTaskqueu
        this.PromiseResolveHanlder = function (value) {
            // console.log('value dekh lund :', value)
            _this.promiseState = PromiseStateType.fulfilled;
            _this.promiseResult = value;
            // console.log('hai',this.PromiseFulFilledHandler)
            if (_this.PromiseFulFilledHandler) {
                queueMicrotask(function () {
                    // console.log('this mf runned')
                    var data = _this.PromiseFulFilledHandler(_this.promiseResult);
                    if (_this.nextResolve) {
                        _this.nextResolve(data);
                    }
                });
            }
        };
        this.PromiseRejectHanlder = function (value) {
            _this.promiseState = PromiseStateType.reject;
            _this.promiseResult = value;
            if (_this.PromiseRejectHanlder) {
                queueMicrotask(function () {
                    var data = _this.PromiseRejectHanlder(value);
                });
            }
        };
        // setting promise fulfilled record 
        this.then = function (cb) {
            //  console.log('then runed',cb)
            _this.PromiseFulFilledHandler = cb;
            return new CustomPromise(function (res, rej) {
                _this.nextResolve = res;
            });
        };
        //  to handle reject state of promise
        this.catch = function (cb) {
            _this.PromiseRejectRecord = cb;
        };
        this.promiseState = PromiseStateType.pending;
        excutor(this.PromiseResolveHanlder, this.PromiseRejectHanlder);
    }
    ;
    return CustomPromise;
}());
exports.default = CustomPromise;
;
