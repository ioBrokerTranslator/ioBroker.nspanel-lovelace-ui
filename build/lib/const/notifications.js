"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var notifications_exports = {};
__export(notifications_exports, {
  systemNotifications: () => systemNotifications
});
module.exports = __toCommonJS(notifications_exports);
var Color = __toESM(require("./Color"));
const popupTest = {
  card: "popupNotify",
  dpInit: "",
  alwaysOn: "none",
  uniqueID: "///WelcomePopup",
  useColor: false,
  config: {
    card: "popupNotify",
    data: {
      entity1: { value: { type: "state", dp: "0_userdata.0.example_state" } },
      headline: { type: "const", constVal: "welcomeHToken" },
      colorHeadline: { true: { color: { type: "const", constVal: Color.Green } } },
      buttonLeft: { type: "const", constVal: "" },
      colorButtonLeft: { true: { color: { type: "const", constVal: Color.White } } },
      buttonRight: { type: "const", constVal: "" },
      colorButtonRight: { true: { color: { type: "const", constVal: Color.White } } },
      text: { type: "const", constVal: "welcomeTToken" },
      colorText: { true: { color: { type: "const", constVal: Color.White } } },
      timeout: { type: "const", constVal: 5 }
    }
  },
  pageItems: [],
  items: void 0
};
const systemNotifications = [popupTest];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  systemNotifications
});
//# sourceMappingURL=notifications.js.map
