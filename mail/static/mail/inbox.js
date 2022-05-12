document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Submit form
  document.querySelector('#compose-form').onsubmit = () => {


    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: document.querySelector("#compose-recipients").value,
          subject: document.querySelector("#compose-subject").value,
          body: document.querySelector("#compose-body").value
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        load_mailbox('sent')
    });


    return false
  }


});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';


  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;


  // fetch the emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
  // Print emails
  console.log(emails);

    // ... do something else with emails ...
    // display emails in each inbox
    emails.forEach((email) =>{
      const container = document.createElement('div');
      container.style.border  = "solid";
      if (email.read === true){
        container.style.background  = "DarkGray";
      }else{
        container.style.background = "White";
      }
      // Figure out how to rearranage the mailbox
      if (mailbox === 'inbox'){
      container.innerHTML = `<div class = "emails" id = '${email.id}'><p id ="emailAddress" >${email.sender}</p> ${email.subject}  <p id="time">${email.timestamp}</p></div>
      <button class="btn btn-sm btn-outline-primary archive" id='${email.id}'>Archive</button>`;}
      else if (mailbox === 'archive'){
        container.innerHTML = `<div class = "emails" id = '${email.id}'><p id ="emailAddress">${email.sender}</p> ${email.subject}  <p id="time">${email.timestamp}</p></div>
      <button class="btn btn-sm btn-outline-primary archive" id='${email.id}'>Unarchive</button>`
      }
      else{
        container.innerHTML = `<div class = "emails" id = '${email.id}'><p id ="emailAddress">${email.sender}</p> ${email.subject}  <p id="time">${email.timestamp}</p></div>`
      }

      document.querySelector("#emails-view").append(container)

    })

    // retriving email id
    const email_info = document.querySelectorAll('.emails')
    console.log(email_info)
    let email_id
    email_info.forEach((div) =>{
        div.addEventListener('click', () =>{
        email_id = parseInt(div.id)  // get individual email id of clicked
        email_view(email_id)
    })})


    // add event listner to archive class button and add archive/ unarchive functionality
    const archive_button = document.querySelectorAll(".archive")
    archive_button.forEach((button) =>{

      button.addEventListener('click', () => {
        email_id = parseInt(button.id)
        let archive_state ;

        fetch(`/emails/${email_id}`)
        .then(response => response.json())
        .then(email => {
            // Print email
            console.log(email);

            // ... do something else with email ...
            archive_state = email.archived
            console.log(archive_state)
            return archive_state
        })
        .then((state) =>{
          fetch(`/emails/${email_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !state
            })
          })
        })


        // if (archive_state){
        //   console.log("here archived", )
        //   fetch(`/emails/${email_id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify({
        //         archived: false
        //     })
        //   })
        // }else {
        //   console.log("here inbox")
        //   fetch(`/emails/${email_id}`, {
        //     method: 'PUT',
        //     body: JSON.stringify({
        //         archived: true
        //     })
        //   })
        // }

      })

    })




});
}

// function to view individual email

function email_view(email_id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'block';
  document.querySelector('#email-view').innerHTML = ''

  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // Print email
    console.log(email);
    // ... do something else with email ...
    if (email.read === false){
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
      })
    }

    const header = document.createElement('div')
    header.innerHTML = `<h3><strong>From</strong> : ${email.sender}</h3><br>
    <h3><strong>To</strong> : ${email.recipients}</h3><br>
    <h3><strong>Subject</strong> : ${email.subject}</h3><br>
    <h3><strong>Timestamp</strong> : ${email.timestamp}</h3><br>
    <button class="btn btn-sm btn-outline-primary reply" id='${email_id}'>Reply</button>
    <hr>
    <div id="email-body">${email.body} </div>`
    document.querySelector('#email-view').append(header)

    button = document.querySelector(".reply")
    button.addEventListener('click', () =>{


      document.querySelector('#compose-view').style.display = 'block';



      // Clear out composition fields
      document.querySelector('#compose-recipients').value = `${email.sender}`;
      let subject = `${email.subject}`
      console.log(subject.slice(0,4).localeCompare('Re: '))
      if (subject.slice(0,4).localeCompare('Re: ') === 0){
        console.log("here")
        subject =subject.slice(4)
        console.log(subject)
      }

      document.querySelector('#compose-subject').value = `Re: ${subject}`;
      document.querySelector('#compose-body').value = `
      --------------------------------------------
      On ${email.timestamp} ${email.sender} wrote:
      ${email.body}`;
    })

});



}