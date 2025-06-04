from email.utils import parsedate
from django.shortcuts import render
from accounts.models import User
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from datetime import datetime,time
from .serializers import *
from .models import *
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination
from django.utils.timezone import make_aware
from urllib.parse import urlencode, parse_qs, urlparse, urlunparse



# Create your views here.



# --- Worksite Views ---
class WorksiteView(APIView):
    

    def get(self, request):
        worksites = Worksite.objects.all().order_by('-id')
        serializer = WorksiteSerializer(worksites, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = WorksiteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorksiteDetailView(APIView):
    

    def get(self, request, pk):
        worksite = get_object_or_404(Worksite, pk=pk)
        serializer = WorksiteSerializer(worksite)
        return Response(serializer.data)

    def put(self, request, pk):
        worksite = get_object_or_404(Worksite, pk=pk)
        serializer = WorksiteSerializer(worksite, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        worksite = get_object_or_404(Worksite, pk=pk)
        worksite.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Aynı yapıyı diğer modeller için de kopyalayıp aşağıya uyarlayabiliriz.

# --- Group Views ---
class GroupView(APIView):
    

    def get(self, request):
        groups = Group.objects.all().order_by('-id')
        serializer = GroupSerializer(groups, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = GroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GroupDetailView(APIView):
    

    def get(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        serializer = GroupSerializer(group)
        return Response(serializer.data)

    def put(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        serializer = GroupSerializer(group, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        group = get_object_or_404(Group, pk=pk)
        group.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- Company Views ---
class CompanyView(APIView):
    

    def get(self, request):
        companies = Company.objects.all().order_by('-id')
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CompanyDetailView(APIView):
    

    def get(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        serializer = CompanySerializer(company)
        return Response(serializer.data)

    def put(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        serializer = CompanySerializer(company, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        company = get_object_or_404(Company, pk=pk)
        company.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# --- Customer Views ---
class CustomerView(APIView):
    

    def get(self, request):
        customers = Customer.objects.all().order_by('-id')
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomerDetailView(APIView):
    

    def get(self, request, pk):
        customer = get_object_or_404(Customer, pk=pk)
        serializer = CustomerSerializer(customer)
        return Response(serializer.data)

    def put(self, request, pk):
        customer = get_object_or_404(Customer, pk=pk)
        serializer = CustomerSerializer(customer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        customer = get_object_or_404(Customer, pk=pk)
        customer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PaymentView(APIView):
    

    def get(self, request):
        payments = Payment.objects.all().order_by('-id')
        serializer = PaymentReadSerializer(payments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PaymentSerializer(data=request.data)
        if serializer.is_valid():
            print("usercık",request.user)
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class PaymentDetailView(APIView):
    

    def get(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk)
        serializer = PaymentSerializer(payment)
        return Response(serializer.data)

    def put(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk)
        serializer = PaymentSerializer(payment, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        payment = get_object_or_404(Payment, pk=pk)
        payment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# --- Personal Views ---
class PersonalView(APIView):

    def get(self, request):
        personals = Personal.objects.select_related('worksite', 'created_by').all().order_by('-id')
        serializer = PersonalSerializer(personals, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PersonalSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PersonalDetailView(APIView):

    def get(self, request, pk):
        personal = get_object_or_404(Personal, pk=pk)
        serializer = PersonalSerializer(personal)
        return Response(serializer.data)

    def put(self, request, pk):
        personal = get_object_or_404(Personal, pk=pk)
        serializer = PersonalSerializer(personal, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        personal = get_object_or_404(Personal, pk=pk)
        personal.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# class PaymenInvoiceView(APIView):
#     def get(self, request):
#         invoices = PaymenInvoice.objects.all().order_by('-id')

#         # URL parametrelerinden filtreleme değerlerini al
#         search = request.GET.get("search", "")
#         start_date = request.GET.get("start_date", "")
#         end_date = request.GET.get("end_date", "")

#         # Arama filtresi (örnek olarak müşteri adına göre filtreleme)
#         if search:
#             invoices = invoices.filter(
#                 Q(customer__name__icontains=search) |  # customer bir ForeignKey ise
#                 Q(invoice_number__icontains=search)     # başka bir alan varsa ona göre de filtrele
#             )

#         # Tarih aralığı filtresi
#         if start_date and end_date:
#             invoices = invoices.filter(date__range=[start_date, end_date])

#         serializer = PaymenInvoiceReadSerializer(invoices, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = PaymenInvoiceSerializer(data=request.data, context={'request': request})
#         if serializer.is_valid():
#             serializer.save(created_by=request.user)
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class PaymenInvoiceView(APIView):
    # def get(self, request):
        
    #     invoices = PaymenInvoice.objects.all().order_by('-id')
    #     serializer = PaymenInvoiceReadSerializer(invoices, many=True)
    #     return Response(serializer.data)

    def get(self, request):
        type_param = request.query_params.get('type')  # ?type=payment veya ?type=invoice
        
        if type_param:
            invoices = PaymenInvoice.objects.filter(type=type_param).order_by('-id')
        else:
            invoices = PaymenInvoice.objects.all().order_by('-id')

        serializer = PaymenInvoiceReadSerializer(invoices, many=True)

        print(f"Gelen type: {type_param}")
        

        return Response(serializer.data)

    # def post(self, request):
    #     serializer = PaymenInvoiceSerializer(data=request.data, context={'request': request})
    #     if serializer.is_valid():
    #         serializer.save(created_by=request.user)
    #         return Response(serializer.data, status=status.HTTP_201_CREATED)
    #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)





class PaymenInvoiceDetailView(APIView):
    def get(self, request, pk):
        invoice = get_object_or_404(PaymenInvoice, pk=pk)
        serializer = PaymenInvoiceReadSerializer(invoice)
        return Response(serializer.data)

    def put(self, request, pk):
        invoice = get_object_or_404(PaymenInvoice, pk=pk)
        serializer = PaymenInvoiceSerializer(invoice, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(PaymenInvoiceReadSerializer(invoice).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        invoice = get_object_or_404(PaymenInvoice, pk=pk)
        invoice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class ChecklistPagination(PageNumberPagination):
    page_size = 10

class ChecklistView(APIView):
    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        order_by = request.query_params.get('order_by', 'check_time')  # default: check_time
        order = request.query_params.get('order', 'desc')  # default: descending
        company = request.query_params.get('company', '')
        customer = request.query_params.get('customer', '')

        checklists = PaymenInvoice.objects.filter(
            Q(check_no__isnull=False) & ~Q(check_no='')
        )

        if start_date and end_date:
            try:
                start = make_aware(datetime.combine(datetime.strptime(start_date, '%Y-%m-%d').date(), time.min))
                end = make_aware(datetime.combine(datetime.strptime(end_date, '%Y-%m-%d').date(), time.max))

                checklists = checklists.filter(check_time__range=(start, end))

                
            except ValueError:
                return Response({'error': 'Tarih formatı hatalı. Format: YYYY-MM-DD olmalı.'}, status=400)
            
        # Şirket adına göre filtreleme (case-insensitive)
        if company:
            checklists = checklists.filter(company__name__icontains=company)

        # Müşteri adına göre filtreleme (case-insensitive)
        if customer:
            checklists = checklists.filter(customer__name__icontains=customer)

        if order == 'desc':
                checklists = checklists.order_by(f'-{order_by}')
        else:
                checklists = checklists.order_by(order_by)

        paginator = ChecklistPagination()
        result_page = paginator.paginate_queryset(checklists, request)
        serializer = PaymenInvoiceReadSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)


class SearchPagination(PageNumberPagination):
    page_size = 10

class SearchPagelistView(APIView):
    def get(self, request):
        # Sıralama ayarları
        order_by = request.query_params.get('order_by', 'date')
        order = request.query_params.get('order', 'desc')

        # Tarih aralığı
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        print("startDateeee:", start_date)
        print("endDateeee:", end_date)
        
        # Çoklu müşteri seçimi için özel işlem
        customer_param = request.query_params.get('customer_ids', '')
        customer_ids = []
        
        if customer_param:
            try:
                # Virgülle ayrılmış müşteri ID'lerini parse et
                customer_ids = [int(id.strip()) for id in customer_param.split(',') if id.strip()]
                print("Seçili müşteri ID'leri:", customer_ids)
            except ValueError:
                return Response({'error': 'Müşteri ID formatı hatalı.'}, status=400)

        # Filtre parametreleri
        filters = {
            'worksite__name__icontains': request.query_params.get('worksite', ''),
            'group__name__icontains': request.query_params.get('group', ''),
            'company__name__icontains': request.query_params.get('company', ''),
            'customer__name__icontains': request.query_params.get('customer', ''),
            'bank__icontains': request.query_params.get('bank', ''),
            'check_no__icontains': request.query_params.get('check_no', ''),
            'material__icontains': request.query_params.get('material', ''),
            'quantity': request.query_params.get('quantity', ''),
            'unit_price': request.query_params.get('unit_price', ''),
            'price': request.query_params.get('price', ''),
            'tax': request.query_params.get('tax', ''),
            'withholding': request.query_params.get('withholding', ''),
            'receivable': request.query_params.get('receivable', ''),
            'debt': request.query_params.get('debt', '')
        }

        # İlk queryset
        queryset = PaymenInvoice.objects.all()

        # Q objesiyle dinamik filtreleme
        q_objects = Q()

        print("\n--- Aktif Filtreler ---")
        for field, value in filters.items():
            if value != '':
                print(f"{field} = {value}")
                q_objects &= Q(**{field: value})
                
        # Çoklu müşteri filtresi
        if customer_ids:
            q_objects &= Q(customer__id__in=customer_ids)
            print(f"Müşteri filtresi uygulandı: {customer_ids}")

        # Tarih filtrelemesi
        if start_date and end_date:
            try:
                start = make_aware(datetime.combine(datetime.strptime(start_date, '%Y-%m-%d'), time.min))
                end = make_aware(datetime.combine(datetime.strptime(end_date, '%Y-%m-%d'), time.max))
                q_objects &= Q(check_time__range=(start, end))
            except ValueError:
                return Response({'error': 'Tarih formatı hatalı.'}, status=400)

        # Filtreleri uygula
        queryset = queryset.filter(q_objects)
        print("queryseeettt:", queryset.count())

        # Sıralama uygula
        order_by = f'-{order_by}'
        queryset = queryset.order_by(order_by)

        # Sayfalama ve serialize
        paginator = SearchPagination()
        page = paginator.paginate_queryset(queryset, request)
        serializer = PaymenInvoiceReadSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
    

    def post(self, request):
        serializer = PaymenInvoiceSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class SearchPageDetailView(APIView):
    def get(self, request, pk):
        searchPage = get_object_or_404(PaymenInvoice, pk=pk)
        serializer = PaymenInvoiceReadSerializer(searchPage)
        return Response(serializer.data)

    def put(self, request, pk):
        searchPage = get_object_or_404(PaymenInvoice, pk=pk)
        serializer = PaymenInvoiceSerializer(searchPage, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(PaymenInvoiceReadSerializer(searchPage).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        searchPage = get_object_or_404(PaymenInvoice, pk=pk)
        searchPage.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class SearchAllView(APIView):
    def get(self, request):
        products = PaymenInvoice.objects.all()
        serializer = PaymenInvoiceSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# class SearchlistView(APIView):
#     def get(self, request):
#         search = request.GET.get("search", "")
#         if search:
#             customers = Customer.objects.filter(Q(name__icontains=search) | Q(surname__icontains=search))
#             serializer = CustomerSerializer(customers, many=True)
#             return Response(serializer.data)
#         else:
#             return Response({"message": "No search term provided."}, status=status.HTTP_400_BAD_REQUEST)  

# class OrderPagination(PageNumberPagination):
#     page_size = 10  # Sayfa başına 50 sipariş


# class OrderView(APIView):
    # def get(self, request):

    #     orders = Order.objects.filter(is_cancelled=False)

    #     orders_serialized = OrderSerializer(orders, many=True).data
    #     return JsonResponse(orders_serialized, safe=False)

    # def get(self, request):
    #     search = request.GET.get("search", "")
    #     seller = request.GET.get("seller", "")
    #     customer = request.GET.get("customer", "")
    #     payment_type = request.GET.get("payment_type", "")
    #     start_date = request.GET.get("start_date", "")
    #     end_date = request.GET.get("end_date", "")
    #     hour_range = request.GET.get("hour_range", "")

    #     if request.user.is_authorized == False:
    #         orders = Order.objects.filter(~Q(payment_type="E-Ticaret"))
    #     else:
    #         orders = Order.objects.all()

    #     if search:
    #         orders = orders.filter(
    #             Q(customer_nameicontains=search) | Q(selleruserfirst_nameicontains=search) | Q(selleruserlast_name_icontains=search)
    #         )
    #     if seller:
    #         orders = orders.filter(seller_id=seller)
    #     if customer:
    #         orders = orders.filter(customer_id=customer)
    #     if payment_type:
    #         orders = orders.filter(payment_type=payment_type)
    #     if start_date and end_date:
    #         orders = orders.filter(creation_date__range=[start_date, end_date])
    #     if hour_range:
    #         now = timezone.now()
    #         start_time = now - timedelta(hours=int(hour_range))
    #         orders = orders.filter(creation_date__gte=start_time)

    #     orders = orders.order_by("-creation_date")  # Add this line for sorting by creation_date
        # orders = orders.select_related("seller", "customer", "warehouse")

        # paginator = OrderPagination()
        # page = paginator.paginate_queryset(orders, request)
        # serialized = OrderSerializer(page, many=True)

        # return paginator.get_paginated_response(serialized.data)

class PaymentPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'pageSize'

    def get_paginated_response(self, data):
        request = self.request

        # Orijinal query string'ten parametreleri al
        query_dict = dict(parse_qs(request.META.get('QUERY_STRING', '')))
        query_dict.pop(self.page_query_param, None)  # önceki page parametresini çıkar

        def build_url(page_number):
            query_dict[self.page_query_param] = [str(page_number)]
            new_query = urlencode(query_dict, doseq=True)
            return f"{request.build_absolute_uri(request.path)}?{new_query}"

        return Response({
            'count': self.page.paginator.count,
            'next': build_url(self.page.next_page_number()) if self.page.has_next() else None,
            'previous': build_url(self.page.previous_page_number()) if self.page.has_previous() else None,
            'results': data
        })   

class PaymentEntryView(APIView):
    def get(self, request): 
        # Parametreleri al
        entry_type = request.query_params.get('type', 'invoice')
        order_by = request.query_params.get('order_by', 'date')
        order = request.query_params.get('order', 'asc')
        worksite = request.query_params.get('worksite', '')
        group = request.query_params.get('group', '')
        company = request.query_params.get('company', '')
        customer = request.query_params.get('customer', '')

        # Filtre
        filters = Q()
        if entry_type:
            filters &= Q(type=entry_type)
        if company:
            filters &= Q(company__name__icontains=company)
        if worksite:
            filters &= Q(worksite__name__icontains=worksite)
        if group:
            filters &= Q(group__name__icontains=group)
        if customer:
            filters &= Q(customer__name__icontains=customer)

        payments = PaymenInvoice.objects.filter(filters)

        # Sıralama
        if order == 'asc':
            payments = payments.order_by(f'-{order_by}')
        else:
            payments = payments.order_by(order_by)

        # Sayfalama
        paginator = PaymentPagination()
        paginator.request = request  # <-- BU SATIR ÖNEMLİ!
        result_page = paginator.paginate_queryset(payments, request)

        serializer = PaymenInvoiceReadSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)
    
    def post(self, request):
        serializer = PaymenInvoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentEntryDetailView(APIView):
    def get(self, request, pk):
        payment_entry = get_object_or_404(PaymenInvoice, pk=pk)
        serializer = PaymenInvoiceReadSerializer(payment_entry)
        return Response(serializer.data)

    def put(self, request, pk):
        payment_entry = get_object_or_404(PaymenInvoice, pk=pk)
        serializer = PaymenInvoiceSerializer(payment_entry, data=request.data)
        
        if serializer.is_valid():
            serializer.save()
            read_serializer = PaymenInvoiceReadSerializer(payment_entry)
            return Response(read_serializer.data)
        
        # Hatalı olan satır düzeltildi:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        payment_entry = get_object_or_404(PaymenInvoice, pk=pk)
        payment_entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class InvoicePagination(PageNumberPagination):
    page_size = 10

class InvoiceView(APIView):
    def get(self, request):
        # Parametreleri al
        entry_type = request.query_params.get('type', 'invoice')  # Varsayılan: 'invoice'
        order_by = request.query_params.get('order_by', 'date')  # Varsayılan: 'date'
        order = request.query_params.get('order', 'asc')  # Varsayılan: 'desc'
        worksite = request.query_params.get('worksite', '')
        group = request.query_params.get('group', '')
        company = request.query_params.get('company', '')
        customer = request.query_params.get('customer', '')

        # Sorguyu başlat
        filters = Q()

        # Tür filtresi
        if entry_type:
            filters &= Q(type=entry_type)

        # Diğer filtreler (case-insensitive)
        if company:
            filters &= Q(company__name__icontains=company)
        if worksite:
            filters &= Q(worksite__name__icontains=worksite)
        if group:
            filters &= Q(group__name__icontains=group)
        if customer:
            filters &= Q(customer__name__icontains=customer)

        # Filtreleri uygula
        invoices = PaymenInvoice.objects.filter(filters)

        # Sıralama uygula
        if order == 'asc':
            invoices = invoices.order_by(f'-{order_by}')
        else:
            invoices = invoices.order_by(order_by)

        # Sayfalama işlemi
        paginator = PaymentPagination()
        result_page = paginator.paginate_queryset(invoices, request)
        serializer = PaymenInvoiceReadSerializer(result_page, many=True)

        return paginator.get_paginated_response(serializer.data)

    def post(self, request):
        serializer = PaymenInvoiceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class InvoiceDetailView(APIView):
    def get(self, request, pk):
        invoice = get_object_or_404(PaymenInvoice, pk=pk)
        serializer = PaymenInvoiceReadSerializer(invoice)
        return Response(serializer.data)

    def put(self, request, pk):
        invoice = get_object_or_404(PaymenInvoice, pk=pk)
        serializer = PaymenInvoiceSerializer(invoice, data=request.data)
        if serializer.is_valid():
            serializer.save()
            read_serializer = PaymenInvoiceReadSerializer(invoice)
            return Response(read_serializer.data)
        return Response(read_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        invoice = get_object_or_404(PaymenInvoice, pk=pk)
        invoice.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


