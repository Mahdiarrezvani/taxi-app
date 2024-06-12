const neshanMap = new nmp_mapboxgl.Map({
  mapType: nmp_mapboxgl.Map.mapTypes.neshanVector,
  container: "map",
  zoom: 15,
  pitch: 0,
  center: [59.55036666548102, 36.28465681622846],
  minZoom: 4,
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
let radio1 = document.querySelector(".radio1");
let radio2 = document.querySelector(".radio2");
let radio3 = document.querySelector(".radio3");

let routes = {};

// example of response data from direction-API v4
// request URL : https://api.neshan.org/v4/direction?type=car&origin=35.700785062128666,51.38881156907395&destination=35.703189177622946,51.3908984545814&alternative=false
let requestOptions = {
  method: "GET",
  headers: { "api-key": "service.36bf6235486e42c080b02c5b3bc54da1" },
  redirect: "follow",
};

let numberClick = 0;
let origin = "";
let destination = "";

neshanMap.on("click", function (e) {
  if (numberClick === 0) {
    let popup = new nmp_mapboxgl.Popup({ offset: 25 }).setText("مبدا");
    new nmp_mapboxgl.Marker({ color: "purple" })
      .setPopup(popup)
      .setLngLat([e.lngLat.lng, e.lngLat.lat])
      .addTo(neshanMap);
    origin = `${e.lngLat.lng},${e.lngLat.lat}`;
  } else if (numberClick === 1) {
    let popup = new nmp_mapboxgl.Popup({ offset: 25 }).setText("مقصد");
    new nmp_mapboxgl.Marker({ color: "#00F955", draggable: true })
      .setPopup(popup)
      .setLngLat([e.lngLat.lng, e.lngLat.lat])
      .addTo(neshanMap)
      .togglePopup();
    destination = `${e.lngLat.lng},${e.lngLat.lat}`;
    getAddressWithMArker(origin, destination);
  }
  numberClick++;
});

//
async function asdadasd(ori, des) {
  let a;
  await fetch(
    `https://api.neshan.org/v4/direction?type=car&origin=${ori}&destination=${des}&alternative=false`,
    requestOptions
  )
    .then((response) => response.json())
    .then((result) => {
      a = result;
      routes = result;
    });
  console.log(a);
  return a;
}
let priceElem = document.querySelector(".price");

async function asd(ori, des) {
  console.log(ori, des);
  let exampleResponse = await asdadasd(ori, des);
  let price = radio1.checked
    ? 1
    : radio2.checked
    ? 1.21
    : radio3.checked
    ? 1.4
    : 1;

  let travlePrice =
    Math.ceil(
      (exampleResponse.routes[0].legs[0].distance.value * 3 * price) / 1000
    ) * 1000;
  priceElem.style.display = "flex";
  priceElem.innerHTML = `<span>${travlePrice.toLocaleString()}</span> <span>تومان</span>`;

  let routes = [];
  let points = [];
  for (let k = 0; k < exampleResponse.routes.length; k++) {
    for (let j = 0; j < exampleResponse.routes[k].legs.length; j++) {
      for (let i = 0; i < exampleResponse.routes[k].legs[j].steps.length; i++) {
        let step = exampleResponse.routes[k].legs[j].steps[i]["polyline"];
        let point =
          exampleResponse.routes[k].legs[j].steps[i]["start_location"];

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
// گرفتن لوکیشن با ادرس
let originElem = document.querySelector(".origin");
let desElem = document.querySelector(".destination");
let showRouting = document.querySelector(".show-routing");
let reqDriver = document.querySelector(".req-driver");

const GetLocationByAddress = async (address) => {
  let loc = "";
  await fetch(`https://api.neshan.org/v4/geocoding?address=${address}`, {
    headers: { "api-key": "service.36bf6235486e42c080b02c5b3bc54da1" },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "NO_RESULT") {
        alert("مسیر یافت نشد");
        showRouting.innerHTML = "نمایش مسیر";
      } else {
        loc = `${data.location.y},${data.location.x}`;
        showRouting.style.display = "none";
        reqDriver.style.display = "block";
      }
    });
  return loc;
};

let radios = document.querySelector(".radios");
let mainOrigin = "";
let mainDestnation = "";
showRouting.addEventListener("click", async () => {
  radios.style.display = "none";
  desElem.value
    ? (desElem.style.border = "none")
    : (desElem.style.border = "1px solid red");
  originElem.value
    ? (originElem.style.border = "none")
    : (originElem.style.border = "1px solid red");

  if (originElem.value && desElem.value) {
    let ori = await GetLocationByAddress(originElem.value);
    let des = "";
    if (ori) {
      neshanMap.setCenter([ori.split(",")[1], ori.split(",")[0]]);
      des = await GetLocationByAddress(desElem.value);
    }
    mainOrigin = ori;
    mainDestnation = des;
    asd(ori, des);
    markerHandler(ori, des);
  }
});

reqDriver.addEventListener("click", async () => {
  reqDriver.style.display = "none";

  let price = radio1.checked
    ? 1
    : radio2.checked
    ? 1.21
    : radio3.checked
    ? 1.4
    : "";
  let time = Math.floor(Math.random() * 20);
  let idRand = crypto.randomUUID();
  let travlePrice =
    Math.ceil(
      ((await routes.routes[0].legs[0].distance.value) * 3 * price) / 1000
    ) * 1000;
  let body = {
    id: idRand,
    ori: mainOrigin,
    des: mainDestnation,
    allData: routes.routes,
    price: `${travlePrice} تومان`,
    timeOrigin: `${time} دقیقه`,
    time: routes.routes[0].legs[0].duration.text,
    Travel_accepted: false,
  };
  fetch("https://taxi-server.liara.run/infoTravel", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(() => {
    location.assign(`/pages/user/user.html?id=${idRand}`);
  });
});

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

function ruleUser() {
  let cookie = localStorage.getItem("userInfo");
  let userInfo = JSON.parse(cookie);
  if (userInfo.rule === "driver") {
    location.assign("/pages/driver/driver.html");
  }
}

ruleUser();

async function getAddressWithMArker(ori, des) {
  let arrayOrigin = ori.split(",");
  let arrayDestnation = des.split(",");
  let a = arrayOrigin[1] + "," + arrayOrigin[0];
  console.log(a);
  let b = arrayDestnation[1] + "," + arrayDestnation[0];
  asd(a, b);
}
