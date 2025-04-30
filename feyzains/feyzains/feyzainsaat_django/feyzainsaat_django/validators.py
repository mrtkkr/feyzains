from django.core.exceptions import ValidationError

def validate_file_size(value):
    filesize = value.size
    if filesize > 5 * 1024 * 1024:  # 5MB
        raise ValidationError("Dosya boyutu 5MB'dan büyük olamaz.")
    return value