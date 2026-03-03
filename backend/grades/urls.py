from django.urls import path
from . import views

urlpatterns = [
    path('my/', views.MyGradesView.as_view(), name='my-grades'),
    path('journal/', views.TeacherGradebookView.as_view(), name='gradebook'),
    path('student/<int:student_id>/', views.StudentDetailGradesView.as_view(), name='student-grades'),
    path('statistics/', views.StatisticsView.as_view(), name='statistics'),
]
