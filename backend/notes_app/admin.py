from django.contrib import admin
from .models import Category, Note

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'color', 'created_at')
    search_fields = ('name', 'user__email')
    list_filter = ('created_at',)

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'created_at', 'last_edited')
    search_fields = ('title', 'content', 'user__email')
    list_filter = ('created_at', 'last_edited', 'category')
    readonly_fields = ('created_at', 'last_edited')