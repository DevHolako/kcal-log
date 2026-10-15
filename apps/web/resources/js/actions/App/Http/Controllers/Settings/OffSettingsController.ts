import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\OffSettingsController::edit
* @see app/Http/Controllers/Settings/OffSettingsController.php:25
* @route '/settings/open-food-facts'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/open-food-facts',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::edit
* @see app/Http/Controllers/Settings/OffSettingsController.php:25
* @route '/settings/open-food-facts'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::edit
* @see app/Http/Controllers/Settings/OffSettingsController.php:25
* @route '/settings/open-food-facts'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::edit
* @see app/Http/Controllers/Settings/OffSettingsController.php:25
* @route '/settings/open-food-facts'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::edit
* @see app/Http/Controllers/Settings/OffSettingsController.php:25
* @route '/settings/open-food-facts'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::edit
* @see app/Http/Controllers/Settings/OffSettingsController.php:25
* @route '/settings/open-food-facts'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::edit
* @see app/Http/Controllers/Settings/OffSettingsController.php:25
* @route '/settings/open-food-facts'
*/
editForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

edit.form = editForm

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::connect
* @see app/Http/Controllers/Settings/OffSettingsController.php:48
* @route '/settings/open-food-facts/connect'
*/
export const connect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

connect.definition = {
    methods: ["post"],
    url: '/settings/open-food-facts/connect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::connect
* @see app/Http/Controllers/Settings/OffSettingsController.php:48
* @route '/settings/open-food-facts/connect'
*/
connect.url = (options?: RouteQueryOptions) => {
    return connect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::connect
* @see app/Http/Controllers/Settings/OffSettingsController.php:48
* @route '/settings/open-food-facts/connect'
*/
connect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::connect
* @see app/Http/Controllers/Settings/OffSettingsController.php:48
* @route '/settings/open-food-facts/connect'
*/
const connectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::connect
* @see app/Http/Controllers/Settings/OffSettingsController.php:48
* @route '/settings/open-food-facts/connect'
*/
connectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

connect.form = connectForm

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::disconnect
* @see app/Http/Controllers/Settings/OffSettingsController.php:80
* @route '/settings/open-food-facts/disconnect'
*/
export const disconnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

disconnect.definition = {
    methods: ["post"],
    url: '/settings/open-food-facts/disconnect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::disconnect
* @see app/Http/Controllers/Settings/OffSettingsController.php:80
* @route '/settings/open-food-facts/disconnect'
*/
disconnect.url = (options?: RouteQueryOptions) => {
    return disconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::disconnect
* @see app/Http/Controllers/Settings/OffSettingsController.php:80
* @route '/settings/open-food-facts/disconnect'
*/
disconnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::disconnect
* @see app/Http/Controllers/Settings/OffSettingsController.php:80
* @route '/settings/open-food-facts/disconnect'
*/
const disconnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\OffSettingsController::disconnect
* @see app/Http/Controllers/Settings/OffSettingsController.php:80
* @route '/settings/open-food-facts/disconnect'
*/
disconnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

disconnect.form = disconnectForm

const OffSettingsController = { edit, connect, disconnect }

export default OffSettingsController