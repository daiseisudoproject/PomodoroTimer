package com.example.pomodoroapp.controller;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.MockitoAnnotations;

import com.example.pomodoroapp.model.Session;
import com.example.pomodoroapp.repository.SessionRepository;

public class SessionControllerTest {

    @InjectMocks
    private SessionController sessionController;

    @Mock
    private SessionRepository sessionRepository;

    @BeforeEach
    public void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    public void testGetSessions() {
        // モックデータの準備
        Session session1 = new Session("25:00", "2023-10-01T10:00:00Z");
        Session session2 = new Session("25:00", "2023-10-01T11:00:00Z");

        when(sessionRepository.findAll()).thenReturn(Arrays.asList(session1, session2));

        // メソッドの実行
        List<Session> sessions = sessionController.getSessions();

        // 結果の検証
        assertNotNull(sessions);
        assertEquals(2, sessions.size());
        verify(sessionRepository, times(1)).findAll();
    }

    @Test
    public void testSaveSession() {
        // 入力データの準備
        String duration = "25:00";
        String completedAt = "2023-10-01T12:00:00Z";

        Session savedSession = new Session(duration, completedAt);
        savedSession.setId(1L); // IDを設定（エンティティにIDがある場合）

        when(sessionRepository.save(any(Session.class))).thenReturn(savedSession);

        // メソッドの実行
        Session result = sessionController.saveSession(duration, completedAt);

        // 結果の検証
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals(duration, result.getDuration());
        assertEquals(completedAt, result.getCompletedAt());
        verify(sessionRepository, times(1)).save(any(Session.class));
    }
}
