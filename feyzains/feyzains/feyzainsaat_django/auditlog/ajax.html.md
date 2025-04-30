```
{% for id_val, action, timestamp, object_id , object_repr, changes, actor, content_type in data %}
<tr>
    <td>{{timestamp|date:'d.m.Y, H:i'}}</td>
        <td>
            {% if action == 2 %}
            Silindi
            {% elif action == 1 %}
            G√ľncellendi
            {% elif action == 0 %}
            Eklendi
            {% endif %}
        </td>
        <td>{% if actor == None %}Belirsiz{% else %}{{actor}}{% endif %}</td>
        <td>{{content_type|title}}</td>
        <td>{% if changes.degisen_ne == 'None' %}Yok{% else %}{{changes.degisen_ne|title}}{% endif %}</td>
        <td>{% if changes.oncesi == 'None' %}Yok{% else %}{{changes.oncesi|safe}}{% endif %}</td>
    <td>{% if changes.sonrasi == 'None' %}Yok{% else %}{{changes.sonrasi|safe}}{% endif %}</td>
</tr>
{% endfor %}


```