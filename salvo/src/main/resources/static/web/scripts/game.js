

$(function () {

  $.getJSON('http://localhost:8080/api/game_view/'+getParamObj(window.location.search).gp).done(function(json){consumeJson(json)})
  .fail(function (xhr, status, error) {
      alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
  });
renderTable(10,10,'div#ships table');
renderTable(10,10,'div#salvoes table');



});//fin de la funcion jquery
//--------------------Eventos----------------------------------------------
$("#goBack").click( function(){
  goBack();
});




//--------------------Funtions----------------------------------------------
/**
 * 
 * @param {*} rows Number of rows 
 * @param {*} cols Number of cols
 * @param {*} cols String with de css location of the element
 */
function renderTable(rows,cols,tableLocation){
  renderHeader(cols,tableLocation);
  renderRows(rows,cols,tableLocation);
}

/**
 * Funcion que recibe el query string de un url y regresa un objeto con su informacion
 * imput: "?ab=12&cd=34"
 * output: { ab: "12", cd: "34" }
 * @param {*} search String
 */
function getParamObj(search) {
  var obj = {};
  var reg = /(?:[?&]([^?&#=]+)(?:=([^&#]*))?)(?:#.*)?/g;
  search.replace(reg, function(match, param, val) {
    obj[decodeURIComponent(param)] = val === undefined ? "" : decodeURIComponent(val);
  });
  return obj;
}

function getHeader(cols) {
  let header = "<tr><th></th>";
  for(i = 0; i<cols; i++){
    header += `<th>${i+1}</th>`;
  }
  return header + "</tr>";
}

function getRows(rows,cols) {
  let filas;
  for(i = 0; i<rows;i++){
    filas += `<tr><th>${(String.fromCharCode(i+65))}</th>`;
    for(j = 0;j<cols;j++){
      filas +=`<td class="${String.fromCharCode(i+65)+(j+1)}"></td>`; 
    }
    filas += "</tr>";
  }
  return filas;  
}

function renderHeader(cols,tableLocation) {
  let html = getHeader(cols);
  $(tableLocation).append(html);
}

function renderRows(rows,cols,tableLocation) {
  let html = getRows(rows,cols);
  $(tableLocation).append(html);
}
function renderShips(json) {
  json.ships.forEach(ship => {
    switch (ship.type) {
      case "battleship":
        ship.locations.forEach(location => {
          $('#ships .'+location).addClass('ship-battleship');
        });
      break;

      case "patrol boat":
        ship.locations.forEach(location => {
          $('#ships .'+location).addClass('ship-patrol-boat');
        });
      break;

      case "carrier":
        ship.locations.forEach(location => {
          $('#ships .'+location).addClass('ship-carrier');
        });
      break;

      case "submarine":
        ship.locations.forEach(location => {
          $('#ships .'+location).addClass('ship-submarine');
        });
      break;

      case "destroyer":
        ship.locations.forEach(location => {
          $('#ships .'+location).addClass('ship-destroyer');
        });
      break;

      
      default:
          ship.locations.forEach(location => {
            $('#ships .'+location).addClass('ship-piece');
          });
      break;
    } 

    /* if (ship.type == "submarine") {
      ship.locations.forEach(location => {
        $('#ships .'+location).addClass('ship-submarine');
      });  
    }else if(){

    }
    ship.locations.forEach(location => {
      $('#ships .'+location).addClass('ship-piece');
    }); */
  });  
}

function renderSalvoes(json) {
  json.salvoes.forEach(player =>{
    Object.keys(player).forEach(playerKey =>{
      if(playerKey == getParamObj(window.location.search).gp){
        player[playerKey].forEach((turno) => {
          Object.keys(turno).forEach(turnoKey => {
            turno[turnoKey].forEach(location =>{
              $('#salvoes .'+location).addClass('salvo');
              $('#salvoes .'+location).text(turnoKey);
            })
          })
        })
      }
    })
  }); 
}

function renderHitedShips(json) {
  json.salvoes.forEach(player =>{
    Object.keys(player).forEach(playerKey =>{
      if(playerKey != getParamObj(window.location.search).gp){
        player[playerKey].forEach((turno) => {
          Object.keys(turno).forEach(turnoKey => {
            turno[turnoKey].forEach(location =>{
              if($('#ships .'+location).hasClass('ship-piece')){
                $('#ships .'+location).addClass('ship-hited');
                $('#ships .'+location).text(turnoKey);
              }else if($('#ships .'+location).hasClass('ship-hited')){
                
              }
              else{
                $('#ships .'+location).addClass('salvo');
                $('#ships .'+location).text(turnoKey);
              }
            })
          })
        })
      }
    })
  }); 
}

function renderPlayerInfo(data) {
  if(data.gamePlayers[0].gpId == getParamObj(window.location.search).gp){
    playerInfo = [data.gamePlayers[0].player.email,data.gamePlayers[1].player.email];
    $('#playerInfo').text(playerInfo[0]+ '(you) vs ' +playerInfo[1]);
  }
  else{
    playerInfo = [data.gamePlayers[1].player.email, data.gamePlayers[0].player.email];
    $('#playerInfo').text(playerInfo[0] + '(you) vs ' + playerInfo[1]);
  }
}

function consumeJson(json) {
  console.log(JSON.stringify(json, null, 2));
  if(json.gamePlayers.length < 2){
    playerInfo = [json.gamePlayers[0].player.email];
    $('#playerInfo').text(playerInfo[0]+ '(you) vs Waiting for another player ...');
    renderShips(json);
    // renderSalvoes(json);
    // renderHitedShips(json);
  }else{
    renderPlayerInfo(json);
    renderShips(json);
    renderSalvoes(json);
    renderHitedShips(json);
  }
}

function pruebaPostShips(){
  $.post({
    url: "/api/games/players/1/ships", 
    data: JSON.stringify([  { "type": "destroyer", "locations":   ["A1", "B1", "C1"]  },
                            { "type": "patrol boat", "locations": ["H5", "H6"]        }]),
    dataType: "text",
    contentType: "application/json"
  })
  .done(function (response, status, jqXHR) {
    alert( "Ship added: " + response + " " + status );
  })
  .fail(function (jqXHR, status, httpError) {
    alert("Failed to add ship: " + status + " " + httpError);
  })
}
function pruebaPostSalvos(){
  $.post({
    url: "/api/games/players/1/salvos", 
    data: JSON.stringify(["A1", "B1", "C1"]),
    dataType: "text",
    contentType: "application/json"
  })
  .done(function (response, status, jqXHR) {
    alert( "Shoots added: " + response + " " + status );
  })
  .fail(function (jqXHR, status, httpError) {
    alert("Failed to add Shoots: " + status + " " + httpError);
  })
}

function goBack() {
  window.history.back();
}
