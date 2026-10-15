import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\AuthController::store
* @see app/Http/Controllers/Api/V1/AuthController.php:18
* @route '/api/v1/auth/tokens'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/auth/tokens',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::store
* @see app/Http/Controllers/Api/V1/AuthController.php:18
* @route '/api/v1/auth/tokens'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::store
* @see app/Http/Controllers/Api/V1/AuthController.php:18
* @route '/api/v1/auth/tokens'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::store
* @see app/Http/Controllers/Api/V1/AuthController.php:18
* @route '/api/v1/auth/tokens'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::store
* @see app/Http/Controllers/Api/V1/AuthController.php:18
* @route '/api/v1/auth/tokens'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

/**
* @see \App\Http\Controllers\Api\V1\AuthController::index
* @see app/Http/Controllers/Api/V1/AuthController.php:49
* @route '/api/v1/auth/tokens'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/api/v1/auth/tokens',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::index
* @see app/Http/Controllers/Api/V1/AuthController.php:49
* @route '/api/v1/auth/tokens'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::index
* @see app/Http/Controllers/Api/V1/AuthController.php:49
* @route '/api/v1/auth/tokens'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::index
* @see app/Http/Controllers/Api/V1/AuthController.php:49
* @route '/api/v1/auth/tokens'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::index
* @see app/Http/Controllers/Api/V1/AuthController.php:49
* @route '/api/v1/auth/tokens'
*/
const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::index
* @see app/Http/Controllers/Api/V1/AuthController.php:49
* @route '/api/v1/auth/tokens'
*/
indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::index
* @see app/Http/Controllers/Api/V1/AuthController.php:49
* @route '/api/v1/auth/tokens'
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
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
* @see app/Http/Controllers/Api/V1/AuthController.php:69
* @route '/api/v1/auth/tokens/{id}'
*/
export const destroy = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/api/v1/auth/tokens/{id}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
* @see app/Http/Controllers/Api/V1/AuthController.php:69
* @route '/api/v1/auth/tokens/{id}'
*/
destroy.url = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { id: args }
    }

    if (Array.isArray(args)) {
        args = {
            id: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        id: args.id,
    }

    return destroy.definition.url
            .replace('{id}', parsedArgs.id.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
* @see app/Http/Controllers/Api/V1/AuthController.php:69
* @route '/api/v1/auth/tokens/{id}'
*/
destroy.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
* @see app/Http/Controllers/Api/V1/AuthController.php:69
* @route '/api/v1/auth/tokens/{id}'
*/
const destroyForm = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroy.url(args, {
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroy
* @see app/Http/Controllers/Api/V1/AuthController.php:69
* @route '/api/v1/auth/tokens/{id}'
*/
destroyForm.delete = (args: { id: string | number } | [id: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
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
* @see \App\Http\Controllers\Api\V1\AuthController::destroyAll
* @see app/Http/Controllers/Api/V1/AuthController.php:90
* @route '/api/v1/auth/tokens'
*/
export const destroyAll = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyAll.url(options),
    method: 'delete',
})

destroyAll.definition = {
    methods: ["delete"],
    url: '/api/v1/auth/tokens',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroyAll
* @see app/Http/Controllers/Api/V1/AuthController.php:90
* @route '/api/v1/auth/tokens'
*/
destroyAll.url = (options?: RouteQueryOptions) => {
    return destroyAll.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroyAll
* @see app/Http/Controllers/Api/V1/AuthController.php:90
* @route '/api/v1/auth/tokens'
*/
destroyAll.delete = (options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroyAll.url(options),
    method: 'delete',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroyAll
* @see app/Http/Controllers/Api/V1/AuthController.php:90
* @route '/api/v1/auth/tokens'
*/
const destroyAllForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyAll.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::destroyAll
* @see app/Http/Controllers/Api/V1/AuthController.php:90
* @route '/api/v1/auth/tokens'
*/
destroyAllForm.delete = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: destroyAll.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'DELETE',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'post',
})

destroyAll.form = destroyAllForm

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
export const me = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})

me.definition = {
    methods: ["get","head"],
    url: '/api/v1/user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
me.url = (options?: RouteQueryOptions) => {
    return me.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
me.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: me.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
me.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: me.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
const meForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: me.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
meForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: me.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::me
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
meForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: me.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

me.form = meForm

const AuthController = { store, index, destroy, destroyAll, me }

export default AuthController