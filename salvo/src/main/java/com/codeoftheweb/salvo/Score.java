package com.codeoftheweb.salvo;

import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
    @GenericGenerator(name = "native", strategy = "native")
    private long id;

    @OneToOne(fetch = FetchType.EAGER)
    private GamePlayer gamePlayer;

    private double score;

    private LocalDateTime finishDate;

    public Score(){

    }

    public Score(double score, GamePlayer gamePlayer){
        this.score = score;
        this.gamePlayer = gamePlayer;
        this.finishDate = LocalDateTime.now();
    }

    public long getId() {
        return id;
    }

    public GamePlayer getGamePlayer() {
        return gamePlayer;
    }

    public double getScore() {
        return score;
    }

    public LocalDateTime getFinishDate() {
        return finishDate;
    }
}
