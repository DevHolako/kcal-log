import { definePlugin } from '@oxlint/plugins';
import { noRawFetch } from './rules/no-raw-fetch.js';
import { noWindowConfirm } from './rules/no-window-confirm.js';
import { translations } from './rules/translations.js';

export const rules = {
    'no-raw-fetch': noRawFetch,
    'no-window-confirm': noWindowConfirm,
    translations: translations,
};

export default definePlugin({
    meta: {
        name: 'oxlint-plugin-kcal-log',
    },
    rules,
});
