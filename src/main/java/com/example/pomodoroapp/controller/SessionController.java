package com.example.pomodoroapp.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import com.example.pomodoroapp.model.Session;
import com.example.pomodoroapp.repository.SessionRepository;

@Controller
public class SessionController {

    // Springの依存性注入（DI）機能を使用して、SessionRepositoryインターフェースの実装をこのクラスに自動的に注入します。
    @Autowired
    private SessionRepository sessionRepository;

    // 学習セッションを保存するミューテーション
    @MutationMapping
    public Session saveSession(@Argument String duration, @Argument String completedAt) {
        Session session = new Session(duration, completedAt);
        return sessionRepository.save(session);
    }

    // 学習セッションを取得するクエリ
    @QueryMapping
    public List<Session> getSessions() {
        return sessionRepository.findAll();
    }
}
