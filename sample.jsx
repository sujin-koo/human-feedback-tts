import React, { useState, useRef, useEffect } from 'react';

// 샘플 오디오 데이터
const samplePairs = [
  {
    id: 1,
    text: "안녕하세요, 오늘 날씨가 정말 좋네요.",
    audioA: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    audioB: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    modelA: "Model-v1",
    modelB: "Model-v2"
  },
  {
    id: 2,
    text: "이 제품은 고객님의 만족을 위해 최선을 다하겠습니다.",
    audioA: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    audioB: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    modelA: "Model-v1",
    modelB: "Model-v2"
  },
  {
    id: 3,
    text: "지금 바로 시작해보세요!",
    audioA: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    audioB: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    modelA: "Model-v1",
    modelB: "Model-v2"
  }
];

const WaveformVisualizer = ({ isPlaying, color }) => {
  const bars = 32;
  return (
    <div className="flex items-center justify-center gap-[2px] h-12">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="w-1 rounded-full transition-all duration-150"
          style={{
            backgroundColor: color,
            height: isPlaying 
              ? `${Math.random() * 100}%` 
              : '20%',
            animation: isPlaying ? `wave 0.5s ease-in-out infinite` : 'none',
            animationDelay: `${i * 0.02}s`
          }}
        />
      ))}
    </div>
  );
};

const AudioCard = ({ label, audioUrl, isSelected, onSelect, isPlaying, onPlay, onStop, accentColor, bgGradient }) => {
  const audioRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', () => {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
      });
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current.duration);
      });
      audioRef.current.addEventListener('ended', () => {
        onStop();
        setProgress(0);
      });
    }
  }, []);

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [isPlaying]);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl p-6 transition-all duration-500 cursor-pointer group ${
        isSelected 
          ? 'ring-4 scale-[1.02] shadow-2xl' 
          : 'hover:scale-[1.01] shadow-lg hover:shadow-xl'
      }`}
      style={{
        background: bgGradient,
        ringColor: accentColor
      }}
      onClick={onSelect}
    >
      {/* Decorative elements */}
      <div 
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl opacity-30"
        style={{ backgroundColor: accentColor }}
      />
      <div 
        className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-2xl opacity-20"
        style={{ backgroundColor: accentColor }}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <span 
            className="text-5xl font-black tracking-tighter"
            style={{ 
              color: accentColor,
              fontFamily: "'Bebas Neue', sans-serif",
              textShadow: `0 0 30px ${accentColor}40`
            }}
          >
            {label}
          </span>
          {isSelected && (
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white font-bold text-sm animate-pulse"
              style={{ backgroundColor: accentColor }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              선택됨
            </div>
          )}
        </div>

        {/* Waveform */}
        <div className="bg-black/20 rounded-2xl p-4 mb-4 backdrop-blur-sm">
          <WaveformVisualizer isPlaying={isPlaying} color={accentColor} />
          
          {/* Progress bar */}
          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-100"
              style={{ 
                width: `${progress}%`,
                backgroundColor: accentColor
              }}
            />
          </div>
          
          <div className="flex justify-between mt-2 text-xs text-white/60 font-mono">
            <span>{formatTime((progress / 100) * duration)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Play button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            isPlaying ? onStop() : onPlay();
          }}
          className="w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3 group-hover:scale-[1.02]"
          style={{
            backgroundColor: isPlaying ? accentColor : 'rgba(255,255,255,0.1)',
            color: isPlaying ? 'white' : accentColor,
            border: `2px solid ${accentColor}`
          }}
        >
          {isPlaying ? (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              일시정지
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
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

export default function TTSFeedbackApp() {
  const [currentPairIndex, setCurrentPairIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPair = samplePairs[currentPairIndex];
  const progress = ((currentPairIndex) / samplePairs.length) * 100;

  const handleSubmit = async () => {
    if (!selectedOption) return;
    
    setIsSubmitting(true);
    
    // 피드백 저장 (실제로는 서버로 전송)
    const feedback = {
      pairId: currentPair.id,
      text: currentPair.text,
      selectedModel: selectedOption === 'A' ? currentPair.modelA : currentPair.modelB,
      timestamp: new Date().toISOString()
    };
    
    setFeedbackHistory([...feedbackHistory, feedback]);
    
    // 시뮬레이션된 서버 응답 대기
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsSubmitting(false);
    setSelectedOption(null);
    setPlayingAudio(null);
    
    if (currentPairIndex < samplePairs.length - 1) {
      setCurrentPairIndex(currentPairIndex + 1);
    } else {
      setShowStats(true);
    }
  };

  const resetSession = () => {
    setCurrentPairIndex(0);
    setSelectedOption(null);
    setPlayingAudio(null);
    setFeedbackHistory([]);
    setShowStats(false);
  };

  if (showStats) {
    const modelAWins = feedbackHistory.filter(f => f.selectedModel === 'Model-v1').length;
    const modelBWins = feedbackHistory.filter(f => f.selectedModel === 'Model-v2').length;

    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center p-6">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        `}</style>
        
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 
              className="text-5xl font-black mb-4"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              평가 완료!
            </h1>
            <p className="text-white/60 text-lg">
              {feedbackHistory.length}개의 피드백을 제출해주셨습니다
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-white/80">결과 요약</h2>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-rose-500/20 to-orange-500/20 rounded-2xl p-6 border border-rose-500/30">
                <div 
                  className="text-6xl font-black text-rose-400 mb-2"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {modelAWins}
                </div>
                <div className="text-white/60">Model-v1 선택</div>
              </div>
              
              <div className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 rounded-2xl p-6 border border-violet-500/30">
                <div 
                  className="text-6xl font-black text-violet-400 mb-2"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {modelBWins}
                </div>
                <div className="text-white/60">Model-v2 선택</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="text-sm text-white/40 mb-2">피드백 데이터 (JSON)</div>
              <pre className="bg-black/30 rounded-xl p-4 text-left text-xs text-emerald-400 overflow-auto max-h-40">
                {JSON.stringify(feedbackHistory, null, 2)}
              </pre>
            </div>
          </div>

          <button
            onClick={resetSession}
            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl font-bold text-lg hover:scale-105 transition-transform"
          >
            다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        
        @keyframes wave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        body {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>

      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 mb-6">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-white/60 text-sm font-medium">TTS 품질 평가 수집 중</span>
          </div>
          
          <h1 
            className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-rose-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            어떤 음성이 더 자연스러운가요?
          </h1>
          
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            두 합성음을 비교하고 더 좋은 음성을 선택해주세요.
            <br />여러분의 피드백이 AI 모델을 개선합니다.
          </p>
        </header>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <span className="text-white/40 text-sm">진행률</span>
            <span className="text-white/60 font-mono text-sm">
              {currentPairIndex + 1} / {samplePairs.length}
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 via-violet-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${((currentPairIndex + 1) / samplePairs.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Text to speak */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 mb-8 border border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/10 rounded-xl">
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-white/40 text-sm font-medium">합성할 텍스트</span>
          </div>
          <p className="text-2xl md:text-3xl font-medium leading-relaxed">
            "{currentPair.text}"
          </p>
        </div>

        {/* Audio comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <AudioCard
            label="A"
            audioUrl={currentPair.audioA}
            isSelected={selectedOption === 'A'}
            onSelect={() => setSelectedOption('A')}
            isPlaying={playingAudio === 'A'}
            onPlay={() => {
              setPlayingAudio('A');
            }}
            onStop={() => setPlayingAudio(null)}
            accentColor="#f43f5e"
            bgGradient="linear-gradient(135deg, #1a0a0d 0%, #2d1215 50%, #1a0a0d 100%)"
          />
          
          <AudioCard
            label="B"
            audioUrl={currentPair.audioB}
            isSelected={selectedOption === 'B'}
            onSelect={() => setSelectedOption('B')}
            isPlaying={playingAudio === 'B'}
            onPlay={() => {
              setPlayingAudio('B');
            }}
            onStop={() => setPlayingAudio(null)}
            accentColor="#8b5cf6"
            bgGradient="linear-gradient(135deg, #0d0a1a 0%, #1a152d 50%, #0d0a1a 100%)"
          />
        </div>

        {/* Submit button */}
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || isSubmitting}
            className={`px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 ${
              selectedOption && !isSubmitting
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                제출 중...
              </span>
            ) : selectedOption ? (
              `옵션 ${selectedOption} 제출하기`
            ) : (
              '먼저 A 또는 B를 선택하세요'
            )}
          </button>
          
          <p className="mt-4 text-white/30 text-sm">
            선택 후 다음 비교로 넘어갑니다
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-white/30 text-sm">
            수집된 피드백은 TTS 모델 품질 향상에 사용됩니다
          </p>
        </footer>
      </div>
    </div>
  );
}
