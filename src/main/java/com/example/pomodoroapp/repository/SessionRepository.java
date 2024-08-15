package com.example.pomodoroapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.pomodoroapp.model.Session;

public interface SessionRepository extends JpaRepository<Session, Long> {
    // 追加のクエリメソッドが必要な場合はここに定義できます
}
