import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:28
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
* @see app/Http/Controllers/Settings/AiSettingsController.php:28
* @route '/settings/ai'
*/
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:28
* @route '/settings/ai'
*/
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:28
* @route '/settings/ai'
*/
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:28
* @route '/settings/ai'
*/
const editForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:28
* @route '/settings/ai'
*/
editForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: edit.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::edit
* @see app/Http/Controllers/Settings/AiSettingsController.php:28
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
* @see app/Http/Controllers/Settings/AiSettingsController.php:137
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
* @see app/Http/Controllers/Settings/AiSettingsController.php:137
* @route '/settings/ai/connect'
*/
connect.url = (options?: RouteQueryOptions) => {
    return connect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::connect
* @see app/Http/Controllers/Settings/AiSettingsController.php:137
* @route '/settings/ai/connect'
*/
connect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::connect
* @see app/Http/Controllers/Settings/AiSettingsController.php:137
* @route '/settings/ai/connect'
*/
const connectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::connect
* @see app/Http/Controllers/Settings/AiSettingsController.php:137
* @route '/settings/ai/connect'
*/
connectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: connect.url(options),
    method: 'post',
})

connect.form = connectForm

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:180
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
* @see app/Http/Controllers/Settings/AiSettingsController.php:180
* @route '/settings/ai/disconnect'
*/
disconnect.url = (options?: RouteQueryOptions) => {
    return disconnect.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:180
* @route '/settings/ai/disconnect'
*/
disconnect.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:180
* @route '/settings/ai/disconnect'
*/
const disconnectForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::disconnect
* @see app/Http/Controllers/Settings/AiSettingsController.php:180
* @route '/settings/ai/disconnect'
*/
disconnectForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: disconnect.url(options),
    method: 'post',
})

disconnect.form = disconnectForm

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::models
* @see app/Http/Controllers/Settings/AiSettingsController.php:60
* @route '/settings/ai/models'
*/
export const models = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: models.url(options),
    method: 'get',
})

models.definition = {
    methods: ["get","head"],
    url: '/settings/ai/models',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::models
* @see app/Http/Controllers/Settings/AiSettingsController.php:60
* @route '/settings/ai/models'
*/
models.url = (options?: RouteQueryOptions) => {
    return models.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::models
* @see app/Http/Controllers/Settings/AiSettingsController.php:60
* @route '/settings/ai/models'
*/
models.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::models
* @see app/Http/Controllers/Settings/AiSettingsController.php:60
* @route '/settings/ai/models'
*/
models.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: models.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::models
* @see app/Http/Controllers/Settings/AiSettingsController.php:60
* @route '/settings/ai/models'
*/
const modelsForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::models
* @see app/Http/Controllers/Settings/AiSettingsController.php:60
* @route '/settings/ai/models'
*/
modelsForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: models.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::models
* @see app/Http/Controllers/Settings/AiSettingsController.php:60
* @route '/settings/ai/models'
*/
modelsForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: models.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

models.form = modelsForm

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::fetchModels
* @see app/Http/Controllers/Settings/AiSettingsController.php:92
* @route '/settings/ai/models'
*/
export const fetchModels = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fetchModels.url(options),
    method: 'post',
})

fetchModels.definition = {
    methods: ["post"],
    url: '/settings/ai/models',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::fetchModels
* @see app/Http/Controllers/Settings/AiSettingsController.php:92
* @route '/settings/ai/models'
*/
fetchModels.url = (options?: RouteQueryOptions) => {
    return fetchModels.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::fetchModels
* @see app/Http/Controllers/Settings/AiSettingsController.php:92
* @route '/settings/ai/models'
*/
fetchModels.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: fetchModels.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::fetchModels
* @see app/Http/Controllers/Settings/AiSettingsController.php:92
* @route '/settings/ai/models'
*/
const fetchModelsForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: fetchModels.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::fetchModels
* @see app/Http/Controllers/Settings/AiSettingsController.php:92
* @route '/settings/ai/models'
*/
fetchModelsForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: fetchModels.url(options),
    method: 'post',
})

fetchModels.form = fetchModelsForm

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::updateModel
* @see app/Http/Controllers/Settings/AiSettingsController.php:110
* @route '/settings/ai/model'
*/
export const updateModel = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateModel.url(options),
    method: 'patch',
})

updateModel.definition = {
    methods: ["patch"],
    url: '/settings/ai/model',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::updateModel
* @see app/Http/Controllers/Settings/AiSettingsController.php:110
* @route '/settings/ai/model'
*/
updateModel.url = (options?: RouteQueryOptions) => {
    return updateModel.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::updateModel
* @see app/Http/Controllers/Settings/AiSettingsController.php:110
* @route '/settings/ai/model'
*/
updateModel.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateModel.url(options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::updateModel
* @see app/Http/Controllers/Settings/AiSettingsController.php:110
* @route '/settings/ai/model'
*/
const updateModelForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateModel.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Settings\AiSettingsController::updateModel
* @see app/Http/Controllers/Settings/AiSettingsController.php:110
* @route '/settings/ai/model'
*/
updateModelForm.patch = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: updateModel.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'PATCH',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

updateModel.form = updateModelForm

const AiSettingsController = { edit, connect, disconnect, models, fetchModels, updateModel }

export default AiSettingsController