import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:32
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
* @see app/Http/Controllers/Assistant/AssistantController.php:32
* @route '/assistant'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:32
* @route '/assistant'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:32
* @route '/assistant'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:32
* @route '/assistant'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:32
* @route '/assistant'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::index
* @see app/Http/Controllers/Assistant/AssistantController.php:32
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

/**
* @see \App\Http\Controllers\Assistant\AssistantController::store
* @see app/Http/Controllers/Assistant/AssistantController.php:81
* @route '/assistant/conversations'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/assistant/conversations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Assistant\AssistantController::store
* @see app/Http/Controllers/Assistant/AssistantController.php:81
* @route '/assistant/conversations'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Assistant\AssistantController::store
* @see app/Http/Controllers/Assistant/AssistantController.php:81
* @route '/assistant/conversations'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::store
* @see app/Http/Controllers/Assistant/AssistantController.php:81
* @route '/assistant/conversations'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::store
* @see app/Http/Controllers/Assistant/AssistantController.php:81
* @route '/assistant/conversations'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Assistant\AssistantController::destroy
* @see app/Http/Controllers/Assistant/AssistantController.php:97
* @route '/assistant/conversations/{conversation}'
*/
export const destroy = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/assistant/conversations/{conversation}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Assistant\AssistantController::destroy
* @see app/Http/Controllers/Assistant/AssistantController.php:97
* @route '/assistant/conversations/{conversation}'
*/
destroy.url = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { conversation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
    }

    return destroy.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Assistant\AssistantController::destroy
* @see app/Http/Controllers/Assistant/AssistantController.php:97
* @route '/assistant/conversations/{conversation}'
*/
destroy.delete = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::destroy
* @see app/Http/Controllers/Assistant/AssistantController.php:97
* @route '/assistant/conversations/{conversation}'
*/
const destroyForm = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::destroy
* @see app/Http/Controllers/Assistant/AssistantController.php:97
* @route '/assistant/conversations/{conversation}'
*/
destroyForm.delete = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroy.form = destroyForm

/**
* @see \App\Http\Controllers\Assistant\AssistantController::stream
* @see app/Http/Controllers/Assistant/AssistantController.php:114
* @route '/assistant/conversations/{conversation}/stream'
*/
export const stream = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(args, options),
    method: 'post',
})

stream.definition = {
    methods: ["post"],
    url: '/assistant/conversations/{conversation}/stream',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Assistant\AssistantController::stream
* @see app/Http/Controllers/Assistant/AssistantController.php:114
* @route '/assistant/conversations/{conversation}/stream'
*/
stream.url = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { conversation: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { conversation: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            conversation: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        conversation: typeof args.conversation === 'object'
        ? args.conversation.id
        : args.conversation,
    }

    return stream.definition.url
            .replace('{conversation}', parsedArgs.conversation.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Assistant\AssistantController::stream
* @see app/Http/Controllers/Assistant/AssistantController.php:114
* @route '/assistant/conversations/{conversation}/stream'
*/
stream.post = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: stream.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::stream
* @see app/Http/Controllers/Assistant/AssistantController.php:114
* @route '/assistant/conversations/{conversation}/stream'
*/
const streamForm = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stream.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Assistant\AssistantController::stream
* @see app/Http/Controllers/Assistant/AssistantController.php:114
* @route '/assistant/conversations/{conversation}/stream'
*/
streamForm.post = (args: { conversation: number | { id: number } } | [conversation: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: stream.url(args, options),
    method: 'post',
})

stream.form = streamForm

const AssistantController = { index, store, destroy, stream }

export default AssistantController