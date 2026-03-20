from rest_framework import serializers
from .models import Section, Topic, Lesson, LessonImage, TopicProgress


class LessonImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = LessonImage
        fields = ['id', 'image', 'caption']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class LessonSerializer(serializers.ModelSerializer):
    images = LessonImageSerializer(many=True, read_only=True)
    video_source = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'content', 'video_url', 'video_file', 'video_source', 'images']

    def get_video_source(self, obj):
        return obj.get_video_source()


class TopicListSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = ['id', 'title', 'order', 'is_completed', 'has_quiz', 'status']

    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            return TopicProgress.objects.filter(
                student=request.user, topic=obj, is_completed=True
            ).exists()
        return False

    def get_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and request.user.role == 'student':
            progress = TopicProgress.objects.filter(student=request.user, topic=obj).first()
            if progress and progress.is_completed:
                return 'completed'
            elif progress and progress.opened_at:
                return 'in_progress'
        return 'not_started'

    def get_has_quiz(self, obj):
        try:
            return obj.quiz.is_published
        except Topic.quiz.RelatedObjectDoesNotExist:
            return False


class TopicDetailSerializer(serializers.ModelSerializer):
    lesson = LessonSerializer(read_only=True)
    is_completed = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    prev_topic_id = serializers.SerializerMethodField()
    next_topic_id = serializers.SerializerMethodField()

    class Meta:
        model = Topic
        fields = [
            'id', 'title', 'order', 'section', 'lesson',
            'is_completed', 'has_quiz', 'prev_topic_id', 'next_topic_id',
        ]

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

    def get_prev_topic_id(self, obj):
        prev_topic = Topic.objects.filter(
            section=obj.section, order__lt=obj.order, is_published=True
        ).order_by('-order').first()
        return prev_topic.id if prev_topic else None

    def get_next_topic_id(self, obj):
        next_topic = Topic.objects.filter(
            section=obj.section, order__gt=obj.order, is_published=True
        ).order_by('order').first()
        return next_topic.id if next_topic else None


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
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = LessonImage
        fields = ['id', 'lesson', 'image', 'image_url', 'caption']

    def get_image_url(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def validate_image(self, value):
        import os
        max_size = 5 * 1024 * 1024  # 5 MB
        if value.size > max_size:
            raise serializers.ValidationError('Сурет файлы тым үлкен (макс. 5 МБ)')
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError('Тек JPG, PNG, GIF, WebP форматтары рұқсат етіледі')
        return value


class TeacherLessonSerializer(serializers.ModelSerializer):
    video_url = serializers.URLField(required=False, allow_blank=True, allow_null=True)
    video_file = serializers.FileField(required=False, allow_null=True)
    images = LessonImageSerializer(many=True, read_only=True)
    video_source = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ['id', 'topic', 'content', 'video_url', 'video_file', 'video_source', 'images']

    def get_video_source(self, obj):
        return obj.get_video_source()

    def validate_video_url(self, value):
        if not value or not value.strip():
            return None
        return value

    def validate_video_file(self, value):
        if value is None or value == '':
            return None
        if value:
            max_size = 100 * 1024 * 1024
            if value.size > max_size:
                raise serializers.ValidationError('Видео файл тым үлкен (макс. 100 МБ)')
            import os
            allowed_extensions = ['.mp4', '.webm', '.ogg', '.mov']
            ext = os.path.splitext(value.name)[1].lower()
            if ext not in allowed_extensions:
                raise serializers.ValidationError('Тек MP4, WebM, OGG форматтары рұқсат етіледі')
            allowed_types = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
            if value.content_type not in allowed_types:
                raise serializers.ValidationError('Тек MP4, WebM, OGG форматтары рұқсат етіледі')
        return value

    def update(self, instance, validated_data):
        if validated_data.get('video_url') and instance.video_file:
            instance.video_file.delete(save=False)
            validated_data['video_file'] = None
        if validated_data.get('video_file') and instance.video_url:
            validated_data['video_url'] = None
        return super().update(instance, validated_data)
