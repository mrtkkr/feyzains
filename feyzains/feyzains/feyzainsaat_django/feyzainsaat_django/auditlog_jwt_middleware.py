import logging
from django.utils.deprecation import MiddlewareMixin
from rest_framework_simplejwt.authentication import JWTAuthentication

logger = logging.getLogger(__name__)

class JWTAuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # Authenticate the user using JWT
        user_auth_tuple = JWTAuthentication().authenticate(request)
        if user_auth_tuple is not None:
            user, _ = user_auth_tuple
            request.user = user
            logger.debug(f"JWTAuthenticationMiddleware: User authenticated as {user}")
        else:
            logger.debug("JWTAuthenticationMiddleware: No user authenticated")