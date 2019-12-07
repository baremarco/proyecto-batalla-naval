package com.codeoftheweb.salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

import java.time.LocalDateTime;



import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

import java.time.format.DateTimeFormatter;
import java.util.*;

import static java.util.stream.Collectors.toList;

@Entity
public class Game {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    private String fechaCreacion;

    @OneToMany(mappedBy="game", fetch=FetchType.EAGER)
    private List<GamePlayer> gamePlayers;

     List<GamePlayer> getGamePlayers() {
        return gamePlayers;
    }


    public Game(){

    }
    public Game(long horas) {
        LocalDateTime now = LocalDateTime.now().plusHours(horas);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm a");
        this.fechaCreacion = now.format(formatter);
    }

    public String getFechaCreacion() {
        return fechaCreacion;
    }

    public long getId() {
        return id;
    }

    public Map<String, Object> getDto(){
        Map<String, Object> dto = new LinkedHashMap<String, Object>();
        dto.put("id", this.id);
        dto.put("created", this.fechaCreacion);

        List<Map<String, Object>> gamePlayersDto =
                gamePlayers .stream()
                            .map(GamePlayer::getDto)
                            .collect(toList());
        dto.put("gamePlayers", gamePlayersDto);
        return dto;
    }
    public String getStringPlayer(){
        String gamePlayerS;
        gamePlayerS = this.getGamePlayers().stream()
                            .map(gamePlayer -> gamePlayer.getGamePlayerId()).toString();

        return gamePlayerS;
    }

}