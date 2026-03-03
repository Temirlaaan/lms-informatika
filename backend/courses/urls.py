from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'sections', views.SectionViewSet, basename='section')
router.register(r'topics', views.TopicViewSet, basename='topic')

urlpatterns = [
    path('', include(router.urls)),
    path('progress/', views.ProgressView.as_view(), name='progress'),
]
