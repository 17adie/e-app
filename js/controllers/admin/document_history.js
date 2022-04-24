app.log.check_admin_session()

// let server_url = 'http://localhost/e-app';

const main = {

  fn: {
    calculate_days: function(date_needed){

      let date_now = moment().format("YYYY-MM-DD");
      let diff = moment(date_needed, 'YYYY-MM-DD').businessDiff(moment(date_now,'YYYY-MM-DD'));

      return diff;
    },
    get_docs_details: function(tbl_id, docs_status, cb){
      const params = {
          _approval_id: tbl_id
      };
      app.crud.request('sp-get_notification_details', params, function (resp) {
  
      let d = resp[0]
  
      let approver = d.approver_list.split('|')
  
      let approver_list = approver.map((v,i) => {
        let textColor;
  
        if(v.search(/\bPending\b/) >= 0) {
            textColor = 'badge-warning'
        } else if(v.search(/\bApproved\b/) >= 0) {
            textColor = 'badge-success'
        } else if(v.search(/\bDisapproved\b/) >= 0) {
            textColor = 'badge-danger'
        } else {
            console.log({textColor})
        }
        
        return(`<div class="m-1 custom-badge ${textColor}" style="font-size: 14px">${v}</div>`)
      }) 
  
      let notif_list = 'N/A';
        
  
      if(d.notified_person_list) {
          let notif = d.notified_person_list.split(',')
  
          notif_list = notif.map((v,i) => {
              return(`<div>${v}</div>`)
          }) 
  
      }
      
      let url_main = server_url + '/uploads/'+ d.filename_main
      let download_link_main = `<a href="${url_main}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;
      let url_sup = server_url + '/uploads/'+ d.filename_sup
      let download_link_sup = `<a href="${url_sup}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;
  
      let d_stat = $('.txt_document_status');
  
      switch(docs_status){
        case 0: 
          d_stat.html('Pending').addClass('gradient-4').removeClass('gradient-1 gradient-2')
        break
        case 1: 
          d_stat.html('Approved').addClass('gradient-1').removeClass('gradient-4 gradient-2')
        break
        case 2: 
          d_stat.html('Disapproved').addClass('gradient-2').removeClass('gradient-1 gradient-4')
        break
        case 3: 
          d_stat.html('Cancelled').addClass('gradient-2').removeClass('gradient-1 gradient-4')
        break
        default:
          console.log('errorrr')
        break
  
      }
  
      $('.txt_trans_no').html(d.trans_no)
      $('.txt_category').html(d.category)
      $('.txt_requestor').html(d.requestor)
      $('.txt_document_title').html(d.category)
      $('.txt_requestor_message').html(d.requestor_message)
      $('.txt_date_request').html(d.date_request)
  
      $('.txt_approver_list').html(approver_list)
      $('.txt_notified_person_list').html(notif_list)
      $('.file_main_attch').html(d.filename_main == '' || d.filename_main == null ? 'NA' : download_link_main)
      $('.file_sup_attch').html(d.filename_sup == '' || d.filename_sup == null ? 'NA' : download_link_sup)
  
      app.loader('hide', '#modal-view_details .modal-body');
  
          return cb(resp)
      });
    },
  },

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

  tbl: {
    document_history: function() {

      let unfiltered_rows_count;

          const columns = [
              {data: "trans_no", title: "TRANS#", className: 'trans_no'},
              {data: "category", title: "Form", className: 'category'},
              {data: "docs_status", title: "Document Status", className: 'docs_status'},
              {data: "requestor", title: "Requestor", className: 'requestor'},
              {data: "date_request", title: "Date Requested", className: 'date_request'},
              {title: "Priority", className: 'priority_level', sortable : false},
              {title: "Actions", className: 'td_actions' , sortable : false},
          ]

          $('#document_history_tbl').dataTable({
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
                  columns: [ 0, 1, 2, 3, 4, 5]
                }
              },
              { 
                extend: 'csv', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2, 3, 4, 5]
                }
              },
              { 
                extend: 'print', 
                className: 'btn-primary' , 
                exportOptions: {
                  columns: [ 0, 1, 2, 3, 4, 5]
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
                {
                  render: function ( data, type, row ) {
                      // return row.tbl_id + ' ' + row.tbl_id;

                      let text;

                      if(row.docs_status == 1) {
                        let date_needed = moment(row.date_needed, 'YYYY-MM-DD')
                        let diff = main.fn.calculate_days(date_needed)
    
                        app.get.priority_status(diff, function(prio){
                          
                          text = prio;
    
                        })
                      } else {
                        text = 'N/A'
                      }

                      return text;
                  },
                  targets: -2
              },
              {
                render: function ( data, type, row ) {

                    // DISPLAY STATUS WITH TEXT
                    let docs_status;

                    switch(row.docs_status){
                        case '0':
                            docs_status = 'Pending';
                            break;
                        case '1':
                            docs_status = 'Approved';
                            break;
                        case '2':
                            docs_status = 'Disapproved';
                            break;
                        case '3':
                            docs_status = 'Cancelled';
                            break;
                        default:
                            docs_status = 'N/A';
                            break;
                    }

                    return docs_status;
                },
                targets: -5
            },
            ],
             
              ajax: function (data, callback, settings) {

                  const params = {
                      _limit_offset: data.start,
                      _search_string: data.search.value,
                      _sort_by: data.columns[data.order[0].column].data,
                      _sort_direction: data.order[0].dir,
                  };
                  main.api_request('get_document_history', params, function(response){
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

                // DISPLAY STATUS WITH TEXT
                let docs_status;

                switch(data.docs_status){
                    case '0':
                        docs_status = '<span class="label label-sm gradient-4">Pending</span>';
                        break;
                    case '1':
                        docs_status = '<span class="label label-sm gradient-1">Approved</span>';
                        break;
                    case '2':
                        docs_status = '<span class="label label-sm gradient-2">Disapproved</span>';
                        break;
                    case '3':
                        docs_status = '<span class="label label-sm gradient-2">Cancelled</span>';
                        break;
                    default:
                        docs_status = '<span class="label label-sm label-danger">N/A</span>';
                        break;
                }

                $( row ).find('td.docs_status')
                    .html(docs_status)
                    .attr({
                        "data-tbl_id": data.tbl_id
                    });

                  // DISPLAY PRIO WITH TEXT

                  if(data.docs_status == 1) {
                    let date_needed = moment(data.date_needed, 'YYYY-MM-DD')
                    let diff = main.fn.calculate_days(date_needed)

                    app.get.priority_status(diff, function(prio){
                      
                      $( row ).find('td.priority_level').html(prio)

                    })
                  } else {
                    $( row ).find('td.priority_level').html('N/A')
                  }
                  

                  $( row ).find('td:eq(-1)')
                  .html(`
                  <div style="display:flex">
                  <a href="javascript:void(0)" data-target="#modal-view_details" data-toggle="modal" class="custom_action_icon_btn text-warning view_details" data-toggle="tooltip" data-placement="top" title="View" data-original-title="View">
                      <i class="fa fa-file-text"></i>
                  </a>
                  </div>
                  `
                  );
  
                $( row ).find('td:eq(-1) > div > a')
                    .attr({
                        'data-tbl_id': data.tbl_id,
                        'data-docs_status': data.docs_status,
                        'data-trans_no': data.trans_no,
                });

                $(row).addClass('hover_cls');

              }

          });

    }
  }


}


main.tbl.document_history()


$(document)

.off('click', '.view_details').on('click', '.view_details', function(){
  let {tbl_id, trans_no, docs_status} = $(this).data()

  // console.log({trans_no})
  // console.log({tbl_id})

  app.loader('show', '#modal-view_details .modal-body');
    main.fn.get_docs_details(tbl_id, docs_status, function(){
    })



})

