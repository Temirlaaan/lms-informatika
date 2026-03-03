from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'full_name', 'role', 'grade_class', 'is_staff')
    list_filter = ('role', 'grade_class', 'is_staff')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra', {'fields': ('role', 'full_name', 'avatar', 'grade_class')}),
    )
