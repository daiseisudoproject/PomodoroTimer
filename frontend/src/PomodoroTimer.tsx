import React, { useState, useEffect } from 'react';
import './App.css';
import { gql, useMutation, useQuery } from '@apollo/client';
import alarmSound from './alarm.mp3';
// 暑い
const SAVE_SESSION = gql`
  mutation SaveSession($duration: String!, $completedAt: String!) {
    saveSession(duration: $duration, completedAt: $completedAt) {
      id
      duration
      completedAt
    }
  }
`;

const GET_SESSIONS = gql`
  query GetSessions {
    getSessions {
      id
      duration
      completedAt
    }
  }
`;

const TIMER_COUNT = 1 * 60;

const PomodoroTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(TIMER_COUNT); // 25分のタイマー
  const [isActive, setIsActive] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false); // アラームの再生状態を管理
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);
  const [saveSession] = useMutation(SAVE_SESSION);
  const { loading, error, data, refetch } = useQuery(GET_SESSIONS);
  const totalDuration = 25 * 60; // 25分の秒数
  const percentage = (timeLeft / totalDuration) * 100;

  useEffect(() => {
    // コンポーネントがマウントされたときに音声オブジェクトを作成
    setAlarmAudio(new Audio(alarmSound));
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      setTimeLeft(TIMER_COUNT)
      handleSaveSession();
      playAlarm();
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isActive, timeLeft]);

  const playAlarm = () => {
    if (alarmAudio) {
      alarmAudio.play();
      setIsAlarmPlaying(true);
    }
  };

  const stopAlarm = () => {
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0; // 再生位置をリセット
      setIsAlarmPlaying(false);
    }
  };

  const startTimer = () => {
    setIsActive(true);
  };

  const pauseTimer = () => {
    setIsActive(false);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSaveSession = () => {
    const duration = formatTime(25 * 60 - timeLeft); // 実際の学習時間を計算
    const completedAt = new Date().toISOString();

    saveSession({ variables: { duration, completedAt } })
      .then(response => {
        console.log('Session saved:', response.data.saveSession);
        refetch(); // データを再取得して最新のセッションリストを表示
      })
      .catch(error => {
        console.error('Error saving session:', error);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Pomodoro Timer</h1>
      <div className="timer-wrapper" style={{ '--percentage': percentage } as React.CSSProperties}>
        <div className="timer-text">
          <h2>{formatTime(timeLeft)}</h2>
        </div>
      </div>
      <div>
        <button onClick={startTimer} disabled={isActive}>
          Start
        </button>
        <button onClick={pauseTimer} disabled={!isActive}>
          Pause
        </button>
        <button onClick={resetTimer}>
          Reset
        </button>
        </div>
          {isAlarmPlaying && (  // アラームが鳴っているときのみ「止める」ボタンを表示
            <div>
              <button onClick={stopAlarm}>
                Stop Alarm
              </button>
            </div>
          )}
        <div>
      </div>
      <div>
        <h2>Saved Sessions</h2>
        <ul>
          {data.getSessions.map((session: any) => (
            <li key={session.id}>
              {session.duration} - {new Date(session.completedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PomodoroTimer;
