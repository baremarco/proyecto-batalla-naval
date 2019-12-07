package com.codeoftheweb.salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;


@Entity
public class Player {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    private String userName;

    @OneToMany(mappedBy="player", fetch=FetchType.EAGER)
    List<GamePlayer> gamePlayers;

    private String password;

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    //CONSTRUCTOR POR DEFECTO
    public Player() {

    }

    //CONSTRUCTOR
    public Player(String userName, String password) {
        this.userName = userName;
        this.password = password;
    }
    //METODOS GETERS Y SETERS
    public String getUserName() {
        return this.userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public long getId() {
        return id;
    }

    public List<GamePlayer> getGamePlayer() {
        return gamePlayers;
    }

    private double getPuntuacion(double puntuacion){
        double contaPuntuados =(double) this.gamePlayers.stream()
                                            .map(gamePlayer -> gamePlayer.getScore())
                                            .filter(score -> score != null && score.getScore() == puntuacion)
                                            .count();

        return contaPuntuados;
    }

    public Map<String,Object> getDto(){
        Map<String,Object> dto = new LinkedHashMap<>();
        dto.put("id", this.id);
        dto.put("email", this.userName);
        return dto;
    }
    public Map<String,Object> getLeaderboardDto(){
        Map<String,Object> dto = new LinkedHashMap<>();
        dto.put("nombre", this.userName);
        dto.put("ganados", this.getPuntuacion(1));
        dto.put("perdidos",this.getPuntuacion(0));
        dto.put("empatados",this.getPuntuacion(0.5));
        dto.put("total", this.getPuntuacion(1) + (this.getPuntuacion(0.5)/2));
        return dto;
    }
}
