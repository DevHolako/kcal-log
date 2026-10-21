import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/diary/water',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:131
* @route '/diary/water'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
*/
export const destroy = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/diary/water/{waterLog}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
*/
destroy.url = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { waterLog: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { waterLog: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            waterLog: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        waterLog: typeof args.waterLog === 'object'
        ? args.waterLog.id
        : args.waterLog,
    }

    return destroy.definition.url
            .replace('{waterLog}', parsedArgs.waterLog.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
*/
destroy.delete = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
*/
const destroyForm = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:145
* @route '/diary/water/{waterLog}'
*/
destroyForm.delete = (args: { waterLog: number | { id: number } } | [waterLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const water = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default water