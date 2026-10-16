import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\FoodController::status
* @see app/Http/Controllers/FoodController.php:300
* @route '/foods/sync/status'
*/
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/foods/sync/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\FoodController::status
* @see app/Http/Controllers/FoodController.php:300
* @route '/foods/sync/status'
*/
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\FoodController::status
* @see app/Http/Controllers/FoodController.php:300
* @route '/foods/sync/status'
*/
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::status
* @see app/Http/Controllers/FoodController.php:300
* @route '/foods/sync/status'
*/
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\FoodController::status
* @see app/Http/Controllers/FoodController.php:300
* @route '/foods/sync/status'
*/
const statusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::status
* @see app/Http/Controllers/FoodController.php:300
* @route '/foods/sync/status'
*/
statusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\FoodController::status
* @see app/Http/Controllers/FoodController.php:300
* @route '/foods/sync/status'
*/
statusForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

status.form = statusForm
