# Generated by Django 5.1.7 on 2025-05-06 12:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0007_alter_paymeninvoice_bank_alter_paymeninvoice_debt_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='paymeninvoice',
            name='type',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
    ]
