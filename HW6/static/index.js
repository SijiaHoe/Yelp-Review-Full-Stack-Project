/*
 * @Descripttion:
 * @version:
 * @Author: voanit
 * @Date: 2022-09-10 10:38:07
 * @LastEditors: voanit
 * @LastEditTime: 2022-10-08 11:39:16
 */
const anchor = window.location.href;

window.addEventListener("load", function () {
  var submit_btn = document.getElementById('submit');
  var clear_btn = document.getElementById('clear');
  var check_box = document.getElementById('myCheck');
  var location = document.getElementById('location');
  var keyword = document.getElementById('keyword'); // term
  var distance = document.getElementById('distance'); // radius
  var category = document.getElementById('select'); // categories
  var formData = {};

  //  check required input
  function checkFieldValid(field) {
    // remove  old custom error message that was there before
    if (!field.checkValidity()) {
      field.reportValidity();
      return false;
    }
    return true;
  }

  // click submit button
  submit_btn.addEventListener('click', function () {
    if (!checkFieldValid(keyword)) {
      return;
    }
    if (!checkFieldValid(distance)) {
      return;
    }
    if (!checkFieldValid(location)) {
      return;
    }
    // distance > 25 miles
    if (parseInt(distance.value) > 25) {
      alert("Distance must be less or equal to 25 miles.")
      return;
    }

    document.getElementById("noresult").classList.add("none");

    formData[keyword.name] = keyword.value;
    formData[distance.name] = distance.value * 1600;
    formData[category.name] = category.value;

    // convert location to latitude and longitude
    if (check_box.checked == false && check_box.value) {
      if(!getcoordinates(location.value)){
        return;
      }
    }
    else if (check_box.checked == true) {
      location.disabled = true;
      getCurrentLocation();
    }

    console.log(formData);
    $.ajax({
      url: anchor + 'search',
      type: 'GET',
      contentType: 'application/json',
      async: false,
      data: formData,
      dataType: 'json',
      success: function (search_result) {
        // get the search result in search_result
        // console.log(search_result);
        // console.log(search_result[0]);
        display_table(search_result);
      },
      error: function (error) {
        console.log(error);
      }
    })
  });

  // display table section
  function display_table(data) {
    table = document.getElementById('table');
    if (data.length != 0) {
      document.getElementById("myList").classList.remove("none");
      var html = `<tr>
      <th>No.</th>
      <th style="width: 120px;">Image</th>
      <th id="bname"">Business Name</th>
      <th id="rating"">Rating</th>
      <th id="miles"">Distance(miles)</th>
      </tr>`;
      window.location.href = anchor + "#myList";
    }
    else {
      // If no result is found
      console.log("no result")
      document.getElementById("noresult").classList.remove("none");
      return;
    }

    for (var i = 0; i < data.length; i++) {
      if (data[i].image_url.length != 0) {
        var image_url = data[i].image_url;
      }
      else {
        // if no image given
        var image_url = "https://media.istockphoto.com/vectors/no-image-available-sign-vector-id1138179183?k=20&m=1138179183&s=612x612&w=0&h=iJ9y-snV_RmXArY4bA-S4QSab0gxfAMXmXwn5Edko1M=";
      }
      var name = data[i].name;
      var rating = data[i].rating;
      var distance = (parseFloat(data[i].distance) / 1600).toFixed(2).toString();
      var id = data[i].id;

      html += `<tr>
      <td>${i + 1}</td>
      <td><img src=${image_url} alt='Image'></td>
      <td class="nameTag" id=${id}>${name}</td>
      <td>${rating}</td>
      <td>${distance}</td>
      </tr>
      `
      table.innerHTML = html;
    }

    // display detail info section
    var nameTag = document.getElementsByClassName("nameTag");
    for (var i = 0; i < nameTag.length; i++) {
      nameTag[i].addEventListener('click', function () {
        var id = this.id;
        params = { "id": id };
        $.ajax({
          url: anchor + 'detail',
          type: 'GET',
          contentType: 'application/json',
          async: false,
          data: params,
          dataType: 'json',
          success: function (detail) {
            // console.log(detail);
            // name
            var name = detail.name;
            if (name.length > 0) {
              document.getElementById("title").innerHTML = name;
            }

            // status
            if (Reflect.has(detail, 'hours') && Reflect.has(detail.hours[0], 'is_open_now')) {
              var status = detail.hours[0].is_open_now; // bool
              if (!status) {
                document.getElementById("status").innerHTML = "Closed Now";
                document.getElementById("status").style.backgroundColor = "red";
              }
              else {
                document.getElementById("status").innerHTML = "Open Now";
                document.getElementById("status").style.backgroundColor = "green";
              }
            }
            else {
              document.getElementById("hStatus").style.display = "none";
            }

            // categories
            if (Reflect.has(detail, 'categories') && detail.categories.length > 0) {
              var categories = ""; // Array
              for (let i = 0; i < detail.categories.length; i++) {
                categories += detail.categories[i].title + "|";
              }
              document.getElementById("category").innerHTML = categories.slice(0, -1);
            }
            else {
              document.getElementById('hCategories').style.display = "none";
            }

            // address
            if (Reflect.has(detail.location, 'display_address') && detail.location.display_address.length > 0) {
              var location = detail.location.display_address; // Array
              var address = "";
              for (let i = 0; i < location.length; i++) {
                address += location[i];
              }
              document.getElementById("address").innerHTML = address;
            }
            else {
              document.getElementById('hAddress').style.display = "none";
            }

            // phone number
            if (Reflect.has(detail, 'display_phone') && detail.display_phone.length > 0) {
              document.getElementById("phone").innerHTML = detail.display_phone;
            }
            else {
              document.getElementById('hPhone').style.display = "none";
            }

            // transactions
            if (Reflect.has(detail, 'transactions') && detail.transactions.length > 0) {
              var transactions = detail.transactions; // Array
              var t = "";
              for (var i = 0; i < transactions.length; i++) {
                t += transactions[i] + "|";
              }
              document.getElementById("transactions").innerHTML = t.slice(0, -1);
            }
            else {
              document.getElementById("hTransactions").style.display = "none";
            }

            // price
            if (Reflect.has(detail, 'price') && detail.price.length > 0) {
              document.getElementById("price").innerHTML = detail.price;
            }
            else {
              document.getElementById("hPrice").style.display = "none";
            }

            // more info
            if (Reflect.has(detail, 'url')) {
              var url = detail.url;
              document.getElementById("url").innerHTML = "<a href=\"" + url + "\" target=\"_blank\">" + "Yelp" + "</a>";
            }
            else {
              document.getElementById("hInfo").style.display = "none";
            }

            // photos
            if (Reflect.has(detail, 'photos')) {
              var photos = detail.photos; // Array
              for (let i = 0; i < photos.length; i++) {
                if (i == 0) {
                  document.getElementById("first").setAttribute('src', photos[i]);
                }
                else if (i == 1) {
                  document.getElementById("second").setAttribute('src', photos[i]);
                }
                else {
                  document.getElementById("third").setAttribute('src', photos[i]);
                }
              }
            }
          },
          error: function (error) {
            console.log(error);
          }
        })
        window.location.href = anchor + "#detail";
        document.getElementById("detail").classList.remove("none");
      });
    }

    // sort algorithm from W3School, link: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sort_table_desc
    // type = "c"/"n", to sort by string or numeric
    function sortTable(n, type) {
      var table = document.getElementById("table");
      var rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
      switching = true;
      // Set the sorting direction to ascending:
      dir = "asc";
      /*Make a loop that will continue until
      no switching has been done:*/
      while (switching) {
        //start by saying: no switching is done:
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
          //start by saying there should be no switching:
          shouldSwitch = false;
          x = rows[i].getElementsByTagName("TD")[n];
          y = rows[i + 1].getElementsByTagName("TD")[n];
          /*check if the two rows should switch place,
          based on the direction, asc or desc:*/
          if (type == "c") {
            if (dir == "asc") {
              if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                //if so, mark as a switch and break the loop:
                shouldSwitch = true;
                break;
              }
            } else if (dir == "desc") {
              if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                shouldSwitch = true;
                break;
              }
            }
          }
          else if (type == "n") {
            if (dir == "asc") {
              if (Number(x.innerHTML) > Number(y.innerHTML)) {
                shouldSwitch = true;
                break;
              }
            } else if (dir == "desc") {
              if (Number(x.innerHTML) < Number(y.innerHTML)) {
                shouldSwitch = true;
                break;
              }
            }
          }
        }
        if (shouldSwitch) {
          /*If a switch has been marked, make the switch
          and mark that a switch has been done:*/
          rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
          switching = true;
          //Each time a switch is done, increase this count by 1:
          switchcount++;
        } else {
          /*If no switching has been done AND the direction is "asc",
          set the direction to "desc" and run the while loop again.*/
          if (switchcount == 0 && dir == "asc") {
            dir = "desc";
            switching = true;
          }
        }
      }
      for (var index = 1; index < rows.length; index++) {
        rows[index].getElementsByTagName("TD")[0].innerHTML = index;
      }
    }

    document.getElementById("bname").addEventListener('click', function () {
      sortTable(2, "c");
    })

    document.getElementById("rating").addEventListener('click', function () {
      sortTable(3, "n");
    })

    document.getElementById("miles").addEventListener('click', function () {
      sortTable(4, "n");
    })
  }


  // reset all input
  clear_btn.addEventListener("click", function () {
    document.getElementById("info_form").reset();
    document.getElementById("myList").classList.add("none");
    document.getElementById("detail").classList.add("none");
    check_box.checked = false;
    document.getElementById("noresult").classList.add("none");
    document.getElementById("table").innerHTML = "";
  });

  // disable/enable location based on checkbox
  check_box.addEventListener('change', (e) => {
    if (e.currentTarget.checked) {
      location.value = "";
      location.disabled = true;
    }
    else {
      location.value = "";
      location.disabled = false;
    }
  });

  function getCurrentLocation() {
    // call IPinfo to get current location
    var url = 'https://ipinfo.io/json?token=026d73b0fd6fa7';
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      async: false,
      success: function (data) {
        console.log(data.loc);
        // console.log(typeof data.loc); // string
        formData["latitude"] = data.loc.split(',')[0];
        formData["longitude"] = data.loc.split(',')[1];
      }
    });
  }

  // call google geocoding API to convert address to coordinates
  function getcoordinates(location) {
    var API_KEY = 'AIzaSyCkzSueDHiSvh1Spx1hn78_KbXgEniGt5g';
    var url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + location + '&key=' + API_KEY;
    $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json',
      async: false,
      success: function (data) {
        console.log(data);
        if (data.results.length != 0) {
          const latitude = data.results[0].geometry.location.lat;
          const longitude = data.results[0].geometry.location.lng;
          // console.log({ latitude, longitude })
          formData["latitude"] = latitude;
          formData["longitude"] = longitude;
          return true;
        }
        else {
          document.getElementById("noresult").classList.remove("none");
          return false;
        }
      },
      error: function (e) {
        console.log(e);
      }
    });
  }
});
