app.log.check_admin_session()

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
              {data: "tbl_id", title: "ID#", className: 'tbl_id'},
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
                  columns: [ 0, 1, 2, 3]
                }
              },
              { 
                extend: 'csv', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2, 3]
                }
              },
              { 
                extend: 'print', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2, 3]
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
                  .html(`<a href="javascript:void(0)" data-target="#modal-edit_form_details" data-toggle="modal" class="custom_action_icon_btn text-warning edit_form_details" data-toggle="tooltip" data-placement="top" title="Edit" data-original-title="Edit">
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
  }

}

main.tbl.forms()


$(document)

.off('click', '.edit_form_details').on('click', '.edit_form_details', function(){
  let { tbl_id } = $(this).data()

  console.log({tbl_id})

})

.off('click', '#add_form').on('click', '#add_form', function(){
  console.log('new form')

})

