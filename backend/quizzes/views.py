from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsStudent, IsTeacher
from grades.models import Grade
from .models import Quiz, Question, Choice, QuizAttempt, StudentAnswer
from .serializers import (
    QuizSerializer,
    QuizAttemptListSerializer,
    QuizAttemptDetailSerializer,
    TeacherQuizSerializer,
    TeacherQuestionSerializer,
    TeacherChoiceSerializer,
)


class QuizViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Quiz.objects.all()

    @action(detail=False, url_path='topic/(?P<topic_id>[^/.]+)')
    def by_topic(self, request, topic_id=None):
        """GET /api/quizzes/topic/<topic_id>/ — quiz for a topic."""
        quiz = get_object_or_404(Quiz, topic_id=topic_id, is_published=True)
        serializer = QuizSerializer(quiz, context={'request': request})
        data = serializer.data
        if request.user.role == 'student':
            data['attempts_used'] = QuizAttempt.objects.filter(
                student=request.user, quiz=quiz
            ).count()
        return Response(data)

    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def start(self, request, pk=None):
        """POST /api/quizzes/<id>/start/ — start a new attempt."""
        quiz = get_object_or_404(Quiz, pk=pk)
        attempts = QuizAttempt.objects.filter(student=request.user, quiz=quiz).count()
        if attempts >= quiz.max_attempts:
            return Response(
                {'error': 'Әрекет лимитіне жеттіңіз'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        incomplete = QuizAttempt.objects.filter(
            student=request.user, quiz=quiz, is_completed=False
        ).first()
        if incomplete:
            return Response({'attempt_id': incomplete.id, 'message': 'Аяқталмаған әрекет бар'})
        attempt = QuizAttempt.objects.create(student=request.user, quiz=quiz)
        return Response({'attempt_id': attempt.id}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def submit(self, request, pk=None):
        """POST /api/quizzes/<id>/submit/ — submit answers and score."""
        quiz = get_object_or_404(Quiz, pk=pk)
        attempt = QuizAttempt.objects.filter(
            student=request.user, quiz=quiz, is_completed=False
        ).first()
        if not attempt:
            return Response(
                {'error': 'Белсенді әрекет жоқ'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        answers_data = request.data.get('answers', [])
        total_points = 0
        earned_points = 0

        for answer_data in answers_data:
            question_id = answer_data.get('question_id')
            choice_ids = answer_data.get('selected_choice_ids', [])

            try:
                question = Question.objects.get(id=question_id, quiz=quiz)
            except Question.DoesNotExist:
                continue

            total_points += question.points

            correct_choices = set(
                question.choices.filter(is_correct=True).values_list('id', flat=True)
            )
            selected = set(choice_ids)
            is_correct = correct_choices == selected
            points = question.points if is_correct else 0
            earned_points += points

            student_answer = StudentAnswer.objects.create(
                attempt=attempt,
                question=question,
                is_correct=is_correct,
                points_earned=points,
            )
            student_answer.selected_choices.set(choice_ids)

        score = (earned_points / total_points * 100) if total_points > 0 else 0
        attempt.score = round(score, 1)
        attempt.total_points = total_points
        attempt.earned_points = earned_points
        attempt.finished_at = timezone.now()
        attempt.is_completed = True
        attempt.save()

        section = quiz.topic.section
        grade_value = Grade.calculate_grade(score)
        Grade.objects.update_or_create(
            student=request.user,
            section=section,
            defaults={
                'quiz_attempt': attempt,
                'score': score,
                'grade_value': grade_value,
            },
        )

        serializer = QuizAttemptDetailSerializer(attempt)
        return Response(serializer.data)


class AttemptViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsStudent]

    def get_queryset(self):
        return QuizAttempt.objects.filter(student=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizAttemptDetailSerializer
        return QuizAttemptListSerializer


class TeacherQuizViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = Quiz.objects.all()
    serializer_class = TeacherQuizSerializer


class TeacherQuestionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = Question.objects.all()
    serializer_class = TeacherQuestionSerializer


class TeacherChoiceViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = Choice.objects.all()
    serializer_class = TeacherChoiceSerializer
