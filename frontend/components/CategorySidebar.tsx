'use client';

import { Category, User } from '@/lib/store';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
  onCreateNote: () => void;
  user: User | null;
  onLogout: () => void;
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onCreateNote,
  user,
  onLogout,
}: CategorySidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-300 flex flex-col">
      {/* User Section */}
      <div className="p-4 border-b border-gray-200">
        <p className="text-sm font-medium text-gray-700">{user?.username}</p>
        <p className="text-xs text-gray-500">{user?.email}</p>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <button
          onClick={() => onSelectCategory(null)}
          className={`w-full text-left px-4 py-2 rounded-lg transition ${
            selectedCategory === null
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          All Categories
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="flex-1">{category.name}</span>
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
              {category.note_count}
            </span>
          </button>
        ))}
      </div>

      {/* New Note Button */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={onCreateNote}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition"
        >
          + New Note
        </button>

        <button
          onClick={onLogout}
          className="w-full border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium py-2 rounded-lg transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
