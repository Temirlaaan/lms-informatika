from django.contrib import admin

from .models import Section, Topic, Lesson, LessonImage, TopicProgress


class TopicInline(admin.TabularInline):
    model = Topic
    extra = 1


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_published')
    list_filter = ('is_published',)
    inlines = [TopicInline]


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'order', 'is_published')
    list_filter = ('section', 'is_published')


class LessonImageInline(admin.TabularInline):
    model = LessonImage
    extra = 1


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('topic', 'video_url')
    inlines = [LessonImageInline]


@admin.register(LessonImage)
class LessonImageAdmin(admin.ModelAdmin):
    list_display = ('lesson', 'caption')


@admin.register(TopicProgress)
class TopicProgressAdmin(admin.ModelAdmin):
    list_display = ('student', 'topic', 'is_completed', 'completed_at')
    list_filter = ('is_completed',)
