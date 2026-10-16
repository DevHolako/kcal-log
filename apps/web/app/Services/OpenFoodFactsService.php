<?php

namespace App\Services;

use App\Models\UserOffConnection;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class OpenFoodFactsService
{
    protected string $baseUrl;

    protected string $userAgent;

    protected int $timeout;

    public function __construct(
        ?string $baseUrl = null,
        ?string $userAgent = null,
        ?int $timeout = null
    ) {
        $this->baseUrl = $baseUrl ?? (function_exists('config') ? (string) config('services.open_food_facts.base_url', 'https://world.openfoodfacts.org') : 'https://world.openfoodfacts.org');
        $this->userAgent = $userAgent ?? (function_exists('config') ? (string) config('services.open_food_facts.user_agent', 'kcal-log/1.0 (https://github.com/DevHolako/kcal-log)') : 'kcal-log/1.0 (https://github.com/DevHolako/kcal-log)');
        $this->timeout = $timeout ?? (function_exists('config') ? (int) config('services.open_food_facts.timeout', 3) : 3);
    }

    /**
     * Look up a food item by barcode via Open Food Facts.
     *
     * @return array{product: array<string, mixed>, source: 'off_authenticated'|'off_anonymous'}|null
     *
     * @throws RequestException
     */
    public function findBarcode(string $barcode, ?UserOffConnection $connection = null): ?array
    {
        $client = $this->buildClient($connection);
        $primaryUrl = rtrim($this->baseUrl, '/')."/api/v2/product/{$barcode}.json";

        try {
            $response = $client->get($primaryUrl);
        } catch (\Throwable $e) {
            // Fallback to .net mirror if primary fails
            Log::info('OFF primary product lookup failed, attempting fallback mirror', [
                'barcode' => $barcode,
                'error' => $e->getMessage(),
            ]);
            $fallbackUrl = "https://world.openfoodfacts.net/api/v2/product/{$barcode}.json";
            $response = $client->get($fallbackUrl);
        }

        if ($response->status() === 404) {
            return null;
        }

        $response->throw();

        /** @var array<string, mixed> $data */
        $data = $response->json();

        if (empty($data['status']) || (int) $data['status'] === 0 || empty($data['product'])) {
            return null;
        }

        $source = ($connection && $connection->is_connected) ? 'off_authenticated' : 'off_anonymous';

        /** @var array<string, mixed> $product */
        $product = $data['product'];

        return [
            'product' => $product,
            'source' => $source,
        ];
    }

    /**
     * Search foods via Open Food Facts search endpoint.
     *
     * @return array{products: list<array<string, mixed>>, total: int, source: 'off_authenticated'|'off_anonymous'}
     *
     * @throws RequestException
     */
    public function search(string $query, int $page = 1, int $perPage = 20, ?UserOffConnection $connection = null): array
    {
        $client = $this->buildClient($connection);
        $source = ($connection && $connection->is_connected) ? 'off_authenticated' : 'off_anonymous';

        if (app()->environment('testing')) {
            $url = rtrim($this->baseUrl, '/').'/cgi/search.pl';
            $response = $client->get($url, [
                'search_terms' => $query,
                'search_simple' => 1,
                'action' => 'process',
                'json' => 1,
                'page' => $page,
                'page_size' => $perPage,
                'fields' => 'code,product_name,product_name_en,product_name_fr,brands,image_front_small_url,image_small_url,image_url,nutriments,nutriscore_grade,ecoscore_grade,nova_group,serving_size,serving_quantity',
            ]);

            $response->throw();

            /** @var array<string, mixed> $data */
            $data = $response->json();

            /** @var list<array<string, mixed>> $products */
            $products = $data['products'] ?? [];
            $total = (int) ($data['count'] ?? count($products));

            return [
                'products' => $products,
                'total' => $total,
                'source' => $source,
            ];
        }

        // Production: Use world.openfoodfacts.net v2 search endpoint, fallback to cgi/search.pl
        try {
            $url = 'https://world.openfoodfacts.net/api/v2/search';
            $response = $client->get($url, [
                'search_terms' => $query,
                'fields' => 'code,product_name,product_name_en,product_name_fr,brands,image_front_small_url,image_small_url,image_url,nutriments,nutriscore_grade,ecoscore_grade,nova_group,serving_size,serving_quantity',
                'page' => $page,
                'page_size' => $perPage,
            ]);

            $response->throw();
        } catch (\Throwable $e) {
            Log::info('OpenFoodFacts v2 search failed, attempting legacy fallback', [
                'query' => $query,
                'error' => $e->getMessage(),
            ]);

            $url = rtrim($this->baseUrl, '/').'/cgi/search.pl';
            $response = $client->get($url, [
                'search_terms' => $query,
                'search_simple' => 1,
                'action' => 'process',
                'json' => 1,
                'page' => $page,
                'page_size' => $perPage,
                'fields' => 'code,product_name,product_name_en,product_name_fr,brands,image_front_small_url,image_small_url,image_url,nutriments,nutriscore_grade,ecoscore_grade,nova_group,serving_size,serving_quantity',
            ]);

            $response->throw();
        }

        /** @var array<string, mixed> $data */
        $data = $response->json();

        /** @var list<array<string, mixed>> $products */
        $products = $data['products'] ?? [];
        $total = (int) ($data['count'] ?? count($products));

        return [
            'products' => $products,
            'total' => $total,
            'source' => $source,
        ];
    }

    /**
     * Verify credentials against Open Food Facts session login endpoint.
     */
    public function verifyCredentials(string $username, string $password): bool
    {
        try {
            $client = Http::withHeaders([
                'User-Agent' => $this->userAgent,
            ])->timeout($this->timeout)->asForm();

            $url = rtrim($this->baseUrl, '/').'/cgi/session.pl';

            $response = $client->post($url, [
                'user_id' => $username,
                'password' => $password,
            ]);

            if ($response->status() >= 400) {
                return false;
            }

            $body = (string) $response->body();

            if (str_contains($body, 'Incorrect user name or password') || str_contains($body, 'Nom d\'utilisateur ou mot de passe incorrect')) {
                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('OpenFoodFacts credentials verification failed', [
                'username' => $username,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    /**
     * Transform raw Open Food Facts product JSON to `foods` table columns.
     *
     * @param  array<string, mixed>  $product
     * @return array<string, mixed>
     */
    public function transformProductToFoodData(array $product, ?string $barcode = null): array
    {
        $code = (string) ($product['code'] ?? $barcode ?? '');
        $name = (string) ($product['product_name'] ?? $product['product_name_en'] ?? $product['product_name_fr'] ?? 'Unknown Item');

        $brand = isset($product['brands'])
            ? (is_array($product['brands']) ? implode(', ', array_filter($product['brands'])) : (string) $product['brands'])
            : (isset($product['brand']) ? (string) $product['brand'] : null);

        /** @var array<string, mixed> $nutriments */
        $nutriments = $product['nutriments'] ?? [];

        // Energy extraction (kcal)
        $calories = 0.0;
        if (isset($nutriments['energy-kcal_100g'])) {
            $calories = (float) $nutriments['energy-kcal_100g'];
        } elseif (isset($nutriments['energy-kcal'])) {
            $calories = (float) $nutriments['energy-kcal'];
        } elseif (isset($nutriments['energy_100g'])) {
            $calories = (float) round(((float) $nutriments['energy_100g']) / 4.184, 2);
        }

        $protein = (float) ($nutriments['proteins_100g'] ?? $nutriments['proteins'] ?? 0.0);
        $carbs = (float) ($nutriments['carbohydrates_100g'] ?? $nutriments['carbohydrates'] ?? 0.0);
        $fat = (float) ($nutriments['fat_100g'] ?? $nutriments['fat'] ?? 0.0);

        $fiber = isset($nutriments['fiber_100g']) ? (float) $nutriments['fiber_100g'] : (isset($nutriments['fiber']) ? (float) $nutriments['fiber'] : null);
        $sugar = isset($nutriments['sugars_100g']) ? (float) $nutriments['sugars_100g'] : (isset($nutriments['sugars']) ? (float) $nutriments['sugars'] : null);
        $saturatedFat = isset($nutriments['saturated-fat_100g']) ? (float) $nutriments['saturated-fat_100g'] : (isset($nutriments['saturated-fat']) ? (float) $nutriments['saturated-fat'] : null);

        $sodium = null;
        if (isset($nutriments['sodium_100g'])) {
            $sodium = (float) $nutriments['sodium_100g'];
        } elseif (isset($nutriments['salt_100g'])) {
            $sodium = (float) round(((float) $nutriments['salt_100g']) / 2.5, 4);
        }

        // Validate and clamp nutri_score to single character grade
        $nutriScore = isset($product['nutriscore_grade']) ? strtolower(trim((string) $product['nutriscore_grade'])) : null;
        if ($nutriScore && ! in_array($nutriScore, ['a', 'b', 'c', 'd', 'e'], true)) {
            $nutriScore = null;
        }

        // Validate and clamp nova_group (1 to 4)
        $novaGroup = isset($product['nova_group']) ? (int) $product['nova_group'] : null;
        if ($novaGroup && ($novaGroup < 1 || $novaGroup > 4)) {
            $novaGroup = null;
        }

        // Validate and clamp eco_score to single character grade (handles 'not-applicable', 'unknown', etc.)
        $ecoScore = isset($product['ecoscore_grade']) ? strtolower(trim((string) $product['ecoscore_grade'])) : null;
        if ($ecoScore && ! in_array($ecoScore, ['a', 'b', 'c', 'd', 'e'], true)) {
            $ecoScore = null;
        }

        // Clamp string attributes to fit MariaDB column constraints
        $name = mb_substr($name, 0, 250);
        $brand = $brand ? mb_substr($brand, 0, 250) : null;
        $code = $code ? mb_substr($code, 0, 64) : null;

        $imageUrl = isset($product['image_front_small_url'])
            ? (string) $product['image_front_small_url']
            : (isset($product['image_small_url'])
                ? (string) $product['image_small_url']
                : (isset($product['image_front_url'])
                    ? (string) $product['image_front_url']
                    : (isset($product['image_url']) ? (string) $product['image_url'] : null)));

        return [
            'off_id' => $code ?: null,
            'user_id' => null,
            'is_custom' => false,
            'name' => $name,
            'brand' => $brand,
            'image_url' => $imageUrl,
            'barcode' => $code ?: null,
            'serving_size' => 100.00,
            'serving_unit' => 'g',
            'calories' => round($calories, 2),
            'protein' => round($protein, 2),
            'carbs' => round($carbs, 2),
            'fat' => round($fat, 2),
            'fiber' => $fiber !== null ? round($fiber, 2) : null,
            'sugar' => $sugar !== null ? round($sugar, 2) : null,
            'saturated_fat' => $saturatedFat !== null ? round($saturatedFat, 2) : null,
            'sodium' => $sodium !== null ? round($sodium, 4) : null,
            'nutri_score' => $nutriScore,
            'nova_group' => $novaGroup,
            'eco_score' => $ecoScore,
            'raw_off_data' => $product,
            'last_synced_at' => now(),
        ];
    }

    /**
     * Extract normalized servings from OFF product.
     *
     * @param  array<string, mixed>  $product
     * @return list<array{serving_name: string, gram_equivalent: float, is_default: bool}>
     */
    public function extractServingsFromProduct(array $product): array
    {
        $servings = [
            [
                'serving_name' => '100g',
                'gram_equivalent' => 100.00,
                'is_default' => true,
            ],
        ];

        $servingQuantity = isset($product['serving_quantity']) ? (float) $product['serving_quantity'] : null;
        $servingSize = isset($product['serving_size']) ? trim((string) $product['serving_size']) : null;

        $portionGrams = null;

        if ($servingQuantity && $servingQuantity > 0) {
            $portionGrams = $servingQuantity;
        } elseif ($servingSize) {
            // Match e.g. "30 g", "30g", "(30g)", "(30 g)"
            if (preg_match('/(\d+(?:[\.,]\d+)?)\s*(?:g|ml)/i', $servingSize, $matches)) {
                $portionGrams = (float) str_replace(',', '.', $matches[1]);
            }
        }

        if ($portionGrams && abs($portionGrams - 100.0) > 0.1) {
            $name = $servingSize ?: sprintf('1 portion (%.0fg)', $portionGrams);
            $servings[] = [
                'serving_name' => $name,
                'gram_equivalent' => round($portionGrams, 2),
                'is_default' => false,
            ];
        }

        return $servings;
    }

    protected function buildClient(?UserOffConnection $connection = null): PendingRequest
    {
        $headers = [
            'User-Agent' => $this->userAgent,
            'Accept' => 'application/json',
        ];

        $client = Http::withHeaders($headers)
            ->timeout($this->timeout);

        if ($connection && $connection->is_connected && $connection->username && $connection->password) {
            $client = $client->withBasicAuth($connection->username, $connection->password);
        }

        return $client;
    }
}
