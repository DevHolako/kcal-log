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

export const noWindowConfirm = {
    meta: {
        type: 'problem',
        docs: {
            description:
                'Disallow native confirm(), window.confirm(), or globalThis.confirm() in favor of accessible custom dialogs.',
        },
        messages: {
            noWindowConfirm: 'noWindowConfirm',
        },
    },
    create(context) {
        return {
            CallExpression(node) {
                if (node.callee.type === 'Identifier' && node.callee.name === 'confirm') {
                    const scope = context.sourceCode.getScope(node);
                    if (!isLocalVariable(scope, 'confirm')) {
                        context.report({ node, messageId: 'noWindowConfirm' });
                    }
                } else if (
                    node.callee.type === 'MemberExpression' &&
                    node.callee.property.type === 'Identifier' &&
                    node.callee.property.name === 'confirm' &&
                    node.callee.object.type === 'Identifier' &&
                    (node.callee.object.name === 'window' || node.callee.object.name === 'globalThis')
                ) {
                    context.report({ node, messageId: 'noWindowConfirm' });
                }
            },
        };
    },
};

export default noWindowConfirm;
