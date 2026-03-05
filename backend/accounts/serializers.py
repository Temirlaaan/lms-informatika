from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class UserSerializer(serializers.ModelSerializer):
    """Read-only serializer for user data."""

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'role', 'grade_class', 'avatar', 'created_at']
        read_only_fields = fields


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'password_confirm', 'full_name', 'role', 'grade_class']

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Құпиясөздер сәйкес келмейді.'})

        # Security: force student role on public registration.
        # Teachers must be created by an admin via Django admin panel.
        attrs['role'] = 'student'

        if not attrs.get('grade_class'):
            raise serializers.ValidationError({'grade_class': 'Сынып көрсетілуі тиіс.'})

        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing and updating the authenticated user's profile."""

    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'full_name', 'avatar', 'grade_class']
        read_only_fields = ['id', 'username', 'role']


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Extends the default token serializer to include user data in the response."""

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data
