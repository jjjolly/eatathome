import React, { useState, useEffect } from 'react';
import { Home, UtensilsCrossed, HelpCircle, Settings, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const DinnerPlanner = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [responses, setResponses] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [simulatedUsers, setSimulatedUsers] = useState([]);

  // LocalStorageからデータを読み込む
  useEffect(() => {
    const savedUser = localStorage.getItem('gohanTaberu_User');
    const savedResponses = localStorage.getItem('gohanTaberu_Responses');
    const savedSimUsers = localStorage.getItem('gohanTaberu_SimUsers');

    if (savedUser) {
      setCurrentUser(savedUser);
    }
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
    if (savedSimUsers) {
      setSimulatedUsers(JSON.parse(savedSimUsers));
    }
  }, []);

  // LocalStorageにデータを保存する
  useEffect(() => {
    if (responses && Object.keys(responses).length > 0) {
      localStorage.setItem('gohanTaberu_Responses', JSON.stringify(responses));
    }
  }, [responses]);

  useEffect(() => {
    if (simulatedUsers.length > 0) {
      localStorage.setItem('gohanTaberu_SimUsers', JSON.stringify(simulatedUsers));
    }
  }, [simulatedUsers]);

  // ユーザー登録
  const handleUserSetup = () => {
    if (userName.trim()) {
      setCurrentUser(userName.trim());
      localStorage.setItem('gohanTaberu_User', userName.trim());
    }
  };

  // ログアウト
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gohanTaberu_User');
    setUserName('');
    setShowSettings(false);
  };

  // 月の日数を取得
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  // 日付キーを生成
  const getDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // 回答を切り替える
  const toggleResponse = (dateKey) => {
    if (!currentUser) return;

    const newResponses = { ...responses };
    if (!newResponses[dateKey]) {
      newResponses[dateKey] = {};
    }

    const currentResponse = newResponses[dateKey][currentUser];

    if (!currentResponse) {
      newResponses[dateKey][currentUser] = 'home';
    } else if (currentResponse === 'home') {
      newResponses[dateKey][currentUser] = 'out';
    } else if (currentResponse === 'out') {
      newResponses[dateKey][currentUser] = 'unknown';
    } else {
      delete newResponses[dateKey][currentUser];
    }

    setResponses(newResponses);
  };

  // レスポンスアイコンを取得
  const getResponseIcon = (response) => {
    switch (response) {
      case 'home':
        return <Home className="w-4 h-4" />;
      case 'out':
        return <UtensilsCrossed className="w-4 h-4" />;
      case 'unknown':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // レスポンスの色を取得
  const getResponseColor = (response) => {
    switch (response) {
      case 'home':
        return 'bg-green-600 text-white';
      case 'out':
        return 'bg-orange-600 text-white';
      case 'unknown':
        return 'bg-gray-500 text-white';
      default:
        return '';
    }
  };

  // 月を変更
  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
  };

  // シミュレーションユーザーを追加
  const addSimulatedUser = () => {
    const names = ['太郎', '花子', 'お母さん', 'お父さん', '次郎', '美咲'];
    const unusedNames = names.filter(name =>
      name !== currentUser && !simulatedUsers.includes(name)
    );

    if (unusedNames.length > 0) {
      const newUser = unusedNames[0];
      setSimulatedUsers([...simulatedUsers, newUser]);
    }
  };

  // シミュレーションユーザーを削除
  const removeSimulatedUser = (userName) => {
    setSimulatedUsers(simulatedUsers.filter(u => u !== userName));

    // そのユーザーの回答も削除
    const newResponses = { ...responses };
    Object.keys(newResponses).forEach(dateKey => {
      if (newResponses[dateKey][userName]) {
        delete newResponses[dateKey][userName];
      }
    });
    setResponses(newResponses);
  };

  // 初期設定画面
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <Home className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">今日家でご飯食べる？</h1>
            <p className="text-slate-400">家族の夕食予定を共有しよう 🍽️</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                あなたの名前
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUserSetup()}
                placeholder="例: 太郎"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleUserSetup}
              disabled={!userName.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              利用開始
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 設定画面
  if (showSettings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">設定</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">現在のユーザー</h3>
                <p className="text-slate-300 mb-4">{currentUser}</p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ログアウト
                </button>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  シミュレーションユーザー
                  <span className="text-sm text-slate-400 ml-2">(テスト用)</span>
                </h3>
                <div className="space-y-2 mb-4">
                  {simulatedUsers.map((user) => (
                    <div key={user} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
                      <span className="text-white">{user}</span>
                      <button
                        onClick={() => removeSimulatedUser(user)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addSimulatedUser}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  ユーザーを追加
                </button>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // メイン画面
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' });
  const today = new Date();
  const isToday = (day) => {
    return today.getFullYear() === year &&
           today.getMonth() === month &&
           today.getDate() === day;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">今日家でご飯食べる？</h1>
              <p className="text-slate-400 text-sm mt-1">ようこそ、{currentUser}さん</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>

          {/* 月の切り替え */}
          <div className="flex items-center justify-between bg-slate-700 rounded-lg p-4">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <h2 className="text-xl font-semibold text-white">{monthName}</h2>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-600 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* 凡例 */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-4 mb-6 border border-slate-700">
          <div className="flex flex-wrap gap-4 justify-center text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-300">家で食べる</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-300">外で食べる</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-300">未定</span>
            </div>
          </div>
        </div>

        {/* カレンダー */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 border border-slate-700">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
              <div
                key={day}
                className={`text-center font-semibold py-2 ${
                  index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-slate-300'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-2">
            {/* 空白セル */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* 日付セル */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dateKey = getDateKey(year, month, day);
              const dayResponses = responses[dateKey] || {};
              const allUsers = [currentUser, ...simulatedUsers];

              return (
                <div
                  key={day}
                  className={`aspect-square border rounded-lg p-2 transition-all cursor-pointer ${
                    isToday(day)
                      ? 'border-blue-500 bg-slate-700'
                      : 'border-slate-600 bg-slate-750 hover:bg-slate-700'
                  }`}
                  onClick={() => toggleResponse(dateKey)}
                >
                  <div className="text-white text-sm font-semibold mb-1">{day}</div>
                  <div className="space-y-1">
                    {allUsers.map((user) => {
                      const response = dayResponses[user];
                      if (!response) return null;

                      return (
                        <div
                          key={user}
                          className={`flex items-center gap-1 text-xs rounded px-1 py-0.5 ${getResponseColor(response)}`}
                        >
                          {getResponseIcon(response)}
                          <span className="truncate">{user.substring(0, 3)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* フッター */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          日付をタップして回答を切り替えられます
        </div>
      </div>
    </div>
  );
};

export default DinnerPlanner;
