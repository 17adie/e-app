app.log.check_session()

let uid = app.cookie.get('uid');

const main = {
  fn: {
    tbl: {
      // DATATABLES
      to_approve_documents: function() {

          let unfiltered_rows_count;

          const columns = [
              {data: "trans_no", title: "TRANS#", className: 'trans_no'},
              {data: "requestor_name", title: "Requestor", className: 'requestor_name'},
              {data: "filename_main", title: "Document File", className: 'filename_main', sortable : false},
              {data: "document_title", title: "Subject", className: 'document_title'},
              {data: "requestor_message", title: "Message", className: 'requestor_message', sortable : false},
              {data: "date_requests", title: "Date Requested", className: 'date_requests'},
              {data: "date_needed", title: "Date Needed", className: 'date_needed'},
              {title: "Actions", className: 'td_action', sortable : false}
          ]

          $('#for_approval_request_tbl').dataTable({
              serverSide: true,
              lengthChange: false,
              searching: false,
              processing: true,
              language: {
                  infoFiltered: "", 
              },
              columns: columns,
              order: [[ 6, "asc" ]],    // ORDER BY DATE NEEDED
              columnDefs: [
                {
                    render: function ( data, type, row ) {
                        return row.tbl_id + ' ' + row.tbl_id;
                    },
                    targets: -1
                }
            ],
             
              ajax: function (data, callback, settings) {

                  const params = {
                      _limit_offset: data.start,
                      _search_string: uid,
                      _sort_by: data.columns[data.order[0].column].data,
                      _sort_direction: data.order[0].dir

                  };
                  app.view_table.request('sp-get_to_approve_document_request', params, function (response) {
                    
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
                .html(`
                <div style="display:flex">
                  <a href="javascript:void(0)" class="custom_action_icon_btn text-success approve_docs" data-toggle="tooltip" data-placement="top" title="Approve" data-original-title="Approve">
                    <i class="fa fa-check-circle-o"></i>
                  </a>
                  <a href="javascript:void(0)" class="custom_action_icon_btn text-danger ml-2 disapprove_docs" data-toggle="tooltip" data-placement="top" title="Disapprove" data-original-title="Disapprove">
                    <i class="fa fa-remove"></i>
                  </a>
                </div>
                `
                );

                  $( row ).find('td:eq(-1) > div > a')
                      .attr({
                          'data-tbl_id': data.tbl_id,
                          'data-approver_id': data.approver_id,
                          'data-document_title': data.document_title,
                          'data-requestor_name': data.requestor_name,

                  });


                  let url = server_url + '/uploads/'+ data.filename_main
                  console.log({url})
                  let download_link = `<a href="${url}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;

                  $( row ).find('td.filename_main').html(download_link)
                      
                  $(row).addClass('hover_cls');

              }

          });
      },
    
  },
  docs_verification: function(approval_id, approver_id, type, d_remarks, cb){
    const params = {
      _approval_id: approval_id,
      _approver_id: approver_id,
      _type: type,
      _disapprove_remarks: d_remarks
    };
    console.log({params})
    app.crud.request('sp-update_approval_status', params, function (resp) {
      return cb(resp)
    })
  },  
}
}


main.fn.tbl.to_approve_documents()


$(document) 

.off('click', '.approve_docs').on('click', '.approve_docs', function(){
  let {tbl_id, approver_id, document_title, requestor_name} = $(this).data()

  let text = `Subject: ${document_title} \n Requestor: ${requestor_name}`

  swal({
    title:"Are you sure you want to approve this document?",
    text: text,
    type:"info",
    showCancelButton:!0,
    confirmButtonColor:"#DD6B55",
    confirmButtonText:"Yes",
    closeOnConfirm:!1
  },function(){
    main.fn.docs_verification(tbl_id, approver_id, 'a', '', function(resp){
      swal('Document Approved!','','success');
      $('#for_approval_request_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
      })
  })

  

})

.off('click', '.disapprove_docs').on('click', '.disapprove_docs', function(){
  let {tbl_id, approver_id, document_title, requestor_name} = $(this).data()

  let text = `Subject: ${document_title} \n Requestor: ${requestor_name}`
  swal({
    title:"Are you sure you want to disapprove this document?",
    text: text,
    type:"input",
    inputPlaceholder: 'Please enter reason',
    showCancelButton:!0,
    confirmButtonColor:"#DD6B55",
    confirmButtonText:"Yes",
    closeOnConfirm: !1
  },function(inputValue){
    
    if (inputValue === false) return false; // for cancel button

    let reason = inputValue.trim()

    if(reason) {
      main.fn.docs_verification(tbl_id, approver_id, 'd', reason, function(){
      swal('Document Dispproved!',"Reason: " + inputValue,'error');
      $('#for_approval_request_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
      })
    } else {
      swal.showInputError("You need to write something!");
    }
    
  })

  

})


