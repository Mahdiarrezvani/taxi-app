const submitRegister = document.querySelector(".submit");
const name = document.querySelector(".name");
const family = document.querySelector(".family");
const phoneNumber = document.querySelector(".phone-number");
const password = document.querySelector(".password");
const checkbox = document.querySelector(".checkbox");

submitRegister.addEventListener("click", () => {
  name.value
    ? (name.style.border = "none")
    : (name.style.border = "1px solid red");
  family.value
    ? (family.style.border = "none")
    : (family.style.border = "1px solid red");
  phoneNumber.value
    ? (phoneNumber.style.border = "none")
    : (phoneNumber.style.border = "1px solid red");
  password.value
    ? (password.style.border = "none")
    : (password.style.border = "1px solid red");
  name.value &&
    family.value &&
    phoneNumber.value &&
    password.value &&
    createUser();
});

const createUser = () => {
  let rule = checkbox.checked ? "driver" : "user";
  let body = {
    name: name.value,
    family: family.value,
    phoneNumber: phoneNumber.value,
    password: password.value,
    rule,
  };
  fetch("https://taxi-server.liara.run/users", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(() => {
    localStorage.setItem("userInfo", JSON.stringify(body));
    location.assign("/");
  });
};
