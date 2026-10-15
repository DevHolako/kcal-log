import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\Api\V1\OnboardingController::store
* @see app/Http/Controllers/Api/V1/OnboardingController.php:16
* @route '/api/v1/onboarding'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/api/v1/onboarding',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Api\V1\OnboardingController::store
* @see app/Http/Controllers/Api/V1/OnboardingController.php:16
* @route '/api/v1/onboarding'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Api\V1\OnboardingController::store
* @see app/Http/Controllers/Api/V1/OnboardingController.php:16
* @route '/api/v1/onboarding'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\OnboardingController::store
* @see app/Http/Controllers/Api/V1/OnboardingController.php:16
* @route '/api/v1/onboarding'
*/
const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Api\V1\OnboardingController::store
* @see app/Http/Controllers/Api/V1/OnboardingController.php:16
* @route '/api/v1/onboarding'
*/
storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
    action: store.url(options),
    method: 'post',
})

store.form = storeForm

const onboarding = {
    store: Object.assign(store, store),
}

export default onboarding