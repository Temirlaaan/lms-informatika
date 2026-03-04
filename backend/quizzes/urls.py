from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'attempts', views.AttemptViewSet, basename='attempt')
router.register(r'teacher/quizzes', views.TeacherQuizViewSet, basename='teacher-quiz')
router.register(r'teacher/questions', views.TeacherQuestionViewSet, basename='teacher-question')
router.register(r'teacher/choices', views.TeacherChoiceViewSet, basename='teacher-choice')
router.register(r'', views.QuizViewSet, basename='quiz')

urlpatterns = [
    path('', include(router.urls)),
]
