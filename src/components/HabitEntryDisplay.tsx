
'use client';

import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ChevronDown, Circle, Star, CheckCircle } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { HabitEntry } from '@/lib/types';

interface HabitEntryDisplayProps {
  entry: HabitEntry;
  index: number;
  habitId: string;
  mainDayEntries: HabitEntry[];
  onUpdateEntry: (habitId: string, entryDate: string, newValues: Partial<HabitEntry>) => void;
}

export function HabitEntryDisplay({ entry, index, habitId, mainDayEntries, onUpdateEntry }: HabitEntryDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [journalText, setJournalText] = useState(entry.journal || '');

  const handleToggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  const handleSaveAndClose = () => {
    onUpdateEntry(habitId, entry.date, { journal: journalText });
    setIsOpen(false);
  };
  
  const handleMarkComplete = () => {
    onUpdateEntry(habitId, entry.date, { completed: !entry.completed });
  }

  const mainDayEntryIndex = mainDayEntries.findIndex(e => isSameDay(parseISO(e.date), parseISO(entry.date)));
  const dayNumber = mainDayEntries.length - mainDayEntryIndex;
  
  const Icon = entry.completed ? CheckCircle : Circle;

  return (
    <div className="p-3 rounded-lg bg-muted/60 transition-colors">
      <div 
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
             <Icon 
                className={`h-6 w-6 cursor-pointer transition-colors ${entry.completed ? 'text-secondary fill-green-100' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={handleMarkComplete}
            />
            <div onClick={handleToggleOpen} className="cursor-pointer">
                <div className="font-semibold flex items-center gap-2">
                    {entry.isExtra ? (
                        <>
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-400"/>
                            <span>Avance Extra del Día {dayNumber}</span>
                        </>
                    ) : (
                        <span>Día {dayNumber}</span>
                    )}
                </div>
                <p className="text-xs text-muted-foreground">{format(parseISO(entry.date), "d 'de' MMMM, yyyy", { locale: es })}</p>
            </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleToggleOpen}>
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      {isOpen && (
        <div className="mt-3 ml-9 space-y-3">
          <Textarea
            placeholder="¿Qué aprendiste? ¿Cómo te sentiste?"
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            className="text-sm bg-background resize-none"
            rows={3}
          />
          <Button size="sm" onClick={handleSaveAndClose}>
            Guardar Diario
          </Button>
        </div>
      )}
    </div>
  );
}
