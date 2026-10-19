import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:25
* @route '/settings/ai'
*/
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/ai',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:25
* @route '/settings/ai'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:25
* @route '/settings/ai'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:25
* @route '/settings/ai'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:25
* @route '/settings/ai'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:25
* @route '/settings/ai'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:25
* @route '/settings/ai'
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
* @see \App\Http\Controllers\Settings\AiSettingsController::connect
* @see app/Http/Controllers/Settings/AiSettingsController.php:51
* @route '/settings/ai/connect'
*/
export const connect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

connect.definition = {
    methods: ["post"],
    url: '/settings/ai/connect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::connect
* @see app/Http/Controllers/Settings/AiSettingsController.php:51
* @route '/settings/ai/connect'
*/
connect.url = (options?: RouteQueryOptions) => {
    return connect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::connect
* @see app/Http/Controllers/Settings/AiSettingsController.php:51
* @route '/settings/ai/connect'
*/
connect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::connect
* @see app/Http/Controllers/Settings/AiSettingsController.php:51
* @route '/settings/ai/connect'
*/
const connectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::connect
* @see app/Http/Controllers/Settings/AiSettingsController.php:51
* @route '/settings/ai/connect'
*/
connectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

connect.form = connectForm

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:88
* @route '/settings/ai/disconnect'
*/
export const disconnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

disconnect.definition = {
    methods: ["post"],
    url: '/settings/ai/disconnect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:88
* @route '/settings/ai/disconnect'
*/
disconnect.url = (options?: RouteQueryOptions) => {
    return disconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:88
* @route '/settings/ai/disconnect'
*/
disconnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:88
* @route '/settings/ai/disconnect'
*/
const disconnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:88
* @route '/settings/ai/disconnect'
*/
disconnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

disconnect.form = disconnectForm

const ai = {
    edit: Object.assign(edit, edit),
    connect: Object.assign(connect, connect),
    disconnect: Object.assign(disconnect, disconnect),
}

export default ai