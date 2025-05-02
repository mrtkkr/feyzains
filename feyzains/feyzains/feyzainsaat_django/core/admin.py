from django.contrib import admin

# Register your models here.
from .models import *


admin.site.register(Company)
admin.site.register(Customer)
admin.site.register(Worksite)
admin.site.register(Group)
admin.site.register(Tax)
admin.site.register(Withholding)
admin.site.register(Payment)

