import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\AdaptiveController::index
* @see app/Http/Controllers/AdaptiveController.php:30
* @route '/strategy'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/strategy',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\AdaptiveController::index
* @see app/Http/Controllers/AdaptiveController.php:30
* @route '/strategy'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdaptiveController::index
* @see app/Http/Controllers/AdaptiveController.php:30
* @route '/strategy'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdaptiveController::index
* @see app/Http/Controllers/AdaptiveController.php:30
* @route '/strategy'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\AdaptiveController::index
* @see app/Http/Controllers/AdaptiveController.php:30
* @route '/strategy'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdaptiveController::index
* @see app/Http/Controllers/AdaptiveController.php:30
* @route '/strategy'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\AdaptiveController::index
* @see app/Http/Controllers/AdaptiveController.php:30
* @route '/strategy'
*/
indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

index.form = indexForm

/**
* @see \App\Http\Controllers\AdaptiveController::accept
* @see app/Http/Controllers/AdaptiveController.php:81
* @route '/strategy/{adjustment}/accept'
*/
export const accept = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

accept.definition = {
    methods: ["post"],
    url: '/strategy/{adjustment}/accept',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdaptiveController::accept
* @see app/Http/Controllers/AdaptiveController.php:81
* @route '/strategy/{adjustment}/accept'
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
* @see \App\Http\Controllers\AdaptiveController::accept
* @see app/Http/Controllers/AdaptiveController.php:81
* @route '/strategy/{adjustment}/accept'
*/
accept.post = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdaptiveController::accept
* @see app/Http/Controllers/AdaptiveController.php:81
* @route '/strategy/{adjustment}/accept'
*/
const acceptForm = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdaptiveController::accept
* @see app/Http/Controllers/AdaptiveController.php:81
* @route '/strategy/{adjustment}/accept'
*/
acceptForm.post = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: accept.url(args, options),
    method: 'post',
})

accept.form = acceptForm

/**
* @see \App\Http\Controllers\AdaptiveController::reject
* @see app/Http/Controllers/AdaptiveController.php:98
* @route '/strategy/{adjustment}/reject'
*/
export const reject = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/strategy/{adjustment}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdaptiveController::reject
* @see app/Http/Controllers/AdaptiveController.php:98
* @route '/strategy/{adjustment}/reject'
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
* @see \App\Http\Controllers\AdaptiveController::reject
* @see app/Http/Controllers/AdaptiveController.php:98
* @route '/strategy/{adjustment}/reject'
*/
reject.post = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdaptiveController::reject
* @see app/Http/Controllers/AdaptiveController.php:98
* @route '/strategy/{adjustment}/reject'
*/
const rejectForm = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdaptiveController::reject
* @see app/Http/Controllers/AdaptiveController.php:98
* @route '/strategy/{adjustment}/reject'
*/
rejectForm.post = (args: { adjustment: number | { id: number } } | [adjustment: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: reject.url(args, options),
    method: 'post',
})

reject.form = rejectForm

/**
* @see \App\Http\Controllers\AdaptiveController::trigger
* @see app/Http/Controllers/AdaptiveController.php:115
* @route '/strategy/trigger'
*/
export const trigger = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: trigger.url(options),
    method: 'post',
})

trigger.definition = {
    methods: ["post"],
    url: '/strategy/trigger',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\AdaptiveController::trigger
* @see app/Http/Controllers/AdaptiveController.php:115
* @route '/strategy/trigger'
*/
trigger.url = (options?: RouteQueryOptions) => {
    return trigger.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\AdaptiveController::trigger
* @see app/Http/Controllers/AdaptiveController.php:115
* @route '/strategy/trigger'
*/
trigger.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: trigger.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdaptiveController::trigger
* @see app/Http/Controllers/AdaptiveController.php:115
* @route '/strategy/trigger'
*/
const triggerForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: trigger.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\AdaptiveController::trigger
* @see app/Http/Controllers/AdaptiveController.php:115
* @route '/strategy/trigger'
*/
triggerForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: trigger.url(options),
    method: 'post',
})

trigger.form = triggerForm

const AdaptiveController = { index, accept, reject, trigger }

export default AdaptiveController