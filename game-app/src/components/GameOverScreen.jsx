import { AlertCircle, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function GameOverScreen({ score, maxStreak, lastQuestion, userAnswer, explanation, onRestart, onHome }) {
  const [playerName, setPlayerName] = useState(() => localStorage.getItem('thpt_player_name') || '');
  const [playerId] = useState(() => {
    let id = localStorage.getItem('thpt_player_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('thpt_player_id', id);
    }
    return id;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bỏ qua nếu người dùng đang gõ tên trong input
      if (document.activeElement.tagName === 'INPUT') return;
      if (e.key === 'Enter' || e.key === 'Backspace') {
        e.preventDefault();
        onRestart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onRestart]);

  const submitScore = async () => {
    if (!playerName.trim()) return;
    setIsSubmitting(true);
    setNameError(''); // Xóa lỗi cũ nếu có

    try {
      // 1. Kiểm tra xem tên đã tồn tại chưa (không phân biệt hoa thường)
      const { data: existingUsers, error: fetchErr } = await supabase
        .from('leaderboard')
        .select('player_id')
        .ilike('player_name', playerName.trim())
        .limit(1);

      if (fetchErr) throw fetchErr;

      // 2. Nếu tên đã tồn tại nhưng khác ID thiết bị => Báo lỗi trùng
      if (existingUsers && existingUsers.length > 0) {
        if (existingUsers[0].player_id !== playerId) {
          setNameError('Tên này đã có người sử dụng. Vui lòng chọn tên khác!');
          setIsSubmitting(false);
          return;
        }
      }

      // 3. Nếu hợp lệ => Lưu
      localStorage.setItem('thpt_player_name', playerName.trim());
      
      const { error } = await supabase
        .from('leaderboard')
        .insert([{ player_id: playerId, player_name: playerName.trim(), score, max_streak: maxStreak }]);
      if (error) throw error;
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Không thể lưu điểm!');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="result-box">
        <div className="result-item">
          <span className="result-label">Tổng điểm</span>
          <span className="result-value highlight-score">{score}</span>
        </div>
        <div className="result-item">
          <span className="result-label">Chuỗi Max</span>
          <span className="result-value">{maxStreak}</span>
        </div>
      </div>

      <div className="explanation-box">
        <strong>
          <AlertCircle size={22} strokeWidth={2.5} />
          Lỗi
        </strong>
        {lastQuestion && (
          <div className="failed-question">
            <p className="q-text" dangerouslySetInnerHTML={{ __html: lastQuestion.q }}></p>
            <div className="user-answer-row">
              Bạn chọn: <span className={`ans-badge ${userAnswer === 'timeout' ? 'timeout' : (userAnswer ? 'true' : 'false')}`}>
                {userAnswer === 'timeout' ? 'HẾT GIỜ' : (userAnswer ? 'ĐÚNG' : 'SAI')}
              </span>
              <span style={{ margin: '0 8px', color: 'rgba(244, 63, 94, 0.4)' }}>|</span>
              Đáp án: <span className={`ans-badge ${lastQuestion.a ? 'true' : 'false'}`}>
                {lastQuestion.a ? 'ĐÚNG' : 'SAI'}
              </span>
            </div>
            <hr className="divider" />
          </div>
        )}
        <p dangerouslySetInnerHTML={{ __html: explanation }}></p>
      </div>

      {!isSubmitted ? (
        <div className="submit-section">
          <div className="submit-box" style={{ marginBottom: nameError ? '8px' : '24px' }}>
            <input 
              type="text" 
              className="name-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.substring(0, 20))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitScore();
              }}
              disabled={isSubmitting}
              placeholder="Nhập tên của bạn..."
            />
            <button className="btn-save" onClick={submitScore} disabled={isSubmitting || !playerName.trim()}>
              {isSubmitting ? 'Đang lưu...' : <><Save size={18} /> Lưu Điểm</>}
            </button>
          </div>
          {nameError && (
            <div style={{ color: 'var(--danger-color)', fontSize: '0.9rem', marginBottom: '24px', fontWeight: '600' }}>
              {nameError}
            </div>
          )}
        </div>
      ) : (
        <div className="submit-success">🏆 Đã lưu điểm lên Bảng Xếp Hạng!</div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <button className="btn-start" onClick={onRestart} style={{ flex: 1, padding: '14px', fontSize: '1rem', borderRadius: '8px' }}>
          Thi Lại
        </button>
        <button className="btn-start" onClick={onHome} style={{ flex: 1, padding: '14px', fontSize: '1rem', borderRadius: '8px', background: 'transparent', border: '1px solid #333', color: '#fff' }}>
          Màn Hình Chính
        </button>
      </div>
    </div>
  );
}
