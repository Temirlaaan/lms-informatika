from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sections', views.SectionViewSet, basename='section')
router.register(r'topics', views.TopicViewSet, basename='topic')
router.register(r'teacher/sections', views.TeacherSectionViewSet, basename='teacher-section')
router.register(r'teacher/topics', views.TeacherTopicViewSet, basename='teacher-topic')
router.register(r'teacher/lessons', views.TeacherLessonViewSet, basename='teacher-lesson')

urlpatterns = [
    path('', include(router.urls)),
    path('progress/', views.ProgressView.as_view(), name='progress'),
]
