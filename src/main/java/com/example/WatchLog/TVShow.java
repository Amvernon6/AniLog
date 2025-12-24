package com.example.WatchLog;
public class TVShow {
    private String title;
    private int year;
    private String director;

    public TVShow(String title, int year, String director) {
        this.title = title;
        this.year = year;
        this.director = director;
    }

    public String getTitle() {
        return title;
    }

    public int getYear() {
        return year;
    }

}