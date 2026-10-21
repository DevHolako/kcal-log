import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:197
* @route '/api/v1/diary/measurements'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/diary/measurements',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:197
* @route '/api/v1/diary/measurements'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:197
* @route '/api/v1/diary/measurements'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:197
* @route '/api/v1/diary/measurements'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::store
* @see app/Http/Controllers/Api/V1/DiaryController.php:197
* @route '/api/v1/diary/measurements'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:217
* @route '/api/v1/diary/measurements'
*/
export const destroy = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/diary/measurements',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:217
* @route '/api/v1/diary/measurements'
*/
destroy.url = (options?: RouteQueryOptions) => {
    return destroy.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:217
* @route '/api/v1/diary/measurements'
*/
destroy.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:217
* @route '/api/v1/diary/measurements'
*/
const destroyForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\DiaryController::destroy
* @see app/Http/Controllers/Api/V1/DiaryController.php:217
* @route '/api/v1/diary/measurements'
*/
destroyForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

const measurements = {
    store: Object.assign(store, store),
    destroy: Object.assign(destroy, destroy),
}

export default measurements