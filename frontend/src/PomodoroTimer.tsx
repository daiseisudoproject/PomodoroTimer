import React, { useState, useEffect } from 'react';
import './App.css';
import { gql, useMutation, useQuery } from '@apollo/client';
import bgm25min from './bgm_5min.mp3';

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

const TIMER_COUNT_25min = 25 * 60;
const TIMER_COUNT_5min = 5 * 60;

const PomodoroTimer: React.FC = () => {
  const [isActiveApp, setisActiveApp] = useState(false); // 初期表示や一巡した際に、「開始」と表示させるため
  const [timeLeft25min, setTimeLeft25min] = useState(TIMER_COUNT_25min); // 25分のタイマー
  const [timeLeft5min, setTimeLeft5min] = useState(TIMER_COUNT_5min); // 5分のタイマー
  const [isActive25min, setIsActive25min] = useState(false);
  const [isActive5min, setIsActive5min] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false); // アラームの再生状態を管理
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);
  const [saveSession] = useMutation(SAVE_SESSION);
  const { loading, error, data, refetch } = useQuery(GET_SESSIONS);
  const totalDuration = isActive25min ? TIMER_COUNT_25min : TIMER_COUNT_5min;
  let percentage;
  if (isActive25min) {
    percentage = (timeLeft25min / totalDuration) * 100;
  } else if (isActive5min) {
    percentage = (timeLeft5min / totalDuration) * 100;
  } else {
    percentage = 100;
  }

  useEffect(() => {
    setisActiveApp(true);
    // コンポーネントがマウントされたときに音声オブジェクトを作成
    setAlarmAudio(new Audio(bgm25min));
  }, []);

  // 25分タイマー
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive25min && timeLeft25min > 0) {
      timer = setInterval(() => {
        setTimeLeft25min((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    } else if (timeLeft25min === 0) {
      setIsActive25min(false);
      setIsActive5min(true);
      setTimeLeft25min(TIMER_COUNT_25min)
      handleSaveSession();
      playAlarm();
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isActive25min, timeLeft25min]);

  // 5分タイマー
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isActive5min && timeLeft5min > 0) {
      timer = setInterval(() => {
        setTimeLeft5min((prevTimeLeft) => prevTimeLeft - 1);
      }, 1000);
    } else if (timeLeft5min === 0) {
      setisActiveApp(true);
      setIsActive5min(false);
      setTimeLeft5min(TIMER_COUNT_5min)
      stopAlarm();
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isActive5min, timeLeft5min]);

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
    setisActiveApp(false);
    setIsActive5min(false);
    setIsActive25min(true);
    setTimeLeft5min(TIMER_COUNT_5min)

    // 音楽が鳴っている場合、止める
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0; // 再生位置をリセット
      setIsAlarmPlaying(false);
    }
  };

  const pauseTimer = () => {
    setIsActive25min(false);
    setIsActive5min(false);
  };

  const resetTimer = () => {
    setIsActive25min(false);
    setTimeLeft25min(TIMER_COUNT_25min);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    // 例：「5:30」ではなく、「05:30」のように表示させる
    return `${minutes < 10 ? '0' : ''}${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleSaveSession = () => {
    const duration = formatTime(25 * 60 - timeLeft25min); // 実際の学習時間を計算
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
        <h2>
          { isActiveApp
            ? "開始"
            : isActive25min
            ? formatTime(timeLeft25min)
            : isActive5min
            ? formatTime(timeLeft5min)
            : "停止中" // 初期表示は25分と表示させる
          }
        </h2>
        </div>
      </div>
      <div>
        <button onClick={startTimer} disabled={isActive25min}>
          Start
        </button>
        <button onClick={pauseTimer} disabled={!isActive25min}>
          Pause
        </button>
        <button onClick={resetTimer} disabled={!isActive25min}>
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
        <ul className="scrollable-list">
          {data.getSessions.length === 0 ? (
            <li>まだ学習記録がありません</li>
          ) : (
            data.getSessions
              .slice() // 元のデータを変更しないようにコピーを作成
              .sort((a: any, b: any) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()) // 降順にソート
              .map((session: any) => (
                <li key={session.id}>
                  {session.duration} - {new Date(session.completedAt).toLocaleString()}
                </li>
              ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default PomodoroTimer;
