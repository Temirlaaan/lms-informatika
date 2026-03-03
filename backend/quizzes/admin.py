from django.contrib import admin

from .models import Quiz, Question, Choice, QuizAttempt, StudentAnswer


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'topic', 'time_limit_minutes', 'passing_score', 'max_attempts', 'is_published')
    list_filter = ('is_published',)
    inlines = [QuestionInline]


class ChoiceInline(admin.TabularInline):
    model = Choice
    extra = 4


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('text', 'quiz', 'question_type', 'points', 'order')
    list_filter = ('question_type', 'quiz')
    inlines = [ChoiceInline]


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('text', 'question', 'is_correct', 'order')
    list_filter = ('is_correct',)


class StudentAnswerInline(admin.TabularInline):
    model = StudentAnswer
    extra = 0


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('student', 'quiz', 'score', 'earned_points', 'total_points', 'is_completed', 'started_at')
    list_filter = ('is_completed', 'quiz')
    inlines = [StudentAnswerInline]


@admin.register(StudentAnswer)
class StudentAnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'is_correct', 'points_earned')
    list_filter = ('is_correct',)
