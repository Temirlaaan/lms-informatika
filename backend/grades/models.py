from django.conf import settings
from django.db import models


class Grade(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='grades'
    )
    section = models.ForeignKey(
        'courses.Section', on_delete=models.CASCADE, related_name='grades'
    )
    quiz_attempt = models.ForeignKey(
        'quizzes.QuizAttempt', on_delete=models.SET_NULL, blank=True, null=True, related_name='grades'
    )
    score = models.FloatField()
    grade_value = models.PositiveIntegerField()

    class Meta:
        ordering = ['-score']

    def __str__(self):
        return f"{self.student} - {self.section}: {self.grade_value}"

    @staticmethod
    def calculate_grade(score_percentage):
        """Calculate grade value from score percentage.

        >= 85% -> 5
        >= 70% -> 4
        >= 50% -> 3
        < 50%  -> 2
        """
        if score_percentage >= 85:
            return 5
        elif score_percentage >= 70:
            return 4
        elif score_percentage >= 50:
            return 3
        else:
            return 2
