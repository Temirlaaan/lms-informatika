# Generated manually — adds video_file to Lesson and opened_at to TopicProgress

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='lesson',
            name='video_file',
            field=models.FileField(blank=True, null=True, upload_to='lesson_videos/'),
        ),
        migrations.AddField(
            model_name='topicprogress',
            name='opened_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
