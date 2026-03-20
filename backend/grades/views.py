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
    pagination_class = None

    def get(self, request):
        grades = Grade.objects.filter(student=request.user).select_related('section')
        serializer = GradeSerializer(grades, many=True)
        return Response(serializer.data)


class TeacherGradebookView(generics.GenericAPIView):
    """GET /api/grades/journal/ — all students x all sections."""

    permission_classes = [IsTeacher]
    pagination_class = None

    def get(self, request):
        students = User.objects.filter(role='student').order_by('full_name')
        sections = Section.objects.filter(is_published=True).order_by('order')

        section_names = [s.title for s in sections]
        student_list = []
        for student in students:
            grades = Grade.objects.filter(student=student).select_related('section')
            grade_map = {
                g.section.title: {'score': g.score, 'grade_value': g.grade_value}
                for g in grades
            }
            student_list.append({
                'student_id': student.id,
                'student_name': student.full_name or student.username,
                'grades': grade_map,
            })

        return Response({
            'sections': section_names,
            'students': student_list,
        })


class StudentDetailGradesView(generics.GenericAPIView):
    """GET /api/grades/student/<id>/ — specific student's grades (teacher)."""

    permission_classes = [IsTeacher]
    pagination_class = None

    def get(self, request, student_id):
        student = User.objects.filter(id=student_id, role='student').first()
        if not student:
            return Response({'error': 'Оқушы табылмады'}, status=404)

        grades = Grade.objects.filter(student=student).select_related('section')
        grades_data = [
            {
                'section_name': g.section.title,
                'grade_value': g.grade_value,
                'score': g.score,
            }
            for g in grades
        ]
        return Response({
            'student_id': student.id,
            'student_name': student.full_name or student.username,
            'grade_class': student.grade_class,
            'grades': grades_data,
        })


class StatisticsView(generics.GenericAPIView):
    """GET /api/grades/statistics/ — class-wide stats."""

    permission_classes = [IsTeacher]
    pagination_class = None

    def get(self, request):
        from quizzes.models import Quiz

        sections = Section.objects.filter(is_published=True).order_by('order')
        total_students = User.objects.filter(role='student').count()
        total_sections = sections.count()
        total_quizzes = Quiz.objects.count()

        section_stats = []
        all_scores = []
        for section in sections:
            grades = Grade.objects.filter(section=section)
            avg_score = grades.aggregate(avg=Avg('score'))['avg'] or 0
            students_with_grade = grades.values('student').distinct().count()
            all_scores.extend(grades.values_list('score', flat=True))

            section_stats.append({
                'section_name': section.title,
                'avg_score': round(avg_score, 1),
                'students_completed': students_with_grade,
                'total_students': total_students,
                'completion_rate': round(
                    (students_with_grade / total_students * 100) if total_students > 0 else 0, 1
                ),
            })

        average_score = round(sum(all_scores) / len(all_scores), 1) if all_scores else 0

        return Response({
            'total_students': total_students,
            'total_sections': total_sections,
            'total_quizzes': total_quizzes,
            'average_score': average_score,
            'section_stats': section_stats,
        })
