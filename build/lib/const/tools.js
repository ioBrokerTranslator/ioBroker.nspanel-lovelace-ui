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
var tools_exports = {};
__export(tools_exports, {
  GetIconColor: () => GetIconColor,
  deepAssign: () => deepAssign,
  formatInSelText: () => formatInSelText,
  getDecfromHue: () => getDecfromHue,
  getDecfromRGBThree: () => getDecfromRGBThree,
  getEntryColor: () => getEntryColor,
  getEntryTextOnOff: () => getEntryTextOnOff,
  getIconEntryColor: () => getIconEntryColor,
  getIconEntryValue: () => getIconEntryValue,
  getInternalDefaults: () => getInternalDefaults,
  getItemMesssage: () => getItemMesssage,
  getPayload: () => getPayload,
  getPayloadArray: () => getPayloadArray,
  getRGBfromRGBThree: () => getRGBfromRGBThree,
  getScaledNumber: () => getScaledNumber,
  getSliderCTFromValue: () => getSliderCTFromValue,
  getTemperaturColorFromValue: () => getTemperaturColorFromValue,
  getTranslation: () => getTranslation,
  getValueEntryBoolean: () => getValueEntryBoolean,
  getValueEntryNumber: () => getValueEntryNumber,
  getValueEntryString: () => getValueEntryString,
  ifValueEntryIs: () => ifValueEntryIs,
  messageItemDefault: () => messageItemDefault,
  setHuefromRGB: () => setHuefromRGB,
  setRGBThreefromRGB: () => setRGBThreefromRGB,
  setScaledNumber: () => setScaledNumber,
  setSliderCTFromValue: () => setSliderCTFromValue,
  setTriggeredToState: () => setTriggeredToState,
  setValueEntry: () => setValueEntry
});
module.exports = __toCommonJS(tools_exports);
var import_data_item = require("../classes/data-item");
var Color = __toESM(require("./Color"));
var import_icon_mapping = require("./icon_mapping");
var import_types = require("../types/types");
const messageItemDefault = {
  type: "input_sel",
  intNameEntity: "",
  icon: "",
  iconColor: "",
  displayName: "",
  optionalValue: ""
};
function ifValueEntryIs(i, type) {
  if (i && i.value && i.value.type)
    return i.value.type === type;
  return false;
}
async function setValueEntry(i, value, sca = true) {
  var _a;
  if (!i || !i.value)
    return;
  let res = value;
  if (typeof value === "number") {
    res = value / ((_a = i.factor && await i.factor.getNumber()) != null ? _a : 1);
    if (sca && i.minScale !== void 0 && i.maxScale !== void 0) {
      const min = await i.minScale.getNumber();
      const max = await i.maxScale.getNumber();
      if (min !== null && max !== null) {
        res = Math.round(Color.scale(res, 100, 0, min, max));
      }
    }
  }
  if (i.set && i.set.writeable)
    await i.set.setStateAsync(res);
  else
    await i.value.setStateAsync(res);
}
async function getValueEntryNumber(i, s = true) {
  var _a, _b;
  if (!i)
    return null;
  const nval = i.value && await i.value.getNumber();
  if (nval !== null && nval !== void 0) {
    let res = nval * ((_a = i.factor && await i.factor.getNumber()) != null ? _a : 1);
    if (s && i.minScale !== void 0 && i.maxScale !== void 0) {
      const min = await i.minScale.getNumber();
      const max = await i.maxScale.getNumber();
      if (min !== null && max !== null) {
        res = Color.scale(res, max, min, 0, 100);
      }
    }
    const d = (_b = "decimal" in i && i.decimal && await i.decimal.getNumber()) != null ? _b : null;
    if (d !== null && d !== false) {
      res = Math.round(res * 10 ** d) / 10 ** d;
    }
    return res;
  }
  return null;
}
function getScaledNumberRaw(n, min, max, oldValue = null) {
  if (min !== null && max !== null) {
    if (oldValue === null) {
      n = Math.round(Color.scale(n, max, min, 0, 100));
    } else {
      n = Color.scale(n, 100, 0, min, max);
      if (oldValue !== false) {
        if (oldValue >= n)
          n = Math.floor(n);
        else
          n = Math.ceil(n);
      } else {
        n = Math.round(n);
      }
    }
  }
  return n;
}
async function getScaledNumber(i) {
  if (!i)
    return null;
  let nval = i.value && await i.value.getNumber();
  if (nval !== null && nval !== void 0) {
    if (i.minScale !== void 0 && i.maxScale !== void 0) {
      const min = await i.minScale.getNumber();
      const max = await i.maxScale.getNumber();
      nval = getScaledNumberRaw(nval, min, max);
    }
    return nval;
  }
  return null;
}
async function getTemperaturColorFromValue(i, dimmer = 100) {
  if (!i)
    return null;
  let nval = i.value && await i.value.getNumber();
  const mode = i.mode && await i.mode.getString();
  let kelvin = 3500;
  if (nval !== null && nval !== void 0) {
    if (i.minScale !== void 0 && i.maxScale !== void 0) {
      const min = await i.minScale.getNumber();
      const max = await i.maxScale.getNumber();
      nval = getScaledNumberRaw(nval, min, max);
    }
    if (mode === "mired") {
      kelvin = 10 ** 6 / nval;
    } else {
      kelvin = nval;
    }
    kelvin = kelvin > 7e3 ? 7e3 : kelvin < 1800 ? 1800 : kelvin;
    let r = Color.kelvinToRGB[Math.trunc(kelvin / 100) * 100];
    r = Color.darken(r, Color.scale(dimmer, 100, 0, 0, 1));
    return r ? String(Color.rgb_dec565(r)) : null;
  }
  return null;
}
async function getSliderCTFromValue(i) {
  if (!i)
    return null;
  let nval = i.value && await i.value.getNumber();
  const mode = i.mode && await i.mode.getString();
  let r = 3500;
  if (nval !== null && nval !== void 0) {
    if (i.minScale !== void 0 && i.maxScale !== void 0) {
      const min = await i.minScale.getNumber();
      const max = await i.maxScale.getNumber();
      if (min !== null && max !== null)
        nval = Math.round(Color.scale(nval, max, min, 1800, 7e3));
    }
    if (mode === "mired") {
      r = 10 ** 6 / nval;
    } else {
      r = nval;
    }
    r = r > 7e3 ? 7e3 : r < 1800 ? 1800 : r;
    r = getScaledNumberRaw(r, 1800, 7e3);
    return r !== null ? String(r) : null;
  }
  return null;
}
async function setSliderCTFromValue(i, value) {
  var _a;
  if (!i || !i.value)
    return;
  const nval = (_a = i.value && await i.value.getNumber()) != null ? _a : null;
  const mode = i.mode && await i.mode.getString();
  if (nval !== null) {
    let r = getScaledNumberRaw(value, 1800, 7e3, false);
    r = r > 7e3 ? 7e3 : r < 1800 ? 1800 : r;
    if (mode === "mired") {
      r = 10 ** 6 / r;
    }
    if (i.minScale !== void 0 && i.maxScale !== void 0) {
      const min = await i.minScale.getNumber();
      const max = await i.maxScale.getNumber();
      if (min !== null && max !== null)
        r = Math.round(Color.scale(nval, 7e3, 1800, min, max));
    }
    if (i.set && i.set.writeable)
      await i.value.setStateAsync(r);
    else if (nval !== value)
      await i.value.setStateAsync(r);
  }
}
async function setScaledNumber(i, value) {
  var _a;
  if (!i || !i.value)
    return;
  const nval = (_a = await i.value.getNumber()) != null ? _a : null;
  if (nval !== null) {
    if (i.minScale !== void 0 && i.maxScale !== void 0) {
      value = getScaledNumberRaw(value, await i.minScale.getNumber(), await i.maxScale.getNumber(), value);
    }
    if (i.set && i.set.writeable)
      await i.set.setStateAsync(value);
    else if (nval !== value)
      await i.value.setStateAsync(value);
  }
}
async function getIconEntryValue(i, on, def, defOff = null, getText = false) {
  var _a, _b, _c, _d, _e, _f;
  if (i === void 0)
    return "";
  on = on != null ? on : true;
  if (!i)
    return import_icon_mapping.Icons.GetIcon(on ? def : defOff != null ? defOff : def);
  const text = getText ? (_a = i.true && i.true.text && await getValueEntryString(i.true.text)) != null ? _a : null : null;
  if (text !== null) {
    const textFalse = (_b = i.false && i.false.text && await getValueEntryString(i.false.text)) != null ? _b : null;
    if (typeof on === "number" && textFalse !== null) {
      const scale = i.scale && await i.scale.getObject();
      if ((0, import_types.isPartialIconScaleElement)(scale)) {
        if (scale.val_min && scale.val_min >= on || scale.val_max && scale.val_max <= on)
          return text;
        else
          textFalse;
      }
    }
    if (!on)
      return textFalse != null ? textFalse : text;
    return text;
  }
  const icon = (_c = i.true && i.true.value && await i.true.value.getString()) != null ? _c : null;
  if (!on) {
    return import_icon_mapping.Icons.GetIcon((_f = (_e = (_d = i.false && i.false.value && await i.false.value.getString()) != null ? _d : defOff) != null ? _e : icon) != null ? _f : def);
  }
  return import_icon_mapping.Icons.GetIcon(icon != null ? icon : def);
}
async function getIconEntryColor(i, value, def, defOff = null) {
  var _a, _b, _c, _d;
  value = value != null ? value : true;
  if (typeof def === "number")
    def = Color.decToRgb(def);
  else if (typeof def === "string")
    def = Color.decToRgb(parseInt(def));
  if (typeof defOff === "number")
    defOff = Color.decToRgb(defOff);
  else if (defOff === null)
    defOff = null;
  else if (typeof defOff === "string")
    defOff = Color.decToRgb(parseInt(defOff));
  if (!i)
    return String(Color.rgb_dec565(def));
  if (typeof value === "boolean") {
    const color = i.true && i.true.color && await i.true.color.getRGBDec();
    if (!value) {
      return (_c = (_b = (_a = i.false && i.false.color && await i.false.color.getRGBDec()) != null ? _a : defOff && String(Color.rgb_dec565(defOff))) != null ? _b : color) != null ? _c : String(Color.rgb_dec565(def));
    }
    return color != null ? color : String(Color.rgb_dec565(def));
  } else if (typeof value === "number") {
    let cto = i.true && i.true.color && await i.true.color.getRGBValue();
    let cfrom = i.false && i.false.color && await i.false.color.getRGBValue();
    const scale = i.scale && await i.scale.getObject();
    if (cto && cfrom && scale) {
      let rColor = cto;
      if ((0, import_types.isIconScaleElement)(scale)) {
        let vMin = scale.val_min < value ? scale.val_min : value;
        let vMax = scale.val_max > value ? scale.val_max : value;
        if (vMax < vMin) {
          const temp = vMax;
          vMax = vMin;
          vMin = temp;
          const temp2 = cto;
          cto = cfrom;
          cfrom = temp2;
        }
        const vBest = (_d = scale.val_best) != null ? _d : void 0;
        let factor = 1;
        if (vMin == vMax) {
          rColor = cto;
        } else if (vBest === void 0) {
          factor = (value - vMin) / (vMax - vMin);
          factor = getLogFromIconScale(scale, factor);
          rColor = Color.mixColor(cfrom, cto, factor);
        } else if (value >= vBest) {
          factor = (value - vBest) / (vMax - vBest);
          factor = getLogFromIconScale(scale, factor);
          rColor = Color.mixColor(cto, cfrom, factor);
        } else {
          factor = (value - vMin) / (vBest - vMin);
          factor = 1 - getLogFromIconScale(scale, 1 - factor);
          rColor = Color.mixColor(cfrom, cto, factor);
        }
        return String(Color.rgb_dec565(rColor));
      } else if ((0, import_types.isPartialIconScaleElement)(scale)) {
        if (scale.val_min && scale.val_min >= value || scale.val_max && scale.val_max <= value)
          return String(Color.rgb_dec565(cto));
        else
          String(Color.rgb_dec565(cfrom));
      }
    }
    if (value) {
      if (cto)
        return String(Color.rgb_dec565(cto));
    } else if (cfrom)
      return String(Color.rgb_dec565(cfrom));
    else if (cto)
      return String(Color.rgb_dec565(cto));
  }
  return String(Color.rgb_dec565(def));
}
function getLogFromIconScale(i, factor) {
  if (i.log10 !== void 0) {
    if (i.log10 === "max") {
      factor = factor * (90 / 10) + 1;
      factor = factor < 1 ? 1 : factor > 10 ? 10 : factor;
      factor = Math.log10(factor);
    } else {
      factor = (1 - factor) * (90 / 10) + 1;
      factor = factor < 1 ? 1 : factor > 10 ? 10 : factor;
      factor = Math.log10(factor);
      factor = 1 - factor;
    }
  }
  return factor;
}
async function GetIconColor(item, value, min = null, max = null, offColor = null) {
  var _a, _b;
  if (item === void 0)
    return "";
  if (Color.isRGB(item)) {
    const onColor = item;
    if (typeof value === "number") {
      let val = typeof value === "number" ? value : 0;
      const maxValue = max != null ? max : 100;
      const minValue = min != null ? min : 0;
      val = val > maxValue ? maxValue : val;
      val = val < minValue ? minValue : val;
      return String(
        Color.rgb_dec565(
          !offColor ? Color.darken(onColor ? onColor : Color.HMIOn, Color.scale(val, maxValue, minValue, 0, 1)) : Color.Interpolate(
            offColor,
            onColor ? onColor : Color.HMIOn,
            Color.scale(val, maxValue, minValue, 0, 1)
          )
        )
      );
    }
    if (value) {
      return String(Color.rgb_dec565(onColor ? onColor : Color.HMIOn));
    }
    return String(Color.rgb_dec565(offColor ? offColor : Color.HMIOff));
  } else {
    const onColor = item.true && item.true.color && await item.true.color.getRGBValue();
    const offColor2 = item.false && item.false.color && await item.false.color.getRGBValue();
    if (typeof value === "number") {
      let val = typeof value === "number" ? value : 0;
      const maxValue = (_a = item.maxBri && await item.maxBri.getNumber() || max) != null ? _a : 100;
      const minValue = (_b = item.minBri && await item.minBri.getNumber() || min) != null ? _b : 0;
      val = val > maxValue ? maxValue : val;
      val = val < minValue ? minValue : val;
      return String(
        Color.rgb_dec565(
          !offColor2 ? Color.darken(onColor ? onColor : Color.HMIOn, Color.scale(val, maxValue, minValue, 0, 1)) : Color.Interpolate(
            offColor2,
            onColor ? onColor : Color.HMIOn,
            Color.scale(val, maxValue, minValue, 0, 1)
          )
        )
      );
    }
    if (value) {
      return String(Color.rgb_dec565(onColor ? onColor : Color.HMIOn));
    }
    return String(Color.rgb_dec565(offColor2 ? offColor2 : Color.HMIOff));
  }
}
async function getEntryColor(i, value, def) {
  var _a, _b;
  if (i === void 0)
    return "";
  if (typeof def === "number")
    def = String(def);
  else if (typeof def !== "string")
    def = String(Color.rgb_dec565(def));
  if (!i)
    return def;
  const color = i.true && await i.true.getRGBDec();
  if (!value) {
    return (_b = (_a = i.false && await i.false.getRGBDec()) != null ? _a : color) != null ? _b : def;
  }
  return color != null ? color : def;
}
async function getEntryTextOnOff(i, on) {
  var _a, _b, _c;
  if (!i)
    return null;
  if (!(0, import_data_item.isDataItem)(i)) {
    const value = i.true && await i.true.getString();
    if (!(on != null ? on : true)) {
      return (_b = (_a = i.false && await i.false.getString()) != null ? _a : value) != null ? _b : null;
    }
    return value != null ? value : null;
  } else {
    return (_c = await i.getString()) != null ? _c : null;
  }
}
async function getValueEntryBoolean(i) {
  if (!i)
    return null;
  const nval = i.value && await i.value.getBoolean();
  if (nval !== void 0) {
    return nval;
  }
  return null;
}
function isTextSizeEntryType(F) {
  return "textSize" in F;
}
async function getValueEntryString(i, v = null) {
  var _a, _b, _c, _d, _e;
  if (!i || !i.value)
    return null;
  const nval = v !== null ? v : await getValueEntryNumber(i);
  if (nval !== null && nval !== void 0) {
    const format = (_a = i.dateFormat && await i.dateFormat.getObject()) != null ? _a : null;
    let res2 = (0, import_types.isValueDateFormat)(format) ? new Date(nval).toLocaleString(format.local, format.format) : String(nval);
    res2 = res2 + ((_b = i.unit && await i.unit.getString()) != null ? _b : "");
    let opt2 = "";
    if (isTextSizeEntryType(i))
      opt2 = String((_c = i.textSize && await i.textSize.getNumber()) != null ? _c : "");
    return res2 + (opt2 ? "\xAC" + opt2 : "");
  }
  let res = await i.value.getString();
  let opt = "";
  if (res != null) {
    res += (_d = i.unit && await i.unit.getString()) != null ? _d : "";
    if (isTextSizeEntryType(i))
      opt = String((_e = i.textSize && await i.textSize.getNumber()) != null ? _e : "");
    res += opt ? "\xAC" + opt : "";
  }
  return res;
}
function getTranslation(library, key1, key2) {
  let result = key2 != null ? key2 : key1;
  if (key2 !== void 0) {
    result = library.getLocalTranslation(key1, key2);
  }
  result = library.getTranslation(result || key1);
  return result;
}
const getRGBfromRGBThree = async (item) => {
  var _a, _b, _c;
  if (!item)
    return Color.White;
  const red = (_a = item.Red && await item.Red.getNumber()) != null ? _a : -1;
  const green = (_b = item.Green && await item.Green.getNumber()) != null ? _b : -1;
  const blue = (_c = item.Blue && await item.Blue.getNumber()) != null ? _c : -1;
  if (red === -1 || blue === -1 || green === -1)
    return null;
  return { r: red, g: green, b: blue };
};
const getDecfromRGBThree = async (item) => {
  const rgb = await getRGBfromRGBThree(item);
  if (!rgb)
    return null;
  return String(Color.rgb_dec565(rgb));
};
const setRGBThreefromRGB = async (item, c) => {
  if (!item || !item.Red || !item.Green || !item.Blue)
    return;
  await item.Red.setStateAsync(c.r);
  await item.Green.setStateAsync(c.g);
  await item.Blue.setStateAsync(c.b);
};
const getDecfromHue = async (item) => {
  var _a;
  if (!item || !item.hue)
    return null;
  const hue = await item.hue.getNumber();
  let saturation = Math.abs((_a = item.saturation && await item.saturation.getNumber()) != null ? _a : 1);
  if (saturation > 1)
    saturation = 1;
  if (hue === null)
    return null;
  const arr = Color.hsv2rgb(hue, saturation, 1);
  return String(Color.rgb_dec565({ r: arr[0], g: arr[1], b: arr[2] }));
};
const setHuefromRGB = async (item, c) => {
  if (!item || !item.hue || !Color.isRGB(c))
    return;
  if (!item.hue.writeable) {
    return;
  }
  const hue = Color.getHue(c.r, c.g, c.b);
  await item.hue.setStateAsync(hue);
};
function formatInSelText(Text) {
  if (Text === void 0 || Text === null)
    return `error`;
  let splitText = Text;
  if (typeof splitText === "string")
    splitText = splitText.replaceAll("__", "_").replaceAll("_", " ").split(" ");
  let lengthLineOne = 0;
  const arrayLineOne = [];
  for (let i = 0; i < splitText.length; i++) {
    lengthLineOne += splitText[i].length + 1;
    if (lengthLineOne > 12) {
      break;
    } else {
      arrayLineOne[i] = splitText[i];
    }
  }
  const textLineOne = arrayLineOne.join(" ");
  const arrayLineTwo = [];
  for (let i = arrayLineOne.length; i < splitText.length; i++) {
    arrayLineTwo[i] = splitText[i];
  }
  let textLineTwo = arrayLineTwo.join(" ");
  if (textLineTwo.length > 12) {
    textLineTwo = textLineTwo.substring(0, 9) + "...";
  }
  if (textLineOne.length != 0) {
    return textLineOne + "\r\n" + textLineTwo.trim();
  } else {
    return textLineTwo.trim();
  }
}
function getItemMesssage(msg) {
  var _a, _b, _c, _d, _e, _f;
  if (!msg || !msg.intNameEntity || !msg.type)
    return "~~~~~";
  const id = [];
  if (msg.mainId)
    id.push(msg.mainId);
  if (msg.subId)
    id.push(msg.subId);
  if (msg.intNameEntity)
    id.push(msg.intNameEntity);
  return getPayload(
    (_a = msg.type) != null ? _a : messageItemDefault.type,
    (_b = id.join("?")) != null ? _b : messageItemDefault.intNameEntity,
    (_c = msg.icon) != null ? _c : messageItemDefault.icon,
    (_d = msg.iconColor) != null ? _d : messageItemDefault.iconColor,
    (_e = msg.displayName) != null ? _e : messageItemDefault.displayName,
    (_f = msg.optionalValue) != null ? _f : messageItemDefault.optionalValue
  );
}
function getPayloadArray(s) {
  return s.join("~");
}
function getPayload(...s) {
  return s.join("~");
}
function deepAssign(def, source, level = 0) {
  if (level++ > 20) {
    throw new Error("Max level reached! Circulating object is suspected!");
  }
  for (const k in def) {
    if (typeof def[k] === "object") {
      if (source[k] === null || def[k] === null) {
        source[k] = void 0;
        def[k] = void 0;
      } else if (source[k] !== void 0) {
        def[k] = deepAssign(def[k], source[k]);
      } else if (def[k] !== void 0) {
        source[k] = def[k];
      }
    }
  }
  for (const k in source) {
    if (typeof source[k] === "object" && k in source) {
      if (source[k] === null) {
        source[k] = void 0;
        def[k] = void 0;
      } else if (def[k] === void 0) {
        def[k] = source[k];
      }
    }
  }
  return Object.assign(def, source);
}
function getInternalDefaults(type, role) {
  return {
    name: "",
    type,
    role,
    read: true,
    write: true
  };
}
function setTriggeredToState(theObject, exclude) {
  if (theObject instanceof Array) {
    for (let i = 0; i < theObject.length; i++) {
      setTriggeredToState(theObject[i], exclude);
    }
  } else {
    for (const prop in theObject) {
      if (exclude.indexOf(prop) !== -1)
        continue;
      if (prop == "type") {
        if (theObject[prop] === "triggered")
          theObject[prop] = "state";
      }
      if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
        setTriggeredToState(theObject[prop], exclude);
      }
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  GetIconColor,
  deepAssign,
  formatInSelText,
  getDecfromHue,
  getDecfromRGBThree,
  getEntryColor,
  getEntryTextOnOff,
  getIconEntryColor,
  getIconEntryValue,
  getInternalDefaults,
  getItemMesssage,
  getPayload,
  getPayloadArray,
  getRGBfromRGBThree,
  getScaledNumber,
  getSliderCTFromValue,
  getTemperaturColorFromValue,
  getTranslation,
  getValueEntryBoolean,
  getValueEntryNumber,
  getValueEntryString,
  ifValueEntryIs,
  messageItemDefault,
  setHuefromRGB,
  setRGBThreefromRGB,
  setScaledNumber,
  setSliderCTFromValue,
  setTriggeredToState,
  setValueEntry
});
//# sourceMappingURL=tools.js.map
