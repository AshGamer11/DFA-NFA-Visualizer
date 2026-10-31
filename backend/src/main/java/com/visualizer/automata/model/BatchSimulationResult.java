package com.visualizer.automata.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Result of a batch simulation run across multiple input strings.
 */
public class BatchSimulationResult {

    private String automatonId;
    private String automatonName;
    private AutomatonType automatonType;
    private List<SimulationResult> results = new ArrayList<>();
    private int totalCount;
    private int acceptedCount;
    private int rejectedCount;

    public BatchSimulationResult() {
    }

    public BatchSimulationResult(String automatonId, String automatonName, AutomatonType automatonType,
                                 List<SimulationResult> results) {
        this.automatonId = automatonId;
        this.automatonName = automatonName;
        this.automatonType = automatonType;
        this.results = results != null ? new ArrayList<>(results) : new ArrayList<>();
        this.totalCount = this.results.size();
        this.acceptedCount = (int) this.results.stream().filter(SimulationResult::isAccepted).count();
        this.rejectedCount = this.totalCount - this.acceptedCount;
    }

    public String getAutomatonId() {
        return automatonId;
    }

    public void setAutomatonId(String automatonId) {
        this.automatonId = automatonId;
    }

    public String getAutomatonName() {
        return automatonName;
    }

    public void setAutomatonName(String automatonName) {
        this.automatonName = automatonName;
    }

    public AutomatonType getAutomatonType() {
        return automatonType;
    }

    public void setAutomatonType(AutomatonType automatonType) {
        this.automatonType = automatonType;
    }

    public List<SimulationResult> getResults() {
        return results;
    }

    public void setResults(List<SimulationResult> results) {
        this.results = results != null ? new ArrayList<>(results) : new ArrayList<>();
        this.totalCount = this.results.size();
        this.acceptedCount = (int) this.results.stream().filter(SimulationResult::isAccepted).count();
        this.rejectedCount = this.totalCount - this.acceptedCount;
    }

    public int getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(int totalCount) {
        this.totalCount = totalCount;
    }

    public int getAcceptedCount() {
        return acceptedCount;
    }

    public void setAcceptedCount(int acceptedCount) {
        this.acceptedCount = acceptedCount;
    }

    public int getRejectedCount() {
        return rejectedCount;
    }

    public void setRejectedCount(int rejectedCount) {
        this.rejectedCount = rejectedCount;
    }
}
