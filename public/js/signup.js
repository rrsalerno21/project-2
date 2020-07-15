$(document).ready(() => {
  // Getting references to our form and input
  const signUpForm = $("form.signup");
  const emailInput = $("input#email-input");
  const passwordInput = $("input#password-input");
  const stateInput = $("#state");

  // When the signup button is clicked, we validate the email and password and state are not blank
  signUpForm.on("submit", event => {
    event.preventDefault();
    
    const userData = {
      email: emailInput.val().trim(),
      password: passwordInput.val().trim(),
      state: stateInput.val()
    };

    

    if (!userData.email || !userData.password || !userData.state) {
      alert("Please provide an email address, password, and state location")
      return;
    }
    // If we have an email and password, run the signUpUser function
    signUpUser(userData.email, userData.password, userData.state);
    emailInput.val("");
    passwordInput.val("");
    stateInput.val("");
  });

  // Does a post to the signup route. If successful, we are redirected to the members page
  // Otherwise we log any errors
  function signUpUser(email, password, state) {
    $.post("/api/signup", {
      email: email,
      password: password,
      state: state
    })
      .then(() => {
        window.location.replace("/members");
        // If there's an error, handle it by throwing up a bootstrap alert
      })
      .catch(handleLoginErr);
  }

  function handleLoginErr(err) {
    console.log(err);
    $("#alert .msg").text(err.responseJSON);
    $("#alert").fadeIn(500);
  }
});
