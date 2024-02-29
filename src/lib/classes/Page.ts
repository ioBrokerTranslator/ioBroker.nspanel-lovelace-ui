import { Panel } from '../controller/panel';
import { BaseClassPage, BaseClassTriggerdInterface } from '../controller/states-controller';
import * as pages from '../types/pages';
import { ButtonActionType, IncomingEvent, PopupType, TemplateIdent, isPopupType } from '../types/types';
import { PageItem } from '../pages/pageItem';
import { BaseClass } from './library';
import { cardTemplates } from '../templates/card';
import { deepAssign, getRegExp } from '../const/tools';
import { PageItemDataItemsOptions, PageItemOptionsTemplate } from '../types/type-pageItem';
import { pageItemTemplates } from '../templates/templateArray';

export interface PageConfigInterface {
    config: pages.PageBaseConfig;
    page: PageInterface;
}
export type PageItemInterface = BaseClassTriggerdInterface & {
    card: pages.PageTypeCards;
    panel: Panel;
    id: string;
    parent: Page;
};

export type PageInterface = BaseClassTriggerdInterface & {
    card: pages.PageTypeCards;
    panel: Panel;
    id: string;
};

//interface Page extends BaseClass | PageConfig
export type PageConfigAll = pages.PageBaseConfig;

export class Page extends BaseClassPage {
    readonly card: pages.PageTypeCards;
    readonly id: string;
    config: pages.PageBaseConfig['config'];
    //config: Card['config'];
    constructor(card: PageInterface, pageItemsConfig: pages.PageBaseConfig | undefined) {
        super(card, pageItemsConfig && pageItemsConfig.pageItems);
        this.card = card.card;
        this.id = card.id;
        if (card.dpInit && typeof card.dpInit === 'string') {
            const reg = getRegExp(card.dpInit);
            if (reg) {
                card.dpInit = reg;
            }
        }
        this.dpInit = card.dpInit ?? '';
        this.config = pageItemsConfig && pageItemsConfig.config;
    }

    async init(): Promise<void> {
        // do the work für PageItems only one time - changes in ObjectDB need a adapter restart.
        if (this.pageItemConfig) {
            for (let a = 0; a < this.pageItemConfig.length; a++) {
                let options = this.pageItemConfig[a];
                if (options === undefined) continue;
                if (options.dpInit && typeof options.dpInit === 'string') {
                    const reg = getRegExp(options.dpInit);
                    if (reg) {
                        options.dpInit = reg;
                    }
                }
                options = await this.getItemFromTemplate(options);
                if (!options) continue;

                // search states for mode auto
                const dpInit = (this.dpInit ? this.dpInit : options.dpInit) ?? '';
                options.data = dpInit
                    ? await this.panel.statesControler.getDataItemsFromAuto(
                          dpInit,
                          options.data,
                          'appendix' in options ? options.appendix : undefined,
                      )
                    : options.data;

                this.pageItemConfig[a] = options;
            }
        }
    }

    async getItemFromTemplate(
        options: PageItemDataItemsOptions,
        subtemplate: TemplateIdent = '',
        loop: number = 0,
    ): Promise<PageItemDataItemsOptions | undefined> {
        if ('template' in options && options.template) {
            const template: PageItemOptionsTemplate | undefined = subtemplate
                ? pageItemTemplates[subtemplate]
                : pageItemTemplates[options.template];
            const name = options.template;
            if (!template) {
                this.log.error('Dont find template ' + options.template);
                return undefined;
            }
            if (
                template.adapter &&
                typeof options.dpInit === 'string' &&
                !options.dpInit.startsWith(template.adapter) &&
                typeof this.dpInit === 'string' &&
                !this.dpInit.startsWith(template.adapter)
            ) {
                this.log.error(
                    'Missing dbInit or dbInit not starts with' + template.adapter + ' for template ' + options.template,
                );
                return undefined;
            }

            const newTemplate = structuredClone(template) as Partial<PageItemOptionsTemplate>;
            delete newTemplate.adapter;
            if (options.type && options.type !== template.type) {
                this.log.error('Type: ' + options.type + 'is not equal with ' + template.type);
                return undefined;
            }
            options.type = template.type;
            options.role = template.role;
            if (options.appendix) {
                this.log.debug('c');
            }
            options = deepAssign(newTemplate, options);
            if (template.template !== undefined) {
                if (loop > 10) {
                    throw new Error(
                        `Endless loop in getItemFromTemplate() detected! From ${template.template} for ${name}. Bye Bye`,
                    );
                }
                const o = await this.getItemFromTemplate(options, template.template, ++loop);
                if (o !== undefined) options = o;
                else this.log.warn(`Dont get a template from ${template.template} for ${name}`);
            }
        }
        return options;
    }

    async onButtonEvent(event: IncomingEvent): Promise<void> {
        this.log.warn(`Event received but no handler! ${JSON.stringify(event)}`);
    }
    sendType(): void {
        this.sendToPanel(`pageType~${this.card}`);
    }

    static getPage(config: pages.PageBaseConfig, that: BaseClass): pages.PageBaseConfig {
        if ('template' in config && config.template) {
            const template = cardTemplates[config.template];
            if (!template) {
                that.log.error('dont find template ' + config.template);
                return config;
            }
            if (config.dpInit && typeof config.dpInit === 'string') {
                const reg = getRegExp(config.dpInit);
                if (reg) {
                    config.dpInit = reg;
                }
                if (
                    template.adapter &&
                    typeof config.dpInit === 'string' &&
                    !config.dpInit.startsWith(template.adapter)
                ) {
                    return config;
                }
            }
            const newTemplate = structuredClone(template) as Partial<pages.PageBaseConfigTemplate>;
            delete newTemplate.adapter;
            if (config.card && config.card !== template.card) {
                that.log.error(config.card + 'is not equal with ' + template.card);
                return config;
            }

            config = deepAssign(newTemplate, config);
        }
        return config;
    }
    protected async onVisibilityChange(val: boolean): Promise<void> {
        if (val) {
            if (!this.pageItems && this.pageItemConfig) {
                this.pageItems = [];
                for (let a = 0; a < this.pageItemConfig.length; a++) {
                    const config: Omit<PageItemInterface, 'pageItemsConfig'> = {
                        name: 'PI',
                        adapter: this.adapter,
                        panel: this.panel,
                        panelSend: this.panelSend,
                        card: 'cardItemSpecial',
                        id: `${this.id}?${a}`,
                        parent: this,
                    };
                    this.pageItems[a] = PageItem.getPageItem(config, this.pageItemConfig[a]);
                    this.pageItems[a] && (await this.pageItems[a]!.init());
                }
            }
            this.sendType();
            this.update();
        } else {
            if (this.pageItems) {
                for (const item of this.pageItems) {
                    item && (await item.delete());
                }
                this.pageItems = undefined;
            }
        }
    }

    setLastPage(_p: Page | undefined): void {}
    removeLastPage(_p: Page | undefined): void {}

    protected getNavigation(): string {
        return this.panel.navigation.buildNavigationString();
    }

    public async update(): Promise<void> {
        this.adapter.log.warn(
            `<- instance of [${Object.getPrototypeOf(this)}] update() is not defined or call super.onStateTrigger()`,
        );
    }

    public async onPopupRequest(
        id: number | string,
        popup: PopupType | undefined,
        action: ButtonActionType | undefined | string,
        value: string | undefined,
        _event: IncomingEvent | null = null,
    ): Promise<void> {
        if (!this.pageItems) return;
        const i = typeof id === 'number' ? id : parseInt(id);
        const item = this.pageItems[i];
        if (!item) return;
        let msg: string | null = null;
        if (action && value !== undefined && (await item.onCommand(action, value))) {
            return;
        } else if (isPopupType(popup) && action !== 'bExit') {
            msg = await item.GeneratePopup(popup);
        }
        if (msg !== null) {
            this.sleep = true;
            this.sendToPanel(msg);
        }
    }
    async delete(): Promise<void> {
        await super.delete();
        this.pageItems = undefined;
    }
}

export function isMediaButtonActionType(F: MediaButtonActionType | string): F is MediaButtonActionType {
    switch (F) {
        case 'media-back':
        case 'media-pause':
        case 'media-next':
        case 'media-shuffle':
        case 'volumeSlider':
        case 'mode-speakerlist':
        case 'mode-playlist':
        case 'mode-tracklist':
        case 'mode-repeat':
        case 'mode-equalizer':
        case 'mode-seek':
        case 'mode-crossfade':
        case 'mode-favorites':
        case 'mode-insel':
        case 'media-OnOff':
        case 'button':
            return true;
    }
    console.error(`${F} isMediaButtonActionType === false`);
    return false;
}
type MediaButtonActionType = Extract<
    ButtonActionType,
    | 'media-back'
    | 'media-pause'
    | 'media-next'
    | 'media-shuffle'
    | 'volumeSlider'
    | 'mode-speakerlist'
    | 'mode-playlist'
    | 'mode-tracklist'
    | 'mode-repeat'
    | 'mode-equalizer'
    | 'mode-seek'
    | 'mode-crossfade'
    | 'mode-favorites'
    | 'mode-insel'
    | 'media-OnOff'
    | 'button'
>;
