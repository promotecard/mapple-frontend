
import React, { useState, useEffect, useRef } from 'react';
import { Label } from './Label';
import { Button } from './Button';

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ label, value, onChange, id, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
        // Value format expected: YYYY-MM-DDTHH:MM
        const parts = value.split('T');
        if (parts.length === 2) {
            setDate(parts[0]);
            setTime(parts[1]);
        }
    } else {
        setDate('');
        setTime('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if(isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleDone = () => {
    if (date && time) {
        onChange(`${date}T${time}`);
    }
    setIsOpen(false);
  };
  
  const formatDisplay = (val: string) => {
      if(!val) return 'Seleccionar fecha y hora';
      const dateObj = new Date(val);
      if(isNaN(dateObj.getTime())) return val.replace('T', ' ');
      return dateObj.toLocaleString('es-DO', {
          year: 'numeric', month: '2-digit', day: '2-digit', 
          hour: '2-digit', minute: '2-digit', hour12: true
      });
  }

  return (
    <div className="relative" ref={containerRef}>
      <Label htmlFor={id}>{label}</Label>
      <div 
        onClick={() => setIsOpen(true)} 
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white cursor-pointer flex justify-between items-center text-sm min-h-[38px]"
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>
          {formatDisplay(value)}
        </span>
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[250px] bg-white border border-gray-200 rounded-lg shadow-xl p-4 animate-in fade-in zoom-in-95 duration-100">
           <div className="space-y-4">
              <div>
                 <Label className="text-xs text-gray-500 uppercase font-bold mb-1">Fecha</Label>
                 <input 
                    type="date" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                 />
              </div>
              <div>
                 <Label className="text-xs text-gray-500 uppercase font-bold mb-1">Hora</Label>
                 <input 
                    type="time" 
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                 />
              </div>
              <div className="flex justify-end pt-2 border-t mt-2">
                 <Button onClick={handleDone} size="sm" disabled={!date || !time}>Hecho</Button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
