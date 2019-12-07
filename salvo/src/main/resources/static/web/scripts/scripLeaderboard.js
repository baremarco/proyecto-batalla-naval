$(function(){
  //CUERPO---------------------------------------------------------------------------------------------
  renderResultados();
  renderPlayers();
  
}); //FIN DE LA FUNCION JQUERY



//MANEJO DE EVENTOS-----------------------------------------------------------------------------------
$("#login-button").click( function(){
  login();
});

$("#create-button").click(function(){
  createNewGame();
});


$("#signup-button").click(function(){
  var logForm = document.forms["login-form"];
  $.post("/api/players", { name: logForm["name"].value, password: logForm["password"].value })
  .done(function(data,status){        
    login();
  }).fail(function(data,status){
    if(status == "error"){
      $("#postresult").html("codigo "+status+" usuario o clave invalida");
      alert(status);
    }
  });
});

$("#logout-button").click(function(){
  $.post("/api/logout")
  .done(function() { 
    location.reload();
    $("#postresult").html("success logout"); 
    $("#login-form").show();
    $("#logout-form").hide();
    $("#new-form").hide();
    $("#logged").html("Hello Guest!");
  }).fail(function(data,status){
    alert("logout "+ status);
  });
});

$("#login-form").submit(function(e){
  e.preventDefault();
});

$("#logout-form").submit(function(e){
  e.preventDefault();
});

//FUNCIONES-------------------------------------------------------------------------------------------
function joinGame(data){
  let nn = data.getAttribute("data-gameid");
  $.post(`/api/game/${nn}/players`).done(function(data,status) {
    //location.href = "http://localhost:8080/web/game.html?gp="+data.gpId;
    location.href = "http://localhost:8080/web/grid.html?gp="+data.gpId;
    location.reload;
  }).fail(function(data,status){
    alert(status);
  })
}

function login(){
  var logForm = document.forms["login-form"];
  $.post("/api/login", { username: logForm["name"].value, password: logForm["password"].value }, function(data,status){
    alert("exitoso"+ data);
    $("#postresult").html(data,status);
    $("#postresult").append(status);
  }).done(function(data,status){        
    $("#postresult").html(status);
    $("#logged").text("Hello " + logForm["name"].value);
    $("#login-form").hide();
    $("#logout-form").show();
    $("#new-form").show();
    logForm["name"].value = "";
    logForm["password"].value = "";
    location.reload();
  }).fail(function(data,status){
    if(status == "error"){
      $("#postresult").html("codigo "+status+" usuario o clave invalida");
      alert(status);
    }
  });
}

function createNewGame(){
  $.post("/api/games").done(function(data,status) {
    //location.href = "http://localhost:8080/web/game.html?gp="+data.gpId;
    location.href = "http://localhost:8080/web/grid.html?gp="+data.gpId;
    location.reload;
  }).fail(function(data,status){
    alert(status);
  })
}

function getScoreHeader(){
  let header = "<tr><th>Name</th><th>Total</th><th>Won</th><th>Lost</th><th>Tied</th></tr>";
  return header;
}

function getScoreRows(json) {
  let row;
  json.forEach(player => {
    row += `<tr><td>${player.nombre}</td><td>${player.total}</td><td>${player.ganados}</td>
    <td>${player.perdidos}</td><td>${player.empatados}</td></tr>`
  });
  return row;
}

function renderScoreHeader(tableLocation){
  let html = getScoreHeader();
  $(tableLocation).append(html);
}

function renderScoreRows(json,tableLocation){
  let html = getScoreRows(json);
  $(tableLocation).append(html);
}

function renderScoreTable(json, tableLocation){
  renderScoreHeader(tableLocation);
  renderScoreRows(json, tableLocation);
}

function renderResultados(){
  $.get('/api/leaderboard').done(function(json){
    renderScoreTable(json,'div#resultados table');
  })
  .fail(function (xhr, status, error) {
    alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
  });
}

//FUNCION QUE CREA LA LISTA DE JUGADORES AL INICIO DE LA PAGINA
function renderPlayers(){
  $.get('/api/games').done(function (json) {
    var list; 
    if(json.player != null){
      $("#logged").text("Hello " + json.player.email +' Your id ='+ json.player.id);
      $("#login-form").hide();
      $("#logout-form").show();
      $("#new-form").show();
      
      //chequeo los botones
      list = json.games.map(game => {
        var jugadorLogueadoEnJuego = game.gamePlayers.map(gp => gp.player.id).includes(json.player.id);
        var linea = "<li>" + game.created + ":<br>";
        
        linea = linea + game.gamePlayers.map(function(gamePlayer){
          return '<i class = "player-email">'+"&nbsp"+gamePlayer.player.email+"&nbsp"+"</i>"
        });
        
        if(jugadorLogueadoEnJuego){
          linea = linea + `<a class="button" href = "http://localhost:8080/web/game.html?gp=${game.gamePlayers
          .filter(gp => gp.player.id==json.player.id )[0].gpId}" data-gpid="${game.gamePlayers
            .filter(gp => gp.player.id==json.player.id )[0].gpId}">Enter</a>`;
        }else{
          if(game.gamePlayers.length < 2){
            linea = linea + `<a class="button join-button" data-gameid = "${game.id}" onclick="joinGame(this)">Join</a>`;
          }
        }
        
        linea = linea + "</li>";
        
        return linea;
      })
    }
    else{
      
      list = json.games.map(value => {
        return `<li>${value.created}:<br> ${value.gamePlayers.map(valuePlayer => {
          return `${valuePlayer.player.email} `
        })}</li>`
      })
      $("#logged").text("Hello Guest!");
      $("#login-form").show();
      $("#logout-form").hide();
      $("#new-form").hide();
    }
    $('div#one ol').html(list);
  }).fail(function (xhr, status, error) {
    alert("Result: " + status + " " + error + " " + xhr.status + " " + xhr.statusText)
  });
}