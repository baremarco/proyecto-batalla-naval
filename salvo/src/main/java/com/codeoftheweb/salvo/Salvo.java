package com.codeoftheweb.salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Entity
public class Salvo {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name="gamePlayerSalvo")
    private GamePlayer gamePlayerSalvo;

    private int turnNumber;

    @ElementCollection
    @Column(name="location")
    private List<String> locations;

    public Salvo(){

    }
    public Salvo(GamePlayer gamePlayer, int turnNumber, List<String> locations) {
        this.gamePlayerSalvo = gamePlayer;
        this.turnNumber = turnNumber;
        this.locations = locations;
    }

    public long getId() {
        return id;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayerSalvo;
    }

    public int getTurnNumber() {
        return turnNumber;
    }

    public List<String> getLocations() {
        return locations;
    }

    public Map<String,Object> getDto(){
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put( Integer.toString(this.getTurnNumber()),this.getLocations());

        return dto;
    }

}

