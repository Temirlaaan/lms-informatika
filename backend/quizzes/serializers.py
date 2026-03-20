from rest_framework import serializers
from .models import Quiz, Question, Choice, QuizAttempt, StudentAnswer


class ChoiceSerializer(serializers.ModelSerializer):
    """Choice without is_correct — used during active quiz."""

    class Meta:
        model = Choice
        fields = ['id', 'text', 'order']


class ChoiceResultSerializer(serializers.ModelSerializer):
    """Choice with is_correct — used in results after submission."""

    class Meta:
        model = Choice
        fields = ['id', 'text', 'order', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'image', 'points', 'order', 'choices']


class QuestionResultSerializer(serializers.ModelSerializer):
    choices = ChoiceResultSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'image', 'points', 'order', 'choices']


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'topic', 'title', 'description',
            'time_limit_minutes', 'passing_score', 'max_attempts',
            'is_published', 'questions',
        ]


class QuizAttemptListSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'score',
            'total_points', 'earned_points',
            'started_at', 'finished_at', 'is_completed',
        ]


class StudentAnswerResultSerializer(serializers.ModelSerializer):
    question = QuestionResultSerializer(read_only=True)
    selected_choice_ids = serializers.SerializerMethodField()

    class Meta:
        model = StudentAnswer
        fields = ['id', 'question', 'selected_choice_ids', 'is_correct', 'points_earned']

    def get_selected_choice_ids(self, obj):
        return list(obj.selected_choices.values_list('id', flat=True))


class QuizAttemptDetailSerializer(serializers.ModelSerializer):
    answers = StudentAnswerResultSerializer(many=True, read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    grade_value = serializers.SerializerMethodField()

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'score',
            'total_points', 'earned_points',
            'started_at', 'finished_at', 'is_completed', 'answers',
            'grade_value',
        ]

    def get_grade_value(self, obj):
        from grades.models import Grade
        return Grade.calculate_grade(obj.score)


class TeacherChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ['id', 'question', 'text', 'is_correct', 'order']
        extra_kwargs = {
            'question': {'required': False},
        }


class TeacherQuestionSerializer(serializers.ModelSerializer):
    choices = TeacherChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'quiz', 'text', 'question_type', 'image', 'points', 'order', 'choices']
        extra_kwargs = {
            'quiz': {'required': False},
        }


class TeacherQuizSerializer(serializers.ModelSerializer):
    questions = TeacherQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'topic', 'title', 'description', 'time_limit_minutes', 'passing_score', 'max_attempts', 'is_published', 'questions']
