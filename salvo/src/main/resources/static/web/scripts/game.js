

$(function () {

  $.getJSON('http://localhost:8080/api/game_view/'+getParamObj(window.location.search).gp).done(function(json){consumeJson(json)})
  .fail(function (xhr, status, error) {
      alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
  });
renderTable(10,10,'div#ships table','shipsGrid');
renderTable(10,10,'div#salvoes table','salvoesGrid');



});//fin de la funcion jquery
//--------------------Eventos----------------------------------------------

//EVENTO AL PRESIONAR BOTON VOLVER 
$("#goBack").click( function(){
  goBack();
});

//EVENTO AL PRESIONAR BOTON ENVIAR SALVOS
$('#sendSalvoes').click(function(){
  var classSelector = $('.firstShot'); 
  sendSalvoes(getSalvoesArray(classSelector));
  location.reload();
});

//EVENTO AL PRESIONAR GRID DE LOS SALVOS
$("#salvoes").on("click","td",(function(e){
  casillaId = e.target.id;
  let casillaClickeada = $('#'+casillaId);
  if(isPossibleToShot(5)){
    casillaClickeada.toggleClass("firstShot");
  }else{
    casillaClickeada.removeClass("firstShot");
  }
  
}));


//casillasTomadas.id = salvoesGrid-C5

//--------------------Funtions----------------------------------------------
function isPossibleToShot(possiblesShots){
  casillasTomadas = $('.firstShot')
  return casillasTomadas.length >= possiblesShots ? false : true;
}
/**
 * @param {*} id unique id name for each td element 
 * @param {*} rows Number of rows 
 * @param {*} cols Number of cols
 * @param {*} tableLocation String with de css location of the element
 */
function renderTable(rows,cols,tableLocation,id){
  renderHeader(cols,tableLocation);
  renderRows(rows,cols,tableLocation,id);
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

function getRows(rows,cols,id) {
  let filas;
  for(i = 0; i<rows;i++){
    filas += `<tr><th>${(String.fromCharCode(i+65))}</th>`;
    for(j = 0;j<cols;j++){
      filas +=`<td id="${id}-${String.fromCharCode(i+65)+(j+1)}"></td>`; 
    }
    filas += "</tr>";
  }
  return filas;  
}

function renderHeader(cols,tableLocation) {
  let html = getHeader(cols);
  $(tableLocation).append(html);
}

function renderRows(rows,cols,tableLocation,id) {
  let html = getRows(rows,cols,id);
  $(tableLocation).append(html);
}
function renderShips(json) {
  json.ships.forEach(ship => {
    switch (ship.type) {
      case "battleship":
        ship.locations.forEach(location => {
          $('#ships #shipsGrid-'+location).addClass('ship-battleship');
        });
      break;

      case "patrol boat":
        ship.locations.forEach(location => {
          $('#ships #shipsGrid-'+location).addClass('ship-patrol-boat');
        });
      break;

      case "carrier":
        ship.locations.forEach(location => {
          $('#ships #shipsGrid-'+location).addClass('ship-carrier');
        });
      break;

      case "submarine":
        ship.locations.forEach(location => {
          $('#ships #shipsGrid-'+location).addClass('ship-submarine');
        });
      break;

      case "destroyer":
        ship.locations.forEach(location => {
          $('#ships #shipsGrid-'+location).addClass('ship-destroyer');
        });
      break;

      
      default:
          ship.locations.forEach(location => {
            $('#ships #shipsGrid-'+location).addClass('ship-piece');
          });
      break;
    } 

  });  
}

function renderSalvoes(json) {
  json.salvoes.forEach(player =>{
    Object.keys(player).forEach(playerKey =>{
      if(playerKey == getParamObj(window.location.search).gp){
        player[playerKey].forEach((turno) => {
          Object.keys(turno).forEach(turnoKey => {
            turno[turnoKey].forEach(location =>{
              $('#salvoes #salvoesGrid-'+location).addClass('salvo');
              $('#salvoes #salvoesGrid-'+location).text(turnoKey);
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
              
              if( $('#ships #shipsGrid-'+location).hasClass('ship-piece')       || 
                  $('#ships #shipsGrid-'+location).hasClass('ship-battleship')  || 
                  $('#ships #shipsGrid-'+location).hasClass('ship-patrol-boat') || 
                  $('#ships #shipsGrid-'+location).hasClass('ship-carrier')     ||    
                  $('#ships #shipsGrid-'+location).hasClass('ship-submarine')   || 
                  $('#ships #shipsGrid-'+location).hasClass('ship-destroyer'))
              {
                $('#ships #shipsGrid-'+location).addClass('ship-hited');
                $('#ships #shipsGrid-'+location).text(turnoKey);
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
  // console.log(JSON.stringify(json, null, 2));
  if(json.gamePlayers.length < 2){
    playerInfo = [json.gamePlayers[0].player.email];
    $('#playerInfo').text(playerInfo[0]+ '(you) vs Waiting for another player ...');
    renderShips(json);
    renderSalvoes(json);
    renderHitedShips(json);
  }else{
    renderPlayerInfo(json);
    renderShips(json);
    renderSalvoes(json);
    renderHitedShips(json);
  }
}
function getSalvoesArray(classSelector){
  var salvoesArray = [];
  classSelector.each(function(){
    let id = this.id;
    if(id.length < 15 ){
      salvoesArray.push(""+id.substr(-2,2)); 
    }else{
      salvoesArray.push(""+id.substr(-3,3)); 
    }
  })
  return salvoesArray;
}

function sendSalvoes(salvoesArray){
  
  $.post({
    url: "/api/games/players/"+ getParamObj(window.location.search).gp +"/salvos", 
    data: JSON.stringify(getSalvoesArray($('.firstShot'))),
    dataType: "text",
    contentType: "application/json"
  })
  .done(function (response, status, jqXHR) {
    alert( "Good, Shoots added");
  })
  .fail(function (jqXHR, status, httpError) {
    alert("Sorry, Failed to add Shoots" );
  })
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
