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
var text_exports = {};
__export(text_exports, {
  textTemplates: () => textTemplates
});
module.exports = __toCommonJS(text_exports);
var Color = __toESM(require("../const/Color"));
const textTemplates = [
  {
    template: "text.window.isOpen",
    role: "text",
    adapter: "",
    type: "text",
    data: {
      icon: {
        true: {
          value: { type: "const", constVal: "window-open-variant" },
          color: { type: "const", constVal: Color.Cyan }
        },
        false: {
          value: { type: "const", constVal: "window-closed-variant" },
          color: { type: "const", constVal: Color.Green }
        },
        scale: void 0,
        maxBri: void 0,
        minBri: void 0
      },
      entity1: {
        value: {
          type: "triggered",
          mode: "auto",
          role: "sensor.window",
          dp: ""
        },
        decimal: void 0,
        factor: void 0,
        unit: void 0
      },
      text: {
        true: { type: "const", constVal: "text" },
        false: void 0
      },
      text1: {
        true: { type: "const", constVal: "open" },
        false: { type: "const", constVal: "close" }
      }
    }
  },
  {
    template: "text.window.isClose",
    role: "text",
    adapter: "",
    type: "text",
    data: {
      icon: {
        true: {
          value: { type: "const", constVal: "window-open-variant" },
          color: { type: "const", constVal: Color.Cyan }
        },
        false: {
          value: { type: "const", constVal: "window-closed-variant" },
          color: { type: "const", constVal: Color.Green }
        }
      },
      entity1: {
        value: {
          type: "triggered",
          mode: "auto",
          role: "sensor.window",
          dp: "",
          read: "return !val"
        }
      },
      text: {
        true: { type: "const", constVal: "text" },
        false: void 0
      },
      text1: {
        true: { type: "const", constVal: "open" },
        false: { type: "const", constVal: "close" }
      }
    }
  },
  {
    template: "text.temperature",
    role: "text",
    adapter: "",
    type: "text",
    data: {
      icon: {
        true: {
          value: { type: "const", constVal: "temperature-celsius" },
          text: {
            type: "triggered",
            mode: "auto",
            role: "value.temperature",
            dp: "",
            read: "return Math.random(val*10)/10"
          },
          color: { type: "const", constVal: Color.Red }
        },
        false: {
          value: { type: "const", constVal: "temperature-celsius" },
          color: { type: "const", constVal: Color.Blue }
        },
        scale: { type: "const", constVal: { min: 0, max: 30 } }
      },
      entity1: {
        value: {
          type: "triggered",
          mode: "auto",
          role: "value.temperature",
          dp: ""
        }
      },
      text: {
        true: { type: "const", constVal: "Temperature" },
        false: void 0
      },
      text1: {
        true: {
          type: "triggered",
          mode: "auto",
          role: "value.temperature",
          dp: "",
          read: "return Math.random(val*10)/10"
        },
        false: void 0
      }
    }
  }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  textTemplates
});
//# sourceMappingURL=text.js.map
