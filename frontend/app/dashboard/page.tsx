'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useNotesStore, type Category, type Note } from '@/lib/store';
import { categoryAPI, noteAPI } from '@/lib/api';
import NoteCard from '@/components/NoteCard';
import CategorySidebar from '@/components/CategorySidebar';
import NoteEditor from '@/components/NoteEditor';

export default function DashboardPage() {
  const router = useRouter();
  const { user, fetchUser, logout } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        // Check if user is logged in
        if (!user) {
          await fetchUser();
        }

        // Fetch categories
        const catResponse = await categoryAPI.list();
        setCategories(catResponse.data);

        // Create defaults if no categories
        if (catResponse.data.length === 0) {
          const defaultsResponse = await categoryAPI.createDefaults();
          setCategories(defaultsResponse.data);
        }

        // Fetch notes
        const notesResponse = await noteAPI.list();
        setNotes(notesResponse.data);

        setLoading(false);
      } catch (error) {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      }
    };

    initializeDashboard();
  }, [user, fetchUser, router]);

  const handleSelectCategory = async (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    try {
      const response = categoryId 
        ? await noteAPI.list(categoryId)
        : await noteAPI.list();
      setNotes(response.data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const handleCreateNote = async () => {
    try {
      const response = await noteAPI.quickCreate();
      const newNote = response.data;
      // Enrich with category color if it has a category
      if (newNote.category) {
        const category = categories.find(c => c.id === newNote.category);
        if (category) {
          newNote.category_color = category.color;
          newNote.category_name = category.name;
          // Update category count
          setCategories(categories.map(c => 
            c.id === newNote.category ? { ...c, note_count: c.note_count + 1 } : c
          ));
        }
      }
      setNotes([newNote, ...notes]);
      setEditingNote(newNote);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      const oldNote = notes.find(n => n.id === updatedNote.id);
      await noteAPI.update(updatedNote.id, {
        title: updatedNote.title,
        content: updatedNote.content,
        category: updatedNote.category || undefined,
      });

      // Enrich with category color if it has a category
      if (updatedNote.category) {
        const category = categories.find(c => c.id === updatedNote.category);
        if (category) {
          updatedNote.category_color = category.color;
          updatedNote.category_name = category.name;
        }
      }

      // Update category counts if category changed
      let updatedCategories = [...categories];
      if (oldNote?.category !== updatedNote.category) {
        updatedCategories = categories.map(c => {
          if (oldNote?.category === c.id) {
            return { ...c, note_count: Math.max(0, c.note_count - 1) };
          }
          if (updatedNote.category === c.id) {
            return { ...c, note_count: c.note_count + 1 };
          }
          return c;
        });
        setCategories(updatedCategories);
      }

      setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to update note:', error);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      const noteToDelete = notes.find(n => n.id === noteId);
      await noteAPI.delete(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      // Update category count if note had a category
      if (noteToDelete?.category) {
        setCategories(categories.map(c => 
          c.id === noteToDelete.category ? { ...c, note_count: Math.max(0, c.note_count - 1) } : c
        ));
      }
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cream">
      {/* Sidebar */}
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onCreateNote={handleCreateNote}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-cream border-b border-gray-300 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">
              {selectedCategory
                ? categories.find(c => c.id === selectedCategory)?.name
                : 'All Notes'}
            </h1>
            <button
              onClick={handleCreateNote}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              + New Note
            </button>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="flex-1 overflow-auto p-6">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg mb-4">No notes yet</p>
              <button
                onClick={handleCreateNote}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Create your first note
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  categoryColor={note.category_color}
                  onClick={() => setEditingNote(note)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Editor Modal */}
      {editingNote && (
        <NoteEditor
          note={editingNote}
          categories={categories}
          onUpdate={handleUpdateNote}
          onDelete={handleDeleteNote}
          onClose={() => setEditingNote(null)}
        />
      )}
    </div>
  );
}
