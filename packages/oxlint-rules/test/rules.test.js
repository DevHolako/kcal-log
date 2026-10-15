import { RuleTester } from 'oxlint/plugins-dev';
import { noRawFetch } from '../src/rules/no-raw-fetch.js';
import { noWindowConfirm } from '../src/rules/no-window-confirm.js';
import { translations } from '../src/rules/translations.js';

const rules = {
    'no-raw-fetch': {
        rule: noRawFetch,
        valid: [
            'clientHttp.post(parseRaw.url(), {});',
            'const fetch = useFetcher(); fetch.load();',
            'api.fetch("/x");',
        ],
        invalid: [
            { code: 'fetch("/api/thing");', errors: ['noRawFetch'] },
            { code: 'window.fetch("/api/thing");', errors: ['noRawFetch'] },
        ],
    },
    'no-window-confirm': {
        rule: noWindowConfirm,
        valid: [
            'const confirm = useConfirm(); await confirm({ title: "x" });',
            'function run(confirm) { confirm(); }',
            'dialog.confirm();',
        ],
        invalid: [
            { code: 'if (confirm("Sure?")) {}', errors: ['noWindowConfirm'] },
            { code: 'window.confirm("Sure?");', errors: ['noWindowConfirm'] },
            {
                code: 'globalThis.confirm("Sure?");',
                errors: ['noWindowConfirm'],
            },
        ],
    },
    translations: {
        rule: translations,
        valid: [
            "t('common.save');",
            'const a = <span>{t("common.save")}</span>;',
            'const a = <span>&laquo; · 42 % &lt;&gt;</span>;',
            'const a = <code>const x = 1;</code>;',
            'const a = <div title={t("common.save")} className="flex gap-2" />;',
            "const l = locale === 'en' ? 'en-US' : 'fr-FR';",
            "toast.success(t('common.save'));",
        ],
        invalid: [
            {
                code: "t('this.key.does.not.exist');",
                errors: ['missingKeyBoth'],
                data: { key: 'this.key.does.not.exist' },
            },
            {
                code: "const a = t('common.save') || 'Save';",
                errors: ['noFallback'],
                data: { key: 'common.save', operator: '||' },
                output: "const a = t('common.save');",
            },
            {
                code: "const a = t('common.save') ?? 'Save';",
                errors: ['noFallback'],
                data: { key: 'common.save', operator: '??' },
                output: "const a = t('common.save');",
            },
            {
                code: 'const a = <span>Hard coded &lt;b&gt; text</span>;',
                errors: ['hardcodedText'],
            },
            {
                code: 'const a = <div aria-label="Close" />;',
                errors: ['hardcodedText'],
            },
            {
                code: 'const a = <div>{`Hello ${name}`}</div>;',
                errors: ['hardcodedText'],
            },
            {
                code: "toast.error('Failed', { description: 'Try again' });",
                errors: ['hardcodedText', 'hardcodedText'],
            },
            {
                code: "const l = locale === 'fr' ? 'Bonjour' : 'Hello';",
                errors: ['localeTernary'],
            },
        ],
    },
};

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaFeatures: { jsx: true },
        },
    },
});

console.log('Running test suite for oxlint custom rules...\n');

let totalTests = 0;
let passedRules = 0;

for (const [ruleName, config] of Object.entries(rules)) {
    const validCount = config.valid.length;
    const invalidCount = config.invalid.length;
    const count = validCount + invalidCount;
    totalTests += count;

    console.log(`Testing rule '${ruleName}' (${validCount} valid, ${invalidCount} invalid)...`);
    ruleTester.run(ruleName, config.rule, {
        valid: config.valid,
        invalid: config.invalid,
    });
    console.log(`  ✓ '${ruleName}' passed all ${count} test cases.`);
    passedRules++;
}

console.log(`\n🎉 Success! All ${passedRules} custom oxlint rules (${totalTests} total test cases) passed!`);
