from django.utils import timezone
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import IsStudent, IsTeacher
from .models import Section, Topic, Lesson, LessonImage, TopicProgress
from .serializers import (
    SectionListSerializer,
    SectionDetailSerializer,
    TopicDetailSerializer,
    TeacherSectionSerializer,
    TeacherTopicSerializer,
    TeacherLessonSerializer,
    TeacherLessonImageSerializer,
)


class SectionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        if self.request.user.role == 'teacher':
            return Section.objects.all()
        return Section.objects.filter(is_published=True)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return SectionDetailSerializer
        return SectionListSerializer


class TopicViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = TopicDetailSerializer
    pagination_class = None

    def get_queryset(self):
        if self.request.user.role == 'teacher':
            return Topic.objects.all()
        return Topic.objects.filter(is_published=True)

    def retrieve(self, request, pk=None):
        topic = self.get_object()
        if request.user.role == 'student':
            progress, _ = TopicProgress.objects.get_or_create(
                student=request.user, topic=topic,
            )
            if not progress.opened_at:
                progress.opened_at = timezone.now()
                progress.save(update_fields=['opened_at'])
        serializer = self.get_serializer(topic)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsStudent])
    def complete(self, request, pk=None):
        topic = self.get_object()
        progress, created = TopicProgress.objects.get_or_create(
            student=request.user,
            topic=topic,
            defaults={'is_completed': True, 'completed_at': timezone.now()},
        )
        if not created and not progress.is_completed:
            progress.is_completed = True
            progress.completed_at = timezone.now()
            progress.save()
        return Response({'status': 'completed'})


class ProgressView(generics.GenericAPIView):
    permission_classes = [IsStudent]
    pagination_class = None

    def get(self, request):
        sections = Section.objects.filter(is_published=True)
        data = []
        for section in sections:
            total = section.topics.filter(is_published=True).count()
            completed = TopicProgress.objects.filter(
                student=request.user, topic__section=section, is_completed=True,
                topic__is_published=True
            ).count()
            data.append({
                'section_id': section.id,
                'section_title': section.title,
                'total_topics': total,
                'completed_topics': completed,
                'percentage': round((completed / total) * 100) if total > 0 else 0,
            })
        return Response(data)


class TeacherSectionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = Section.objects.all()
    serializer_class = TeacherSectionSerializer
    pagination_class = None


class TeacherTopicViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    queryset = Topic.objects.all()
    serializer_class = TeacherTopicSerializer
    pagination_class = None


class TeacherLessonViewSet(viewsets.ModelViewSet):
    permission_classes = [IsTeacher]
    serializer_class = TeacherLessonSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    pagination_class = None

    def get_queryset(self):
        return Lesson.objects.all()


class TeacherLessonImageViewSet(viewsets.GenericViewSet,
                                viewsets.mixins.CreateModelMixin,
                                viewsets.mixins.DestroyModelMixin):
    permission_classes = [IsTeacher]
    serializer_class = TeacherLessonImageSerializer
    queryset = LessonImage.objects.all()
    pagination_class = None

    def create(self, request, *args, **kwargs):
        lesson_id = request.data.get('lesson')
        if lesson_id and LessonImage.objects.filter(lesson_id=lesson_id).count() >= 20:
            return Response(
                {'detail': 'Сабаққа 20-дан артық сурет қосу мүмкін емес'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return super().create(request, *args, **kwargs)
