from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import JSONParser
from django.contrib.auth.models import User
from .models import Category, Note
from .serializers import UserSerializer, UserRegisterSerializer, CategorySerializer, NoteSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def create_defaults(self, request):
        """Create default categories for the user"""
        default_categories = [
            {'name': 'Random Thoughts', 'color': '#FFD93D'},
            {'name': 'School', 'color': '#6BCB77'},
            {'name': 'Personal', 'color': '#FF6B9D'},
        ]
        created = []
        for cat_data in default_categories:
            cat, _ = Category.objects.get_or_create(
                user=request.user,
                name=cat_data['name'],
                defaults={'color': cat_data['color']}
            )
            created.append(CategorySerializer(cat).data)
        return Response(created)

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user)
        category_id = self.request.query_params.get('category_id')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['post'])
    def quick_create(self, request):
        """Quickly create an empty note"""
        note = Note.objects.create(user=request.user)
        serializer = NoteSerializer(note)
        return Response(serializer.data, status=status.HTTP_201_CREATED)