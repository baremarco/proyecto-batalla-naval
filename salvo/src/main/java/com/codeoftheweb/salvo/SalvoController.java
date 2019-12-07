package com.codeoftheweb.salvo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class SalvoController {
   @Autowired
   private GameRepository gameRepository;
   @Autowired
   private GamePlayerRepository gamePlayerRepository;
   @Autowired
   private PlayerRepository playerRepository;
   @Autowired
   private PasswordEncoder passwordEncoder;
   @Autowired
   private ShipRepository shipRepository;
   @Autowired
   private SalvoRepository salvoRepository;

   @RequestMapping("/games")
   public Map<String, Object> getGamesInformation(Authentication authentication) {
      Map<String, Object> dto = new LinkedHashMap<>();
      if (authentication != null) {
         dto.put("player", playerRepository.findByUserName(authentication.getName()).getDto());
      }
      dto.put("games", gameRepository.findAll()
              .stream()
              .map(Game::getDto)
              .collect(Collectors.toList()));
      return dto;
   }

   @RequestMapping("/game_view/{game_player_id}")
   public ResponseEntity<Map<String, Object>> getPlayerView(@PathVariable Long game_player_id,
                                                            Authentication authentication) {
      GamePlayer gamePlayer = gamePlayerRepository.getOne(game_player_id);

      String userInGame = gamePlayer.getPlayer().getUserName();

      if (getCurrentUser(authentication).equals(userInGame)){
         Map<String, Object> dto = gamePlayer.getGame().getDto();
         dto.put("ships", gamePlayer.getShips()
                 .stream()
                 .map(Ship::getDto).collect(Collectors.toList()));

         dto.put("salvoes", gamePlayer.getGame()
                 .getGamePlayers()
                 .stream()
                 .map(GamePlayer::getDtoGamePlayerId));

         return new ResponseEntity<>(dto,HttpStatus.OK);
      }
         return new ResponseEntity<>(makeMap("error","You are not the logged user"), HttpStatus.UNAUTHORIZED);
   }

   @RequestMapping("/leaderboard")
   public List<Map<String, Object>> getLeaderboard(Authentication authentication) {

      return playerRepository.findAll()
              .stream()
              .map(Player::getLeaderboardDto)
              .collect(Collectors.toList());
   }

   @RequestMapping(path = "/players", method = RequestMethod.POST)
   public ResponseEntity<Map<String,Object>> register(@RequestParam String name, @RequestParam String password) {
      if (name.isEmpty() || password.isEmpty()) {
         return new ResponseEntity<>(makeMap("error", "No name"), HttpStatus.BAD_REQUEST);
      }

      if (playerRepository.findByUserName(name) != null) {
         return new ResponseEntity<>(makeMap("error", "Username already exits"), HttpStatus.FORBIDDEN);
      }

      playerRepository.save(new Player(name, passwordEncoder.encode(password)));

      return new ResponseEntity<>(makeMap("id",playerRepository.findByUserName(name).getId()),HttpStatus.CREATED);
   }

   //PARA UNIRSE A UN JUEGO (JOIN)
   @RequestMapping(path = "/game/{gameId}/players", method = RequestMethod.POST)
   ResponseEntity<Map<String, Object>> joinGame (@PathVariable long gameId,  Authentication authentication){
      Game toJoinGame = gameRepository.getOne(gameId);
      Player loggedPlayer = playerRepository.findByUserName(authentication.getName());
      if(isGuess(authentication)){
         return new ResponseEntity<>(makeMap("error", "Not a logged user"),HttpStatus.UNAUTHORIZED);
      }
      if(toJoinGame == null){
         return new ResponseEntity<>(makeMap("error", "No such game"),HttpStatus.FORBIDDEN);
      }
      if(toJoinGame.getGamePlayers().size()>1){
         return new ResponseEntity<>(makeMap("error", "Game is full"),HttpStatus.FORBIDDEN);

      }
      if(toJoinGame.getGamePlayers().stream()
                                    .anyMatch(gp -> gp.getPlayer().getId() == loggedPlayer.getId())){
         return new ResponseEntity<>(makeMap("error", "You can't play against yourself"),HttpStatus.FORBIDDEN);

      }
      GamePlayer newGamePlayer = gamePlayerRepository.save(new GamePlayer(toJoinGame, loggedPlayer));
      return new ResponseEntity<>(makeMap("gpId",newGamePlayer.getGamePlayerId()),HttpStatus.CREATED);
   }

   //PARA RECIBIR LOS SHIPS Y SUS LOCATIONS Y UBICARLOS
   @RequestMapping(path = "/games/players/{gamePlayerId}/ships", method = RequestMethod.POST)
   ResponseEntity<Map<String, Object>> placeShips (@PathVariable long gamePlayerId, @RequestBody List<Ship> ships,
                                                   Authentication authentication){
      Player loggedPlayer = playerRepository.findByUserName(authentication.getName());
      GamePlayer currentGamePlayer = gamePlayerRepository.findById(gamePlayerId).orElse(null);
      if(isGuess(authentication)){
         return new ResponseEntity<>(makeMap("error", "Not a logged user"),HttpStatus.UNAUTHORIZED);
      }
      if(currentGamePlayer == null){
         return new ResponseEntity<>(makeMap("error", "Nonexistent gamePlayer"),HttpStatus.UNAUTHORIZED);
      }
      if(!currentGamePlayer.getPlayer().getUserName().equals(loggedPlayer.getUserName())){
         return new ResponseEntity<>(makeMap("error", "You aren't the gamePlayer User"),HttpStatus.UNAUTHORIZED);
      }
      if(!currentGamePlayer.getShips().isEmpty()){
         return new ResponseEntity<>(makeMap("error", "You already have ships"),HttpStatus.FORBIDDEN);
      }
      for(Ship ship : ships){
         ship.setGamePlayer(currentGamePlayer);
         shipRepository.save(ship);
      }
      return new ResponseEntity<>(makeMap("success"," Ships added"),HttpStatus.CREATED);
  }

//   //PARA RECIBIR LOS SALVOS Y SUS LOCATION Y ASIGNARLOS
   @RequestMapping(path = "/games/players/{gamePlayerId}/salvos", method = RequestMethod.POST)
   ResponseEntity<Map<String, Object>> placeSalvo (@PathVariable long gamePlayerId, @RequestBody List<String> shots,
                                                   Authentication authentication){
      Player loggedPlayer = playerRepository.findByUserName(authentication.getName());
      GamePlayer currentGamePlayer = gamePlayerRepository.findById(gamePlayerId).orElse(null);
      if(isGuess(authentication)){
         return new ResponseEntity<>(makeMap("error", "You aren't a logged user"),HttpStatus.UNAUTHORIZED);
      }else if(currentGamePlayer == null){
         return new ResponseEntity<>(makeMap("error", "Nonexistent gamePlayer"),HttpStatus.UNAUTHORIZED);
      }else if(!currentGamePlayer.getPlayer().getUserName().equals(loggedPlayer.getUserName())){
         return new ResponseEntity<>(makeMap("error", "You aren't the gamePlayer User"),HttpStatus.UNAUTHORIZED);
      }else if(shots.size() != 5){
         return new ResponseEntity<>(makeMap("error", "You have to add only 5 shots"),HttpStatus.FORBIDDEN);
      }else if(!currentGamePlayer.isTurn(currentGamePlayer.getPlayer().getId())){
         return new ResponseEntity<>(makeMap("error", "You shot already"),HttpStatus.FORBIDDEN);
      }
      else{
         int turn = currentGamePlayer.getSalvoes().size() + 1;
         Salvo salvo = new Salvo(currentGamePlayer,turn,shots);
         salvoRepository.save(salvo);
         return new ResponseEntity<>(makeMap("success", "saved salvo"),HttpStatus.CREATED);
      }
   }

   @RequestMapping(path = "/games", method = RequestMethod.POST)
   ResponseEntity<Map<String, Object>> createGame (Authentication authentication){
      if(getCurrentUser(authentication) == null){
         return new ResponseEntity<>(makeMap("error", "No logged user"),HttpStatus.UNAUTHORIZED);
      }else{
         Game newGame = new Game(0);
         GamePlayer newGamePlayer = new GamePlayer(newGame,playerRepository
                                                            .findByUserName(getCurrentUser(authentication)));
         gameRepository.save(newGame);
         gamePlayerRepository.save(newGamePlayer);
         return new ResponseEntity<>(this.makeMap("gpId",newGamePlayer.getGamePlayerId()),HttpStatus.CREATED);
      }
   }

   private boolean isGuess(Authentication authentication) {
      return authentication == null || authentication instanceof AnonymousAuthenticationToken;
   }

   private Map<String, Object> makeMap(String key, Object value) {
      Map<String, Object> map = new HashMap<>();
      map.put(key, value);
      return map;
   }

   private String getCurrentUser(Authentication authentication){
      return authentication.getName();
   }
}