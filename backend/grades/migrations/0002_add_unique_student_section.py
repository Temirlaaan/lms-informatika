# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('grades', '0001_initial'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='grade',
            unique_together={('student', 'section')},
        ),
    ]
