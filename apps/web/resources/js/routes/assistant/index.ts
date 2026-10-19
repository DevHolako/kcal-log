import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../wayfinder'
import conversations from './conversations'
/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:35
* @route '/assistant'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/assistant',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:35
* @route '/assistant'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:35
* @route '/assistant'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:35
* @route '/assistant'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:35
* @route '/assistant'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:35
* @route '/assistant'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:35
* @route '/assistant'
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

const assistant = {
    index: Object.assign(index, index),
    conversations: Object.assign(conversations, conversations),
}

export default assistant