'use client';

import { useRef, useState, useEffect } from 'react';
import { Note, Category } from '@/lib/store';
import { formatDate } from '@/utils/dateFormatter';

interface NoteEditorProps {
  note: Note;
  categories: Category[];
  onUpdate: (note: Note) => void;
  onDelete: (id: number) => void;
  onClose: () => void;
}

export default function NoteEditor({
  note,
  categories,
  onUpdate,
  onDelete,
  onClose,
}: NoteEditorProps) {
  // Get the first category (Random Thoughts) as default
  const getDefaultCategory = () => {
    return note.category || categories[0]?.id || null;
  };

  const [categoryId, setCategoryId] = useState<number | null>(getDefaultCategory());
  const titleRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Initialize contentEditable divs with content
    if (!hasInitialized) {
      if (titleRef.current) {
        titleRef.current.textContent = note.title;
      }
      if (contentRef.current) {
        contentRef.current.textContent = note.content;
      }
      setHasInitialized(true);
    }
  }, [note.id, hasInitialized]);

  const handleTitleChange = () => {
    setIsDirty(true);
  };

  const handleContentChange = () => {
    setIsDirty(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryId(e.target.value ? parseInt(e.target.value) : null);
    setIsDirty(true);
  };

  const handleSave = () => {
    if (isDirty) {
      const title = titleRef.current?.textContent || '';
      const content = contentRef.current?.textContent || '';
      onUpdate({
        ...note,
        title,
        content,
        category: categoryId ? parseInt(String(categoryId)) : null,
      });
      setIsDirty(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const getCategoryColor = () => {
    const cat = categories.find(c => c.id === categoryId);
    return cat?.color || '#E8DCC4';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="w-11/12 max-w-4xl h-5/6 rounded-lg shadow-xl flex flex-col p-6"
        style={{ backgroundColor: getCategoryColor() }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-300">
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              Last Edited: {formatDate(new Date(note.last_edited))}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:opacity-70 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col space-y-4 overflow-y-auto mb-6">
          {/* Title */}
          <div
            ref={titleRef}
            contentEditable
            onInput={handleTitleChange}
            className="text-3xl font-bold outline-none editable"
            suppressContentEditableWarning
          />

          {/* Content */}
          <div
            ref={contentRef}
            contentEditable
            onInput={handleContentChange}
            className="flex-1 text-base outline-none editable"
            suppressContentEditableWarning
          />
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-300 space-x-4">
          <select
            value={categoryId || ''}
            onChange={handleCategoryChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="flex space-x-2">
            <button
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Delete
            </button>
            <button
              onClick={() => {
                setIsDirty(false);
                onClose();
              }}
              className="border border-gray-400 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
