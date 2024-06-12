const neshanMap = new nmp_mapboxgl.Map({
  mapType: nmp_mapboxgl.Map.mapTypes.neshanVector,
  container: "map",
  zoom: 15,
  pitch: 0,
  center: [51.391165, 35.700956],
  minZoom: 2,
  maxZoom: 21,
  trackResize: true,
  mapKey: "web.4a0e4f89f1a546db815c0bd2dfe80e74",
  poi: true,
  traffic: true,
  mapTypeControllerOptions: {
    show: true,
    position: "bottom-left",
  },
});

let acceptTravel = document.querySelector(".submit");
let endTravel = document.querySelector(".end-travel");
let paymentMethod = document.querySelector(".payment-method");

let price = document.querySelector(".price");
let time = document.querySelector(".time");
let distance = document.querySelector(".distance");
// let driverTime = document.querySelector(".driver-time");
// let Travel_accepted = document.querySelector(".Travel_accepted");
let id = location.search.split("=")[1];

const getData = () => {
  fetch(`https://taxi-server.liara.run/infoTravel/${id}`)
    .then((res) => res.json())
    .then((data) => {
      neshanMap.setCenter(data.ori.split(",").reverse());
      routeing(data.allData);
      markerHandler(data.ori, data.des);
      price.innerHTML = `<span>قیمت</span> <span>${(+data.price.split(
        " "
      )[0]).toLocaleString()} ${data.price.split(" ")[1]}</span>`;
      time.innerHTML = `<span>زمان سفر</span> <span>${data.time}</span>`;
      distance.innerHTML = `<span>مسافت</span> <span>${data.allData[0].legs[0].distance.text}</span>`;
      if (data.Travel_accepted) {
        endTravel.style.display = "block";
        acceptTravel.style.display = "none";
        paymentMethod.style.display = "flex";
        paymentMethod.innerHTML = "<span>شیوه پرداخت</span><span>نقدی</span>";
      } else {
        endTravel.style.display = "none";
        paymentMethod.style.display = "none";
        acceptTravel.style.display = "block";
      }
    });
};

async function routeing(exampleResponse) {
  let routes = [];
  let points = [];
  for (let k = 0; k < exampleResponse.length; k++) {
    for (let j = 0; j < exampleResponse[k].legs.length; j++) {
      for (let i = 0; i < exampleResponse[k].legs[j].steps.length; i++) {
        let step = exampleResponse[k].legs[j].steps[i]["polyline"];
        let point = exampleResponse[k].legs[j].steps[i]["start_location"];

        let route = polyline.decode(step, 5);

        route.map((item) => {
          item.reverse();
        });

        routes.push(route);
        points.push(point);
      }
    }
  }

  let routeObj = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "MultiLineString",
          coordinates: routes,
        },
      },
    ],
  };

  let pointsObj = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        geometry: {
          type: "MultiPoint",
          coordinates: points,
        },
      },
    ],
  };

  // for route line
  neshanMap.addSource("route", {
    type: "geojson",
    data: routeObj,
  });

  neshanMap.addSource("points1", {
    type: "geojson",
    data: pointsObj,
  });

  neshanMap.addLayer({
    id: "route-line",
    type: "line",
    source: "route",
    layout: {
      "line-join": "round",
      "line-cap": "round",
    },
    paint: {
      "line-color": "#250ECD",
      "line-width": 9,
    },
  });

  neshanMap.addLayer({
    id: "points1",
    type: "circle",
    source: "points1",
    paint: {
      "circle-color": "#9fbef9",
      "circle-stroke-color": "#FFFFFF",
      "circle-stroke-width": 2,
      "circle-radius": 5,
    },
  });
}
// !

function markerHandler(ori, des) {
  let popup1 = new nmp_mapboxgl.Popup({ offset: 25 }).setText("مبدا");
  new nmp_mapboxgl.Marker({ color: "purple" })
    .setPopup(popup1)
    .setLngLat(ori.split(",").reverse())
    .addTo(neshanMap);
  let popup2 = new nmp_mapboxgl.Popup({ offset: 25 }).setText("مقصد");
  new nmp_mapboxgl.Marker({ color: "#00F955", draggable: true })
    .setPopup(popup2)
    .setLngLat(des.split(",").reverse())
    .addTo(neshanMap)
    .togglePopup();
}
// نمایش لیست تمام مسافرین
let list = document.querySelector(".list");

const getAllTravels = () => {
  fetch(`https://taxi-server.liara.run/infoTravel`)
    .then((res) => res.json())
    .then((data) => {
      data.forEach((travelInfo) => {
        list.insertAdjacentHTML(
          "beforeend",
          `
            <li><a href="/pages/driver/driver.html?id=${travelInfo.id}">${travelInfo.allData[0].legs[0].summary}</a></li>
            `
        );
      });
    });
};

let travels = document.querySelector(".travels");
let travelInfo = document.querySelector(".travel-info");

if (id) {
  getData();
  travels.style.display = "none";
  travelInfo.style.display = "block";
} else {
  getAllTravels();
  travels.style.display = "block";
  travelInfo.style.display = "none";
}

acceptTravel.addEventListener("click", () => {
  fetch(`https://taxi-server.liara.run/infoTravel/${id}`)
    .then((res) => res.json())
    .then((data) => {
      fetch(`https://taxi-server.liara.run/infoTravel/${id}`, {
        method: "PUT",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          Travel_accepted: true,
        }),
      }).then(() => getData());
    });
});

endTravel.addEventListener("click", () => {
  fetch(`https://taxi-server.liara.run/infoTravel/${id}`, {
    method: "DELETE",
  }).then(() => {
    location.assign("/");
  });
});

function ruleUser() {
  let cookie = localStorage.getItem("userInfo");
  let userInfo = JSON.parse(cookie);
  if (userInfo.rule === "user") {
    location.assign("/");
  }
}

ruleUser();

let logoutBtn = document.querySelector(".logout");

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("userInfo");
  location.assign("/pages/Login/Login.html");
});
