'use client';

import { Globe } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LanguageSwitcher() {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 font-medium text-foreground/40 cursor-not-allowed"
          >
            <Globe className="h-3.5 w-3.5" />
            EN
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">हिंदी &amp; తెలుగు coming soon</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
