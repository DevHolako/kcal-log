import fs from 'node:fs';
import path from 'node:path';

// Load known translation keys from apps/web/resources/js/lib/i18n.ts if available
const DEFAULT_KNOWN_KEYS = new Set([
    'common.save',
    'common.cancel',
    'nav.dashboard',
    'nav.diary',
    'nav.strategy',
    'nav.foods',
    'nav.recipes',
    'nav.reports',
    'nav.settings',
    'reports.title',
    'reports.subtitle',
    'recipes.title',
    'recipes.subtitle',
]);

function loadAppTranslationKeys() {
    const keys = new Set(DEFAULT_KNOWN_KEYS);
    try {
        const i18nPath = path.resolve(process.cwd(), 'apps/web/resources/js/lib/i18n.ts');
        if (fs.existsSync(i18nPath)) {
            const content = fs.readFileSync(i18nPath, 'utf8');
            const matches = content.matchAll(/'([a-zA-Z0-9_\.\-]+)':/g);
            for (const match of matches) {
                keys.add(match[1]);
            }
        }
    } catch {
        // Fallback to defaults
    }
    return keys;
}

const KNOWN_KEYS = loadAppTranslationKeys();

const TRANSLATABLE_ATTRS = new Set([
    'aria-label',
    'aria-description',
    'placeholder',
    'title',
    'alt',
]);

const LOCALE_CODE_REGEX = /^[a-z]{2}(-[A-Z]{2})?$/;

function hasLetters(str) {
    return /[a-zA-Z\u00C0-\u024F]/.test(str);
}

function isInsideCodeElement(node) {
    let current = node.parent;
    while (current) {
        if (current.type === 'JSXElement' && current.openingElement?.name?.name) {
            const tag = current.openingElement.name.name.toLowerCase();
            if (tag === 'code' || tag === 'pre') return true;
        }
        current = current.parent;
    }
    return false;
}

export const translations = {
    meta: {
        type: 'problem',
        fixable: 'code',
        docs: {
            description:
                'Enforce comprehensive UI internationalization, disallow fallbacks and hardcoded strings.',
        },
        messages: {
            missingKeyBoth: 'missingKeyBoth',
            noFallback: 'noFallback',
            hardcodedText: 'hardcodedText',
            localeTernary: 'localeTernary',
        },
    },
    create(context) {
        return {
            // 1. Missing keys in t(...) & toast text calls
            CallExpression(node) {
                if (node.callee.type === 'Identifier' && node.callee.name === 't') {
                    const firstArg = node.arguments[0];
                    if (
                        firstArg &&
                        (firstArg.type === 'Literal' || firstArg.type === 'StringLiteral')
                    ) {
                        const key = String(firstArg.value);
                        if (!KNOWN_KEYS.has(key)) {
                            context.report({
                                node: firstArg,
                                messageId: 'missingKeyBoth',
                                data: { key },
                            });
                        }
                    }
                }

                // Toast calls with hardcoded strings
                if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.object.type === 'Identifier' &&
                    node.callee.object.name === 'toast'
                ) {
                    const firstArg = node.arguments[0];
                    if (
                        firstArg &&
                        typeof firstArg.value === 'string' &&
                        hasLetters(firstArg.value)
                    ) {
                        context.report({
                            node: firstArg,
                            messageId: 'hardcodedText',
                        });
                    }
                    const secondArg = node.arguments[1];
                    if (secondArg && secondArg.type === 'ObjectExpression') {
                        for (const prop of secondArg.properties) {
                            if (
                                prop.value &&
                                typeof prop.value.value === 'string' &&
                                hasLetters(prop.value.value)
                            ) {
                                context.report({
                                    node: prop.value,
                                    messageId: 'hardcodedText',
                                });
                            }
                        }
                    }
                }
            },

            // 2. Fallbacks on t(...) || '...' or t(...) ?? '...'
            LogicalExpression(node) {
                if (node.operator === '||' || node.operator === '??') {
                    if (
                        node.left.type === 'CallExpression' &&
                        node.left.callee.name === 't'
                    ) {
                        const key = node.left.arguments[0]?.value || '';
                        context.report({
                            node,
                            messageId: 'noFallback',
                            data: { key, operator: node.operator },
                            fix(fixer) {
                                return fixer.replaceText(
                                    node,
                                    context.sourceCode.getText(node.left),
                                );
                            },
                        });
                    }
                }
            },

            // 3. JSX Text
            JSXText(node) {
                if (isInsideCodeElement(node)) return;
                const raw = node.value.replace(/&[a-zA-Z0-9#]+;/g, ' ').trim();
                if (hasLetters(raw)) {
                    context.report({ node, messageId: 'hardcodedText' });
                }
            },

            // 4. Translatable JSX Attributes
            JSXAttribute(node) {
                if (node.name && TRANSLATABLE_ATTRS.has(node.name.name)) {
                    if (
                        node.value &&
                        typeof node.value.value === 'string' &&
                        hasLetters(node.value.value)
                    ) {
                        context.report({
                            node: node.value,
                            messageId: 'hardcodedText',
                        });
                    }
                }
            },

            // 5. Template literals with words directly in JSX
            JSXExpressionContainer(node) {
                if (isInsideCodeElement(node)) return;
                if (node.expression && node.expression.type === 'TemplateLiteral') {
                    const hasText = node.expression.quasis.some((q) =>
                        hasLetters(q.value.raw),
                    );
                    if (hasText) {
                        context.report({
                            node: node.expression,
                            messageId: 'hardcodedText',
                        });
                    }
                }
            },

            // 6. Ternary conditions checking locale
            ConditionalExpression(node) {
                function checkTest(testNode) {
                    if (!testNode) return false;
                    if (testNode.type === 'Identifier' && testNode.name === 'locale')
                        return true;
                    if (
                        testNode.left?.name === 'locale' ||
                        testNode.right?.name === 'locale'
                    )
                        return true;
                    return false;
                }
                if (checkTest(node.test)) {
                    const cVal = node.consequent?.value;
                    const aVal = node.alternate?.value;
                    if (typeof cVal === 'string' && typeof aVal === 'string') {
                        if (
                            !LOCALE_CODE_REGEX.test(cVal) ||
                            !LOCALE_CODE_REGEX.test(aVal)
                        ) {
                            context.report({ node, messageId: 'localeTernary' });
                        }
                    }
                }
            },
        };
    },
};

export default translations;
