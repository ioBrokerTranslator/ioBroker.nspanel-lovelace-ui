import { PanelSend } from './panel-message';

import { Screensaver, ScreensaverConfigType } from '../pages/screensaver';
import * as Types from '../types/types';
import * as pages from '../types/pages';
import { Controller } from './controller';
import { AdapterClassDefinition, BaseClass } from '../classes/library';
import { callbackMessageType } from '../classes/mqtt';
import { ReiveTopicAppendix, genericStateObjects } from '../const/definition';
import { Page, PageConfigAll, PageInterface } from '../classes/Page';
import { PageMedia } from '../pages/pageMedia';
import { IClientPublishOptions } from 'mqtt';
import { StatesControler } from './states-controller';
import { PageGrid } from '../pages/pageGrid';
import { Navigation, NavigationConfig } from '../classes/navigation';
import { PageThermo } from '../pages/pageThermo';
import { PagePower } from '../pages/pagePower';
import { PageItem } from '../pages/pageItem';
import { PageEntities } from '../pages/pageEntities';
import { getInternalDefaults } from '../const/tools';
import { PageNotify } from '../pages/pageNotification';
import { systemNotifications } from '../const/notifications';

export interface panelConfigPartial extends Partial<panelConfigTop> {
    format?: Partial<Intl.DateTimeFormatOptions>;
    controller: Controller;
    topic: string;
    name: string;
    pages: PageConfigAll[];
    navigation: NavigationConfig['navigationConfig'];
    config: ScreensaverConfigType;
}
export function isPanelConfig(F: object | panelConfig): F is panelConfig {
    if ((F as panelConfig).controller === undefined) return false;
    if ((F as panelConfig).pages === undefined) return false;
    if ((F as panelConfig).topic === undefined) return false;
    if ((F as panelConfig).name === undefined) return false;
    return true;
}
type panelConfig = panelConfigTop & {
    format: Intl.DateTimeFormatOptions;
    controller: Controller;
    topic: string;
    name: string;
    pages: PageConfigAll[];
    config: ScreensaverConfigType;
    navigation: NavigationConfig['navigationConfig'];
};

const DefaultOptions = {
    format: {
        weekday: 'short',
        month: 'short',
        year: 'numeric',
        day: 'numeric',
    },
    CustomFormat: '',
    locale: 'de-DE',
    pages: [],
};

type panelConfigTop = {
    CustomFormat: string;
    locale: Intl.LocalesArgument;
    timeout: number;
    dimLow: number;
    dimHigh: number;
};

export class Panel extends BaseClass {
    private minuteLoopTimeout: ioBroker.Timeout | undefined;
    private pages: (Page | undefined)[] = [];
    private _activePage: Page | undefined = undefined;
    private screenSaver: Screensaver | undefined;
    private InitDone: boolean = false;
    dimMode: { low: number; high: number };
    readonly navigation: Navigation;
    readonly format: Partial<Intl.DateTimeFormatOptions>;
    readonly controller: Controller;
    readonly topic: string;
    readonly reivCallbacks: callbackMessageType[] = [];
    private _isOnline: boolean = false;
    readonly panelSend: PanelSend;
    readonly statesControler: StatesControler;
    readonly config: ScreensaverConfigType;
    timeout: number;
    readonly CustomFormat: string;
    readonly sendToTasmota: (topic: string, payload: string, opt?: IClientPublishOptions) => void = () => {};
    public persistentPageItems: Record<string, PageItem> = {};

    info: Types.PanelInfo = {
        nspanel: {
            displayVersion: 0,
            model: '',
            bigIconLeft: false,
            bigIconRight: false,
            isOnline: false,
            currentPage: '',
        },
        tasmota: {
            net: {
                ip: '',
                gateway: '',
                dnsserver: '',
                subnetmask: '',
                hostname: '',
                mac: '',
            },
            uptime: '',
            wifi: { ssid: '', rssi: 0, downtime: '' },
        },
    };
    friendlyName: string = '';

    constructor(adapter: AdapterClassDefinition, options: panelConfigPartial) {
        super(adapter, options.name);
        this.friendlyName = options.name;
        this.panelSend = new PanelSend(adapter, {
            name: `${options.name}-SendClass`,
            mqttClient: options.controller.mqttClient,
            topic: options.topic,
        });
        this.timeout = options.timeout || 15;

        this.CustomFormat = options.CustomFormat ?? '';
        this.config = options.config;
        this.format = Object.assign(DefaultOptions.format, options.format);
        this.controller = options.controller;
        this.topic = options.topic;
        if (typeof this.panelSend.addMessage === 'function') this.sendToPanelClass = this.panelSend.addMessage;
        if (typeof this.panelSend.addMessageTasmota === 'function')
            this.sendToTasmota = this.panelSend.addMessageTasmota;
        this.statesControler = options.controller.statesControler;

        this.dimMode = { low: options.dimLow ?? 70, high: options.dimHigh ?? 90 };
        options.pages = options.pages.concat(systemNotifications);
        let scsFound = 0;
        for (let a = 0; a < options.pages.length; a++) {
            let pageConfig = options.pages[a];

            if (!pageConfig) continue;
            const pmconfig = {
                card: pageConfig.card,
                panel: this,
                id: String(a),
                name: pageConfig.uniqueID,
                alwaysOn: pageConfig.alwaysOn,
                adapter: this.adapter,
                panelSend: this.panelSend,
                dpInit: pageConfig.dpInit,
            };
            switch (pageConfig.card) {
                case 'cardChart': {
                    break;
                }
                case 'cardLChart': {
                    break;
                }
                case 'cardEntities': {
                    pageConfig = Page.getPage(pageConfig, this);
                    this.pages[a] = new PageEntities(pmconfig, pageConfig);
                    break;
                }
                case 'cardGrid2':
                case 'cardGrid': {
                    pageConfig = Page.getPage(pageConfig, this);
                    this.pages[a] = new PageGrid(pmconfig, pageConfig);
                    break;
                }

                case 'cardThermo': {
                    pageConfig = Page.getPage(pageConfig, this);
                    this.pages[a] = new PageThermo(pmconfig, pageConfig);
                    break;
                }
                case 'cardMedia': {
                    pageConfig = Page.getPage(pageConfig, this);
                    this.pages[a] = new PageMedia(pmconfig, pageConfig);
                    break;
                }
                case 'cardUnlock': {
                    break;
                }
                case 'cardQR': {
                    break;
                }
                case 'cardAlarm': {
                    break;
                }
                case 'cardPower': {
                    pageConfig = Page.getPage(pageConfig, this);
                    this.pages[a] = new PagePower(pmconfig, pageConfig);
                    break;
                }
                case 'cardBurnRec':
                case 'cardItemSpecial':
                    break;
                case 'popupNotify2':
                case 'popupNotify': {
                    pageConfig = Page.getPage(pageConfig, this);
                    this.pages[a] = new PageNotify(pmconfig, pageConfig);
                    break;
                }
                case 'screensaver':
                case 'screensaver2': {
                    if (scsFound++ > 0) continue;

                    //const opt = Object.assign(DefaultOptions, pageConfig);
                    const ssconfig: PageInterface = {
                        card: pageConfig.card,
                        panel: this,
                        id: String(a),
                        name: 'SrS',
                        adapter: this.adapter,
                        panelSend: this.panelSend,
                        dpInit: '',
                    };
                    this.screenSaver = new Screensaver(ssconfig, pageConfig);
                    this.pages[a] = this.screenSaver;
                    break;
                }
            }
        }
        if (scsFound === 0 || this.screenSaver === undefined) {
            this.log.error('no screensaver found! Stop!');
            this.adapter.controller!.delete();
            throw new Error('no screensaver found! Stop!');
            return;
        }
        const navConfig: NavigationConfig = {
            adapter: this.adapter,
            panel: this,
            navigationConfig: options.navigation,
        };
        this.navigation = new Navigation(navConfig);
    }

    init = async (): Promise<void> => {
        this.controller.mqttClient.subscript(this.topic + '/tele/#', this.onMessage);
        this.controller.mqttClient.subscript(this.topic + '/stat/#', this.onMessage);
        this.sendToTasmota(this.topic + '/cmnd/STATUS0', '');
        this.isOnline = false;
    };
    start = async (): Promise<void> => {
        this.adapter.subscribeStates(`panels.${this.name}.cmd.*`);
        genericStateObjects.panel.panels._channel.common.name = this.friendlyName;
        await this.library.writedp(`panels.${this.name}`, undefined, genericStateObjects.panel.panels._channel);
        await this.library.writedp(
            `panels.${this.name}.cmd`,
            undefined === 'ON',
            genericStateObjects.panel.panels.cmd._channel,
        );
        await this.library.writedp(
            `panels.${this.name}.alarm`,
            undefined === 'ON',
            genericStateObjects.panel.panels.alarm._channel,
        );

        let state = this.library.readdb(`panels.${this.name}.cmd.dimStandby`);
        if (state && state.val) this.dimMode.low = state.val as number;
        state = this.library.readdb(`panels.${this.name}.cmd.dimActive`);
        if (state && state.val) this.dimMode.high = state.val as number;
        this.library.writedp(
            `panels.${this.name}.cmd.dimStandby`,
            this.dimMode.low,
            genericStateObjects.panel.panels.cmd.dimStandby,
        );
        this.library.writedp(
            `panels.${this.name}.cmd.dimActive`,
            this.dimMode.high,
            genericStateObjects.panel.panels.cmd.dimActive,
        );

        for (const page of this.pages) {
            if (page) {
                this.log.debug('init page ' + page.name);
                await page.init();
            }
        }

        state = this.library.readdb(`panels.${this.name}.cmd.screensaverTimeout`);
        if (state) {
            this.timeout = parseInt(String(state.val));
        }
        this.library.writedp(
            `panels.${this.name}.cmd.screensaverTimeout`,
            this.timeout,
            genericStateObjects.panel.panels.cmd.screensaverTimeout,
        );

        this.navigation.init();
        const currentPage = this.library.readdb(`panels.${this.name}.cmd.mainPage`);
        if (currentPage && currentPage.val) {
            this.navigation.setMainPageByName(String(currentPage.val));
        }
        const states = this.navigation.buildCommonStates();
        const page = this.navigation.getCurrentMainPoint();
        this.library.writedp(`panels.${this.name}.cmd.mainPage`, page, {
            _id: '',
            type: 'state',
            common: {
                name: 'StateObjects.mainPage',
                type: 'string',
                role: 'value.text',
                read: true,
                write: true,
                states: states,
            },
            native: {},
        });

        state = this.library.readdb(`panels.${this.name}.info.nspanel.bigIconLeft`);
        this.info.nspanel.bigIconLeft = state ? !!state.val : false;
        state = this.library.readdb(`panels.${this.name}.info.nspanel.bigIconRight`);
        this.info.nspanel.bigIconRight = state ? !!state.val : false;

        //done with states
        await this.statesControler.setInternalState(
            `${this.name}/cmd/screensaverTimeout`,
            this.timeout,
            true,
            getInternalDefaults('number', 'value'),
            this.onInternalCommand,
        );
        await this.statesControler.setInternalState(
            `${this.name}/cmd/dimStandby`,
            this.timeout,
            true,
            getInternalDefaults('number', 'value'),
            this.onInternalCommand,
        );

        await this.statesControler.setInternalState(
            `${this.name}/cmd/dimActive`,
            this.timeout,
            true,
            getInternalDefaults('number', 'value'),
            this.onInternalCommand,
        );
        await this.statesControler.setInternalState(
            `${this.name}/cmd/bigIconLeft`,
            true,
            true,
            getInternalDefaults('boolean', 'indicator'),
            this.onInternalCommand,
        );
        await this.statesControler.setInternalState(
            `${this.name}/cmd/bigIconRight`,
            true,
            true,
            getInternalDefaults('boolean', 'indicator'),
            this.onInternalCommand,
        );
        await this.statesControler.setInternalState(`${this.name}/cmd/power1`, false, true, {
            name: 'power1',
            type: 'boolean',
            write: false,
            read: true,
            role: 'value',
        });
        await this.statesControler.setInternalState(`${this.name}/cmd/power2`, false, true, {
            name: 'power1',
            type: 'boolean',
            write: false,
            read: true,
            role: 'value',
        });
        this.sendToTasmota(this.topic + '/cmnd/POWER1', '');
        this.sendToTasmota(this.topic + '/cmnd/POWER2', '');
        this.sendToPanel('pageType~pageStartup', { retain: true });
    };

    private sendToPanelClass: (payload: string, opt?: IClientPublishOptions) => void = () => {};
    protected sendToPanel: (payload: string, opt?: IClientPublishOptions) => void = (
        payload: string,
        opt?: IClientPublishOptions,
    ) => {
        this.sendToPanelClass(payload, opt);
    };
    async setActivePage(_notSleep?: boolean): Promise<void>;
    async setActivePage(_page?: Page | boolean | undefined): Promise<void>;
    async setActivePage(_page?: Page | boolean | undefined, _notSleep?: boolean): Promise<void> {
        if (_page === undefined) return;
        let page = this._activePage;
        let sleep = false;
        if (typeof _page === 'boolean') {
            sleep = !_page;
        } else {
            page = _page;
            sleep = _notSleep ?? false;
        }
        if (!this._activePage) {
            if (page === undefined) return;
            page.setLastPage(this._activePage ?? undefined);
            await page.setVisibility(true);

            this._activePage = page;
        } else if (sleep !== this._activePage.sleep || page !== this._activePage) {
            if (page != this._activePage) {
                if (this._activePage) await this._activePage.setVisibility(false);
                if (page) {
                    page.setLastPage(this._activePage ?? undefined);
                    if (!sleep) await page.setVisibility(true);
                    page.sleep = sleep;
                    this._activePage = page;
                }
            } else if (sleep !== this._activePage.sleep) {
                page.setLastPage(this._activePage ?? undefined);
                if (!sleep) await this._activePage.setVisibility(true, true);
                this._activePage.sleep = sleep;
            }
        }
    }
    getActivePage(): Page {
        if (!this._activePage) throw new Error(`No active page here, check code!`);
        return this._activePage;
    }
    get isOnline(): boolean {
        return this._isOnline;
    }
    set isOnline(s: boolean) {
        this.info.nspanel.isOnline = s;
        if (s !== this._isOnline) {
            this.library.writedp(
                `panels.${this.name}.info.nspanel.isOnline`,
                s,
                genericStateObjects.panel.panels.info.nspanel.isOnline,
            );
            if (s) {
                this.log.info('is online!');
            } else {
                this.log.warn('is offline!');
            }
        }
        this._isOnline = s;
    }
    async isValid(): Promise<true> {
        return true;
    }

    registerOnMessage(fn: callbackMessageType): void {
        if (this.reivCallbacks.indexOf(fn) === -1) {
            this.reivCallbacks.push(fn);
        }
    }
    onMessage: callbackMessageType = async (topic: string, message: string) => {
        for (const fn of this.reivCallbacks) {
            if (fn) fn(topic, message);
        }
        if (topic.endsWith(ReiveTopicAppendix)) {
            //this.log.debug(`Receive message ${topic} with ${message}`);
            const event: Types.IncomingEvent | null = this.convertToEvent(message);
            if (event) {
                this.HandleIncomingMessage(event);
            }
        } else {
            const command = (topic.match(/[0-9a-zA-Z]+?\/[0-9a-zA-Z]+$/g) ||
                [])[0] as Types.TasmotaIncomingTopics | null;
            if (command) {
                //this.log.debug(`Receive other message ${topic} with ${message}`);
                switch (command) {
                    case 'stat/POWER2': {
                        this.library.writedp(
                            `panels.${this.name}.cmd.power2`,
                            message === 'ON',
                            genericStateObjects.panel.panels.cmd.power2,
                        );
                        this.statesControler.setInternalState(`${this.name}/cmd/power2`, message === 'ON', true);
                        break;
                    }
                    case 'stat/POWER1': {
                        this.library.writedp(
                            `panels.${this.name}.cmd.power1`,
                            message === 'ON',
                            genericStateObjects.panel.panels.cmd.power1,
                        );
                        this.statesControler.setInternalState(`${this.name}/cmd/power1`, message === 'ON', true);
                        break;
                    }
                    case 'stat/STATUS0': {
                        const data = JSON.parse(message) as Types.STATUS0;
                        this.name = this.library.cleandp(data.StatusNET.Mac, false, true);
                        if (!this.InitDone) {
                            this.sendToTasmota(
                                this.topic + '/cmnd/Rule3',
                                'ON CustomSend DO RuleTimer1 120 ENDON ON Rules#Timer=1 DO CustomSend pageType~pageStartup ENDON',
                            );
                            this.sendToTasmota(this.topic + '/cmnd/Rule3', 'ON');
                            await this.start();
                            this.InitDone = true;
                        }
                        this.library.writedp(
                            `panels.${this.name}.info`,
                            undefined,
                            genericStateObjects.panel.panels.info._channel,
                        );
                        this.library.writedp(
                            `panels.${this.name}.info.status`,
                            message,
                            genericStateObjects.panel.panels.info.status,
                        );
                        this.info.tasmota.net = {
                            ip: data.StatusNET.IPAddress,
                            gateway: data.StatusNET.Gateway,
                            dnsserver: data.StatusNET.DNSServer1,
                            subnetmask: data.StatusNET.Subnetmask,
                            hostname: data.StatusNET.Hostname,
                            mac: data.StatusNET.Mac,
                        };
                        this.info.tasmota.uptime = data.StatusSTS.Uptime;
                        this.info.tasmota.wifi = {
                            ssid: data.StatusSTS.Wifi.SSId,
                            rssi: data.StatusSTS.Wifi.RSSI,
                            downtime: data.StatusSTS.Wifi.Downtime,
                        };
                        await this.library.writeFromJson(
                            `panels.${this.name}.info.tasmota`,
                            'panel.panels.info.tasmota',
                            genericStateObjects,
                            this.info.tasmota,
                        );
                    }
                }
            }
        }
    };

    async onStateChange(id: string, state: ioBroker.State): Promise<void> {
        if (state.ack) return;
        if (id.split('.')[1] === this.name) {
            const cmd = id.replace(`panels.${this.name}.cmd.`, '');
            switch (cmd) {
                case 'power1': {
                    this.sendToTasmota(this.topic + '/cmnd/POWER1', state.val ? 'ON' : 'OFF');
                    break;
                }
                case 'power2': {
                    this.sendToTasmota(this.topic + '/cmnd/POWER2', state.val ? 'ON' : 'OFF');
                    break;
                }
                case 'mainPage': {
                    this.navigation.setMainPageByName(state.val ? String(state.val) : 'main');
                    this.library.writedp(`panels.${this.name}.cmd.mainPage`, state.val ? String(state.val) : 'main');
                    break;
                }
                case 'screensaverTimeout': {
                    this.statesControler.setInternalState(
                        `${this.name}/cmd/screensaverTimeout`,
                        parseInt(String(state.val)),
                        false,
                    );
                    break;
                }
                case 'dimStandby': {
                    this.statesControler.setInternalState(
                        `${this.name}/cmd/dimStandby`,
                        parseInt(String(state.val)),
                        false,
                    );
                    break;
                }
                case 'dimActive': {
                    this.statesControler.setInternalState(
                        `${this.name}/cmd/dimActive`,
                        parseInt(String(state.val)),
                        false,
                    );
                    break;
                }
            }
        }
    }

    /**
     * timeout screensaver after sec
     * @param sec seconds for timeout
     */
    sendScreeensaverTimeout(sec: number): void {
        this.log.debug(`Set screeensaver timeout to ${sec}s.`);
        this.sendToPanel(`timeout~${sec}`);
    }

    sendDimmode(): void {
        this.sendToPanel(`dimmode~${this.dimMode.low}~${this.dimMode.high}~` + String(1));
    }

    restartLoops(): void {
        if (this.minuteLoopTimeout) this.adapter.clearTimeout(this.minuteLoopTimeout);
        this.minuteLoop();
    }
    /**
     * Do panel work always at full minute
     * @returns void
     */
    minuteLoop = (): void => {
        if (this.unload) return;
        //this.sendToPanel(`time~${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`);

        this.pages = this.pages.filter((a) => a && !a.unload);

        const diff = 60000 - (Date.now() % 60000) + 10;
        this.minuteLoopTimeout = this.adapter.setTimeout(this.minuteLoop, diff);
    };

    async delete(): Promise<void> {
        await super.delete();
        await this.library.writedp(
            `panels.${this.name}.info.nspanel.isOnline`,
            false,
            genericStateObjects.panel.panels.info.nspanel.isOnline,
        );
        for (const a of this.pages) if (a) await a.delete();
        this.isOnline = false;
        this.persistentPageItems = {};
        if (this.minuteLoopTimeout) this.adapter.clearTimeout(this.minuteLoopTimeout);
    }

    getPagebyUniqueID(uniqueID: string): Page | null {
        if (!uniqueID) return null;
        const index = this.pages.findIndex((a) => a && a.name && a.name === uniqueID);
        return this.pages[index] ?? null;
    }
    async HandleIncomingMessage(event: Types.IncomingEvent): Promise<void> {
        if (!this.InitDone) return;
        this.log.debug('Receive message:' + JSON.stringify(event));
        const index = this.pages.findIndex((a) => {
            if (a && a.card !== 'screensaver' && a.card !== 'screensaver2') return true;
            return false;
        });
        if (index === -1 || (this.isOnline === false && event.method !== 'startup')) return;
        switch (event.method) {
            case 'startup': {
                this.isOnline = true;

                this.info.nspanel.displayVersion = parseInt(event.id);
                this.info.nspanel.model = event.action;

                await this.library.writeFromJson(
                    `panels.${this.name}.info`,
                    'panel.panels.info',
                    genericStateObjects,
                    this.info,
                );

                this.restartLoops();
                this.sendToPanel(`dimmode~${this.dimMode.low}~${this.dimMode.high}~` + String(1));
                this.navigation.resetPosition();
                //const page = this.navigation.getCurrentPage();
                //await this.setActivePage(page);
                const i = this.pages.findIndex((a) => a && a.name === '///WelcomePopup');
                const popup = i !== -1 ? this.pages[i] : undefined;
                if (popup) await this.setActivePage(popup);
                break;
            }
            case 'sleepReached': {
                await this.setActivePage(this.screenSaver);
                this.navigation.resetPosition();
                break;
            }
            case 'pageOpenDetail': {
                await this.setActivePage(false);
                this.getActivePage().onPopupRequest(
                    event.id,
                    event.popup as Types.PopupType,
                    event.action,
                    event.opt,
                    event,
                );
                break;
            }
            case 'buttonPress2': {
                if (event.id == 'screensaver') {
                    await this.setActivePage(this.navigation.getCurrentPage());
                } else if (event.action === 'bExit' && event.id !== 'popupNotify') {
                    await this.setActivePage(true);
                } else {
                    if (
                        event.action === 'button' &&
                        ['bNext', 'bPrev', 'bUp', 'bHome', 'bSubNext', 'bSubPrev'].indexOf(event.id) != -1
                    ) {
                        if (['bPrev', 'bUp', 'bSubPrev'].indexOf(event.id) != -1) this.navigation.goLeft();
                        else if (['bNext', 'bHome', 'bSubNext'].indexOf(event.id) != -1) this.navigation.goRight();
                        break;
                    }
                    this.getActivePage().onPopupRequest(
                        event.id,
                        event.popup as Types.PopupType,
                        event.action,
                        event.opt,
                        event,
                    );
                    await this.getActivePage().onButtonEvent(event);
                }
                break;
            }
            case 'renderCurrentPage': {
                // Event only for HA at this Moment
                break;
            }
            case 'button1': {
                this.screenSaver!.setVisibility(false);

                break;
            }
            case 'button2': {
                this.screenSaver!.setVisibility(false);

                break;
            }
        }
    }

    onInternalCommand = async (id: string, state: ioBroker.State | undefined): Promise<ioBroker.StateValue> => {
        if (!id.startsWith(this.name)) return null;
        const token = id.split('/').pop();
        if (state && !state.ack && state.val !== null) {
            switch (token) {
                case 'power1': {
                    this.sendToTasmota(this.topic + '/cmnd/POWER1', state.val ? 'ON' : 'OFF');
                    break;
                }
                case 'power2': {
                    this.sendToTasmota(this.topic + '/cmnd/POWER2', state.val ? 'ON' : 'OFF');
                    break;
                }
                case 'bigIconLeft': {
                    this.info.nspanel.bigIconLeft = !!state.val;
                    this.screenSaver && this.screenSaver.HandleScreensaverStatusIcons();
                    this.statesControler.setInternalState(`${this.name}/cmd/bigIconLeft`, !!state.val, true);
                    this.library.writeFromJson(
                        `panels.${this.name}.info`,
                        'panel.panels.info',
                        genericStateObjects,
                        this.info,
                    );
                    break;
                }
                case 'bigIconRight': {
                    this.info.nspanel.bigIconRight = !!state.val;
                    this.screenSaver && this.screenSaver.HandleScreensaverStatusIcons();
                    this.statesControler.setInternalState(`${this.name}/cmd/bigIconRight`, !!state.val, true);
                    this.library.writeFromJson(
                        `panels.${this.name}.info`,
                        'panel.panels.info',
                        genericStateObjects,
                        this.info,
                    );
                    break;
                }
                case 'screensaverTimeout': {
                    if (typeof state.val !== 'boolean') {
                        const val = parseInt(String(state.val));
                        this.timeout = val;
                        this.sendScreeensaverTimeout(this.timeout);
                        this.statesControler.setInternalState(`${this.name}/cmd/screensaverTimeout`, val, true);
                        this.library.writedp(`panels.${this.name}.cmd.screensaverTimeout`, this.timeout);
                    }
                }
                case 'dimStandby': {
                    const val = parseInt(String(state.val));
                    this.dimMode.low = val;
                    this.sendDimmode();
                    this.library.writedp(`panels.${this.name}.cmd.dimStandby`, this.dimMode.low);
                    break;
                }
                case 'dimActive': {
                    const val = parseInt(String(state.val));
                    this.dimMode.high = val;
                    this.sendDimmode();
                    this.library.writedp(`panels.${this.name}.cmd.dimActive`, this.dimMode.high);
                    break;
                }
            }
            this.statesControler.setInternalState(id, state.val, true);
        } else if (!state) {
            switch (token) {
                case 'bigIconLeft': {
                    return this.info.nspanel.bigIconLeft;
                }
                case 'bigIconRight': {
                    return this.info.nspanel.bigIconRight;
                }
                case 'screensaverTimeout': {
                    return this.timeout;
                }
                case 'dimStandby': {
                    return this.dimMode.low;
                }
                case 'dimActive': {
                    return this.dimMode.high;
                }
            }
        }
        return null;
    };

    private convertToEvent(msg: string): Types.IncomingEvent | null {
        try {
            msg = (JSON.parse(msg) || {}).CustomRecv;
        } catch (e) {
            this.log.warn('Receive a broken msg from mqtt: ' + msg);
        }
        if (msg === undefined) return null;
        const temp = msg.split(',');
        if (!Types.isEventType(temp[0])) return null;
        if (!Types.isEventMethod(temp[1])) return null;
        let popup: undefined | string = undefined;
        if (temp[1] === 'pageOpenDetail') popup = temp.splice(2, 1)[0];
        const arr = String(temp[2]).split('?');
        if (arr[3])
            return {
                type: temp[0],
                method: temp[1],
                target: parseInt(arr[3]),
                page: parseInt(arr[1]),
                cmd: parseInt(arr[0]),
                popup: popup,
                id: arr[2],
                action: pages.isButtonActionType(temp[3]) ? temp[3] : temp[3],
                opt: temp[4] ?? '',
            };
        if (arr[2])
            return {
                type: temp[0],
                method: temp[1],
                page: parseInt(arr[0]),
                cmd: parseInt(arr[1]),
                popup: popup,
                id: arr[2],
                action: pages.isButtonActionType(temp[3]) ? temp[3] : temp[3],
                opt: temp[4] ?? '',
            };
        else if (arr[1])
            return {
                type: temp[0],
                method: temp[1],
                page: parseInt(arr[0]),
                popup: popup,
                id: arr[1],
                action: pages.isButtonActionType(temp[3]) ? temp[3] : temp[3],
                opt: temp[4] ?? '',
            };
        else
            return {
                type: temp[0],
                method: temp[1],
                popup: popup,
                id: arr[0],
                action: pages.isButtonActionType(temp[3]) ? temp[3] : temp[3],
                opt: temp[4] ?? '',
            };
    }

    /*
    function HandleMessage(typ: string, method: NSPanel.EventMethod, page: number | undefined, words: string[] | undefined): void {
        try {
            if (typ == 'event') {
                switch (method as NSPanel.EventMethod) {
                    case 'startup':
                        screensaverEnabled = false;
                        UnsubscribeWatcher();
                        HandleStartupProcess();
                        pageId = 0;
                        GeneratePage(config.pages[0]);
                        if (Debug) log('HandleMessage -> Startup', 'info');
                        Init_Release();
                        break;
                    case 'sleepReached':
                        useMediaEvents = false;
                        screensaverEnabled = true;
                        if (pageId < 0)
                            pageId = 0;
                        HandleScreensaver();
                        if (Debug) log('HandleMessage -> sleepReached', 'info');
                        break;
                    case 'pageOpenDetail':
                        if (words != undefined) {
                            screensaverEnabled = false;
                            UnsubscribeWatcher();
                            if (Debug) {
                                log('HandleMessage -> pageOpenDetail ' + words[0] + ' - ' + words[1] + ' - ' + words[2] + ' - ' + words[3] + ' - ' + words[4], 'info');
                            }
                            let tempId: PageItem['id'];
                            let tempPageItem = words[3].split('?');
                            let placeId: number | undefined = undefined;
                            if (!isNaN(parseInt(tempPageItem[0]))){
                                tempId = activePage!.items[tempPageItem[0]].id;
                                placeId = parseInt(tempPageItem[0])
                                if (tempId == undefined) {
                                    throw new Error(`Missing id in HandleMessage!`)
                                }
                            } else {
                                tempId = tempPageItem[0];
                            }
                            let pageItem: PageItem = findPageItem(tempId);
                            if (pageItem !== undefined && isPopupType(words[2])) {
                                let temp: string | NSPanel.mediaOptional | undefined = tempPageItem[1]
                                if (isMediaOptional(temp)) SendToPanel(GenerateDetailPage(words[2], temp, pageItem, placeId));
                                else SendToPanel(GenerateDetailPage(words[2], undefined, pageItem, placeId));
                            }
                        }
                        break;
                    case 'buttonPress2':
                        screensaverEnabled = false;
                        HandleButtonEvent(words);
                        if (Debug) {
                            if (words != undefined) log('HandleMessage -> buttonPress2 ' + words[0] + ' - ' + words[1] + ' - ' + words[2] + ' - ' + words[3] + ' - ' + words[4], 'info');
                        }
                        break;
                    case 'renderCurrentPage':
                        // Event only for HA at this Moment
                        if (Debug) log('renderCurrentPage', 'info');
                        break;
                    case 'button1':
                    case 'button2':
                        screensaverEnabled = false;
                        HandleHardwareButton(method);
                        if (Debug) log('HandleMessage -> button1 /  button2', 'info')
                        break;
                    default:
                        break;
                }
            }
        } catch (err: any) {
            log('error at function HandleMessage: ' + err.message, 'warn');
        }
    }*/
}
