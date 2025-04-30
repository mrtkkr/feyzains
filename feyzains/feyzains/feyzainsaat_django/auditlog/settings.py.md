```
AUDITLOG_INCLUDE_ALL_MODELS=True


### En alta eklenmeli.
MIDDLEWARE = (
    # Request altering middleware, e.g., Django's default middleware classes
    'auditlog.middleware.AuditlogMiddleware', 
    # Other middleware
)	



INSTALLED_APPS = [
	****
    'auditlog',
    ****
]



AUDITLOG_EXCLUDE_TRACKING_MODELS = (
    "sessions",
     "auth",
)
```