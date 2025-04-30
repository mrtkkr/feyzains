from auditlog.models import LogEntry
from django.contrib.contenttypes.models import ContentType
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from .serializers import LogEntrySerializer
from feyzainsaat_django.pagination import CustomPageNumberPagination

class ModelAuditLogView(ListAPIView):
    serializer_class = LogEntrySerializer
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        model_name = self.kwargs['model_name']
        object_id = self.kwargs['object_id']
        try:
            content_type = ContentType.objects.get(model=model_name)
            return LogEntry.objects.filter(content_type=content_type, object_id=object_id).order_by('-timestamp')
        except ContentType.DoesNotExist:
            return LogEntry.objects.none()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class AllChangesAuditLogView(ListAPIView):
    serializer_class = LogEntrySerializer
    pagination_class = CustomPageNumberPagination

    def get_queryset(self):
        return LogEntry.objects.all().order_by('-timestamp')