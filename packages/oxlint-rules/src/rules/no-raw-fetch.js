function isLocalVariable(scope, name) {
    let current = scope;
    while (current) {
        if (
            current.variables &&
            current.variables.some((v) => v.name === name && v.defs && v.defs.length > 0)
        ) {
            return true;
        }
        current = current.upper;
    }
    return false;
}

export const noRawFetch = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Disallow raw fetch() or window.fetch() in favor of configured API clients.',
        },
        messages: {
            noRawFetch: 'noRawFetch',
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (node.callee.type === 'Identifier' && node.callee.name === 'fetch') {
                    const scope = context.sourceCode.getScope(node);
                    if (!isLocalVariable(scope, 'fetch')) {
                        context.report({ node, messageId: 'noRawFetch' });
                    }
                } else if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.property.type === 'Identifier' &&
                    node.callee.property.name === 'fetch' &&
                    node.callee.object.type === 'Identifier' &&
                    (node.callee.object.name === 'window' || node.callee.object.name === 'globalThis')
                ) {
                    context.report({ node, messageId: 'noRawFetch' });
                }
            },
        };
    },
};

export default noRawFetch;
