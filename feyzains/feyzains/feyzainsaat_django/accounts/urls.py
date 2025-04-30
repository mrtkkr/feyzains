from django.urls import path, include
from .views import *

urlpatterns = [
    path('', Home.as_view(), name='home'),
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('user/', UserView.as_view()),
    path('users/', UsersView.as_view()),

    path('notification/', NotificationView.as_view()),
    path('set_notifications_as_read/', SetNotificationsAsRead.as_view()),
    #path('read-excel/', views.read_excel, name='read-excel'),





    
]
