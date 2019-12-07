package com.codeoftheweb.salvo;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import static javafx.scene.input.KeyCode.J;

@RepositoryRestResource
public interface GamePlayerRepository extends JpaRepository<GamePlayer,Long>{

}
