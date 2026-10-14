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
        $url = rtrim($this->baseUrl, '/')."/api/v2/product/{$barcode}.json";

        $response = $client->get($url);

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
        $url = rtrim($this->baseUrl, '/').'/cgi/search.pl';

        $response = $client->get($url, [
            'search_terms' => $query,
            'search_simple' => 1,
            'action' => 'process',
            'json' => 1,
            'page' => $page,
            'page_size' => $perPage,
        ]);

        $response->throw();

        /** @var array<string, mixed> $data */
        $data = $response->json();

        /** @var list<array<string, mixed>> $products */
        $products = $data['products'] ?? [];
        $total = (int) ($data['count'] ?? count($products));
        $source = ($connection && $connection->is_connected) ? 'off_authenticated' : 'off_anonymous';

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
        $brand = isset($product['brands']) ? (string) $product['brands'] : null;

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

        $nutriScore = isset($product['nutriscore_grade']) ? strtolower((string) $product['nutriscore_grade']) : null;
        $novaGroup = isset($product['nova_group']) ? (int) $product['nova_group'] : null;
        $ecoScore = isset($product['ecoscore_grade']) ? strtolower((string) $product['ecoscore_grade']) : null;

        return [
            'off_id' => $code ?: null,
            'user_id' => null,
            'is_custom' => false,
            'name' => $name,
            'brand' => $brand,
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
