app.log.check_admin_session()

let update_form_id;

const main = {
  api_request: function(api, params, cb){

    $.ajax({
      url: server_url + '/ajax/api/admin/'+ api +'.php', 
      data: {
        params
      },
      method:"POST",  
      dataType: "json",
      crossDomain: true,
      timeout: 50000,

    success: function(response) {
      return cb(response)
    },
    error: function(jqXHR, textStatus, errorThrown) {
      console.log(jqXHR);
      console.log(textStatus);
      console.log(errorThrown);
    }
    });
  },

  tbl : {
    forms: function() {

      let unfiltered_rows_count;
 
          const columns = [
              // {data: "tbl_id", title: "ID#", className: 'tbl_id'},
              {data: "category", title: "Category", className: 'category'},
              {data: "form_code", title: "Form Code", className: 'form_code'},
              {data: "form", title: "Form", className: 'form'},
              {title: "Actions", className: 'td_actions' , sortable : false},
          ]

          $('#forms_tbl').dataTable({
              serverSide: true,
              lengthChange: false,
              searchDelay: 1000,
              searching: true,
              processing: true,
              // stateSave: true, // to save search kahit ilipat sa ibang menu
              language: {
                infoFiltered: "",  // filtered from n total entries datatables remove kasi mali bilang lagi kulang ng isa kapag nag a add.
                // searchPlaceholder: "Forms, Requestor"
            },
            dom: 'Bfrtip',
            buttons: [
              { 
                extend: 'pdf', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2]
                }
              },
              { 
                extend: 'csv', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2]
                }
              },
              { 
                extend: 'print', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2]
                }
              },
                // 'copy', 
                // 'csv', 
                // 'excel', 
                // 'pdf', 
                // 'print'
            ],
              columns: columns,
              order: [ 0, "asc" ],  
              columnDefs: [
                {
                    render: function ( data, type, row ) {
                        return row.tbl_id;
                    },
                    targets: -1
                },
            ],
             
              ajax: function (data, callback, settings) {

                  const params = {
                      _limit_offset: data.start,
                      _search_string: data.search.value,
                      _sort_by: data.columns[data.order[0].column].data,
                      _sort_direction: data.order[0].dir,
                  };
                  main.api_request('get_forms', params, function(response){
                      // console.log({response})
                      let resp = response.data || [];
                      
                      if (data.draw === 1) { // if this is the first draw, which means it is unfiltered
                          unfiltered_rows_count = response._total_count;
                      }

                      let total_count = response._total_count;

                      callback({
                          draw: data.draw,
                          data: resp,
                          recordsTotal: unfiltered_rows_count,
                          recordsFiltered: total_count
                      });
                  });
              },
              createdRow: function( row, data, dataIndex ) {


                  $( row ).find('td:eq(-1)')
                  .html(`<a href="javascript:void(0)" data-target="#modal-update_form" data-toggle="modal" class="custom_action_icon_btn text-warning form_edit_btn" data-toggle="tooltip" data-placement="top" title="Edit" data-original-title="Edit">
                      <i class="fa fa-pencil"></i>
                  </a>`);
  
                $( row ).find('td:eq(-1) > a')
                    .attr({
                        'data-tbl_id': data.tbl_id,
                });

                $(row).addClass('hover_cls');

              }

          });

    }
  },
  get: {
    form_details: function(tbl_id, cb){
      const params = {
        tbl_id: tbl_id
      }
      main.api_request('get_form_details', params, function(resp){
        return cb(resp)
      })
    },
  },
  add: {
    new_form: function(category, form_name, form_code, cb){
      const params = {
        category: category,
        form_code: form_code,
        form: form_name,
      }
      main.api_request('add_form', params, function(resp){
        return cb(resp)
      })
    },
  },
  update: {
    form: function(category, form_name, form_code, tbl_id, cb){
      const params = {
        category: category,
        form_name: form_name,
        form_code: form_code,
        tbl_id: tbl_id
      }
      main.api_request('update_form', params, function(resp){
        return cb(resp)
      })
    },
    filename: function(filename, tbl_id, cb){
      const params = {
        filename: filename,
        tbl_id: tbl_id
      }
      main.api_request('update_filename', params, function(resp){
        return cb(resp)
      })
    },
  },
  loader: function(title, html){
    Swal.fire({
      title: title,
      html: html,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
          Swal.showLoading()
      },
    }); 
  },
  reset: function(el){
    el
      .find("input").val('').removeClass('input-custom-error').end()
      .find("select").val('').removeClass('input-custom-error').end()
  },

}

main.tbl.forms()


$(document)

.off('click', '.form_edit_btn').on('click', '.form_edit_btn', function(){
  let { tbl_id } = $(this).data()

  update_form_id = tbl_id

  // console.log({tbl_id})

  main.get.form_details(tbl_id, function(resp){
     console.log(resp)
     let v = resp[0]

     document.getElementById('update_category').value = v.category
     document.getElementById('update_form').value = v.form
     document.getElementById('update_form_code').value = v.form_code

  })

})

.off('click', '#update_form_btn').on('click', '#update_form_btn', function(){
  
  let category = document.getElementById('update_category').value,
      form_name = document.getElementById('update_form').value,
      form_code = document.getElementById('update_form_code').value,
      file = $('#update_file');

      main.loader('Please Wait!', 'data updating...')

      if(app.validate_input($('#modal-update_form'))){
        main.update.form(category, form_name, form_code, update_form_id, function(resp){

          if(resp.status == true){

            let success_update_message = resp.message

            let success = () => {
              $('#modal-update_form').modal('hide')
              swal.close();
              Toast.fire({ icon: 'success', title: success_update_message})
              $('#forms_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
            }

            app.uploader(file, 'form_uploader',function (cb) {
              let filename = cb
              console.log({filename})

              // if have file
              if(filename){
                main.update.filename(filename, update_form_id, function(){
                  success()
                })
              } else {
                success()
              }

            })
            
          } else {

            let {form_name, form_code } = resp
    
                if(form_name.length != 0) {
                  Toast.fire({ icon: 'warning', title: 'Form name is already exist'})
                  return
                }
               
                if(form_code.length != 0) {
                  Toast.fire({ icon: 'warning', title: 'Form code is already exist'})
                  return
                }

          }

        })
      } else {
        Swal.fire('Incomplete Details','Please complete all the required info marked with (*)','error')
      }

})

.off('click', '#add_new_form_btn').on('click', '#add_new_form_btn', function(){

    let new_form = $('#add_file'),
        category = document.getElementById('add_category').value;
        form_name = document.getElementById('add_form').value.trim(),
        form_code = document.getElementById('add_form_code').value.trim();
  
           main.loader('Please Wait!', 'data uploading...')

          if(app.validate_input($('#modal-add_form'))){
            main.add.new_form(category, form_name, form_code, function(resp){
              
              if(resp.status == true) {

                let last_id = resp.last_inserted_id;
                let success_insert_message = resp.message

                // console.log({last_id})
                app.uploader(new_form, 'form_uploader',function (cb) {
                  let filename = cb
                  // console.log({filename})
                  main.update.filename(filename, last_id, function(resp){
                    // console.log({resp})
                    $('#modal-add_form').modal('hide')
                    swal.close();
                    Toast.fire({ icon: 'success', title: success_insert_message})
                    $('#forms_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
                  })

                })
                
              } else {
    
                let {form_name, form_code } = resp
    
                if(form_name.length != 0) {
                  Toast.fire({ icon: 'warning', title: 'Form name is already exist'})
                  return
                }
               
                if(form_code.length != 0) {
                  Toast.fire({ icon: 'warning', title: 'Form code is already exist'})
                  return
                }
           
              }
  
            })
          } else {
            Swal.fire('Incomplete Details','Please complete all the required info marked with (*)','error')
          }
})

.off('focus',':input').on('focus', ':input', function(){
  $(this).removeClass('input-custom-error')
})

// reset all
$('#modal-add_form, #modal-update_form').on('hidden.bs.modal', function (e) {
  main.reset($(this))
})
