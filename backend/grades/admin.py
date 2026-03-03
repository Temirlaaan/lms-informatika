from django.contrib import admin

from .models import Grade


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ('student', 'section', 'score', 'grade_value')
    list_filter = ('grade_value', 'section')
