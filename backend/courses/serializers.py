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
        return hasattr(obj, 'quiz')


class TopicDetailSerializer(serializers.ModelSerializer):
    lesson = LessonSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'title', 'order', 'section', 'lesson', 'is_completed']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return TopicProgress.objects.filter(
                student=request.user, topic=obj, is_completed=True
            ).exists()
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
                student=request.user, topic__section=obj, is_completed=True
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
