from rest_framework.permissions import BasePermission


class IsStudent(BasePermission):
    """Allow access only to users with the 'student' role."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'student'


class IsTeacher(BasePermission):
    """Allow access only to users with the 'teacher' role."""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'teacher'
