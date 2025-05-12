from django.urls import path
from .views import *

urlpatterns = [
    # path("snippets/", SnippetsView.as_view(), name="snippets_api"),
    path("worksite/", WorksiteView.as_view(), name="worksite_api"),
    path("worksites/<int:pk>/", WorksiteDetailView.as_view(), name="worksite_detail_api"),
    path("group/", GroupView.as_view(), name="group_api"),
    path("groups/<int:pk>/", GroupDetailView.as_view(), name="group_detail_api"),
    path("company/", CompanyView.as_view(), name="company_api"),
    path("companies/<int:pk>/", CompanyDetailView.as_view(), name="company_detail_api"),

    path("customer/", CustomerView.as_view(), name="customer_api"),
    path("customers/<int:pk>/", CustomerDetailView.as_view(), name="customer_detail_api"),
    # path("taxes/", TaxView.as_view(), name="tax_api"),
    # path("withholdings/", WithholdingView.as_view(), name="withholding_api"),
    # path("payment_entry/", PaymentView.as_view(), name="payment_api"),
    # path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'),
    # path("checklists/", ChecklistView.as_view(), name="checklist_api"),
    # path("invoices/", InvoiceView.as_view(), name="invoice_api"),
    path("personal/", PersonalView.as_view(), name="personal_api"),
    path("personals/<int:pk>/", PersonalDetailView.as_view(), name="personal-detail"),

    path("payment_entry/", PaymentEntryView.as_view(), name="payment_api"),
    path("payment_entries/<int:pk>/", PaymentEntryDetailView.as_view(), name="payment_entry_detail_api"),
    path("invoice/", InvoiceView.as_view(), name="invoice_api"),
    path("invoices/<int:pk>/", InvoiceDetailView.as_view(), name="invoice_detail_api"),


    # path("payment_entry_invoice/", PaymenInvoiceView.as_view(), name="payment_entry_invoice_api"),
    # path("payment_invoices/<int:pk>/", PaymenInvoiceDetailView.as_view(), name="payment_invoice_detail_api"),

    path("checklist/", ChecklistView.as_view(), name="checklist_api"),

    path("search_page/", SearchPagelistView.as_view(), name="search_page_api"),
    path("search_pages/<int:pk>/", SearchPageDetailView.as_view(), name="search_page_detail_api"),

]
