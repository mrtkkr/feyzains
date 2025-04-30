from rest_framework import serializers
from auditlog.models import LogEntry
from accounts.serializers import UserSerializer
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import FieldDoesNotExist
from django.db.models.fields.related import ForeignKey, ManyToManyField, OneToOneField

class LogEntrySerializer(serializers.ModelSerializer):
    action = serializers.SerializerMethodField()
    content_type = serializers.SerializerMethodField()
    actor = UserSerializer(read_only=True)
    changes = serializers.SerializerMethodField()

    class Meta:
        model = LogEntry
        fields = '__all__'

    def get_action(self, obj):
        return obj.get_action_display()

    def get_content_type(self, obj):
        return obj.content_type.model

    def get_changes(self, obj):
        changes = obj.changes
        verbose_changes = {}
        for field, change in changes.items():
            verbose_field_name = self.get_verbose_field_name(obj, field)
            verbose_changes[verbose_field_name] = change
        return verbose_changes

    def get_verbose_field_name(self, obj, field_name):
        model = obj.content_type.model_class()
        try:
            field = model._meta.get_field(field_name)
            if isinstance(field, (ForeignKey, ManyToManyField, OneToOneField)):
                return field.verbose_name
            return field.verbose_name if hasattr(field, 'verbose_name') else field_name
        except FieldDoesNotExist:
            return field_name