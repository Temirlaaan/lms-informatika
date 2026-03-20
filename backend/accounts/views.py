from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsTeacher
from .serializers import (
    CustomTokenObtainPairSerializer,
    ProfileSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """Register a new user and return JWT tokens immediately."""

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    pagination_class = None

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_201_CREATED,
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """Login endpoint that returns tokens together with user data."""

    serializer_class = CustomTokenObtainPairSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    """Retrieve or update the authenticated user's profile.

    Supports multipart/form-data for avatar file uploads.
    """

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_object(self):
        return self.request.user


class StudentListView(generics.ListAPIView):
    permission_classes = [IsTeacher]
    serializer_class = UserSerializer
    queryset = User.objects.filter(role='student').order_by('full_name')
    pagination_class = None
