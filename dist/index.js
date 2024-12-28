"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var promise_1 = __importDefault(require("./promise"));
console.log('1');
new promise_1.default(function (res, rej) {
    res("2");
}).then(function (data) {
    console.log(data);
    return Number(data) + 1;
}).then(function (data) {
    console.log(data);
});
console.log('3');
