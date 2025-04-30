```
{% extends "back_end/base/main.html" %}
{% load static %}
{% load humanize %}
{% load custom_tags %}
{% block content %}
<div class="container-fluid" id="general_container">
  <div class="row">
    <div class="col-lg-12 row">
      <div class="col-lg-12">
        <div class="card card-custom gutter-b">
          <div class="card-header flex-wrap py-3">
            <div class="card-title">
              <h3 class="card-label">Datatable
              <span class="d-block text-muted pt-2 font-size-sm">........./</span></h3>
            </div>
            <div class="card-toolbar">
              <!--begin::Button-->
              <a href="" class="btn btn-primary font-weight-bolder">
              <span class="svg-icon svg-icon-md">
                <!--begin::Svg Icon | path:/metronic/theme/html/demo1/dist/assets/media/svg/icons/Design/Flatten.svg-->
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                  <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                    <rect x="0" y="0" width="24" height="24" />
                    <circle fill="#000000" cx="9" cy="15" r="6" />
                    <path d="M8.8012943,7.00241953 C9.83837775,5.20768121 11.7781543,4 14,4 C17.3137085,4 20,6.6862915 20,10 C20,12.2218457 18.7923188,14.1616223 16.9975805,15.1987057 C16.9991904,15.1326658 17,15.0664274 17,15 C17,10.581722 13.418278,7 9,7 C8.93357256,7 8.86733422,7.00080962 8.8012943,7.00241953 Z" fill="#000000" opacity="0.3" />
                  </g>
                </svg>
                <!--end::Svg Icon-->
              </span>New</a>
              <!--end::Button-->
            </div>
          </div>
          <div class="card-body">
            <!--begin: Datatable-->
            <table class="table table-bordered table-checkable" id="kt_datatable_product">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>İşlem</th>
                  <th>Kim Tarafından</th>
                  <th>Model</th>
                  <th>Değiştirilen</th>
                  <th>Öncesi</th>
                  <th>Sonrası</th>
                  
                </tr>
              </thead>
              <tbody id="changedID">
                
                {% for id_val, action, timestamp, object_id , object_repr, changes, actor, content_type in data %}
                <input type="hidden" id="id_{{ forloop.counter }}" name="id_{{ forloop.counter }}" value="{{content_type.name|title}}">

                <tr>
                  <td>{{timestamp|date:'d.m.Y, H:i'}}</td>
                  <td>
                    {% if action == 2 %}
                      Silindi
                    {% elif action == 1 %}
                      Güncellendi
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
             
              </tbody>
            </table>
            <!--end: Datatable-->
          </div>
        </div>
      </div>

        

  </div>
</div>
{% csrf_token %}
<script>
  jQuery(document).ready(function() {
      KTDatatablesBasicBasic.init();

      if("{% for message in messages %}{{message}}{% endfor %}"){
          var inner_text = "{% for message in messages %}{{message|safe}}{% endfor %}";
          var state = "{% for message in messages %}{% if message.tags == 'error' %}error{% endif %}{% endfor %}".includes("error") ? 'danger' : 'success';
          var state_title = state == 'success' ? 'Başarılı' : 'Hata';

          $.notify({
              'title': '<strong>'+state_title+'</strong>',
              'message': inner_text,
          },{
              type: state,
          });
      };
  });
  

  var idInputs = document.querySelectorAll('[id^="id_"]');
  var valuesSet = new Set();

  idInputs.forEach(function(input) {
      valuesSet.add(input.value);
  });

  var uniqueValuesArray = Array.from(valuesSet);
  var buttons = []
  uniqueValuesArray.forEach((data) => 
  buttons.push({
      text: data,
      action: function ( e, dt, node, config ) {
          $.ajax({
            url: '{% url "produce:auditlog-ajax" %}',
            type: 'POST',
            data: {'value':data,'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()},
            success: function (res){
              $('#changedID').html(res)
            },
            error: function (xhr, status, error) {

            },
          });
      }
    },)
  );


  var KTDatatablesBasicBasic = function() {
      var dataTableProduct = function() {
          var table = $('#kt_datatable_product');

          table.DataTable({
              responsive: true,

              // DOM Layout settings
              dom: 'Bfrtip',
              buttons: [
                  //{ extend: 'copy', text: 'Kopyala' },
                  //{ extend: 'print', text: 'Yazdır' },
                  //{ extend: 'pdf', text: 'PDF' },
                  //{ extend: 'excel', text: 'Excel' },
                  {
                    text: 'Güncellendi',
                    action: function ( e, dt, node, config ) {
                        $.ajax({
                          url: '{% url "produce:auditlog-ajax" %}',
                          type: 'POST',
                          data: {'value':1,'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()},
                          success: function (res){
                            $('#changedID').html(res)
                          },
                          error: function (xhr, status, error) {

                          },
                        });
                    }
                  },
                  {
                    text: 'Eklendi',
                    action: function ( e, dt, node, config ) {
                        $.ajax({
                          url: '{% url "produce:auditlog-ajax" %}',
                          type: 'POST',
                          data: {'value':0,'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()},
                          success: function (res){
                            $('#changedID').html(res)
                          },
                          error: function (xhr, status, error) {

                          },
                        });
                    }
                  },
                  {
                    text: 'Silindi',
                    action: function ( e, dt, node, config ) {
                        $.ajax({
                          url: '{% url "produce:auditlog-ajax" %}',
                          type: 'POST',
                          data: {'value':2,'csrfmiddlewaretoken': $('input[name=csrfmiddlewaretoken]').val()},
                          success: function (res){
                            $('#changedID').html(res)
                          },
                          error: function (xhr, status, error) {

                          },
                        });
                    }
                  },
                  
                  

                  buttons
              ],
              "language": {
                  "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Turkish.json",
                  "info": "Toplam _TOTAL_ kayıt gösteriliyor",
              },


              lengthMenu: [10, 15, 20, 30],

              pageLength: 10,
              order: [0, 'desc'],
              

          });
          

          
      };


      return {
          //main function to initiate the module
          init: function() {
              dataTableProduct();
          }
      };
  }();

  
</script>
{% endblock %}




```