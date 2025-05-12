from rest_framework import serializers
from .models import *

class SnippetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snippet
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class WorksiteSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)


    class Meta:
        model = Worksite
        fields = '__all__'

class GroupSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Group
        fields = '__all__'

class CompanySerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Company
        fields = '__all__'

class CustomerSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Customer
        fields = '__all__'

class TaxSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Tax
        fields = '__all__'

class WithholdingSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Withholding
        fields = '__all__'

class PaymentSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    

    class Meta:
        model = Payment
        fields = '__all__'
    def create(self, validated_data):
        print("validated_data", validated_data)

class PaymentReadSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    worksite = WorksiteSerializer()
    group = GroupSerializer()
    company = CompanySerializer()
    customer = CustomerSerializer()

    class Meta:
        model = Payment
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = Invoice
        fields = '__all__'

class PersonalSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    worksite_detail = WorksiteSerializer(source='worksite', read_only=True)  # ✅ bu doğru kullanım

    class Meta:
        model = Personal
        fields = '__all__'



#payment_invoice serializer

class PaymenInvoiceSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = PaymenInvoice
        fields = '__all__'
    

class PaymenInvoiceReadSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    worksite = WorksiteSerializer()
    group = GroupSerializer()
    company = CompanySerializer()
    customer = CustomerSerializer()

    class Meta:
        model = PaymenInvoice
        fields = '__all__'
        