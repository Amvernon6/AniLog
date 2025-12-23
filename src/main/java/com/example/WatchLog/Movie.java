package com.example.WatchLog;
public class Movie {
    private String title;
    private int year;
    private String director;

    public Movie(String title, int year, String director) {
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