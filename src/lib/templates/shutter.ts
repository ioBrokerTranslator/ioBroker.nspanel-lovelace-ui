import * as Color from '../const/Color';
import { PageItemOptionsTemplate } from '../types/type-pageItem';

export const shutterTemplates: PageItemOptionsTemplate[] = [
    {
        /**
         * zu 100% geschlossen zu 0% geschlossen read und write mit jeweils 100-val benutzen um das zu 100% geöffnet zu ändern.
         */
        name: 'generic.shutter',
        role: '',
        type: 'shutter',
        adapter: '',
        data: {
            icon: {
                true: {
                    value: { type: 'const', constVal: 'window-shutter-open' },
                    color: { type: 'const', constVal: Color.Yellow },
                },
                false: {
                    value: { type: 'const', constVal: 'window-shutter' },
                    color: { type: 'const', constVal: Color.HMIOff },
                },
                scale: undefined,
                maxBri: undefined,
                minBri: undefined,
            },
            // 1. slider
            entity1: {
                // button
                value: { mode: 'auto', role: 'level.blind', type: 'triggered', dp: '' },
                decimal: undefined,
                factor: undefined,
                unit: undefined,
                minScale: { type: 'const', constVal: 0 },
                maxScale: { type: 'const', constVal: 100 },
            },
            // 2. slider
            entity2: {
                // button
                value: { mode: 'auto', role: 'level.tilt', type: 'triggered', dp: '' },
                decimal: undefined,
                factor: undefined,
                unit: undefined,
                minScale: { type: 'const', constVal: 0 },
                maxScale: { type: 'const', constVal: 100 },
            },
            text: {
                true: {
                    type: 'const',
                    constVal: 'text',
                },
                false: undefined,
            },
            headline: {
                type: 'const',
                constVal: 'Shutter',
            },
            text1: {
                true: {
                    type: 'const',
                    constVal: 'text1',
                },
                false: undefined,
            },
            text2: {
                true: {
                    type: 'const',
                    constVal: 'text2',
                },
                false: undefined,
            },
            up: {
                type: 'state',
                dp: '',
                mode: 'auto',
                role: ['button.open.blind', 'button.open'],
            },
            down: {
                type: 'state',
                dp: '',
                mode: 'auto',
                role: ['button.close.blind', 'button.close'],
            },
            up2: {
                type: 'state',
                dp: '',
                mode: 'auto',
                role: ['button.open.tilt'],
            },
            stop2: {
                type: 'state',
                dp: '',
                mode: 'auto',
                role: ['button.stop.tilt'],
            },
            /**
             * valueList string[]/stringify oder string?string?string?string stelle korreliert mit setList  {input_sel}
             */
            //valueList: { type: 'const', constVal: 'home?butter' },
            /**
             * setList: {id:Datenpunkt, value: zu setzender Wert}[] bzw. stringify  oder ein String nach dem Muster datenpunkt?Wert|Datenpunkt?Wert {input_sel}
             */
            //setList: { type: 'const', constVal: '0_userdata.0.test?1|0_userdata.0.test?2' },
        },
    },
    {
        role: '',
        type: 'shutter',
        name: 'shutter.shelly.2PM',
        template: 'shutter.basic.onlyV',
        adapter: '0_userdata.0',

        data: {
            // 1. slider
            entity1: {
                // button
                value: { mode: 'auto', role: 'level.blind', type: 'triggered', dp: '.Shutter.Position' },
                decimal: undefined,
                factor: undefined,
                unit: undefined,
                minScale: { type: 'const', constVal: 0 },
                maxScale: { type: 'const', constVal: 100 },
            },
            // 2. slider
            entity2: undefined,
            headline: {
                type: 'const',
                constVal: 'SHSW-25',
            },
            up: {
                type: 'state',
                dp: '.Shutter.Open',
                mode: 'auto',
                role: ['button'],
            },
            down: {
                type: 'state',
                dp: '.Shutter.Close',
                mode: 'auto',
                role: ['button'],
            },
            stop: {
                type: 'state',
                dp: '.Shutter.Pause',
                mode: 'auto',
                role: ['button'],
            },
        },
    },
    {
        role: '',
        type: 'shutter',
        name: 'shutter.basic',
        adapter: '',

        data: {
            up: undefined,
            down: undefined,
            stop: undefined,
            icon: {
                true: {
                    value: { type: 'const', constVal: 'window-shutter-open' },
                    color: { type: 'const', constVal: Color.Green },
                },
                false: {
                    value: { type: 'const', constVal: 'window-shutter' },
                    color: { type: 'const', constVal: Color.HMIOff },
                },
            },
            text: {
                true: {
                    type: 'const',
                    constVal: 'Shutter control',
                },
                false: undefined,
            },
            text1: {
                true: {
                    type: 'const',
                    constVal: 'up/down',
                },
                false: undefined,
            },
            text2: {
                true: {
                    type: 'const',
                    constVal: 'tilt',
                },
                false: undefined,
            },
        },
    },
    {
        role: '',
        type: 'shutter',
        name: 'shutter.basic.onlyV',
        template: 'shutter.basic',
        adapter: '',

        data: {
            up: undefined,
            down: undefined,
            text2: {
                true: null,
                false: null,
            },
        },
    },
    {
        role: '',
        type: 'shutter',
        name: 'shutter.deconz.ikea.fyrtur',
        template: 'shutter.basic.onlyV',
        adapter: 'deconz',

        data: {
            // 1. slider
            entity1: {
                // button
                value: { mode: 'auto', role: 'level.value', type: 'triggered', dp: '.lift' },
                decimal: undefined,
                factor: undefined,
                unit: undefined,
                minScale: { type: 'const', constVal: 1 },
                maxScale: { type: 'const', constVal: 78 },
            },
            up: { mode: 'auto', role: 'level.value', type: 'state', dp: '.lift', write: 'return 1' },

            down: { mode: 'auto', role: 'level.value', type: 'state', dp: '.lift', write: 'return 78' },
            stop: {
                type: 'state',
                dp: '.stop',
                mode: 'auto',
                role: ['button'],
            },
        },
    },
];
