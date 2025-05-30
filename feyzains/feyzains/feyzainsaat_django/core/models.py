from django.db import models
from accounts.models import User

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class Tag(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class Snippet(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    language = models.CharField(max_length=50)  # örn. "Python", "JavaScript"
    framework = models.CharField(max_length=50, blank=True)  # örn. "React", "Django"
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    tags = models.ManyToManyField(Tag, blank=True)
    is_public = models.BooleanField(default=True)  # belki bazı snippet'ler sadece belirli gruplara özel olur

    def __str__(self):
        return self.title

class Comment(models.Model):
    snippet = models.ForeignKey(Snippet, on_delete=models.CASCADE)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)





class Worksite(models.Model):
    name = models.CharField(max_length=255)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class Group(models.Model):
    name = models.CharField(max_length=255)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class Company(models.Model):
    name = models.CharField(max_length=255)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='company_created_by')

class Customer(models.Model):
    name = models.CharField(max_length=255)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    balance = models.DecimalField(max_digits=20, decimal_places=2, default=0.00)



class Tax(models.Model):
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    update_date = models.DateTimeField()
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class Withholding(models.Model):
    withholding = models.DecimalField(max_digits=10, decimal_places=2)
    update_date = models.DateTimeField()
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class Payment(models.Model):
    date = models.DateTimeField()
    worksite = models.ForeignKey(Worksite, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    debt = models.DecimalField(max_digits=15, decimal_places=2)
    bank = models.CharField(max_length=255)

    # Checklist alanları buraya eklendi
    check_time = models.DateTimeField(null=True, blank=True)

    check_no = models.CharField(max_length=255,null=True, blank=True)

    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.customer.name} - {self.check_no}"

class Invoice(models.Model):
    date = models.DateTimeField()
    worksite = models.ForeignKey(Worksite, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    material = models.CharField(max_length=255)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2)
    withholding = models.DecimalField(max_digits=10, decimal_places=2)
    receivable = models.DecimalField(max_digits=10, decimal_places=2)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class Personal(models.Model):
    name = models.CharField(max_length=255)
    creation_date = models.DateTimeField()
    identity_number = models.CharField(max_length=20)
    entry = models.DateTimeField()
    exit = models.DateTimeField()
    worksite = models.ForeignKey(Worksite, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

class PaymenInvoice(models.Model):
    invoice_no = models.CharField(max_length=100, null=True, blank=True)
    date = models.DateTimeField()
    worksite = models.ForeignKey(Worksite, on_delete=models.CASCADE)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    debt = models.DecimalField(max_digits=15, decimal_places=2,null=True, blank=True)
    bank = models.CharField(max_length=255,null=True, blank=True)
    type =models.CharField(max_length=50,null=True, blank=True)
    # Checklist alanları buraya eklendi
    check_time = models.DateTimeField(null=True, blank=True)

    check_no = models.CharField(max_length=255,null=True, blank=True)

    # Invoice alanları buraya eklendi
    material = models.CharField(max_length=255,null=True, blank=True)
    quantity = models.IntegerField(null=True, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)
    price = models.DecimalField(max_digits=18, decimal_places=2,null=True, blank=True)
    tax = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)
    withholding = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)
    withholding_amount = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)
    receivable = models.DecimalField(max_digits=10, decimal_places=2,null=True, blank=True)

    created_date = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.customer.name} - {self.check_no}"
    