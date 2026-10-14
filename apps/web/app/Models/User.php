<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * @return HasOne<Profile, $this>
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * @return HasMany<TargetProfile, $this>
     */
    public function targetProfiles(): HasMany
    {
        return $this->hasMany(TargetProfile::class);
    }

    /**
     * @return HasOne<TargetProfile, $this>
     */
    public function activeTargetProfile(): HasOne
    {
        return $this->hasOne(TargetProfile::class)->where('is_active', true)->latestOfMany();
    }

    /**
     * @return HasOne<UserOffConnection, $this>
     */
    public function offConnection(): HasOne
    {
        return $this->hasOne(UserOffConnection::class);
    }

    /**
     * @return HasMany<Food, $this>
     */
    public function customFoods(): HasMany
    {
        return $this->hasMany(Food::class)->where('is_custom', true);
    }

    /**
     * @return HasMany<DiaryEntry, $this>
     */
    public function diaryEntries(): HasMany
    {
        return $this->hasMany(DiaryEntry::class);
    }

    /**
     * @return HasMany<MealRecipe, $this>
     */
    public function mealsRecipes(): HasMany
    {
        return $this->hasMany(MealRecipe::class);
    }

    /**
     * @return HasMany<WaterLog, $this>
     */
    public function waterLogs(): HasMany
    {
        return $this->hasMany(WaterLog::class);
    }

    /**
     * @return HasMany<WeightLog, $this>
     */
    public function weightLogs(): HasMany
    {
        return $this->hasMany(WeightLog::class);
    }

    /**
     * @return HasMany<BodyMeasurement, $this>
     */
    public function bodyMeasurements(): HasMany
    {
        return $this->hasMany(BodyMeasurement::class);
    }

    /**
     * @return HasMany<ExerciseLog, $this>
     */
    public function exerciseLogs(): HasMany
    {
        return $this->hasMany(ExerciseLog::class);
    }

    /**
     * @return HasMany<ReportExport, $this>
     */
    public function reportExports(): HasMany
    {
        return $this->hasMany(ReportExport::class);
    }

    /**
     * @return HasMany<AdaptiveAdjustment, $this>
     */
    public function adaptiveAdjustments(): HasMany
    {
        return $this->hasMany(AdaptiveAdjustment::class);
    }
}
