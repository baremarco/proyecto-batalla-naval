package com.codeoftheweb.salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.*;

@Entity
public class Ship {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    private String type;

    @ElementCollection
    @Column(name="location")
    private List<String> locations = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayer_id")
    private GamePlayer gamePlayer;

    public long getId() {
        return id;
    }


    public String getType() {
        return type;
    }
    public Ship() {

    }

    public Ship(String type, List<String> locations, GamePlayer gamePlayer) {
        this.type = type;
        this.locations = locations;
        this.gamePlayer = gamePlayer;
    }

    public Ship(String type, List<String> locations) {
        this.type = type;
        this.locations = locations;
    }

    public List<String> getLocations() {
        return locations;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setLocations(List<String> locations) {
        this.locations = locations;
    }

    public void setGamePlayer(GamePlayer gamePlayer) {
        this.gamePlayer = gamePlayer;
    }

    public Map<String,Object> getDto(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("type",this.getType());
        dto.put("locations",this.getLocations());
        return dto;
    }
}
