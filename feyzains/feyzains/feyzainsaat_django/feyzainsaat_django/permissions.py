from rest_framework.permissions import BasePermission

class IsPersonalUserOrSuperUser(BasePermission):
    def has_permission(self, request, view):
        is_user_personal = request.user.groups.filter(name='Personal').exists()
        return bool(is_user_personal or request.user.is_superuser)