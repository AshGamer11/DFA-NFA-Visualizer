package com.visualizer.automata.repository;

import com.visualizer.automata.model.Automaton;
import com.visualizer.automata.model.AutomatonType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data MongoDB repository for finite automaton definitions.
 */
@Repository
public interface AutomatonRepository extends MongoRepository<Automaton, String> {

    List<Automaton> findByType(AutomatonType type);

    List<Automaton> findByNameContainingIgnoreCase(String name);
}
