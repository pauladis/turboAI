'use client';

import { Note } from '@/lib/store';
import { formatDate } from '@/utils/dateFormatter';

interface NoteCardProps {
  note: Note;
  categoryColor?: string;
  onClick: () => void;
}

export default function NoteCard({ note, categoryColor, onClick }: NoteCardProps) {
  const bgColor = categoryColor || '#f9f9f9';

  return (
    <div
      className="note-card p-4 rounded-lg cursor-pointer transition-all"
      style={{ backgroundColor: bgColor }}
      onClick={onClick}
    >
      <div className="text-xs text-gray-600 mb-2">{formatDate(new Date(note.last_edited))}</div>
      {note.category_name && (
        <div className="text-xs font-medium text-gray-700 mb-2">{note.category_name}</div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
        {note.title || 'Untitled Note'}
      </h3>
      <p className="text-sm text-gray-700 line-clamp-3">
        {note.content || 'No content'}
      </p>
    </div>
  );
}
