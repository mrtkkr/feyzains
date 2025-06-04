# signals.py
from decimal import Decimal
from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from .models import PaymenInvoice, Customer

print("Signals loaded")

@receiver(pre_save, sender=PaymenInvoice)
def paymeninvoice_pre_save(sender, instance, **kwargs):
    """
    Fatura güncellenirken, instance.id varsa (yani var olan bir kayıtsa),
    önce eski kaydı alıp eski bakiyeden bu eski farkı düşeceğiz.
    """
    if instance.pk:
        try:
            old_invoice = PaymenInvoice.objects.get(pk=instance.pk)
        except PaymenInvoice.DoesNotExist:
            return  # Yoksa bir şey yapma
        old_difference = (old_invoice.debt or Decimal(0)) - (old_invoice.receivable or Decimal(0))
        customer = old_invoice.customer
        # Eski farkı müşterinin bakiyesinden çıkar
        customer.balance = (customer.balance or Decimal(0)) - old_difference
        # Balance status’u güncelle
        if customer.balance > 0:
            customer.balance_status = 'B'
        elif customer.balance < 0:
            customer.balance_status = 'A'
        else:
            customer.balance_status = '0'
        customer.save()

@receiver(post_save, sender=PaymenInvoice)
def paymeninvoice_post_save(sender, instance, created, **kwargs):
    """
    Yeni fatura eklendiğinde veya güncellendiğinde, instance'daki (debt - receivable)
    değerini müşterinin bakiyesine ekle.
    """
    new_difference = (instance.debt or Decimal(0)) - (instance.receivable or Decimal(0))
    customer = instance.customer
    customer.balance = (customer.balance or Decimal(0)) + new_difference

    # Balance durumunu güncelle
    if customer.balance > 0:
        customer.balance_status = 'B'
    elif customer.balance < 0:
        customer.balance_status = 'A'
    else:
        customer.balance_status = '0'

    customer.save()

@receiver(post_delete, sender=PaymenInvoice)
def paymeninvoice_post_delete(sender, instance, **kwargs):
    """
    Fatura silindiğinde, o faturanın (debt - receivable) değerini müşterinin bakiyesinden çıkar.
    """
    deleted_difference = (instance.debt or Decimal(0)) - (instance.receivable or Decimal(0))
    customer = instance.customer
    customer.balance = (customer.balance or Decimal(0)) - deleted_difference

    # Balance durumunu güncelle
    if customer.balance > 0:
        customer.balance_status = 'B'
    elif customer.balance < 0:
        customer.balance_status = 'A'
    else:
        customer.balance_status = '0'

    customer.save()
