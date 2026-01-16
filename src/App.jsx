import React, { useState, useEffect } from 'react';
import { Home, UtensilsCrossed, HelpCircle, Settings, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';

const DinnerPlanner = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [responses, setResponses] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [simulatedUsers, setSimulatedUsers] = useState([]);
  const [allRegisteredUsers, setAllRegisteredUsers] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [summaryView, setSummaryView] = useState('today'); // 'today' or 'week'
  const [summaryTouchStart, setSummaryTouchStart] = useState(null);
  const [summaryTouchEnd, setSummaryTouchEnd] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'calendar'

  // スワイプの最小距離（ピクセル）
  const minSwipeDistance = 50;

  // LocalStorageからデータを読み込む
  useEffect(() => {
    const savedUser = localStorage.getItem('gohanTaberu_User');
    const savedResponses = localStorage.getItem('gohanTaberu_Responses');
    const savedSimUsers = localStorage.getItem('gohanTaberu_SimUsers');
    const savedAllUsers = localStorage.getItem('gohanTaberu_AllUsers');

    if (savedUser) {
      setCurrentUser(savedUser);
    }
    if (savedResponses) {
      setResponses(JSON.parse(savedResponses));
    }
    if (savedSimUsers) {
      setSimulatedUsers(JSON.parse(savedSimUsers));
    }
    if (savedAllUsers) {
      setAllRegisteredUsers(JSON.parse(savedAllUsers));
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

  useEffect(() => {
    if (allRegisteredUsers.length > 0) {
      localStorage.setItem('gohanTaberu_AllUsers', JSON.stringify(allRegisteredUsers));
    }
  }, [allRegisteredUsers]);

  // ユーザー登録
  const handleUserSetup = () => {
    if (userName.trim()) {
      const newUser = userName.trim();
      setCurrentUser(newUser);
      localStorage.setItem('gohanTaberu_User', newUser);

      // 登録ユーザーリストに追加
      if (!allRegisteredUsers.includes(newUser)) {
        const updatedUsers = [...allRegisteredUsers, newUser];
        setAllRegisteredUsers(updatedUsers);
        localStorage.setItem('gohanTaberu_AllUsers', JSON.stringify(updatedUsers));
      }
    }
  };

  // 既存ユーザーでログイン
  const handleUserLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('gohanTaberu_User', user);
    setShowLogin(false);
  };

  // ログアウト
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('gohanTaberu_User');
    setUserName('');
    setShowSettings(false);
    setShowLogin(false);
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

  // タッチイベント処理（カレンダー用）
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      changeMonth(1); // 左スワイプで次の月へ
    }
    if (isRightSwipe) {
      changeMonth(-1); // 右スワイプで前の月へ
    }
  };

  // タッチイベント処理（サマリー用）
  const onSummaryTouchStart = (e) => {
    setSummaryTouchEnd(null);
    setSummaryTouchStart(e.targetTouches[0].clientX);
  };

  const onSummaryTouchMove = (e) => {
    setSummaryTouchEnd(e.targetTouches[0].clientX);
  };

  const onSummaryTouchEnd = () => {
    if (!summaryTouchStart || !summaryTouchEnd) return;

    const distance = summaryTouchStart - summaryTouchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && summaryView === 'today') {
      setSummaryView('week'); // 左スワイプで週間表示へ
    }
    if (isRightSwipe && summaryView === 'week') {
      setSummaryView('today'); // 右スワイプで今日表示へ
    }
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
    // ログイン画面（既存ユーザー選択）
    if (showLogin && allRegisteredUsers.length > 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
            <div className="text-center mb-8">
              <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
                <Home className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">今日家でご飯食べる？</h1>
              <p className="text-slate-400">ユーザーを選択してください</p>
            </div>

            <div className="space-y-3 mb-6">
              {allRegisteredUsers.map((user) => (
                <button
                  key={user}
                  onClick={() => handleUserLogin(user)}
                  className="w-full py-3 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-left font-medium"
                >
                  {user}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowLogin(false)}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200 shadow-lg"
            >
              新しいユーザーを作成
            </button>
          </div>
        </div>
      );
    }

    // 新規ユーザー登録画面
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-700">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <Home className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">今日家でご飯食べる？</h1>
            <p className="text-slate-400">家族の夕食予定を共有しよう</p>
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

            {allRegisteredUsers.length > 0 && (
              <button
                onClick={() => setShowLogin(true)}
                className="w-full py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-colors"
              >
                既存ユーザーでログイン
              </button>
            )}
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
  const todayFormatted = today.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });
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
          <div className="flex items-center justify-between">
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
        </div>

        {/* タブナビゲーション */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-2 mb-6 border border-slate-700">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'summary'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              サマリー
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'calendar'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              カレンダー
            </button>
          </div>
        </div>

        {/* サマリータブ */}
        {activeTab === 'summary' && (
          <>
            {/* サマリー切り替えボタン */}
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-2 mb-4 border border-slate-700">
              <div className="flex gap-2">
                <button
                  onClick={() => setSummaryView('today')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    summaryView === 'today'
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  今日
                </button>
                <button
                  onClick={() => setSummaryView('week')}
                  className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
                    summaryView === 'week'
                      ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-lg'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  週間
                </button>
              </div>
            </div>

            {/* サマリー（今日 or 1週間） */}
            <div
              className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700 min-h-[400px]"
              onTouchStart={onSummaryTouchStart}
              onTouchMove={onSummaryTouchMove}
              onTouchEnd={onSummaryTouchEnd}
            >
          {summaryView === 'today' ? (
            // 今日のサマリー
            (() => {
              const todayKey = getDateKey(today.getFullYear(), today.getMonth(), today.getDate());
              const todayResponses = responses[todayKey] || {};
              const allUsers = [currentUser, ...simulatedUsers];

              const homeUsers = allUsers.filter(user => todayResponses[user] === 'home');
              const outUsers = allUsers.filter(user => todayResponses[user] === 'out');
              const unknownUsers = allUsers.filter(user => todayResponses[user] === 'unknown');
              const noResponseUsers = allUsers.filter(user => !todayResponses[user]);

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">今日のサマリー</h3>
                    <p className="text-sm text-slate-400">{todayFormatted}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* 家で食べる */}
                    <div className="bg-green-600/20 border border-green-600/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Home className="w-5 h-5 text-green-400" />
                        <span className="font-semibold text-green-400">家で食べる</span>
                      </div>
                      {homeUsers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {homeUsers.map(user => (
                            <span key={user} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm">
                              {user}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">なし</span>
                      )}
                    </div>

                    {/* 外で食べる */}
                    <div className="bg-orange-600/20 border border-orange-600/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <UtensilsCrossed className="w-5 h-5 text-orange-400" />
                        <span className="font-semibold text-orange-400">外で食べる</span>
                      </div>
                      {outUsers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {outUsers.map(user => (
                            <span key={user} className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm">
                              {user}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">なし</span>
                      )}
                    </div>

                    {/* 未定 */}
                    <div className="bg-gray-600/20 border border-gray-600/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle className="w-5 h-5 text-gray-400" />
                        <span className="font-semibold text-gray-400">未定</span>
                      </div>
                      {unknownUsers.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {unknownUsers.map(user => (
                            <span key={user} className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm">
                              {user}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">なし</span>
                      )}
                    </div>
                  </div>

                  {/* 未回答者がいる場合の表示 */}
                  {noResponseUsers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <span className="text-slate-400 text-sm">
                        未回答: {noResponseUsers.join(', ')}
                      </span>
                    </div>
                  )}
                </>
              );
            })()
          ) : (
            // 週間サマリー
            (() => {
              const allUsers = [currentUser, ...simulatedUsers];
              const weekDays = [];

              // 今日から7日間のデータを取得
              for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateKey = getDateKey(date.getFullYear(), date.getMonth(), date.getDate());
                const dayResponses = responses[dateKey] || {};

                const homeUsers = allUsers.filter(user => dayResponses[user] === 'home');
                const outUsers = allUsers.filter(user => dayResponses[user] === 'out');
                const unknownUsers = allUsers.filter(user => dayResponses[user] === 'unknown');

                weekDays.push({
                  date: date,
                  dateStr: date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' }),
                  homeCount: homeUsers.length,
                  outCount: outUsers.length,
                  unknownCount: unknownUsers.length,
                  homeUsers,
                  outUsers,
                  unknownUsers
                });
              }

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">週間サマリー</h3>
                  </div>
                  <div className="space-y-3">
                    {weekDays.map((day, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-3 ${
                          index === 0 ? 'border-blue-500 bg-slate-700/50' : 'border-slate-600 bg-slate-750'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-white">
                            {day.dateStr}
                            {index === 0 && <span className="ml-2 text-xs text-blue-400">（今日）</span>}
                          </span>
                          <div className="flex gap-3 text-sm">
                            <span className="flex items-center gap-1 text-green-400">
                              <Home className="w-4 h-4" />
                              {day.homeCount}
                            </span>
                            <span className="flex items-center gap-1 text-orange-400">
                              <UtensilsCrossed className="w-4 h-4" />
                              {day.outCount}
                            </span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <HelpCircle className="w-4 h-4" />
                              {day.unknownCount}
                            </span>
                          </div>
                        </div>
                        {(day.homeUsers.length > 0 || day.outUsers.length > 0 || day.unknownUsers.length > 0) && (
                          <div className="flex flex-wrap gap-2">
                            {day.homeUsers.map(user => (
                              <span key={user} className="bg-green-600/80 text-white px-2 py-0.5 rounded text-xs">
                                {user}
                              </span>
                            ))}
                            {day.outUsers.map(user => (
                              <span key={user} className="bg-orange-600/80 text-white px-2 py-0.5 rounded text-xs">
                                {user}
                              </span>
                            ))}
                            {day.unknownUsers.map(user => (
                              <span key={user} className="bg-gray-600/80 text-white px-2 py-0.5 rounded text-xs">
                                {user}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()
          )}
        </div>
          </>
        )}

        {/* カレンダータブ */}
        {activeTab === 'calendar' && (
          <>
            {/* 月の切り替え */}
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-4 mb-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white">{monthName}</h2>
              <p className="text-xs text-slate-400 mt-1">← スワイプで月を切り替え →</p>
            </div>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* カレンダー */}
        <div
          className="bg-slate-800 rounded-2xl shadow-2xl p-6 mb-6 border border-slate-700"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ minHeight: '600px' }}
        >
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

            {/* フッター */}
            <div className="mt-6 text-center text-slate-500 text-sm">
              日付をタップして回答を切り替えられます
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DinnerPlanner;
