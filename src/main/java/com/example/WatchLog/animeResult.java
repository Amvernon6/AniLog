package com.example.WatchLog;
public class animeResult {
    private String title;
    private int year;
    private String animator;

    public animeResult(String title, int year, String animator) {
        this.title = title;
        this.year = year;
        this.animator = animator;
    }

    public String getTitle() {
        return title;
    }

    public int getYear() {
        return year;
    }

    public String getAnimator() {
        return animator;
    }

}