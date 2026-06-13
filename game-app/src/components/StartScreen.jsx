import { Play, Trophy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function StartScreen({ onStart, isLoading }) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(100); // Lấy đủ nhiều để lọc
      
      if (!error && data) {
        const uniquePlayers = [];
        const seenKeys = new Set();
        
        for (const row of data) {
          const lowerName = row.player_name.toLowerCase();
          const pId = row.player_id || 'unknown';
          const uniqueKey = `${pId}_${lowerName}`;
          if (!seenKeys.has(uniqueKey)) {
            seenKeys.add(uniqueKey);
            uniquePlayers.push(row);
            if (uniquePlayers.length === 5) break; // Lấy đủ Top 5 thì dừng
          }
        }
        
        setLeaderboard(uniquePlayers);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="animate-fade-in">
      <h1 className="title">Phản xạ tiếng Anh</h1>
      <button className="btn-start" onClick={onStart} disabled={isLoading}>
        {isLoading ? 'Đang Tải Dữ Liệu...' : 'Vào Phòng Thi'}
      </button>

      {leaderboard.length > 0 && (
        <div className="leaderboard-box">
          <h3><Trophy size={18} color="#f59e0b" /> Top 5</h3>
          <ul className="leaderboard-list">
            {leaderboard.map((player, idx) => (
              <li key={player.id}>
                <span className="rank">#{idx + 1}</span>
                <span className="name">{player.player_name}</span>
                <span className="score">{player.score}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
