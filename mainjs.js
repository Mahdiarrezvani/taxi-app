function validationUser() {
  let user = localStorage.getItem("userInfo");
  if (!user) {
    location.assign("pages/Login/Login.html");
  }
}
validationUser()