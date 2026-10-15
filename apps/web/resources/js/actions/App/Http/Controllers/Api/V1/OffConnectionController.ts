import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::status
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:23
* @route '/api/v1/settings/off/status'
*/
export const status = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

status.definition = {
    methods: ["get","head"],
    url: '/api/v1/settings/off/status',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::status
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:23
* @route '/api/v1/settings/off/status'
*/
status.url = (options?: RouteQueryOptions) => {
    return status.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::status
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:23
* @route '/api/v1/settings/off/status'
*/
status.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::status
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:23
* @route '/api/v1/settings/off/status'
*/
status.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: status.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::status
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:23
* @route '/api/v1/settings/off/status'
*/
const statusForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::status
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:23
* @route '/api/v1/settings/off/status'
*/
statusForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: status.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::status
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:23
* @route '/api/v1/settings/off/status'
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

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::connect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:43
* @route '/api/v1/settings/off/connect'
*/
export const connect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

connect.definition = {
    methods: ["post"],
    url: '/api/v1/settings/off/connect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::connect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:43
* @route '/api/v1/settings/off/connect'
*/
connect.url = (options?: RouteQueryOptions) => {
    return connect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::connect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:43
* @route '/api/v1/settings/off/connect'
*/
connect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::connect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:43
* @route '/api/v1/settings/off/connect'
*/
const connectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::connect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:43
* @route '/api/v1/settings/off/connect'
*/
connectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

connect.form = connectForm

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::disconnect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:81
* @route '/api/v1/settings/off/disconnect'
*/
export const disconnect = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

disconnect.definition = {
    methods: ["post"],
    url: '/api/v1/settings/off/disconnect',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::disconnect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:81
* @route '/api/v1/settings/off/disconnect'
*/
disconnect.url = (options?: RouteQueryOptions) => {
    return disconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::disconnect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:81
* @route '/api/v1/settings/off/disconnect'
*/
disconnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::disconnect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:81
* @route '/api/v1/settings/off/disconnect'
*/
const disconnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\OffConnectionController::disconnect
* @see app/Http/Controllers/Api/V1/OffConnectionController.php:81
* @route '/api/v1/settings/off/disconnect'
*/
disconnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

disconnect.form = disconnectForm

const OffConnectionController = { status, connect, disconnect }

export default OffConnectionController