import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/diary/exercises',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\DiaryController::store
* @see app/Http/Controllers/DiaryController.php:221
* @route '/diary/exercises'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
export const destroy = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/diary/exercises/{exerciseLog}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
destroy.url = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { exerciseLog: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { exerciseLog: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            exerciseLog: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        exerciseLog: typeof args.exerciseLog === 'object'
        ? args.exerciseLog.id
        : args.exerciseLog,
    }

    return destroy.definition.url
            .replace('{exerciseLog}', parsedArgs.exerciseLog.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
destroy.delete = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\DiaryController::destroy
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
const destroyForm = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see app/Http/Controllers/DiaryController.php:238
* @route '/diary/exercises/{exerciseLog}'
*/
destroyForm.delete = (args: { exerciseLog: number | { id: number } } | [exerciseLog: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const exercises = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default exercises