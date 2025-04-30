from django.urls import path
from .views import ModelAuditLogView, AllChangesAuditLogView

urlpatterns = [
    path('auditlog/<str:model_name>/<int:object_id>/', ModelAuditLogView.as_view(), name='get_model_auditlog'),
    path('auditlog/', AllChangesAuditLogView.as_view(), name='get_all_changes_auditlog'),
]