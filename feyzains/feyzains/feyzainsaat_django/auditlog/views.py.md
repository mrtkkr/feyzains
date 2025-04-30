```
from auditlog.admin import LogEntry
from django.core import serializers
from django.apps import apps
from django.contrib.contenttypes.models import ContentType
from django.template.loader import render_to_string




def auditlog(request):
    data = LogEntry.objects.all().order_by('-timestamp')

    action = []
    timestamp = []
    object_id = []
    object_repr = []
    changes = []
    actor = []
    id_val = []
    content_type = []

    for item in data:
        anahtarlar = list(json.loads(item.changes).keys())
        degerler = list(json.loads(item.changes).values())
        for inner_list in degerler:
            changes.append({'degisen_ne':anahtarlar[0], 'oncesi':inner_list[0],'sonrasi':inner_list[1]})
        id_val.append(item.id)
        action.append(item.action)
        timestamp.append(item.timestamp)
        object_id.append(item.object_id)
        object_repr.append(item.object_repr)
        actor.append(item.actor)
        content_type.append(item.content_type)
    

    combined_list = zip(id_val, action, timestamp, object_id, object_repr, changes ,actor,content_type)

    context = {'data':combined_list}
    return render(request, "back_end/auditlog/index.html", context)
    
    
    
    
    
    

def auditlog_ajax(request):
    if request.method == 'POST':
        value = request.POST.get('value')
        print(value)

        if value == '0' or value == '1' or value == '2':
            data = LogEntry.objects.filter(action=value).order_by('-timestamp')
        else:
            data = LogEntry.objects.filter(content_type__model=value).order_by('-timestamp')

        action = []
        timestamp = []
        object_id = []
        object_repr = []
        changes = []
        actor = []
        id_val = []
        content_type = []

        for item in data:
            anahtarlar = list(json.loads(item.changes).keys())
            degerler = list(json.loads(item.changes).values())
            for inner_list in degerler:
                changes.append({'degisen_ne':anahtarlar[0], 'oncesi':inner_list[0],'sonrasi':inner_list[1]})
            id_val.append(item.id)
            action.append(item.action)
            timestamp.append(item.timestamp)
            object_id.append(item.object_id)
            object_repr.append(item.object_repr)
            actor.append(item.actor)
            content_type.append(item.content_type)
        
        
        combined_list = zip(id_val, action, timestamp, object_id, object_repr, changes ,actor,content_type)


        rendered = render_to_string('back_end/auditlog/ajax.html', {'data':combined_list})

        return HttpResponse(rendered)




```