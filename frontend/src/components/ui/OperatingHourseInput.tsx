import { useState, useEffect } from "react";
import {Clock, X} from 'lucide-react'

interface timeSlot {
    day: string;
    isOpen: boolean;
    openTime: string;
    closeTime: string;
}

interface OperatingHoursInputProps {
    value?: string;
    onChange: (value: string) => void
    label?: string;
    error?: string;
}

const DAYS = [
    {id: 'monday', label: 'Mon'},
    { id: 'tuesday', label: 'Tue' },
    { id: 'wednesday', label: 'Wed' },
    { id: 'thursday', label: 'Thu' },
    { id: 'friday', label: 'Fri' },
    { id: 'saturday', label: 'Sat' },
    { id: 'sunday', label: 'Sun' }
];

const DEFAULT_HOURS: timeSlot[] = DAYS.map(day => ({
    day: day.id,
    isOpen: day.id !== 'sunday',
    openTime: '07:00',
    closeTime: '20:00'
}));

export default function OperatingHoursInput({value, onChange, label, error}: OperatingHoursInputProps) {
    const [hours, setHours] = useState<timeSlot[]>(DEFAULT_HOURS);
    const [useQuickSelect, setUseQuickSelect] = useState(true);

    // Parse value to hours on mount
    useEffect (() => {
    if(value) {
        const parsed = parseOperatingHours(value);
        if(parsed.length > 0) {
            setHours(parsed);
            setUseQuickSelect(false);
            }
        }
    }, []);

    //update parent when hours change
    useEffect(() => {
        const formatted = formatOperatingHours(hours);
        onChange(formatted);
    }, [hours, onChange]);

    const handleDayToggle = (dayId: string) => {
        setHours(prev => prev.map(h => 
        h.day === dayId ? { ...h, isOpen: !h.isOpen } : h
        ));
    };

    const handleTimeChange = (dayId: string, field: 'openTime' | 'closeTime', value: string) => {
        setHours(prev => prev.map(h => 
          h.day === dayId ? { ...h, [field]: value } : h
        ));
      };

      const handleQuickSelect = (preset: 'weekdays' | 'everyday' | 'weekend') => {
        setHours(prev => prev.map(h => {
            const isWeekday = !['saturday', 'sunday'].includes(h.day);
            const isWeekend = ['saturday', 'sunday'].includes(h.day)

            switch (preset) {
                case 'weekdays':
                    return {...h, isOpen: isWeekday};
                case 'everyday':
                    return {...h, isOpen: true}
                case 'weekend':
                    return{...h, isOpen:isWeekend}
                default: 
                return h;
            }
        }));
      };

      const handleSetAllTime = () => {
        const firstOpen = hours.find(h => h.isOpen);
        if (!firstOpen) return;

        setHours(prev => prev.map(h =>
            h.isOpen ? { ...h, openTime: firstOpen.openTime, closeTime: firstOpen.closeTime } : h
        ));
      };

      return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {label}
                </label>
            )}

            <div className={`border-2 rounded-lg p-4 ${error ? 'border-red-500' : 'border-gray-300'}`}>
                {/* quick select button */}
                <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2 font-medium">
                        Quick Select:
                    </p>
                    <div className="flex gap-2 flex-wrap">
                        <button type='button'
                        onClick={() => handleQuickSelect('weekdays')}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Mon-Fri
                        </button>
                        <button type="button"
                        onClick={() => handleQuickSelect('everyday')}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Everyday
                        </button>
                        <button type="button"
                        onClick={() => handleQuickSelect('weekend')}
                        className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                            Weekend Only
                        </button>
                        <button type="button"
                        onClick={handleSetAllTime}
                        className="px-3 py-1.5 text-xs bg-priamry text-white hover:bg-primary-dark rounded-md transition-colors ml-auto"
                        >
                            Copy first to all
                        </button>
                    </div>
                </div>

                {/* Days Schedule */}
                <div className="space-y-2">
                    {hours.map((slot, index) => {
                        const dayLabel = DAYS.find(d=> d.id === slot.day)?.label || slot.day;

                        return (
                            <div key={slot.day} className="flex items-center gap-3">
                                <label className="flex items-center gap-2 min-w-[80px] cursor-pointer">
                                    <input type="checkbox"
                                    checked = {slot.isOpen}
                                    onChange={() => handleDayToggle(slot.day)}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                                    />

                                    <span className={`text-sm font-medium ${slot.isOpen ? 'text-gray-800' : 'text-gray-400'}`}>
                                        {dayLabel}
                                    </span>
                                </label>

                            {/* time inputs */}
                            {slot.isOpen ? (
                                <div className="flex items-center gap-2 flex-1">
                                    <input type="time"
                                        value={slot.openTime}
                                        onChange={(e) => handleTimeChange(slot.day, 'openTime', e.target.value)}
                                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 foces:ring-primary"
                                    />
                                    <span className="text-gray-500 text-sm">
                                        to
                                    </span>
                                    <input type="time"
                                        value={slot.closeTime}
                                        onChange={(e) => handleTimeChange(slot.day, 'closeTime', e.target.value)}
                                        className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 foces:ring-primary"
                                    />
                                </div>
                            ) : (
                                <span className="text-sm text-gray-400 flex-1">Closed</span>
                            )}
                            </div>
                        );
                    })}
                </div>

                {/* preview */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                        <Clock size={16} className="text-gray-500 mt-0.5 flex-shrink-0"/>
                        <div className="flex-1">
                            <p className="text-xs text-gray-600 font-medium mb-1">
                                Preview:
                            </p>
                            <p className="text-sm text-gray-700 font-mono">
                                {formatOperatingHours(hours) || 'No operating hours set'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {error && (<p className="mt-1.5 text-sm text-gray-500">Select days an set opening hours</p>)}
        </div>
      );
}

function formatOperatingHours(hours: timeSlot[]): string {
    const openDays = hours.filter(h => h.isOpen);
    
    if (openDays.length === 0) return '';
  
    // Group consecutive days with same hours
    const groups: { days: string[]; openTime: string; closeTime: string }[] = [];
    
    openDays.forEach(slot => {
      const dayLabel = DAYS.find(d => d.id === slot.day)?.label || slot.day;
      const existingGroup = groups.find(
        g => g.openTime === slot.openTime && g.closeTime === slot.closeTime
      );
  
      if (existingGroup) {
        existingGroup.days.push(dayLabel);
      } else {
        groups.push({
          days: [dayLabel],
          openTime: slot.openTime,
          closeTime: slot.closeTime,
        });
      }
    });

    return groups.map(group => {
        const daysStr = group.days.length === 7 
          ? 'Every Day'
          : group.days.length > 2
          ? `${group.days[0]}-${group.days[group.days.length - 1]}`
          : group.days.join(', ');
    
        return `${daysStr}: ${group.openTime}-${group.closeTime}`;
      }).join(' | ');
}

function parseOperatingHours(value: string): timeSlot[]{
    return [];
}