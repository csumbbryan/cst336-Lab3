//event listeners
document.querySelector("#zip").addEventListener("change", populateLocation);
document.querySelector("#state").addEventListener("change", displayCounties);
document.querySelector("#username").addEventListener("change",checkUsername);
document.querySelector("#password").addEventListener("click",suggestPassword);
document.querySelector("#signupForm").addEventListener("submit",   function(event) {
  validateForm(event);
});

displayStates();

//global variables
let suggested = false;

//functions

//function to generate random text for password
function randomText() {
  let text = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
  for (let i = 0; i < 8; i++) {
    text += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return text;
} //function randomText()

//function to display the spinner when waiting on API data return
function showSpinner() {
  document.getElementById("spinner").style.display = "inline";
  document.getElementById("spinner").style.padding = "8px";
}

//function to hide the spinner once API data is made available
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
  document.getElementById("spinner").style.padding = "0px";
}

//function to set the selected state based on a passed in USPS state abbreviation
async function setState(state) {
  let stateOptions = document.getElementById("state").options;
  for (let i = 0; i < stateOptions.length; i++) {
    if (state == stateOptions[i].value) {
      stateOptions[i].selected = true;
      await displayCounties();
      return state;
    }
  }
  return "";
}

//function to set the selected county based on a passed in county name
function setCounty(county) {
  let countyOptions = document.getElementById("county").options;
  for (let i = 0; i < countyOptions.length; i++) {
    if (county == countyOptions[i].value) {
      countyOptions[i].selected = true;
    }
  }
}

//populates the list of States from Web API
async function displayStates() {
  let url = `https://csumb.space/api/allStatesAPI.php`;
  let response = await fetch(url);
  let data = await response.json();
  console.log(data);
  let stateList = document.querySelector("#state");
  stateList.innerHTML = "<option>Select One</option>";
  for (let i = 0; i < data.length; i++) {
    stateList.innerHTML += `<option value=${data[i].usps}>${data[i].state}</option>`;
  }
}

function clearLocation() {
  document.querySelector("#city").innerHTML = "";
  document.querySelector("#latitude").innerHTML = "";
  document.querySelector("#longitude").innerHTML = "";
  setState("Select One");
}

//Function to pull data from Zip code retrieval and populate City, Lat, Long, State, and County
async function populateLocation() {
  let zipCode = document.querySelector("#zip").value;
  document.querySelector("#zipError").innerHTML = "";
  console.log(zipCode);
  let url = `https://csumb.space/api/cityInfoAPI.php?zip=${zipCode}`;
  let response = await fetch(url);
  let data = await response.json();
  console.log(data);
  if (data == "") {
    document.querySelector("#zipError").innerHTML = " Zip code not found";
    document.querySelector("#zipError").style.color = "red";
    clearLocation();
  } else {
    document.querySelector("#city").innerHTML = data.city;
    document.querySelector("#latitude").innerHTML = data.latitude;
    document.querySelector("#longitude").innerHTML = data.longitude;
    showSpinner();
    let confirm = await setState(data.state);
    if(confirm != "") {
      setCounty(data.county);
    }
    hideSpinner();
  }
}

//Displaying counties from Web API based on a state two-letter abbreviation
async function displayCounties() {
  if(document.querySelector("#state").value == "Select One") {
    document.querySelector("#county").innerHTML = "";
  } else {
    let state = document.querySelector("#state").value;
    let url = `https://csumb.space/api/countyListAPI.php?state=${state}`;
    let response = await fetch(url);
    let data = await response.json();
    let countList = document.querySelector("#county");
    countList.innerHTML = "";
    for (let i=0; i < data.length; i++) {
      countList.innerHTML += `<option>${data[i].county}</option>`;
    }
  }
  return true;
}

//Checks whether the username entered by the user is available or not
async function checkUsername() {
  let username = document.querySelector("#username").value;
  let url = `https://csumb.space/api/usernamesAPI.php?username=${username}`;
  let response = await fetch(url);
  let data = await response.json();
  let usernameError = document.querySelector("#usernameError");
  if (data.available) {
    usernameError.innerHTML = " Username available!";
    usernameError.style.color = "green";
  } else {
    usernameError.innerHTML = " Username not available!";
    usernameError.style.color = "red";
  }
}

async function populatePassword() {
  let url = "https://webspace.csumb.edu/~lara4594/ajax/suggestedPwd.php?length=8"
  let response = await fetch(url);
  data = await response.json();
  passwordText = data.password;
  let password = document.querySelector("#password");
  let password2 = document.querySelector("#password2"); 
  //let passwordText = randomText();
  password.value = passwordText;
  password2.value = passwordText;
  alert("Your suggested password is: " + passwordText);
}

//suggests a password once the user clicks on the Password textbox
function suggestPassword() {
  if(suggested == false) {
    populatePassword();
    suggested = true;
  }
}

//Validating form data
function validateForm(e) {
  //set variables for condition checks
  let isValid = true;
  let username = document.querySelector("#username").value;
  let password = document.querySelector("#password").value;
  let password2 = document.querySelector("#password2").value;
  let fName = document.querySelector("#fName").value;
  let lName = document.querySelector("#lName").value;
  let genderF = document.getElementById("genderF").checked;
  let genderM = document.getElementById("genderM").checked;
  let zip = document.querySelector("#zip").value;
  let state = document.querySelector("#state").value;
  
  //clear form errors
  document.querySelector("#usernameError").innerHTML = "";
  document.querySelector("#passwordError").innerHTML = "";
  document.querySelector("#generalError").innerHTML = "";
  
  if (username.length == 0) {
    document.querySelector("#usernameError").innerHTML = " Username Required!";
    document.querySelector("#usernameError").style.color = "red";
    isValid = false;
  }
  if (password.length < 6) {
    document.querySelector("#passwordError").innerHTML = " Password must be at least 6 characters!";
    document.querySelector("#passwordError").style.color = "red";
    isValid = false;
  }
  if (password.length == 0) {
    document.querySelector("#passwordError").innerHTML = " Please type in a password!";
    document.querySelector("#passwordError").style.color = "red";
    isValid = false;
  }
  if (password != password2) {
    document.querySelector("#passwordError").innerHTML = " Passwords do not match!";
    document.querySelector("#passwordError").style.color = "red";
    isValid = false;
  }
  if (fName.length == 0 ||
    lName.length == 0 ||
    zip.length == 0 ||
    state == "Select One" || 
     (!genderF && !genderM)) {
    document.querySelector("#generalError").innerHTML = "Please fill out all fields!";
    document.querySelector("#generalError").style.color = "red";
    isValid = false;
  }

  if (!isValid) {
    e.preventDefault();
  }
}