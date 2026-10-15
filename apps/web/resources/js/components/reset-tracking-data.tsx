import { router } from '@inertiajs/react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

export default function ResetTrackingData() {
    const [isOpen, setIsOpen] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    const handleReset = () => {
        setIsResetting(true);
        router.post(
            '/settings/profile/reset-data',
            {},
            {
                onFinish: () => {
                    setIsResetting(false);
                    setIsOpen(false);
                },
            },
        );
    };

    return (
        <div className="space-y-6">
            <Heading
                variant="small"
                title="Reset Tracking Data"
                description="Clear your food diary, weigh-ins, hydration, and adaptive targets to start fresh."
            />
            <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/30 dark:bg-amber-950/20">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="space-y-1 text-sm">
                        <p className="font-semibold text-amber-900 dark:text-amber-200">
                            Clear all nutrition logs & restart onboarding
                        </p>
                        <p className="text-amber-700 dark:text-amber-300">
                            This will erase all daily food diary logs, recorded
                            weight logs, water tracking, and strategy proposals.
                            Your user account and password will remain active,
                            and you will be redirected to setup your plan from
                            scratch.
                        </p>
                    </div>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="gap-2 border-amber-300 text-amber-900 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/40"
                            data-test="reset-tracking-data-button"
                        >
                            <RotateCcw className="h-4 w-4" />
                            Reset All Tracking Data
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Reset All Tracking Data & Start Fresh?
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to reset your tracking
                                history? All logged food entries, body weight
                                entries, water intake, and adaptive checkpoints
                                will be permanently deleted. Your user
                                credentials will stay intact, and you will
                                immediately enter the setup wizard.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter className="gap-2 pt-2">
                            <DialogClose asChild>
                                <Button
                                    variant="secondary"
                                    disabled={isResetting}
                                >
                                    Cancel
                                </Button>
                            </DialogClose>

                            <Button
                                variant="destructive"
                                onClick={handleReset}
                                disabled={isResetting}
                                className="gap-2 bg-amber-600 text-white hover:bg-amber-700"
                                data-test="confirm-reset-tracking-data-button"
                            >
                                <RotateCcw className="h-4 w-4" />
                                {isResetting
                                    ? 'Resetting Data...'
                                    : 'Confirm Reset & Restart Setup'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
