from rest_framework import serializers
from .models import Section, Topic, Lesson, LessonImage, TopicProgress


class LessonImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonImage
        fields = ['id', 'image', 'caption']


class LessonSerializer(serializers.ModelSerializer):
    images = LessonImageSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'content', 'video_url', 'images']


class TopicListSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'title', 'order', 'is_completed', 'has_quiz']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return TopicProgress.objects.filter(
                student=request.user, topic=obj, is_completed=True
            ).exists()
        return False

    def get_has_quiz(self, obj):
        try:
            return obj.quiz.is_published
        except Topic.quiz.RelatedObjectDoesNotExist:
            return False


class TopicDetailSerializer(serializers.ModelSerializer):
    lesson = LessonSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'title', 'order', 'section', 'lesson', 'is_completed', 'has_quiz']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return TopicProgress.objects.filter(
                student=request.user, topic=obj, is_completed=True
            ).exists()
        return False

    def get_has_quiz(self, obj):
        try:
            return obj.quiz.is_published
        except Topic.quiz.RelatedObjectDoesNotExist:
            return False


class SectionListSerializer(serializers.ModelSerializer):
    topic_count = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['id', 'title', 'description', 'order', 'icon', 'topic_count', 'progress_percentage']

    def get_topic_count(self, obj):
        return obj.topics.filter(is_published=True).count()

    def get_progress_percentage(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            total = obj.topics.filter(is_published=True).count()
            if total == 0:
                return 0
            completed = TopicProgress.objects.filter(
                student=request.user, topic__section=obj, is_completed=True,
                topic__is_published=True
            ).count()
            return round((completed / total) * 100)
        return 0


class SectionDetailSerializer(serializers.ModelSerializer):
    topics = serializers.SerializerMethodField()

    class Meta:
        model = Section
        fields = ['id', 'title', 'description', 'order', 'icon', 'topics']

    def get_topics(self, obj):
        request = self.context.get('request')
        if request and request.user.role == 'teacher':
            topics = obj.topics.all()
        else:
            topics = obj.topics.filter(is_published=True)
        return TopicListSerializer(topics, many=True, context=self.context).data


class TeacherSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Section
        fields = ['id', 'title', 'description', 'order', 'icon', 'is_published']


class TeacherTopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'section', 'title', 'order', 'is_published']


class TeacherLessonImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonImage
        fields = ['id', 'lesson', 'image', 'caption']


class TeacherLessonSerializer(serializers.ModelSerializer):
    video_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    images = LessonImageSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'topic', 'content', 'video_url', 'images']

    def validate_video_url(self, value):
        """Convert empty strings to None so Django's URLField doesn't error."""
        if not value or not value.strip():
            return None
        return value
