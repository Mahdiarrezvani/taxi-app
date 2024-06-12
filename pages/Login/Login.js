const submitLogin = document.querySelector(".submit");
const phoneNumber = document.querySelector(".phone-number");
const password = document.querySelector(".password");

submitLogin.addEventListener("click", () => {
    phoneNumber.value ? phoneNumber.style.border = "none" : phoneNumber.style.border = "1px solid red"
    password.value ? password.style.border = "none" : password.style.border = "1px solid red"
    phoneNumber.value && password.value && getUser()
})

const getUser = () => {
    fetch("https://taxi-server.liara.run/users")
        .then(res => res.json())
        .then(data => {
            let user = ""
            let some = data.some((userInfo) => {
                user = userInfo
                return userInfo.phoneNumber == phoneNumber.value && userInfo.password == password.value
            })
            if (some) {
                localStorage.setItem("userInfo", JSON.stringify(user))
                location.assign("/")
            } else {
                alert("شما ثبت نام نکرده اید")
                location.assign("/pages/Register/Register.html")
            }
        })
        
}