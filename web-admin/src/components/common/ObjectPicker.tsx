/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

import { useObjectList, useObjectLabel, useNoPermissionMessage } from '@/lib/objectOptions';
import type { Schema } from '@/types/schema';

interface ObjectPickerProps {
  schema: Schema;
  objectName: string;
  value: string;
  onChange: (id: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function ObjectPicker({ schema, objectName, value, onChange, onClear, placeholder }: ObjectPickerProps) {
  const { t } = useTranslation();
  const list = useObjectList(objectName, schema);
  const fromList = list.options.find((o) => o.id === value)?.label;
  const { label: cheapLabel, loading: labelLoading } = useObjectLabel(
    objectName,
    fromList ? null : value || null,
    schema,
  );
  const display = fromList ?? cheapLabel;
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const noPermissionMessage = useNoPermissionMessage(schema, objectName);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) void list.ensureLoaded();
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {value && (
        <Badge variant="secondary" className="gap-1 pr-1.5 text-sm max-w-xs">
          {labelLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <span className="truncate" title={display ?? value}>
              {display ?? value}
            </span>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
              aria-label={t('common.clear', 'Clear')}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </Badge>
      )}
      {!value && placeholder && <span className="text-sm text-muted-foreground">{placeholder}</span>}
      {noPermissionMessage ? (
        <TooltipProvider>
          <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-not-allowed opacity-60"
                aria-label={t('common.search', 'Search')}
                aria-disabled="true"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setTooltipOpen(true);
                }}
              >
                <Search className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{noPermissionMessage}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={t('common.search', 'Search')}
            >
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-72" align="start">
            <Command>
              <CommandInput placeholder={t('common.searchPlaceholder', 'Search...')} />
              <CommandList>
                {list.loading && (
                  <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.loading', 'Loading...')}
                  </div>
                )}
                {!list.loading && <CommandEmpty>{t('common.noResultsDot', 'No results.')}</CommandEmpty>}
                <CommandGroup>
                  {list.options.map((opt) => (
                    <CommandItem
                      key={opt.id}
                      value={opt.id}
                      keywords={[opt.label]}
                      onSelect={() => {
                        onChange(opt.id);
                        setOpen(false);
                      }}
                    >
                      <span className="truncate" title={opt.label}>
                        {opt.label}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
