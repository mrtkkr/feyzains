from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin, Group
from django.utils import timezone
from django.db.models import Case, When, Value, IntegerField


class Company(models.Model):
    name = models.CharField(max_length=255)
    creation_date = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class UserManager(BaseUserManager):
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)
    def _create_user(self, email, first_name, last_name, password, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        now = timezone.now()
        email = self.normalize_email(email)

        user = self.model(
            email=email,
            first_name = first_name,
            last_name = last_name,
            is_active=True,
            last_login=now,
            date_joined=now,
            **extra_fields
        )



        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, first_name, last_name, password, **extra_fields):
        return self._create_user(email, first_name, last_name, password, **extra_fields)

    def create_superuser(self, email, first_name, last_name, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, first_name, last_name, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    is_active = models.BooleanField(default=True)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    company = models.ForeignKey(Company, on_delete=models.CASCADE, null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    @property
    def username(self):
        return f"{self.first_name} {self.last_name}"

    def get_absolute_url(self):
        return "/users/%i/" % (self.pk)


class NotificationQuerySet(models.QuerySet):
    def ordered_by_priority_and_date(self):
        return self.annotate(
            priority_order=Case(
                When(priority__name='Çok Yüksek', then=Value(1)),
                default=Value(2),
                output_field=IntegerField(),
            )
        ).order_by('priority_order', '-created_at')

class NotificationManager(models.Manager):
    def get_queryset(self):
        return NotificationQuerySet(self.model, using=self._db)

    def ordered_by_priority_and_date(self):
        return self.get_queryset().ordered_by_priority_and_date()

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    objects = NotificationManager()

    def __str__(self):
        return self.message
