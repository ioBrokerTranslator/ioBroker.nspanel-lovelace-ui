import { Page, PageInterface } from '../classes/Page';
import { getPayload, getPayloadArray } from '../const/tools';
import * as pages from '../types/pages';
import { IncomingEvent } from '../types/types';
import { PageItem } from './pageItem';

const PageEntitiesMessageDefault: pages.PageEntitiesMessage = {
    event: 'entityUpd',
    headline: 'Page Grid',
    navigation: 'button~bSubPrev~~~~~button~bSubNext~~~~',
    options: ['~~~~~', '~~~~~', '~~~~~', '~~~~~', '~~~~~', '~~~~~'],
};

export class PageEntities extends Page {
    config: pages.PageBaseConfig['config'];
    items: pages.PageBaseConfig['items'];
    private step: number = 1;
    private headlinePos: number = 0;
    private titelPos: number = 0;
    private nextArrow: boolean = false;
    tempItem: PageItem | undefined;

    constructor(config: PageInterface, options: pages.PageBaseConfig) {
        super(config, options.pageItems);
        this.config = options.config;
        if (options.items && options.items.card == 'cardEntities') this.items = options.items;
        this.minUpdateInterval = 2000;
    }

    async init(): Promise<void> {}

    public async update(): Promise<void> {
        const message: Partial<pages.PageEntitiesMessage> = {};
        message.options = [];
        if (this.pageItems) {
            const maxItems = 4;
            for (let a = 0; a < maxItems; a++) {
                const temp = this.pageItems[a];
                if (temp) message.options[a] = await temp.getPageItemPayload();
            }
        }
        message.headline =
            (this.items && this.items.data.headline && (await this.items.data.headline.getString())) ?? '';
        message.navigation = this.getNavigation();
        const msg: pages.PageEntitiesMessage = Object.assign(PageEntitiesMessageDefault, message);

        this.sendToPanel(this.getMessage(msg));
    }
    private getMessage(message: pages.PageEntitiesMessage): string {
        return getPayload('entityUpd', message.headline, message.navigation, getPayloadArray(message.options));
    }
    protected async onStateTrigger(): Promise<void> {
        this.update();
    }
    async onButtonEvent(_event: IncomingEvent): Promise<void> {}
}