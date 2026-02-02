'use client';

import React, { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';

interface Note {
  timestamp: string;
  author: string;
  content: string;
  type?: 'info' | 'warning' | 'error';
}

interface AgentNotesProps {
  notes: Note[];
}

export function AgentNotes({ notes }: AgentNotesProps) {
  const [noteText, setNoteText] = useState('');

  const handleSave = () => {
    if (noteText.trim()) {
      // Handle save logic here
      console.log('Saving note:', noteText);
      setNoteText('');
    }
  };

  return (
    <section className="bg-white rounded-xl p-6 shadow-sm border border-(--border-light)">
      <h2 className="text-lg font-bold text-(--text-primary) mb-6">Agent Notes</h2>

      {/* Date Header */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-(--text-primary)">Thursday, 25/12/2025</p>
      </div>

      {/* Notes List */}
      <div className="space-y-3 mb-6">
        {notes.map((note, index) => (
          <div key={index} className="text-sm">
            <span className="font-medium text-(--text-secondary)">[{note.timestamp}] </span>
            <span className="font-semibold text-(--brand-primary)">{note.author}: </span>
            <span className="text-(--text-primary)">{note.content} </span>
            {note.type === 'info' && <Check className="inline w-4 h-4 text-green-600" />}
            {note.type === 'warning' && <AlertTriangle className="inline w-4 h-4 text-yellow-600" />}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder="Type your note here"
          className="w-full px-4 py-3 border border-(--border-custom) rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-(--brand-primary) focus:border-transparent"
          rows={3}
        />
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-(--brand-primary) text-white rounded-lg font-medium text-sm hover:bg-(--brand-primary-hover) transition-colors"
        >
          Save
        </button>
      </div>
    </section>
  );
}
