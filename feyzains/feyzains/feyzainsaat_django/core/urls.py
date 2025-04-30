from django.urls import path
from .views import SnippetsView

urlpatterns = [
    path("snippets/", SnippetsView.as_view(), name="snippets_api"),
]
