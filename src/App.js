import React, { useState, useRef, useEffect } from 'react';
import './App.css';

// =============================================
// 설정
// =============================================
const API_URL = process.env.REACT_APP_API_URL || '';

// 샘플 오디오 데이터 (백엔드 없을 때 사용)
const samplePairs = [
  {
    id: 1,
    text: "안녕하세요, 오늘 날씨가 정말 좋네요.",
    audio_a: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    audio_b: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    model_a: "Model-v1",
    model_b: "Model-v2"
  },
  {
    id: 2,
    text: "이 제품은 고객님의 만족을 위해 최선을 다하겠습니다.",
    audio_a: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    audio_b: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    model_a: "Model-v1",
    model_b: "Model-v2"
  },
  {
    id: 3,
    text: "지금 바로 시작해보세요!",
    audio_a: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    audio_b: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    model_a: "Model-v1",
    model_b: "Model-v2"
  }
];

// =============================================
// 웨이브폼 컴포넌트
// =============================================
const WaveformVisualizer = ({ isPlaying, color }) => {
  const bars = 32;
  const [heights, setHeights] = useState(Array(bars).fill(20));

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setHeights(Array(bars).fill(0).map(() => 20 + Math.random() * 80));
      }, 100);
    } else {
      setHeights(Array(bars).fill(20));
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="waveform">
      {heights.map((height, i) => (
        <div
          key={i}
          className="waveform-bar"
          style={{
            backgroundColor: color,
            height: `${height}%`,
          }}
        />
      ))}
    </div>
  );
};

// =============================================
// 오디오 카드 컴포넌트
// =============================================
const AudioCard = ({ 
  label, 
  audioUrl, 
  isSelected, 
  onSelect, 
  isPlaying, 
  onPlay, 
  onStop, 
  accentColor, 
  cardClass 
}) => {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      onStop();
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onStop]);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`audio-card ${cardClass} ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="card-glow" style={{ backgroundColor: accentColor }} />
      
      <div className="card-content">
        <div className="card-header">
          <span className="card-label" style={{ color: accentColor }}>
            {label}
          </span>
          {isSelected && (
            <div className="selected-badge" style={{ backgroundColor: accentColor }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
              </svg>
              <span>선택됨</span>
            </div>
          )}
        </div>

        <div className="waveform-container">
          <WaveformVisualizer isPlaying={isPlaying} color={accentColor} />
          
          <div className="audio-progress">
            <div 
              className="audio-progress-fill"
              style={{ 
                width: `${progress}%`,
                backgroundColor: accentColor
              }}
            />
          </div>
          
          <div className="audio-time">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button
          className={`play-btn ${isPlaying ? 'playing' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            isPlaying ? onStop() : onPlay();
          }}
          style={{
            backgroundColor: isPlaying ? accentColor : 'transparent',
            borderColor: accentColor,
            color: isPlaying ? 'white' : accentColor
          }}
        >
          {isPlaying ? (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z"/>
              </svg>
              일시정지
            </>
          ) : (
            <>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              재생하기
            </>
          )}
        </button>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
};

// =============================================
// 메인 앱 컴포넌트
// =============================================
function App() {
  const [pairs, setPairs] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    const loadPairs = async () => {
      try {
        if (API_URL) {
          const response = await fetch(`${API_URL}/api/pairs`);
          if (response.ok) {
            const data = await response.json();
            if (data.length > 0) {
              setPairs(data);
              setIsLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.log('백엔드 연결 실패, 샘플 데이터 사용');
      }
      setPairs(samplePairs);
      setIsLoading(false);
    };

    loadPairs();
  }, []);

  const currentPair = pairs[currentIndex];
  const progress = pairs.length > 0 ? ((currentIndex + 1) / pairs.length) * 100 : 0;

  const handleSubmit = async () => {
    if (!selectedOption || isSubmitting) return;
    
    setIsSubmitting(true);
    
    const feedback = {
      pair_id: currentPair.id,
      text: currentPair.text,
      selected: selectedOption,
      selected_model: selectedOption === 'A' ? currentPair.model_a : currentPair.model_b,
      timestamp: new Date().toISOString()
    };

    // 백엔드로 전송 시도
    try {
      if (API_URL) {
        await fetch(`${API_URL}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedback)
        });
      }
    } catch (error) {
      console.log('피드백 저장 실패 (로컬에만 저장)');
    }
    
    setFeedbackHistory([...feedbackHistory, feedback]);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsSubmitting(false);
    setSelectedOption(null);
    setPlayingAudio(null);
    
    if (currentIndex < pairs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowStats(true);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setPlayingAudio(null);
    setFeedbackHistory([]);
    setShowStats(false);
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <div className="app">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>데이터 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 완료 화면
  if (showStats) {
    const modelAWins = feedbackHistory.filter(f => f.selected === 'A').length;
    const modelBWins = feedbackHistory.filter(f => f.selected === 'B').length;

    return (
      <div className="app">
        <div className="background-effects">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>

        <div className="complete-screen">
          <div className="complete-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          
          <h1 className="complete-title">평가 완료!</h1>
          <p className="complete-count">{feedbackHistory.length}개의 피드백을 제출해주셨습니다</p>

          <div className="stats-card">
            <h2>결과 요약</h2>
            
            <div className="stats-grid">
              <div className="stat-item stat-a">
                <span className="stat-number">{modelAWins}</span>
                <span className="stat-label">Model A 선택</span>
              </div>
              
              <div className="stat-item stat-b">
                <span className="stat-number">{modelBWins}</span>
                <span className="stat-label">Model B 선택</span>
              </div>
            </div>

            <div className="json-preview">
              <div className="json-label">피드백 데이터 (JSON)</div>
              <pre>{JSON.stringify(feedbackHistory, null, 2)}</pre>
            </div>
          </div>

          <button className="restart-btn" onClick={resetSession}>
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  // 메인 화면
  return (
    <div className="app">
      <div className="background-effects">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="container">
        <header>
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>TTS 품질 평가 수집 중</span>
          </div>
          
          <h1 className="main-title">어떤 음성이 더 자연스러운가요?</h1>
          
          <p className="subtitle">
            두 합성음을 비교하고 더 좋은 음성을 선택해주세요.
            <br />여러분의 피드백이 AI 모델을 개선합니다.
          </p>
        </header>

        {/* 진행률 */}
        <div className="progress-section">
          <div className="progress-info">
            <span>진행률</span>
            <span>{currentIndex + 1} / {pairs.length}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* 텍스트 카드 */}
        <div className="text-card">
          <div className="text-label">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <span>합성할 텍스트</span>
          </div>
          <p className="text-content">"{currentPair?.text}"</p>
        </div>

        {/* 오디오 카드 */}
        <div className="audio-cards">
          <AudioCard
            label="A"
            audioUrl={currentPair?.audio_a}
            isSelected={selectedOption === 'A'}
            onSelect={() => setSelectedOption('A')}
            isPlaying={playingAudio === 'A'}
            onPlay={() => setPlayingAudio('A')}
            onStop={() => setPlayingAudio(null)}
            accentColor="#f43f5e"
            cardClass="card-a"
          />
          
          <AudioCard
            label="B"
            audioUrl={currentPair?.audio_b}
            isSelected={selectedOption === 'B'}
            onSelect={() => setSelectedOption('B')}
            isPlaying={playingAudio === 'B'}
            onPlay={() => setPlayingAudio('B')}
            onStop={() => setPlayingAudio(null)}
            accentColor="#8b5cf6"
            cardClass="card-b"
          />
        </div>

        {/* 제출 버튼 */}
        <div className="submit-section">
          <button
            className={`submit-btn ${!selectedOption || isSubmitting ? 'disabled' : ''}`}
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="btn-loader"></div>
                제출 중...
              </>
            ) : selectedOption ? (
              `옵션 ${selectedOption} 제출하기`
            ) : (
              '먼저 A 또는 B를 선택하세요'
            )}
          </button>
          
          <p className="submit-hint">선택 후 다음 비교로 넘어갑니다</p>
        </div>

        <footer>
          <p>수집된 피드백은 TTS 모델 품질 향상에 사용됩니다</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
