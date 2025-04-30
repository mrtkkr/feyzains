from django.contrib.auth.middleware import get_user
from django.conf import settings
import jwt
from jwt.exceptions import InvalidTokenError
from accounts.models import User

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            mobile_header = request.headers.get('X-Platform')
            if mobile_header == 'mobile':
                request.user = get_user(request)  # get the user from the session
    
                # if the user is not authenticated and there is an Authorization header, try to authenticate with JWT
                if not request.user.is_authenticated:
                    authorization_header = request.headers.get('Authorization')
                    if authorization_header:
                        try:
                            token = authorization_header.split(' ')[1]
                            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                            user_id = decoded_token.get('user_id')
                            user = User.objects.get(id=user_id)
                            request.user = user
                        except (InvalidTokenError, User.DoesNotExist):
                            pass  # if JWT authentication fails, leave request.user as it is
        except KeyError:
            pass  # handle missing headers gracefully

        response = self.get_response(request)
        return response