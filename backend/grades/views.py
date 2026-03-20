from django.contrib.auth import get_user_model
from django.db.models import Avg, Count, Q
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

        all_grades = Grade.objects.filter(
            student__role='student'
        ).select_related('section', 'student')
        grades_by_student: dict[int, dict[str, dict]] = {}
        for g in all_grades:
            grades_by_student.setdefault(g.student_id, {})[g.section.title] = {
                'score': g.score, 'grade_value': g.grade_value,
            }

        student_list = [
            {
                'student_id': student.id,
                'student_name': student.full_name or student.username,
                'grades': grades_by_student.get(student.id, {}),
            }
            for student in students
        ]

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

        total_students = User.objects.filter(role='student').count()
        total_quizzes = Quiz.objects.count()

        sections = Section.objects.filter(is_published=True).order_by('order').annotate(
            avg_score=Avg('grades__score'),
            students_completed=Count('grades__student', distinct=True),
        )
        total_sections = sections.count()

        section_stats = []
        all_scores = list(Grade.objects.filter(
            section__is_published=True
        ).values_list('score', flat=True))

        for section in sections:
            avg = section.avg_score or 0
            completed = section.students_completed or 0
            section_stats.append({
                'section_name': section.title,
                'avg_score': round(avg, 1),
                'students_completed': completed,
                'total_students': total_students,
                'completion_rate': round(
                    (completed / total_students * 100) if total_students > 0 else 0, 1
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
