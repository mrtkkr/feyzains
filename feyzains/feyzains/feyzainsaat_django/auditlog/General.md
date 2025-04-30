AuditLog için gerekli olan kütüphanenin kurulumu:
```
pip install django-auditlog
```

Projeye entegre:
```
INSTALLED_APPS = [
	****
    'auditlog',
    ****
]
```

```
### En alta eklenmeli.
MIDDLEWARE = (
    # Request altering middleware, e.g., Django's default middleware classes
    'auditlog.middleware.AuditlogMiddleware', 
)	
```

Bütün modelleri kapsaması için:
```
AUDITLOG_INCLUDE_ALL_MODELS=True
```

Hariç tutmak istediğimiz modeller için:
```
AUDITLOG_EXCLUDE_TRACKING_MODELS = (
    "sessions",
    "auth",
)
```

En son:
```
python3 manage.py makemigrations  
python3 manage.py migrate
```