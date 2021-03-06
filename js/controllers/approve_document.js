app.log.check_session()

let uid = app.cookie.get('uid');

const main = {
  fn: {
    calculate_days: function(date_needed){

      let date_now = moment().format("YYYY-MM-DD");
      let diff = moment(date_needed, 'YYYY-MM-DD').businessDiff(moment(date_now,'YYYY-MM-DD'));

      return diff;
    },
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
              {data: "date_request", title: "Date Requested", className: 'date_request'},
              {data: "date_needed", title: "Date Needed", className: 'date_needed'},
              {title: "Priority", className: 'priority_level', sortable : false},
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
                },
                {
                  render: function ( data, type, row ) {
                      return row.tbl_id + ' ' + row.tbl_id;
                  },
                  targets: -2
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

                      // to get all status equals to 0 = ongoing
                      // resp = resp.filter( v => v.docs_status == 0)
                     
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

                let dnow = moment().format("YYYY-MM-DD");
                let dneed = moment(data.date_needed, 'YYYY-MM-DD')

                let d = dneed.diff(dnow, 'day')

                console.log(d >= 0)

                  $( row ).find('td:eq(-1)')
                  .html(d >= 0 ?`
                  <div style="display:flex">
                    <a href="javascript:void(0)" class="custom_action_icon_btn text-success approve_docs" data-toggle="tooltip" data-placement="top" title="Approve" data-original-title="Approve">
                      <i class="fa fa-check-circle-o"></i>
                    </a>
                    <a href="javascript:void(0)" class="custom_action_icon_btn text-danger ml-2 disapprove_docs" data-toggle="tooltip" data-placement="top" title="Disapprove" data-original-title="Disapprove">
                      <i class="fa fa-remove"></i>
                    </a>
                  </div>
                  ` : `  
                  <div style="display:flex">
                    <a href="javascript:void(0)" class="custom_action_icon_btn text-muted">
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
                          'data-requestor_message': data.requestor_message,
                          'data-email': data.email,
                          'data-trans_no': data.trans_no,
                          'data-requestor_name': data.requestor_name,
                          'data-form': data.form,
                          'data-date_request': data.date_request,

                  });


                   // DISPLAY PRIO WITH TEXT
                  
                  let date_needed = moment(data.date_needed, 'YYYY-MM-DD')
                  let diff = main.fn.calculate_days(date_needed)

                  app.get.priority_status(diff, function(prio){
                    
                    $( row ).find('td.priority_level').html(prio)

                  })



                  let url = server_url + '/uploads/'+ data.filename_main
                  // console.log({url})
                  let download_link = `<a href="${url}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;

                  $( row ).find('td.filename_main').html(download_link)
                      
                  $(row).addClass('hover_cls');

              }

          });
      },
    
  },
  docs_verification: function(approval_id, approver_id, type, d_remarks, disapprove_file, a_remarks, cb){
    const params = {
      _approval_id: approval_id,
      _approver_id: approver_id,
      _type: type,
      _disapprove_remarks: d_remarks,
      _disapprove_file: disapprove_file,
      _approve_remarks: a_remarks
    };
    // console.log({params})
    app.crud.request('sp-update_approval_status', params, function (resp) {
      return cb(resp)
    })
  }, 
  update_file_name: function(tbl_id, new_filename, cb){
    const params = {
      _tbl_id: tbl_id,
      _new_filename: new_filename,
    };
    console.log({params})
    app.crud.request('sp-update_filename_when_approved', params, function (resp) {
      return cb(resp)
    })
  },  
}
}


main.fn.tbl.to_approve_documents()


$(document) 

.off('click', '.approve_docs').on('click', '.approve_docs', function(){
  let {tbl_id, approver_id, document_title, requestor_message, email, trans_no, requestor_name, form, date_request} = $(this).data()
  let email_to = email.split() // convert to array for global notification
  let text = `<small>Subject: </small> ${document_title} <br> <small>Requestor: </small> ${requestor_name}`

  // Swal.fire({
  //   title:"Are you sure you want to approve this document?",
  //   html: text,
  //   input: 'text',
  //   inputPlaceholder: 'Enter Remarks (optional)',
  //   icon:'question',
  //   showCancelButton: true,
  //   confirmButtonText: 'Yes!',
  // }).then((result) => {

   

  //   // console.log({a_remarks})
  //   if (result.isConfirmed) {
  //     let a_remarks = result.value.trim()
  //     main.fn.docs_verification(tbl_id, approver_id, 'a', '', '', a_remarks, function(resp){
  //       Swal.fire('Document Approved!', '', 'success')
  //       $('#for_approval_request_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
  //     })
  //   }

  // })

  // Swal.fire({
  //   title:"Are you sure you want to approve this document?",
  //   html: text,
  //   input: 'text',
  //   inputPlaceholder: 'Enter Remarks (optional)',
  //   icon:'question',
  //   showCancelButton: true,
  //   confirmButtonText: 'Yes!',
  //   showLoaderOnConfirm: true,
  //   allowEscapeKey: false,
  //   allowOutsideClick: false,
  //   preConfirm: (approver_remarks) => {
  //     console.log({approver_remarks})
     
  //       return new Promise((resolve, reject) => { // for sweetalert loader ..
  //         main.fn.docs_verification(tbl_id, approver_id, 'a', '', '', approver_remarks, function(resp){
  //           app.email_notification({ // notification for notifed person
  //             doc_title : document_title,  
  //             req_message: requestor_message,
  //             email_to : email_to, 
  //             trans_no : trans_no,
  //             requestor : requestor_name,
  //             form_name : form,
  //             date_request : date_request,
  //             approver_remarks: approver_remarks == '' ? 'N/A' : approver_remarks,
  //             file_name: 'email_notification_from_approver'}, function(resp){
  //             console.log('notif', {resp})
  //             return resolve(resp)
  //           })
  //         })
  //       }).catch(err => { console.log(err) });
         
  //     },
  // }).then((result) => {
  //   if (result.isConfirmed) {
  //     Toast.fire({ icon: 'success', title: 'Document approved!' })
  //     $('#for_approval_request_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
  //   }
  // })

  Swal.fire({
    title:"Are you sure you want to approve this document?",
    html: `<div class="form-group">
              <textarea type="text" class="form-control" id="approver_remarks" placeholder="Enter Remarks (optional)"></textarea>
            </div>
            <div class="form-group">
              <input type="file" class="form-control" id="new_file" accept="application/pdf,application/vnd.ms-excel,.xlsx, .xls, .csv">
              <small class="form-text text-muted">Attach file (optional)</small>
            </div>`,
    icon:'question',
    showCancelButton: true,
    confirmButtonText: 'Yes!',
    showLoaderOnConfirm: true,
    allowEscapeKey: false,
    allowOutsideClick: false,
    preConfirm: () => {
      let approver_remarks = Swal.getPopup().querySelector('#approver_remarks').value,
          new_file = $('#new_file')

        // console.log({approver_remarks})
        // console.log({new_file})

        // app.uploader(new_file, 'upload_file',function (cb) {
        //   let file = cb

        //   if(file != '') {
        //     main.fn.update_file_name(tbl_id, file, function(resp){
              
        //     })
        //   }
          
        // })


        return new Promise((resolve, reject) => { // for sweetalert loader ..
          main.fn.docs_verification(tbl_id, approver_id, 'a', '', '', approver_remarks, function(resp){
            app.email_notification({ // notification for notifed person
              doc_title : document_title,  
              req_message: requestor_message,
              email_to : email_to, 
              trans_no : trans_no,
              requestor : requestor_name,
              form_name : form,
              date_request : date_request,
              approver_remarks: approver_remarks == '' ? 'N/A' : approver_remarks,
              file_name: 'email_notification_from_approver'}, function(resp){
              console.log('notif', {resp})

              app.uploader(new_file, 'upload_file',function (cb) {
                let file = cb
      
                if(file != '') {
                  main.fn.update_file_name(tbl_id, file, function(resp){
                   return resolve(resp) 
                  })
                }

                return resolve(resp) 
                
              })


              
            })
          })
        }).catch(err => { console.log(err) });
         
      },
  }).then((result) => {
    if (result.isConfirmed) {
      Toast.fire({ icon: 'success', title: 'Document approved!' })
      $('#for_approval_request_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
    }
  })

})

.off('click', '.disapprove_docs').on('click', '.disapprove_docs', function(){
  let {tbl_id, approver_id, document_title, requestor_name} = $(this).data()

  let text = `Subject: ${document_title} \n Requestor: ${requestor_name}`

  Swal.fire({
    title:"Are you sure you want to disapprove this document?",
    icon: 'question',
    html: `<div class="form-group">
              <textarea type="text" class="form-control" id="d_reason" placeholder="Enter the Reason"></textarea>
            </div>
            <div class="form-group">
              <input type="file" class="form-control" id="d_file">
              <small class="form-text text-muted">Attach file (optional)</small>
            </div>`,
    confirmButtonText: 'Yes!',
    showCancelButton: true,
    focusConfirm: false,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showLoaderOnConfirm: true,
    preConfirm: () => {
      let d_reason = Swal.getPopup().querySelector('#d_reason').value
    
      // console.log({d_reason})
      // console.log({d_file})

      if (!d_reason.trim()) {
        Swal.showValidationMessage(`Please enter the reason`)
      }
      return { reason: d_reason }
    }
  }).then((result) => {

    // console.log({result})
    if (result.isConfirmed) {
      
      let reason = result.value.reason
      let file = $('#d_file')

      app.uploader(file, 'upload_file',function (cb) {
        let file = cb
        main.fn.docs_verification(tbl_id, approver_id, 'd', reason, file, '', function(){
          Swal.fire('Document Dispproved!', 'Reason: ' + reason, 'error')
          $('#for_approval_request_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
        })
      })

    }

  })
  

})


