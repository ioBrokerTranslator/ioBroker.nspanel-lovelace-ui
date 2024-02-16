import { Dataitem } from '../classes/data-item';
import {
    ColorEntryType,
    IconEntryType,
    MessageItem,
    PageItemLightDataItems,
    ScaledNumberType,
    TextEntryType,
    ValueEntryType,
} from '../types/type-pageItem';
import { Library } from '../classes/library';
import { RGB } from '../types/Color';
import {
    HMIOff,
    HMIOn,
    Interpolate,
    White,
    darken,
    getHue,
    hsv2rgb,
    isRGB,
    kelvinToRGB,
    rgb_dec565,
    scale,
} from './Color';
import { Icons } from './icon_mapping';
import { ChangeTypeOfKeys } from '../types/pages';

export const messageItemDefault: MessageItem = {
    type: 'input_sel',
    intNameEntity: '',
    icon: '',
    iconColor: '',
    displayName: '',
    optionalValue: '',
};
export function ifValueEntryIs(
    i: ChangeTypeOfKeys<ValueEntryType, Dataitem | undefined>,
    type: ioBroker.CommonType,
): boolean {
    if (i && i.value && i.value.type) return i.value.type === type;
    return false;
}
export async function setValueEntryNumber(
    i: ChangeTypeOfKeys<ValueEntryType, Dataitem | undefined>,
    value: number,
    s: boolean = true,
): Promise<void> {
    if (!i || !i.value) return;

    let res = value / ((i.factor && (await i.factor.getNumber())) ?? 1);
    if (s && i.minScale !== undefined && i.maxScale !== undefined) {
        const min = await i.minScale.getNumber();
        const max = await i.maxScale.getNumber();
        if (min !== null && max !== null) {
            res = Math.round(scale(res, 0, 100, min, max));
        }
    }
    if (i.set && i.set.writeable) await i.set.setStateAsync(res);
    else await i.value.setStateAsync(res);
}
export async function getValueEntryNumber(
    i: ChangeTypeOfKeys<ValueEntryType, Dataitem | undefined>,
    s: boolean = true,
): Promise<number | null> {
    if (!i) return null;
    const nval = i.value && (await i.value.getNumber());
    if (nval !== null && nval !== undefined) {
        let res = nval * ((i.factor && (await i.factor.getNumber())) ?? 1);
        if (s && i.minScale !== undefined && i.maxScale !== undefined) {
            const min = await i.minScale.getNumber();
            const max = await i.maxScale.getNumber();
            if (min !== null && max !== null) {
                res = scale(res, min, max, 0, 100);
            }
        }
        return res;
    }
    return null;
}
function getScaledNumberRaw(
    n: number,
    min: number | null,
    max: number | null,
    oldValue: number | null | false = null,
): number {
    if (min !== null && max !== null) {
        if (oldValue === null) {
            n = Math.round(scale(n, min, max, 0, 100));
        } else {
            n = scale(n, 0, 100, min, max);
            if (oldValue !== false) {
                if (oldValue >= n) n = Math.floor(n);
                else n = Math.ceil(n);
            } else {
                n = Math.round(n);
            }
        }
    }
    return n;
}

export async function getScaledNumber(
    i: ChangeTypeOfKeys<ScaledNumberType, Dataitem | undefined>,
): Promise<number | null> {
    if (!i) return null;
    let nval = i.value && (await i.value.getNumber());
    if (nval !== null && nval !== undefined) {
        if (i.minScale !== undefined && i.maxScale !== undefined) {
            const min = await i.minScale.getNumber();
            const max = await i.maxScale.getNumber();
            nval = getScaledNumberRaw(nval, min, max);
        }
        return nval;
    }
    return null;
}

export async function getTemperaturColorFromValue(
    i: ChangeTypeOfKeys<ScaledNumberType, Dataitem | undefined>,
    dimmer: number = 100,
): Promise<string | null> {
    if (!i) return null;
    let nval = i.value && (await i.value.getNumber());
    const mode = i.mode && (await i.mode.getString());
    let kelvin = 3500;
    if (nval !== null && nval !== undefined) {
        if (i.minScale !== undefined && i.maxScale !== undefined) {
            const min = await i.minScale.getNumber();
            const max = await i.maxScale.getNumber();
            nval = getScaledNumberRaw(nval, min, max);
        }
        if (mode === 'mired') {
            kelvin = 10 ** 6 / nval;
        } else {
            kelvin = nval;
        }
        kelvin = kelvin > 7000 ? 7000 : kelvin < 1800 ? 1800 : kelvin;

        let r = kelvinToRGB[Math.trunc(kelvin / 100) * 100];
        r = darken(r, scale(dimmer, 100, 0, 0, 1));
        return r ? String(rgb_dec565(r)) : null;
    }
    return null;
}

export async function getSliderCTFromValue(
    i: ChangeTypeOfKeys<ScaledNumberType, Dataitem | undefined>,
): Promise<string | null> {
    if (!i) return null;
    let nval = i.value && (await i.value.getNumber());
    const mode = i.mode && (await i.mode.getString());
    let r = 3500;
    if (nval !== null && nval !== undefined) {
        if (i.minScale !== undefined && i.maxScale !== undefined) {
            const min = await i.minScale.getNumber();
            const max = await i.maxScale.getNumber();
            if (min !== null && max !== null) nval = Math.round(scale(nval, min, max, 1800, 7000));
        }
        if (mode === 'mired') {
            r = 10 ** 6 / nval;
        } else {
            r = nval;
        }
        r = r > 7000 ? 7000 : r < 1800 ? 1800 : r;

        r = getScaledNumberRaw(r, 1800, 7000);
        return r !== null ? String(r) : null;
    }
    return null;
}
export async function setSliderCTFromValue(
    i: ChangeTypeOfKeys<ScaledNumberType, Dataitem | undefined>,
    value: number,
): Promise<void> {
    if (!i || !i.value) return;
    const nval = (i.value && (await i.value.getNumber())) ?? null;
    const mode = i.mode && (await i.mode.getString());
    //value = 100 - value;
    if (nval !== null) {
        let r = getScaledNumberRaw(value, 1800, 7000, false);
        r = r > 7000 ? 7000 : r < 1800 ? 1800 : r;
        if (mode === 'mired') {
            r = 10 ** 6 / r;
        }
        if (i.minScale !== undefined && i.maxScale !== undefined) {
            const min = await i.minScale.getNumber();
            const max = await i.maxScale.getNumber();
            if (min !== null && max !== null) r = Math.round(scale(nval, 1800, 7000, min, max));
        }
        if (i.set && i.set.writeable) await i.value.setStateAsync(r);
        else if (nval !== value) await i.value.setStateAsync(r);
    }
}

export async function setScaledNumber(
    i: ChangeTypeOfKeys<ScaledNumberType, Dataitem | undefined>,
    value: number,
): Promise<void> {
    if (!i || !i.value) return;
    const nval = (await i.value.getNumber()) ?? null;
    if (nval !== null) {
        if (i.minScale !== undefined && i.maxScale !== undefined) {
            value = getScaledNumberRaw(value, await i.minScale.getNumber(), await i.maxScale.getNumber(), value);
        }
        if (i.set && i.set.writeable) await i.value.setStateAsync(value);
        else if (nval !== value) await i.value.setStateAsync(value);
    }
}

export async function getIconEntryValue(
    i: ChangeTypeOfKeys<IconEntryType, Dataitem | undefined> | undefined,
    on: boolean | null,
    def: string,
    defOff: string | null = null,
): Promise<string> {
    if (i === undefined) return '';
    on = on ?? true;
    if (!i) return Icons.GetIcon(on ? def : defOff ?? def);
    const text = (i.true && i.true.text && (await i.true.text.getString())) ?? null;
    if (text !== null) {
        if (!on) return (i.false && i.false.text && (await i.false.text.getString())) ?? text;
        return text;
    }
    const icon = (i.true && i.true.value && (await i.true.value.getString())) ?? null;
    if (!on) {
        return Icons.GetIcon((i.false && i.false.value && (await i.false.value.getString())) ?? defOff ?? icon ?? def);
    }
    return Icons.GetIcon(icon ?? def);
}
export async function getIconEntryColor(
    i: ChangeTypeOfKeys<IconEntryType, Dataitem | undefined> | undefined,
    on: boolean | number | null,
    def: string | RGB | number,
    defOff: string | RGB | null = null,
): Promise<string> {
    on = on ?? true;
    if (typeof def === 'number') def = String(def);
    else if (typeof def !== 'string') def = String(rgb_dec565(def));

    if (typeof defOff === 'number') defOff = String(def);
    else if (defOff === null) defOff = null;
    else if (typeof defOff !== 'string') defOff = String(rgb_dec565(defOff));

    if (!i) return def;
    const icon = i.true && i.true.color && (await i.true.color.getRGBDec());
    if (!on) {
        return (i.false && i.false.color && (await i.false.color.getRGBDec())) ?? defOff ?? icon ?? def;
    }
    return icon ?? def;
}
export async function GetIconColor(
    item: ChangeTypeOfKeys<IconEntryType, Dataitem | undefined> | undefined | RGB,
    value: boolean | number | null,
    min: number | null = null,
    max: number | null = null,
    offColor: RGB | null = null,
): Promise<string> {
    // dimmer
    if (item === undefined) return '';
    if (isRGB(item)) {
        const onColor = item;
        if (typeof value === 'number') {
            let val: number = typeof value === 'number' ? value : 0;
            const maxValue = max ?? 100;
            const minValue = min ?? 0;
            val = val > maxValue ? maxValue : val;
            val = val < minValue ? minValue : val;
            return String(
                rgb_dec565(
                    !offColor
                        ? darken(onColor ? onColor : HMIOn, scale(100 - val, minValue, maxValue, 0, 1))
                        : Interpolate(offColor, onColor ? onColor : HMIOn, scale(100 - val, minValue, maxValue, 0, 1)),
                ),
            );
        }
        if (value) {
            return String(rgb_dec565(onColor ? onColor : HMIOn));
        }
        return String(rgb_dec565(offColor ? offColor : HMIOff));
    } else {
        const onColor = item.true && item.true.color && (await item.true.color.getRGBValue());
        const offColor = item.false && item.false.color && (await item.false.color.getRGBValue());
        if (typeof value === 'number') {
            let val: number = typeof value === 'number' ? value : 0;
            const maxValue = ((item.maxBri && (await item.maxBri.getNumber())) || max) ?? 100;
            const minValue = ((item.minBri && (await item.minBri.getNumber())) || min) ?? 0;
            val = val > maxValue ? maxValue : val;
            val = val < minValue ? minValue : val;
            return String(
                rgb_dec565(
                    !offColor
                        ? darken(onColor ? onColor : HMIOn, scale(100 - val, minValue, maxValue, 0, 1))
                        : Interpolate(offColor, onColor ? onColor : HMIOn, scale(100 - val, minValue, maxValue, 0, 1)),
                ),
            );
        }

        if (value) {
            return String(rgb_dec565(onColor ? onColor : HMIOn));
        }
        return String(rgb_dec565(offColor ? offColor : HMIOff));
    }
}

export async function getEntryColor(
    i: ChangeTypeOfKeys<ColorEntryType, Dataitem | undefined> | undefined,
    value: boolean | number,
    def: string | number | RGB,
): Promise<string> {
    if (i === undefined) return '';
    if (typeof def === 'number') def = String(def);
    else if (typeof def !== 'string') def = String(rgb_dec565(def));
    if (!i) return def;
    const color = i.true && (await i.true.getRGBDec());
    if (!value) {
        return (i.false && (await i.false.getRGBDec())) ?? color ?? def;
    }
    return color ?? def;
}
export async function getEntryTextOnOff(
    i: ChangeTypeOfKeys<TextEntryType, Dataitem | undefined> | undefined,
    on: boolean | null,
): Promise<string | null> {
    if (!i) return null;
    const value = i.true && (await i.true.getString());
    if (!(on ?? true)) {
        return (i.false && (await i.false.getString())) ?? value ?? null;
    }
    return value ?? null;
}

export async function getValueEntryBoolean(
    i: ChangeTypeOfKeys<ValueEntryType, Dataitem | undefined> | undefined,
): Promise<boolean | null> {
    if (!i) return null;
    const nval = i.value && (await i.value.getBoolean());
    if (nval !== undefined) {
        return nval;
    }
    return null;
}

export async function getValueEntryString(
    i: ChangeTypeOfKeys<ValueEntryType, Dataitem | undefined> | undefined,
    v: number | null = null,
): Promise<string | null> {
    if (!i || !i.value) return null;
    const nval = v !== null ? v : await getValueEntryNumber(i);
    if (nval !== null && nval !== undefined) {
        const d = (i.decimal && (await i.decimal.getNumber())) ?? null;
        let result: string = String(nval);
        if (d !== null) {
            result = nval.toFixed(d);
        }
        return result + ((i.unit && (await i.unit.getString())) ?? '');
    }
    const res = await i.value.getString();
    if (res != null) res + ((i.unit && (await i.unit.getString())) ?? '');
    return res;
}

export function getTranslation(library: Library, key1: any | string, key2?: string): string {
    let result = key2 ?? key1;
    if (key2 !== undefined) {
        result = library.getLocalTranslation(key1, key2);
    }
    result = library.getTranslation(result || key1);
    return result;
}

export const getRGBfromRGBThree = async (item: PageItemLightDataItems['data']): Promise<RGB | null> => {
    if (!item) return White;
    const red = (item.Red && (await item.Red.getNumber())) ?? -1;
    const green = (item.Green && (await item.Green.getNumber())) ?? -1;
    const blue = (item.Blue && (await item.Blue.getNumber())) ?? -1;
    if (red === -1 || blue === -1 || green === -1) return null;
    return { r: red, g: green, b: blue };
};
export const getDecfromRGBThree = async (item: PageItemLightDataItems['data']): Promise<string | null> => {
    const rgb = await getRGBfromRGBThree(item);
    if (!rgb) return null;
    return String(rgb_dec565(rgb));
};
export const setRGBThreefromRGB = async (item: PageItemLightDataItems['data'], c: RGB): Promise<void> => {
    if (!item || !item.Red || !item.Green || !item.Blue) return;
    await item.Red.setStateAsync(c.r);
    await item.Green.setStateAsync(c.g);
    await item.Blue.setStateAsync(c.b);
};

export const getDecfromHue = async (item: PageItemLightDataItems['data']): Promise<string | null> => {
    if (!item || !item.hue) return null;
    const hue = await item.hue.getNumber();
    let saturation = Math.abs((item.saturation && (await item.saturation.getNumber())) ?? 1);
    if (saturation > 1) saturation = 1;
    if (hue === null) return null;
    const arr = hsv2rgb(hue, saturation, 1);
    return String(rgb_dec565({ r: arr[0], g: arr[1], b: arr[2] }));
};

export const setHuefromRGB = async (item: PageItemLightDataItems['data'], c: RGB): Promise<void> => {
    if (!item || !item.hue || !isRGB(c)) return;
    if (!item.hue.writeable) {
        return;
    }
    //let saturation = Math.abs((item.saturation && (await item.saturation.getNumber())) ?? 1);
    //if (saturation > 1) saturation = 1;
    const hue = getHue(c.r, c.g, c.b);
    await item.hue.setStateAsync(hue);
};

export function formatInSelText(Text: string[] | string): string {
    if (Text === undefined || Text === null) return `error`;
    let splitText = Text;
    if (typeof splitText === 'string') splitText = splitText.replaceAll('__', '_').replaceAll('_', ' ').split(' ');

    let lengthLineOne = 0;
    const arrayLineOne: string[] = [];
    for (let i = 0; i < splitText.length; i++) {
        lengthLineOne += splitText[i].length + 1;
        if (lengthLineOne > 12) {
            break;
        } else {
            arrayLineOne[i] = splitText[i];
        }
    }
    const textLineOne = arrayLineOne.join(' ');
    const arrayLineTwo: string[] = [];
    for (let i = arrayLineOne.length; i < splitText.length; i++) {
        arrayLineTwo[i] = splitText[i];
    }
    let textLineTwo = arrayLineTwo.join(' ');
    if (textLineTwo.length > 12) {
        textLineTwo = textLineTwo.substring(0, 9) + '...';
    }
    if (textLineOne.length != 0) {
        return textLineOne + '\r\n' + textLineTwo.trim();
    } else {
        return textLineTwo.trim();
    }
}

/**
 * Create a part of the panel messsage for bottom icons. if event === '' u get '~~~~~~'.
 * default for event: input_sel
 * @param msg {Partial<MessageItem>}
 * @returns string
 */
export function getItemMesssage(msg: Partial<MessageItem> | undefined): string {
    if (!msg || !msg.intNameEntity || !msg.type) return '~~~~~';
    const id: string[] = [];
    if (msg.mainId) id.push(msg.mainId);
    if (msg.subId) id.push(msg.subId);
    if (msg.intNameEntity) id.push(msg.intNameEntity);
    return getPayload(
        msg.type ?? messageItemDefault.type,
        id.join('?') ?? messageItemDefault.intNameEntity,
        msg.icon ?? messageItemDefault.icon,
        msg.iconColor ?? messageItemDefault.iconColor,
        msg.displayName ?? messageItemDefault.displayName,
        msg.optionalValue ?? messageItemDefault.optionalValue,
    );
}

export function getPayloadArray(s: (string | any)[]): string {
    return s.join('~');
}
export function getPayload(...s: string[]): string {
    return s.join('~');
}

/**
 * Deep assign of jsons, dont use this for Json with objects/classes
 * @param def Json with json, number, boolean, strings, null, undefined
 * @param source Json with json, number, boolean, strings, null, undefined
 * @param level ignore
 * @returns
 */
export function deepAssign(def: Record<any, any>, source: Record<any, any>, level: number = 0): Record<string, any> {
    if (level++ > 20) {
        throw new Error('Max level reached! Circulating object is suspected!');
    }
    for (const k in def) {
        const entry = def[k];
        if (typeof def[k] === 'object') {
            if (k in source) {
                if (source[k] !== undefined) deepAssign(entry, source[k]);
                def[k] = Object.assign(def[k], source[k]);
            }
        }
    }
    return Object.assign(def, source);
}
