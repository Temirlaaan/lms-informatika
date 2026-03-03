from django.contrib.auth import get_user_model
from django.db.models import Avg
from rest_framework import generics
from rest_framework.response import Response

from accounts.permissions import IsStudent, IsTeacher
from courses.models import Section
from .models import Grade
from .serializers import GradeSerializer

User = get_user_model()


class MyGradesView(generics.GenericAPIView):
    """GET /api/grades/my/ — student's own grades."""

    permission_classes = [IsStudent]

    def get(self, request):
        grades = Grade.objects.filter(student=request.user).select_related('section')
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)


class TeacherGradebookView(generics.GenericAPIView):
    """GET /api/grades/journal/ — all students x all sections."""

    permission_classes = [IsTeacher]

    def get(self, request):
        students = User.objects.filter(role='student').order_by('full_name')
        sections = Section.objects.filter(is_published=True).order_by('order')

        data = []
        for student in students:
            grades = Grade.objects.filter(student=student).select_related('section')
            grade_map = {
                g.section_id: {'score': g.score, 'grade_value': g.grade_value}
                for g in grades
            }
            student_data = {
                'id': student.id,
                'full_name': student.full_name or student.username,
                'grade_class': student.grade_class,
                'grades': [],
            }
            for section in sections:
                g = grade_map.get(section.id, {'score': None, 'grade_value': None})
                student_data['grades'].append({
                    'section_id': section.id,
                    'section_title': section.title,
                    'score': g['score'],
                    'grade_value': g['grade_value'],
                })
            data.append(student_data)

        return Response(data)


class StudentDetailGradesView(generics.GenericAPIView):
    """GET /api/grades/student/<id>/ — specific student's grades (teacher)."""

    permission_classes = [IsTeacher]

    def get(self, request, student_id):
        student = User.objects.filter(id=student_id, role='student').first()
        if not student:
            return Response({'error': 'Оқушы табылмады'}, status=404)

        grades = Grade.objects.filter(student=student).select_related('section')
        serializer = GradeSerializer(grades, many=True)
        return Response({
            'student': {
                'id': student.id,
                'full_name': student.full_name or student.username,
                'grade_class': student.grade_class,
            },
            'grades': serializer.data,
        })


class StatisticsView(generics.GenericAPIView):
    """GET /api/grades/statistics/ — class-wide stats."""

    permission_classes = [IsTeacher]

    def get(self, request):
        sections = Section.objects.filter(is_published=True).order_by('order')
        total_students = User.objects.filter(role='student').count()

        data = []
        for section in sections:
            grades = Grade.objects.filter(section=section)
            avg_score = grades.aggregate(avg=Avg('score'))['avg'] or 0
            students_with_grade = grades.values('student').distinct().count()

            data.append({
                'section_id': section.id,
                'section_title': section.title,
                'average_score': round(avg_score, 1),
                'students_completed': students_with_grade,
                'total_students': total_students,
                'completion_rate': round(
                    (students_with_grade / total_students * 100) if total_students > 0 else 0, 1
                ),
            })

        return Response(data)
