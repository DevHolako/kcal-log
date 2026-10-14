<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class VerifyUserCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:verify {email : The email address of the user to verify}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Mark a user email address as verified';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->argument('email');
        if (! is_string($email)) {
            $this->error('The email argument must be a string.');

            return Command::FAILURE;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User with email {$email} not found.");

            return Command::FAILURE;
        }

        $user->markEmailAsVerified();
        $this->info("User {$email} email has been marked as verified.");

        return Command::SUCCESS;
    }
}
