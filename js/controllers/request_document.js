app.log.check_session()

Ladda.bind('.ladda-button')

let uid = app.cookie.get("uid");
let get_email_list = []
let requestor;

const main = {
  fn: {
    date_picker: function(){
      $('#date_needed').datepicker({
        format: 'yyyy-mm-dd',
        todayHighlight: true,
        daysOfWeekDisabled: '06', // disable sat and sun
        startDate: new Date() // disabled past dates
      });
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
    get_form_list: function(){
     
      app.get_list.request('sp-get_forms', function (resp) {

          let f_data = resp

          // get distinct item
          let cat_distinct = [... new Set(f_data.map(item => {
            return(`
            <option value="${item.category}">${item.category}</opotion>
            `)
          }))]

          $('#form_category').append(cat_distinct)
          
          $(document)

          .off('click', '#form_category').on('click', '#form_category', function(){
            
            $('#form_form').html('<option value="" selected>Choose...</option>')
            
            let cat_selected = $(this).val()
            
            const filtered = f_data.filter(e => e.category === cat_selected)
            
            let form = filtered.map( (v,i) => {
              return(`
              <option value="${v.form_code}">${v.form}</opotion>
              `)
            })
            
            $('#form_form').append(form)
          
            
          })
          
          .off('click', '.btn-download_template').on('click', '.btn-download_template', function(){
            
            let cat_val = $('#form_category').val(),
                form_val = $('#form_form').val();
           
            if(cat_val && form_val) {

              // get url name to download
              let url = f_data.find(url => url.form_code === form_val)

              // download link
              window.open( server_url + '/forms/'+ url.url , '_blank')
              // window.location.href= server_url + '/forms/'+ url.url
              
            } else {
              // swal('Invalid Input','Please select value from Category and Form', 'error')
              Toast.fire({ icon: 'error', title: 'Please select value from Category and Form'})
            }


          })
        
      });
    },
    get_users: function(){
      const params = {
          _tbl_id: uid
      };
      app.crud.request('sp-get_users', params, function (resp) {
        let u_data = resp

        get_email_list = u_data

        console.log({u_data})

        $('.select-multiple-approver').select2({
          maximumSelectionLength: 3
        });
        $('.select-multiple-notification').select2();

        let user_data = u_data.map((v,i) => {
          return(`<option value="${v.tbl_id}">${v.last_name + ' ' + v.first_name}</option>`)
        })

        $('.select-multiple-approver').html(user_data)
        $('.select-multiple-notification').html(user_data)

      })
    },
    add: {
      approval_document: function(doc_title, req_message, date_needed, main_file, sup_file, form_code, expected_days, cb){
        const params = {
          _requestor_id : uid,
          _document_title : doc_title,
          _date_needed : date_needed,
          _filename_main : main_file,
          _filename_sup : sup_file,
          _requestor_message : req_message,
          _form_code : form_code,
          // _prio_lvl : prio_lvl,
          _expected_days : expected_days,
        }
        app.crud.request('sp-add_document_approval', params, function (resp) {
          return cb(resp)
        })
      },
      approver: function(approval_id, approver_id, cb){
        const params = {
          _approval_id: approval_id,
          _approver_id: approver_id
        };
        app.crud.request('sp-add_approver', params, function (resp) {
          return cb(resp)
        })
      },
      notification: function(approval_id, notified_user_id, cb){
        const params = {
          _approval_id: approval_id,
          _notified_user_id: notified_user_id
        };
        app.crud.request('sp-add_notification', params, function (resp) {
          return cb(resp)
        })
      },
    },
    // email_notification: function(data, cb){

    //   // console.log('data.email_to', data.email_to.length)
    //   if(data.email_to.length != 0) { // check if have email

    //     $.ajax({
    //       url:server_url + '/ajax/' + data.file_name + '.php',
    //       type:'post',
    //       data: {data},
    //       cache: false,
    //       success:function(resp){
    //           return cb(resp);
    //       }
    //     });

    //   } else {
    //     return cb('no email')
    //   }

    // },
  }  
}

main.fn.get_form_list()
main.fn.get_users()
main.fn.get_holiday()
main.fn.date_picker()
app.get.user_details(uid, function(resp){
  let ud = resp = undefined ? '' : resp[0]
    requestor = ud.last_name + ', ' + ud.first_name;
})


$(document)

.off('click', '#btn-submit_document').on('click', '#btn-submit_document', function(){

  let doc_title = $('#doc_title').val(),
      req_message = $('#req_message').val(),
      date_needed = $('#date_needed').val(),
    
      main_attachment = $('#main_attachment')
      support_attachment = $('#support_attachment'),

      multiple_approver = $('.select-multiple-approver').val(),
      multiple_notification = $('.select-multiple-notification').val(),

      form = $('#form_form').val(),
      expected_days = $('#expected_days').val();
      // prio_lvl =  $('#prio_lvl').val();

      // form_name = document.querySelector('#form_form option:checked').textContent
      form_name = $("#form_form option:selected").text().trim();

      // console.log(form_name)

      let email_to = []
      let email_cc = []

      get_email_list.forEach((element) => { 
       
        if(multiple_approver.includes(element.tbl_id)) {
          email_to.push(element.email)
        }

        if(multiple_notification.includes(element.tbl_id)) {
          email_cc.push(element.email)
        }

      })

      // console.log({main_attachment})
      // console.log({email_to})
      // console.log({email_cc})

      if((!doc_title || !req_message || !date_needed) || !form || multiple_approver.length == 0 || !expected_days || !main_attachment.val()) {
        // swal('Invalid', 'Please fill in all the required fields.', 'warning')
        Toast.fire({ icon: 'error', title: 'Please fill in all the required fields.'})
        Ladda.stopAll()
      } else if(form === 'prf' && !support_attachment.val()) { // required supporting document
        // swal('Invalid', 'Please attach Supporting Document', 'warning')
        Toast.fire({ icon: 'error', title: 'Please attach Supporting Document'})
        Ladda.stopAll()
      } else if (expected_days < 3){
        // swal('Invalid', 'Expected days should be greater than or equal to 3 working days', 'warning')
        Toast.fire({ icon: 'error', title: 'Expected days should be greater than or equal to 3 working days'})
        Ladda.stopAll()
      } else {
        app.uploader(main_attachment, 'upload_file',function (cb) {
          let main_file = cb
          app.uploader(support_attachment, 'upload_file',function (cb) {
            let sup_file = cb
              main.fn.add.approval_document(doc_title, req_message, date_needed, main_file, sup_file, form, expected_days, function(resp){
                let {approval_id, trans_no} = resp[0]

                console.log({approval_id})
               
                 app.email_notification({ // notification for approver
                    doc_title : doc_title, 
                    req_message : req_message, 
                    email_to : email_to, 
                    trans_no : trans_no, 
                    date_needed : date_needed, 
                    form_name : form_name, 
                    requestor : requestor, 
                    file_name: 'email_notification_approver'}, function(resp){
                      console.log('approver ', {resp})

                      app.email_notification({ // notification for notifed person
                        doc_title : doc_title,  
                        requestor : requestor, 
                        email_to : email_cc, 
                        file_name: 'email_notificaiton_np'}, function(resp){

                      console.log('NP', {resp})

                    multiple_approver.forEach((element) => { 
                      main.fn.add.approver(approval_id, element, function(){
                        console.log('approver')
                      })
                    })
                    
                    multiple_notification.forEach((element) => { 
                      main.fn.add.notification(approval_id, element, function(){
                        console.log('notification')
                        
                      })
                    })
    
                  Ladda.stopAll()

                  $('input, type, select').val('')
                  $(".select-multiple-approver").val([]).change();
                  $(".select-multiple-notification").val([]).change();

                  // swal('Success', 'Document has been successfully submitted', 'success')
                  Toast.fire({ icon: 'success', title: 'Document has been successfully submitted!'})

                  
                  }) // end NP notif
                }) // end approver notif

              })
          })
        })
      }


})

.off('change', '#date_needed').on('change', '#date_needed', function(){
  
  let date_needed = $(this).val()
  let date_now = moment().format("YYYY-MM-DD");
  let is_holiday = moment(date_needed, 'YYYY-MM-DD').isHoliday()

  if(is_holiday) {
    $('#date_needed').val('')
    $('#expected_days').val('');
    // swal('This is holiday', '', 'error')
    Toast.fire({ icon: 'error', title: 'Selected date is holiday!'})
    
    return
  }

  var diff = moment(date_needed, 'YYYY-MM-DD').businessDiff(moment(date_now,'YYYY-MM-DD'));
  
  $('#expected_days').val(diff);

})