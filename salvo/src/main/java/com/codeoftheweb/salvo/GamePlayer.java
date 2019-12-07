package com.codeoftheweb.salvo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.lang.Nullable;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Entity
public class GamePlayer {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long gamePlayerId;

    private LocalDateTime fechaIngreso;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="game")
    private Game game;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="player")
    private Player player;

    @OneToMany(mappedBy="gamePlayer", fetch=FetchType.EAGER)
    private List<Ship> ships;

    @Nullable
    @OneToOne(mappedBy="gamePlayer", fetch=FetchType.EAGER)
    private Score score;

    @OneToMany(mappedBy="gamePlayerSalvo", fetch=FetchType.EAGER)
    @Fetch(value = FetchMode.SUBSELECT)
    private List<Salvo> salvoes;

    public GamePlayer() {

    }
    public GamePlayer(Game game, Player player) {
        this.game = game;
        this.player = player;
        this.fechaIngreso = LocalDateTime.now();
    }

    @JsonIgnore
    public Game getGame() {
        return game;
    }

    public Player getPlayer() {
        return player;
    }

    public void setPlayer(Player player) {
        this.player = player;
    }

    public long getGamePlayerId() {
        return gamePlayerId;
    }

    public LocalDateTime getFechaIngreso() {
        return fechaIngreso;
    }

    public Map<String,Object> getDto(){
        Map<String,Object> dto = new LinkedHashMap<>();
        dto.put("gpId", this.gamePlayerId);
        dto.put("player", this.player.getDto());
        return dto;
    }
    public Map<String,Object> getDtoGamePlayerId(){
        Map<String,Object> dto = new LinkedHashMap<>();
        dto.put(Long.toString(this.getGamePlayerId()),this.getSalvoes()
                                                            .stream()
                                                            .map(salvo -> salvo.getDto()));
        return dto;
    }

    public List <Ship> getShips() {
        return ships;
    }

    public List<Salvo> getSalvoes() {
        return salvoes;
    }

    @Nullable
    public Score getScore() {
        return score;
    }

    public void addShip(Ship ship){
        ship.setGamePlayer(this);
        ships.add(ship);
    }


    public boolean isTurn(Long loggedPlayerID){
        GamePlayer op=getGame().getGamePlayers().stream().filter(gamePlayer -> gamePlayer.getGamePlayerId()!=this.getGamePlayerId()).collect(Collectors.toList()).get(0);
        if(this.salvoes.size() == 0){
            return true;
        }else if(op.getSalvoes().size()>=this.getSalvoes().size()){
            return true;
//            return this.getSalvoes().get(this.getSalvoes().size() - 1).getGamePlayer().getPlayer()
//                                                                        .getId() != loggedPlayerID;
        }else{
            return false;
        }
    }
}
