app.log.check_session()

let uid = app.cookie.get('uid');

const main = {
  fn: {
    chart : {
        request_summary: function(){
            //pie chart

            const params = {
                _uid: uid,
              };
              app.crud.request('sp-get_form_summary_count', params, function (resp) {

                

                if(resp.length != 0){
                    
                    let form_count = resp.map(v => v.f_count)
                    let form_name = resp.map(v => v.form)
    
                    console.log({resp})
                    console.log({form_count})
                    console.log({form_name})
    
                    let ctx = document.getElementById("form_summary");
                    ctx.height = 150;
                    let myChart = new Chart(ctx, {
                        type: 'pie',
                        data: {
                            datasets: [{
                                data: form_count,
                                backgroundColor: [
                                    "#03254c",
                                    "#1167b1",
                                    "#187bcd",
                                    "#2a9df4",
                                    "#d0efff"
                                ],
                                hoverBackgroundColor: [
                                    "#03254c",
                                    "#1167b1",
                                    "#187bcd",
                                    "#2a9df4",
                                    "#d0efff"
                                ]
    
                            }],
                            labels: form_name
                        },
                        options: {
                            responsive: true
                        }
                    });
                    return
                } else {
                    $('#form_summary').hide()
                    $('.no-data-yet').html(`<i class="fa fa-pie-chart"></i>
                                            <div>No Data Yet.</div>`)
                }

              })
            
        },
    },
    get_holiday: function(){
        app.get_list.request('sp-get_holiday', function (resp) {
  
        let hdate = resp.map(v => v.holiday_date)
  
        moment.updateLocale('en', {
          holidays: hdate,
          holidayFormat: 'YYYY-MM-DD'
        });
     
        })
      },
    cancel_document: function(tbl_id, cb){
        const params = {
            _tbl_id: tbl_id,
          };
          app.crud.request('sp-cancel_document', params, function (resp) {
            return cb(resp)
          })
    },
    calculate_days: function(date_needed){

        let date_now = moment().format("YYYY-MM-DD");
        let diff = moment(date_needed, 'YYYY-MM-DD').businessDiff(moment(date_now,'YYYY-MM-DD'));

        return diff;
    },
    tbl: {
        for_my_approval: function() {

            let unfiltered_rows_count;
        
            const columns = [
                {data: "trans_no", title: "TRANS#", className: 'trans_no', sortable : false},
                {data: "document_title", title: "Subject", className: 'document_title'},
                {data: "category", title: "Form", className: 'category'},
                {data: "docs_status", title: "Status", className: 'docs_status'},
                {data: "requestor", title: "Requestor", className: 'requestor'},
                {data: "date_needed", title: "Date Needed", className: 'date_needed'},
                {title: "Priority", className: 'priority_level', sortable : false},
                {title: "Actions", className: 'td_action', sortable : false}
                // {data: "date_approved", title: "Date Approved", className: 'date_approved'},
            ]
        
            $('#for_my_approval_tbl').dataTable({
                serverSide: true,
                lengthChange: false,
                searchDelay: 1000,
                searching: false,
                processing: true,
                // stateSave: true, // to save search kahit ilipat sa ibang menu
                language: {
                  infoFiltered: "",  // filtered from n total entries datatables remove kasi mali bilang lagi kulang ng isa kapag nag a add.
                  searchPlaceholder: "Forms, Subject, Requestor"
              },
                columns: columns,
                order: [[ 5, "asc" ]],  
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
                        _search_string: data.search.value,
                        _sort_by: data.columns[data.order[0].column].data,
                        _sort_direction: data.order[0].dir,
                        _uid: uid
        
                    };
                    app.view_table.request_search('sp-get_all_approval_history', params, function (response) {
                      
                        let resp = response.data || [];

                        // console.log({resp})

                        resp = resp.filter( v => v.docs_status == 0)

                        // console.log({resp})
                        
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
                      <a href="javascript:void(0)" data-target="#modal-view_docs_details" data-toggle="modal" class="custom_action_icon_btn text-warning view_request" data-toggle="tooltip" data-placement="top" title="View" data-original-title="View">
                        <i class="fa fa-file-text"></i>
                      </a>
                    </div>
                    `
                    );
        
                      $( row ).find('td:eq(-1) > div > a')
                          .attr({
                              'data-tbl_id': data.tbl_id,
                              'data-docs_status': 'Ongoing',
                              'data-trans_no': data.trans_no,
                      });
        
                  // DISPLAY STATUS WITH TEXT
                  let stat;
        
                  switch(data.docs_status){
                      case '0':
                          stat = '<span class="label label-sm gradient-4">Ongoing</span>';
                          break;
                      case '1':
                          stat = '<span class="label label-sm gradient-1">Approved</span>';
                          break;
                      case '2':
                          stat = '<span class="label label-sm gradient-2">Disapproved</span>';
                          break;
                      // case '3':
                      //     stat = '<span class="label label-sm gradient-2">Cancelled</span>';
                      //     break;
                      default:
                          stat = '<span class="label label-sm label-danger">N/A</span>';
                          break;
                  }
        
                  $( row ).find('td.docs_status')
                      .html(stat)
                      .attr({
                          "data-tbl_id": data.tbl_id
                      });

                    // DISPLAY PRIO WITH TEXT
                    let date_needed = moment(data.date_needed, 'YYYY-MM-DD')
                    let diff = main.fn.calculate_days(date_needed)

                    app.get.priority_status(diff, function(prio){
                    
                        $( row ).find('td.priority_level').html(prio)

                    })
                        
                    $(row).addClass('hover_cls');
        
                }
        
            });
        },

      // DATATABLES
      my_request: function() {

          let unfiltered_rows_count;

          const columns = [
              {data: "trans_no", title: "Transaction #", className: 'trans_no'},
              {data: "document_title", title: "Document", className: 'document_title'},
              {data: "date_needed", title: "Date Needed", className: 'date_needed'},
              {title: "Status", className: 'status', sortable : false},
              {title: "Priority", className: 'priority_level', sortable : false},
              {title: "Actions", className: 'td_action', sortable : false}
          ]

          $('#request_tbl').dataTable({
              serverSide: true,
              lengthChange: false,
              searching: false,
              processing: true,
            //   scrollY: '44vh',
              language: {
                  infoFiltered: "", 
              },
              columns: columns,
              order: [[ 2, "asc" ]],    // ORDER BY 0 = id_num
              columnDefs: [
                {
                    render: function ( data, type, row ) {
                        return row.tbl_id + ' ' + row.tbl_id;
                    },
                    targets: -1,
                },
                {
                    render: function ( data, type, row ) {
                        return row.tbl_id;
                    },
                    targets: -2,
                },
                {
                    render: function ( data, type, row ) {
                        return row.tbl_id;
                    },
                    targets: -3,
                }
            ],
              ajax: function (data, callback, settings) {

                  const params = {
                      _limit_offset: data.start,
                      _search_string: uid,
                      _sort_by: data.columns[data.order[0].column].data,
                      _sort_direction: data.order[0].dir

                  };
                //   console.log({params})
                  app.view_table.request('sp-get_document_request', params, function (response) {
                    
                      let resp = response.data || [];
                    // console.log(resp)
                     
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
                  <a href="javascript:void(0)" data-target="#modal-view_docs_details" data-toggle="modal" class="custom_action_icon_btn text-warning view_request" data-toggle="tooltip" data-placement="top" title="View" data-original-title="View">
                    <i class="fa fa-file-text"></i>
                  </a>
                  <a href="javascript:void(0)" class="custom_action_icon_btn text-danger ml-3 cancel_request" data-toggle="tooltip" data-placement="top" title="Cancel" data-original-title="Cancel">
                    <i class="fa fa-remove"></i>
                  </a>
                </div>
                `
                );

                  $( row ).find('td:eq(-1) > div > a')
                      .attr({
                          'data-tbl_id': data.tbl_id,
                          'data-document_title': data.document_title,
                          'data-trans_no': data.trans_no,
                          'data-docs_status' : 'For Approval'
                  });

                  // DISPLAY STATUS WITH TEXT
                //   var stat;

                //   switch(data.status){
                //       case '0':
                //           stat = '<span class="label label-sm gradient-4">For Approval</span>';
                //           break;
                //       default:
                //           stat = '<span class="label label-sm label-danger">N/A</span>';
                //           break;
                //   }

                  $( row ).find('td.status')
                      .html('<span class="label label-sm gradient-4">For Approval</span>')
                      .attr({
                          "data-tbl_id": data.tbl_id
                      });

                
                // DISPLAY PRIO WITH TEXT
                let date_needed = moment(data.date_needed, 'YYYY-MM-DD')
                let diff = main.fn.calculate_days(date_needed)

                app.get.priority_status(diff, function(prio){
                
                    $( row ).find('td.priority_level').html(prio)

                })

                  $(row).addClass('hover_cls');

              }

          });
      },
  },
  }
}

main.fn.get_holiday()
app.get.dashboard_count(uid, function(resp) {
  main.fn.tbl.my_request()
  main.fn.tbl.for_my_approval()
  main.fn.chart.request_summary()

  let d = resp = undefined ? '' : resp[0]

  $('.for_approval_count').html(d.user_approval_count)
  $('.my_forms_submitted_count').html(d.user_forms_count)
  $('.my_notification_count').html(d.user_notificiation_count)
  $('.my_document_request_count').html(d.for_approvals_count)

})





$(document)

.off('click','.view_request').on('click','.view_request', function(){
    let { tbl_id, docs_status } = $(this).data()
    app.loader('show', '#modal-view_docs_details .modal-body');
    app.get.notif_details(tbl_id, function(resp){
        let d = resp[0]
        // console.log({d})
    
        let approver = d.approver_list.split(',')
    
        let approver_list = approver.map((v,i) => {
            return(`<div>${v}</div>`)
        }) 

        // if not null

        let notif_list = 'N/A';
      

        if(d.notified_person_list) {
            let notif = d.notified_person_list.split(',')
    
            notif_list = notif.map((v,i) => {
                return(`<div>${v}</div>`)
            }) 

        }

        $('.txt_notified_person_list').html(notif_list)
    

        let url_main = server_url + '/uploads/'+ d.filename_main
        let download_link_main = `<a href="${url_main}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;
        let url_sup = server_url + '/uploads/'+ d.filename_sup
        let download_link_sup = `<a href="${url_sup}" class="custom_action_icon_btn text-primary" target="_blank"><i class="fa fa-file-text-o"></i></a>`;
    
        let date_needed = moment(d.date_needed, 'YYYY-MM-DD')

        $('.txt_document_status').html(docs_status)
        $('.txt_trans_no').html(d.trans_no)
        $('.txt_category').html(d.category)
        $('.txt_requestor').html(d.requestor)
        $('.txt_document_title').html(d.category)
        $('.txt_requestor_message').html(d.requestor_message)
        $('.txt_date_request').html(d.date_request)
        // $('.txt_date_approved').html(d.date_approved)
        // $('.txt_approved_by').html(d.approved_by)
        $('.txt_date_needed').html(d.date_needed)
        $('.txt_no_of_days').html(main.fn.calculate_days(date_needed))
    
        $('.txt_approver_list').html(approver_list)
        
        $('.file_main_attch').html(d.filename_main == '' || d.filename_main == null ? 'NA' : download_link_main)
        $('.file_sup_attch').html(d.filename_sup == '' || d.filename_sup == null ? 'NA' : download_link_sup)
    
        app.loader('hide', '#modal-view_docs_details .modal-body');
    
      })

})

.off('click','.cancel_request').on('click','.cancel_request', function(){
    let { tbl_id , trans_no, document_title} = $(this).data()

    let text = `Trans#: ${trans_no} \n Document: ${document_title}`

    // swal({
    //     title:"Are you sure you want to cancel?",
    //     text: text,
    //     type:"info",
    //     showCancelButton:!0,
    //     confirmButtonColor:"#DD6B55",
    //     confirmButtonText:"Yes",
    //     closeOnConfirm:!1
    // },function(){
        
    //     main.fn.cancel_document(tbl_id, function(resp){
    //         swal('Document Cancelled!','','success');
    //         $('#request_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
    //     })
        
    // })

    Swal.fire({
        title:"Are you sure you want to cancel?",
        html: text,
        icon:'question',
        showCancelButton: true,
        confirmButtonText: 'Yes!',
      }).then((result) => {
    
        if (result.isConfirmed) {
            main.fn.cancel_document(tbl_id, function(resp){
                Toast.fire({ icon: 'success', title: 'Document Cancelled!'})
                $('#request_tbl').DataTable().draw(false) // refresh with false = to retain page when draw
            })
        }
    
      })
 

})