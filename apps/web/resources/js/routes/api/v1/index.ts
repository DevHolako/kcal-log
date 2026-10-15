import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../wayfinder'
import auth from './auth'
import onboarding from './onboarding'
import foods from './foods'
import settings from './settings'
import diary from './diary'
import recipes from './recipes'
import reports from './reports'
import adaptive from './adaptive'
/**
* @see \App\Http\Controllers\Api\V1\AuthController::user
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
export const user = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user.url(options),
    method: 'get',
})

user.definition = {
    methods: ["get","head"],
    url: '/api/v1/user',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Api\V1\AuthController::user
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
user.url = (options?: RouteQueryOptions) => {
    return user.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\AuthController::user
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
user.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: user.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::user
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
user.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: user.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::user
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
const userForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: user.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::user
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
userForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: user.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Api\V1\AuthController::user
* @see app/Http/Controllers/Api/V1/AuthController.php:105
* @route '/api/v1/user'
*/
userForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
    action: user.url({
        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
            _method: 'HEAD',
            ...(options?.query ?? options?.mergeQuery ?? {}),
        }
    }),
    method: 'get',
})

user.form = userForm

const v1 = {
    auth: Object.assign(auth, auth),
    user: Object.assign(user, user),
    onboarding: Object.assign(onboarding, onboarding),
    foods: Object.assign(foods, foods),
    settings: Object.assign(settings, settings),
    diary: Object.assign(diary, diary),
    recipes: Object.assign(recipes, recipes),
    reports: Object.assign(reports, reports),
    adaptive: Object.assign(adaptive, adaptive),
}

export default v1