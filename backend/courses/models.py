from django.conf import settings
from django.db import models


class Section(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    icon = models.CharField(max_length=100, blank=True)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Topic(models.Model):
    section = models.ForeignKey(Section, on_delete=models.CASCADE, related_name='topics')
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)
    is_published = models.BooleanField(default=False)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title


class Lesson(models.Model):
    topic = models.OneToOneField(Topic, on_delete=models.CASCADE, related_name='lesson')
    content = models.TextField()
    video_url = models.URLField(blank=True, null=True)
    video_file = models.FileField(upload_to='lesson_videos/', blank=True, null=True)

    def __str__(self):
        return f"Lesson: {self.topic.title}"

    def get_video_source(self):
        if self.video_file:
            return {'type': 'file', 'url': self.video_file.url}
        elif self.video_url:
            return {'type': 'youtube', 'url': self.video_url}
        return None


class LessonImage(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='lesson_images/')
    caption = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.caption or f"Image for {self.lesson}"


class TopicProgress(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='topic_progress'
    )
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE, related_name='progress')
    is_completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(blank=True, null=True)
    opened_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('student', 'topic')
        ordering = ['topic__order']

    def __str__(self):
        return f"{self.student} - {self.topic} ({'done' if self.is_completed else 'pending'})"
