'use client';
import * as React from 'react';
import { DateRange, DayPicker, DropdownProps, getDefaultClassNames } from 'react-day-picker';
import { buttonVariants } from '@/components/ui/button';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function CustomSelectDropdown(props: DropdownProps) {
  const { options, value, onChange } = props;

  const handleValueChange = (newValue: string) => {
    if (onChange) {
      const syntheticEvent = {
        target: {
          value: newValue,
        },
      } as React.ChangeEvent<HTMLSelectElement>;

      onChange(syntheticEvent);
    }
  };

  return (
    <Select value={value?.toString()} onValueChange={handleValueChange}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        <SelectGroup>
          {options?.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value.toString()}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  defaultMonth,
  index = 0,
  ...props
}: CalendarProps & { index?: number; selected?: DateRange | Date | Date[] | undefined }) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    if (
      props.mode === 'range' &&
      typeof props.selected === 'object' &&
      props.selected &&
      'from' in props.selected &&
      props.selected.from instanceof Date
    ) {
      return new Date(props.selected.from.getFullYear(), props.selected.from.getMonth() + index, 1);
    }

    if (defaultMonth) {
      return new Date(defaultMonth.getFullYear(), defaultMonth.getMonth() + index, 1);
    }

    return new Date();
  });
  React.useEffect(() => {
    if (props.mode === 'range') {
      const selected = props.selected as DateRange | undefined;
      if (selected?.from instanceof Date) {
        const newDate = new Date(selected.from);
        newDate.setMonth(newDate.getMonth() + index);
        setCurrentMonth(newDate);
      }
    }

    if (props.mode === 'single') {
      const selected = props.selected as Date | undefined;
      if (selected instanceof Date) {
        const newDate = new Date(selected);
        newDate.setMonth(newDate.getMonth() + index);
        setCurrentMonth(newDate);
      }
    }

    if (props.mode === 'multiple') {
      const selected = props.selected as Date[] | undefined;
      if (Array.isArray(selected) && selected.length > 0 && selected[0] instanceof Date) {
        const newDate = new Date(selected[0]);
        newDate.setMonth(newDate.getMonth() + index);
        setCurrentMonth(newDate);
      }
    }
  }, [props.selected, props.mode, index]);

  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      defaultMonth={defaultMonth}
      month={currentMonth}
      onMonthChange={(date) => setCurrentMonth(date)}
      captionLayout="dropdown"
      startMonth={new Date(1970, 0)}
      endMonth={new Date(new Date().getFullYear() + 10, 11)}
      navLayout="around"
      className={cn('p-3', className)}
      components={{ Dropdown: CustomSelectDropdown }}
      classNames={{
        month_grid: `${defaultClassNames.month_grid} mx-auto border-spacing-0.5 !border-separate`,
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center gap-2',
        caption_label: 'text-sm font-medium',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100'
        ),
        button_previous:
          'h-8 w-8 group p-0 m-0 transition flex items-center justify-center hover:bg-primary hover:text-primary-foreground rounded-md absolute  top-[17.5px] ',
        chevron: `fill-primary group-hover:fill-primary-foreground`,
        button_next:
          'h-8 w-8 group p-0 m-0 transition flex items-center justify-center hover:bg-primary hover:text-primary-foreground rounded-md absolute  top-[17.5px]  right-3.5',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: 'h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        day: '',
        range_start: '',
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-primary hover:text-primary-foreground '
        ),
        range_end: 'day-range-end',
        selected:
          'bg-primary rounded-md text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        today: 'rounded-md text-primary',
        outside:
          'day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground',
        disabled: 'text-muted-foreground opacity-50',
        range_middle: 'aria-selected:bg-primary/5 dark:aria-selected:bg-primary/20 aria-selected:text-accent-foreground',
        // hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';
export { Calendar };
