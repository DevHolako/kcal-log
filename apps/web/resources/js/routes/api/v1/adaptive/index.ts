import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::current
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:28
* @route '/api/v1/adaptive/current'
*/
export const current = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: current.url(options),
    method: 'get',
})

current.definition = {
    methods: ["get","head"],
    url: '/api/v1/adaptive/current',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::current
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:28
* @route '/api/v1/adaptive/current'
*/
current.url = (options?: RouteQueryOptions) => {
    return current.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::current
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:28
* @route '/api/v1/adaptive/current'
*/
current.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: current.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::current
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:28
* @route '/api/v1/adaptive/current'
*/
current.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: current.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::current
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:28
* @route '/api/v1/adaptive/current'
*/
const currentForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: current.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::current
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:28
* @route '/api/v1/adaptive/current'
*/
currentForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: current.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::current
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:28
* @route '/api/v1/adaptive/current'
*/
currentForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: current.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

current.form = currentForm

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::history
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:54
* @route '/api/v1/adaptive/history'
*/
export const history = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

history.definition = {
    methods: ["get","head"],
    url: '/api/v1/adaptive/history',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::history
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:54
* @route '/api/v1/adaptive/history'
*/
history.url = (options?: RouteQueryOptions) => {
    return history.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::history
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:54
* @route '/api/v1/adaptive/history'
*/
history.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::history
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:54
* @route '/api/v1/adaptive/history'
*/
history.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: history.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::history
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:54
* @route '/api/v1/adaptive/history'
*/
const historyForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::history
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:54
* @route '/api/v1/adaptive/history'
*/
historyForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::history
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:54
* @route '/api/v1/adaptive/history'
*/
historyForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: history.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

history.form = historyForm

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::accept
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:70
* @route '/api/v1/adaptive/{adjustment}/accept'
*/
export const accept = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/api/v1/adaptive/{adjustment}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::accept
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:70
* @route '/api/v1/adaptive/{adjustment}/accept'
*/
accept.url = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { adjustment: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { adjustment: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            adjustment: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        adjustment: typeof args.adjustment === 'object'
        ? args.adjustment.id
        : args.adjustment,
    }

    return accept.definition.url
            .replace('{adjustment}', parsedArgs.adjustment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::accept
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:70
* @route '/api/v1/adaptive/{adjustment}/accept'
*/
accept.post = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::accept
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:70
* @route '/api/v1/adaptive/{adjustment}/accept'
*/
const acceptForm = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::accept
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:70
* @route '/api/v1/adaptive/{adjustment}/accept'
*/
acceptForm.post = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

accept.form = acceptForm

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::reject
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:91
* @route '/api/v1/adaptive/{adjustment}/reject'
*/
export const reject = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/api/v1/adaptive/{adjustment}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::reject
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:91
* @route '/api/v1/adaptive/{adjustment}/reject'
*/
reject.url = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { adjustment: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { adjustment: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            adjustment: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        adjustment: typeof args.adjustment === 'object'
        ? args.adjustment.id
        : args.adjustment,
    }

    return reject.definition.url
            .replace('{adjustment}', parsedArgs.adjustment.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::reject
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:91
* @route '/api/v1/adaptive/{adjustment}/reject'
*/
reject.post = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::reject
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:91
* @route '/api/v1/adaptive/{adjustment}/reject'
*/
const rejectForm = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::reject
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:91
* @route '/api/v1/adaptive/{adjustment}/reject'
*/
rejectForm.post = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::trigger
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:111
* @route '/api/v1/adaptive/trigger'
*/
export const trigger = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: trigger.url(options),
    method: 'post',
})

trigger.definition = {
    methods: ["post"],
    url: '/api/v1/adaptive/trigger',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::trigger
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:111
* @route '/api/v1/adaptive/trigger'
*/
trigger.url = (options?: RouteQueryOptions) => {
    return trigger.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::trigger
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:111
* @route '/api/v1/adaptive/trigger'
*/
trigger.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: trigger.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::trigger
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:111
* @route '/api/v1/adaptive/trigger'
*/
const triggerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: trigger.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AdaptiveController::trigger
* @see app/Http/Controllers/Api/V1/AdaptiveController.php:111
* @route '/api/v1/adaptive/trigger'
*/
triggerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: trigger.url(options),
    method: 'post',
})

trigger.form = triggerForm

const adaptive = {
    current: Object.assign(current, current),
    history: Object.assign(history, history),
    accept: Object.assign(accept, accept),
    reject: Object.assign(reject, reject),
    trigger: Object.assign(trigger, trigger),
}

export default adaptive