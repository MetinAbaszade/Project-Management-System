'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover } from '@/components/ui/Popover';

interface DatePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
  displayFormat?: string;
  placeholder?: string;
}

export function DatePicker({
  date,
  onDateChange,
  displayFormat = 'PP',
  placeholder = 'Select date'
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Calendar className="mr-2 h-4 w-4" />
          {date ? format(date, displayFormat) : <span className="text-muted-foreground">{placeholder}</span>}
        </Button>
      }
    >
      <div className="p-2">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(date) => {
            onDateChange(date);
            setOpen(false);
          }}
          initialFocus
        />
        {date && (
          <div className="flex justify-end mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDateChange(null);
                setOpen(false);
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </Popover>
  );
}