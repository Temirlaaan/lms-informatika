from rest_framework import serializers
from .models import Grade


class GradeSerializer(serializers.ModelSerializer):
    section_title = serializers.CharField(source='section.title', read_only=True)

    class Meta:
        model = Grade
        fields = ['id', 'section', 'section_title', 'score', 'grade_value']
