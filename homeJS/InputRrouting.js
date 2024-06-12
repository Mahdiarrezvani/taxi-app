let origin = document.querySelector(".origin").value
let des = document.querySelector(".des").value

// گرفتن لوکیشن با ادرس
let address = "بلوار فکوری فکوری 71"
const GetLocationByAddress = () => {
    fetch(`https://api.neshan.org/v4/geocoding?address=${address}`, {
        headers: { 'api-key': "service.36bf6235486e42c080b02c5b3bc54da1" },
    }).then(res => res.json())
        // y=1
        // x=2
        .then(data => console.log(data))
}

GetLocationByAddress()