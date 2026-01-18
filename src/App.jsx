import React, { useState, useEffect } from 'react';

const PitameshiMinimal = () => {
  // 認証関連
  const [appMode, setAppMode] = useState('auth');
  const [authScreen, setAuthScreen] = useState('initial');
  const [currentUser, setCurrentUser] = useState(null);
  const [email, setEmail] = useState('');
  const [groupName, setGroupName] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState(''); // 画面上部に表示する通知

  // dinner-planner関連
  const [responses, setResponses] = useState({});
  const [showSettings, setShowSettings] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'calendar'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summaryView, setSummaryView] = useState('today'); // 'today' or 'week'

  // カラー設定
  const colors = {
    main: '#FF8C42',
    base: '#f5f1ed', // 背景 - 薄いベージュ
    card: '#ded8d3', // カード背景 - ベージュ
    darkCard: '#bfb8b0', // 濃いカード背景
    inputBg: '#e8e4df', // 入力フィールド背景
    inputBorder: '#c7c1bb', // 入力フィールド枠線
    buttonGray: '#b8b2ac', // グレーボタン
    success: '#52B788',
    statusYes: '#16a34a', // green-600 (食べる)
    statusNo: '#ea580c', // orange-600 (食べない)
    statusUnknown: '#6b7280', // gray-500 (未定)
    accent: '#FFD166',
    tabUnselected: '#c7c1bb', // タブ未選択 - ライトベージュ
    tabSelected: '#8a7f75', // タブ選択中 - ブラウンベージュ（食べるの緑、食べないのオレンジと区別）
    todayHighlight: '#b8b2ac', // 当日ハイライト背景 - 濃いめ
    todayBorder: '#8a8480', // 当日ハイライト枠線 - より濃い
    text: {
      primary: '#2c2c2c', // ダーク - カード上のテキスト
      secondary: '#5a5a5a', // ミディアムダーク
      light: '#8a8a8a', // ライトダーク
      white: '#ffffff' // 白
    }
  };

  // LocalStorageから読み込み
  useEffect(() => {
    const savedUser = localStorage.getItem('pitameshi_current_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setAppMode('dinner-planner');
      loadGroupMembers(user.groupId);
      loadResponses();
    }
  }, []);

  // データ保存
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem('pitameshi_responses', JSON.stringify(responses));
    }
  }, [responses]);

  const loadGroupMembers = (groupId) => {
    const groupData = localStorage.getItem(`pitameshi_group_${groupId}`);
    if (groupData) {
      const group = JSON.parse(groupData);
      setGroupMembers(group.approvedUsers || []);
    }
  };

  const loadResponses = () => {
    const saved = localStorage.getItem('pitameshi_responses');
    if (saved) {
      setResponses(JSON.parse(saved));
    }
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const handleResponseChange = (userId, date, status) => {
    const dateStr = formatDate(date);
    setResponses(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [dateStr]: status
      }
    }));
  };

  const getResponse = (userId, date) => {
    const dateStr = formatDate(date);
    return responses[userId]?.[dateStr] || null;
  };

  const getMonthDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // 空白セル
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // 日付セル
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getTodaySummary = () => {
    const today = formatDate(new Date());
    const summary = { yes: [], no: [], unknown: [] };

    groupMembers.forEach(member => {
      const response = responses[member.userId]?.[today];
      if (response === 'yes') {
        summary.yes.push(member.userName);
      } else if (response === 'no') {
        summary.no.push(member.userName);
      } else {
        summary.unknown.push(member.userName);
      }
    });

    return summary;
  };

  const getWeekSummary = () => {
    const weekDays = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = formatDate(date);

      const homeUsers = [];
      const outUsers = [];
      const unknownUsers = [];

      groupMembers.forEach(member => {
        const response = responses[member.userId]?.[dateStr];
        if (response === 'yes') {
          homeUsers.push(member.userName);
        } else if (response === 'no') {
          outUsers.push(member.userName);
        }
      });

      weekDays.push({
        date: date,
        dateStr: date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' }),
        homeUsers,
        outUsers
      });
    }

    return weekDays;
  };

  const handleOwnerRegister = () => {
    if (!email || !groupName || !password || !userName) {
      setMessage('全ての項目を入力してください');
      return;
    }

    const groupIdGenerated = `group_${Date.now()}`;
    const userId = `user_${Date.now()}`;

    const groupData = {
      groupId: groupIdGenerated,
      groupName,
      password,
      approvedUsers: [{
        userId,
        userName,
        status: 'owner'
      }]
    };

    localStorage.setItem(`pitameshi_group_${groupIdGenerated}`, JSON.stringify(groupData));

    const user = {
      userId,
      userName,
      groupId: groupIdGenerated,
      groupName,
      status: 'owner'
    };

    setCurrentUser(user);
    localStorage.setItem('pitameshi_current_user', JSON.stringify(user));

    // グループ作成完了メッセージ
    setNotification(`🎉 グループ作成完了！ グループ「${groupName}」を作成しました。設定画面からグループIDをコピーして、家族に共有しましょう！`);
    setTimeout(() => setNotification(''), 8000);

    setAppMode('dinner-planner');
    loadGroupMembers(groupIdGenerated);
    setMessage('');
  };

  const handleMemberRegister = () => {
    if (!groupId || !password || !userName) {
      setMessage('全ての項目を入力してください');
      return;
    }

    const groupData = localStorage.getItem(`pitameshi_group_${groupId}`);
    if (!groupData) {
      setMessage('グループが見つかりません');
      return;
    }

    const group = JSON.parse(groupData);
    if (group.password !== password) {
      setMessage('パスワードが違います');
      return;
    }

    const existingUser = group.approvedUsers.find(u => u.userName === userName);
    let userId;

    if (existingUser) {
      userId = existingUser.userId;
    } else {
      userId = `user_${Date.now()}`;
      group.approvedUsers.push({
        userId,
        userName,
        status: 'member'
      });
      localStorage.setItem(`pitameshi_group_${groupId}`, JSON.stringify(group));
    }

    const user = {
      userId,
      userName,
      groupId,
      groupName: group.groupName,
      status: existingUser ? existingUser.status : 'member'
    };

    setCurrentUser(user);
    localStorage.setItem('pitameshi_current_user', JSON.stringify(user));

    // ウェルカムメッセージを表示
    if (existingUser) {
      setNotification(`おかえりなさい、${userName}さん！ グループ「${group.groupName}」にログインしました。`);
    } else {
      setNotification(`ようこそ、${userName}さん！ グループ「${group.groupName}」に参加しました。`);
    }
    setTimeout(() => setNotification(''), 6000);

    setAppMode('dinner-planner');
    loadGroupMembers(groupId);
  };

  const handleLogout = () => {
    localStorage.removeItem('pitameshi_current_user');
    setCurrentUser(null);
    setAppMode('auth');
    setAuthScreen('initial');
    setEmail('');
    setGroupName('');
    setPassword('');
    setUserName('');
    setGroupId('');
    setMessage('');
  };

  // 認証画面
  if (appMode === 'auth') {
    if (authScreen === 'initial') {
      return (
        <div style={{ minHeight: '100vh', background: colors.base, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '500px', width: '100%', backgroundColor: colors.card, borderRadius: '16px', padding: '40px' }}>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', color: colors.text.primary, textAlign: 'center' }}>ピタめし</h1>
            <p style={{ fontSize: '14px', color: colors.text.secondary, textAlign: 'center', marginBottom: '32px' }}>家族の夕食予定を共有しよう</p>

            <button
              onClick={() => setAuthScreen('owner-register')}
              style={{ width: '100%', padding: '16px', marginBottom: '16px', backgroundColor: colors.tabSelected, color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🏠 新しくグループを作る
            </button>

            <button
              onClick={() => setAuthScreen('member-register')}
              style={{ width: '100%', padding: '16px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              👥 既存グループに参加する
            </button>
          </div>
        </div>
      );
    }

    if (authScreen === 'owner-register') {
      return (
        <div style={{ minHeight: '100vh', background: colors.base, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '500px', width: '100%', backgroundColor: colors.card, borderRadius: '16px', padding: '40px' }}>
            <button onClick={() => setAuthScreen('initial')} style={{ marginBottom: '24px', padding: '8px 16px', backgroundColor: colors.buttonGray, border: 'none', borderRadius: '8px', cursor: 'pointer', color: colors.text.primary }}>← 戻る</button>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: colors.text.primary }}>グループを作成</h2>

            {message && <div style={{ padding: '12px', backgroundColor: '#fee2e2', borderRadius: '8px', marginBottom: '16px', color: '#991b1b', fontSize: '14px' }}>{message}</div>}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.text.primary }}>メールアドレス</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '12px', border: '2px solid' + colors.inputBorder, backgroundColor: colors.inputBg, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', color: colors.text.primary }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.text.primary }}>グループ名</label>
              <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="例: 田中家" style={{ width: '100%', padding: '12px', border: '2px solid' + colors.inputBorder, backgroundColor: colors.inputBg, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', color: colors.text.primary }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.text.primary }}>パスワード</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="家族で共有するパスワード" style={{ width: '100%', padding: '12px', border: '2px solid' + colors.inputBorder, backgroundColor: colors.inputBg, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', color: colors.text.primary }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.text.primary }}>あなたの名前</label>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="例: お母さん" style={{ width: '100%', padding: '12px', border: '2px solid' + colors.inputBorder, backgroundColor: colors.inputBg, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', color: colors.text.primary }} />
            </div>

            <button onClick={handleOwnerRegister} style={{ width: '100%', padding: '16px', backgroundColor: colors.tabSelected, color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
              グループを作成
            </button>
          </div>
        </div>
      );
    }

    if (authScreen === 'member-register') {
      return (
        <div style={{ minHeight: '100vh', background: colors.base, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ maxWidth: '500px', width: '100%', backgroundColor: colors.card, borderRadius: '16px', padding: '40px' }}>
            <button onClick={() => setAuthScreen('initial')} style={{ marginBottom: '24px', padding: '8px 16px', backgroundColor: colors.buttonGray, border: 'none', borderRadius: '8px', cursor: 'pointer', color: colors.text.primary }}>← 戻る</button>

            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: colors.text.primary }}>グループに参加</h2>

            {message && <div style={{ padding: '12px', backgroundColor: message.includes('おかえり') || message.includes('ようこそ') ? '#d1fae5' : '#fee2e2', borderRadius: '8px', marginBottom: '16px', color: message.includes('おかえり') || message.includes('ようこそ') ? '#065f46' : '#991b1b', fontSize: '14px' }}>{message}</div>}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.text.primary }}>グループID</label>
              <input type="text" value={groupId} onChange={(e) => setGroupId(e.target.value)} placeholder="group_xxxxxxxxx" style={{ width: '100%', padding: '12px', border: '2px solid' + colors.inputBorder, backgroundColor: colors.inputBg, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', color: colors.text.primary }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.text.primary }}>パスワード</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="家族で共有しているパスワード" style={{ width: '100%', padding: '12px', border: '2px solid' + colors.inputBorder, backgroundColor: colors.inputBg, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', color: colors.text.primary }} />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px', color: colors.text.primary }}>あなたの名前</label>
              <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="例: 太郎" style={{ width: '100%', padding: '12px', border: '2px solid' + colors.inputBorder, backgroundColor: colors.inputBg, borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', color: colors.text.primary }} />
            </div>

            <button onClick={handleMemberRegister} style={{ width: '100%', padding: '16px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: '12px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer' }}>
              参加する
            </button>
          </div>
        </div>
      );
    }
  }

  // メイン画面
  if (appMode === 'dinner-planner') {
    const today = new Date();
    const todaySummary = getTodaySummary();

    return (
      <div style={{ minHeight: '100vh', background: colors.base, padding: '16px', paddingBottom: '80px' }}>
        {/* 通知バナー */}
        {notification && (
          <div style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '600px',
            width: '90%',
            backgroundColor: colors.success,
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 2000,
            fontSize: '14px',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '2px solid #2d7a4f'
          }}>
            {notification}
          </div>
        )}

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          {/* ヘッダー */}
          <div style={{ backgroundColor: colors.card, padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: colors.text.primary, margin: 0 }}>ピタめし</h1>
                <p style={{ fontSize: '14px', color: colors.text.secondary, margin: '4px 0 0 0' }}>{currentUser?.userName}さん</p>
              </div>
              <button onClick={() => setShowSettings(!showSettings)} style={{ padding: '12px', backgroundColor: colors.tabSelected, border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '20px' }}>⚙️</button>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', backgroundColor: colors.card, padding: '8px', borderRadius: '16px' }}>
            <button
              onClick={() => setActiveTab('summary')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'summary' ? colors.tabSelected : colors.tabUnselected,
                color: activeTab === 'summary' ? 'white' : colors.text.primary,
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              サマリー
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              style={{
                flex: 1,
                padding: '12px',
                background: activeTab === 'calendar' ? colors.tabSelected : colors.tabUnselected,
                color: activeTab === 'calendar' ? 'white' : colors.text.primary,
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              カレンダー
            </button>
          </div>

          {/* 設定モーダル */}
          {showSettings && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setShowSettings(false)}>
              <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '32px', maxWidth: '400px', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: colors.text.primary }}>設定</h2>

                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: colors.buttonGray, borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', color: colors.text.secondary, marginBottom: '4px' }}>ユーザー名</p>
                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: colors.text.primary }}>{currentUser?.userName}</p>
                </div>

                {/* グループID表示とコピー */}
                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: colors.todayHighlight, border: `2px solid ${colors.todayBorder}`, borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'rgb(96, 165, 250)', marginBottom: '12px' }}>👥 家族を招待</p>

                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', color: colors.text.secondary, marginBottom: '4px' }}>グループID</p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <code style={{ flex: 1, fontSize: '11px', fontFamily: 'monospace', padding: '8px', backgroundColor: colors.inputBg, borderRadius: '4px', wordBreak: 'break-all', border: '1px solid ' + colors.inputBorder, color: colors.text.primary }}>
                        {currentUser?.groupId}
                      </code>
                      <button
                        onClick={() => {
                          // クリップボードにコピー
                          const groupIdText = currentUser?.groupId || '';

                          if (navigator.clipboard && navigator.clipboard.writeText) {
                            navigator.clipboard.writeText(groupIdText).then(() => {
                              setNotification(`✅ グループIDをコピーしました！ ${groupIdText}`);
                              setTimeout(() => setNotification(''), 4000);
                            }).catch(() => {
                              setNotification(`📋 グループID: ${groupIdText} (手動でコピーしてください)`);
                              setTimeout(() => setNotification(''), 6000);
                            });
                          } else {
                            // クリップボードAPIが使えない場合
                            setNotification(`📋 グループID: ${groupIdText} (このIDをコピーして家族に共有してください)`);
                            setTimeout(() => setNotification(''), 8000);
                          }
                        }}
                        style={{ padding: '8px 12px', backgroundColor: colors.tabSelected, color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      >
                        📋 コピー
                      </button>
                    </div>
                  </div>

                  <div style={{ padding: '12px', backgroundColor: colors.inputBg, borderRadius: '4px', border: '1px solid ' + colors.inputBorder }}>
                    <p style={{ fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>家族への共有方法：</p>
                    <ol style={{ fontSize: '11px', color: colors.text.primary, margin: '0', paddingLeft: '20px', lineHeight: '1.6' }}>
                      <li>上の「📋 コピー」ボタンでグループIDをコピー</li>
                      <li>パスワードとIDを家族に共有</li>
                      <li>家族は「既存グループに参加」から登録</li>
                    </ol>
                  </div>
                </div>

                <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: colors.buttonGray, borderRadius: '8px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: colors.text.primary, marginBottom: '12px' }}>メンバー（{groupMembers.length}人）</p>
                  {groupMembers.map(member => (
                    <div key={member.userId} style={{ padding: '8px', marginBottom: '4px', backgroundColor: member.userId === currentUser?.userId ? colors.tabSelected : colors.darkCard, color: 'white', borderRadius: '6px', fontSize: '14px' }}>
                      {member.status === 'owner' ? '👑' : '👤'} {member.userName} {member.userId === currentUser?.userId && '(あなた)'}
                    </div>
                  ))}
                </div>

                <button onClick={handleLogout} style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>
                  ログアウト
                </button>

                <button onClick={() => setShowSettings(false)} style={{ width: '100%', padding: '12px', backgroundColor: colors.buttonGray, color: colors.text.primary, border: 'none', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>
                  閉じる
                </button>
              </div>
            </div>
          )}

          {/* タブコンテンツ */}
          {activeTab === 'summary' && (
            <>
              {/* 今日/週間切り替えボタン */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                  onClick={() => setSummaryView('today')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: summaryView === 'today' ? colors.tabSelected : colors.tabUnselected,
                    color: summaryView === 'today' ? 'white' : colors.text.primary,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  今日
                </button>
                <button
                  onClick={() => setSummaryView('week')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: summaryView === 'week' ? colors.tabSelected : colors.tabUnselected,
                    color: summaryView === 'week' ? 'white' : colors.text.primary,
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  週間
                </button>
              </div>

              {summaryView === 'today' ? (
                <>
                  {/* 今日のサマリー */}
                  <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.text.primary, marginBottom: '16px' }}>今日の夕食</h3>

                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', color: colors.text.secondary, marginBottom: '8px' }}>🍚 食べる（{todaySummary.yes.length}人）</p>
                      {todaySummary.yes.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {todaySummary.yes.map(name => (
                            <span key={name} style={{ padding: '6px 12px', backgroundColor: colors.statusYes, color: 'white', borderRadius: '16px', fontSize: '14px' }}>{name}</span>
                          ))}
                        </div>
                      ) : <p style={{ fontSize: '14px', color: colors.text.secondary }}>なし</p>}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ fontSize: '14px', color: colors.text.secondary, marginBottom: '8px' }}>🍴 食べない（{todaySummary.no.length}人）</p>
                      {todaySummary.no.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {todaySummary.no.map(name => (
                            <span key={name} style={{ padding: '6px 12px', backgroundColor: colors.statusNo, color: 'white', borderRadius: '16px', fontSize: '14px' }}>{name}</span>
                          ))}
                        </div>
                      ) : <p style={{ fontSize: '14px', color: colors.text.secondary }}>なし</p>}
                    </div>

                    <div>
                      <p style={{ fontSize: '14px', color: colors.text.secondary, marginBottom: '8px' }}>・未回答（{todaySummary.unknown.length}人）</p>
                      {todaySummary.unknown.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {todaySummary.unknown.map(name => (
                            <span key={name} style={{ padding: '6px 12px', backgroundColor: colors.statusUnknown, color: 'white', borderRadius: '16px', fontSize: '14px' }}>{name}</span>
                          ))}
                        </div>
                      ) : <p style={{ fontSize: '14px', color: colors.text.secondary }}>なし</p>}
                    </div>
                  </div>

                  {/* あなたの回答 */}
                  <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.text.primary, marginBottom: '16px' }}>あなたの回答</h3>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        onClick={() => handleResponseChange(currentUser.userId, today, 'yes')}
                        style={{
                          flex: 1,
                          padding: '16px',
                          backgroundColor: getResponse(currentUser.userId, today) === 'yes' ? colors.statusYes : colors.tabUnselected,
                          color: getResponse(currentUser.userId, today) === 'yes' ? 'white' : colors.text.primary,
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🍚 食べる
                      </button>
                      <button
                        onClick={() => handleResponseChange(currentUser.userId, today, 'no')}
                        style={{
                          flex: 1,
                          padding: '16px',
                          backgroundColor: getResponse(currentUser.userId, today) === 'no' ? colors.statusNo : colors.tabUnselected,
                          color: getResponse(currentUser.userId, today) === 'no' ? 'white' : colors.text.primary,
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '16px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🍴 食べない
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* 週間サマリー */}
                  <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: colors.text.primary, marginBottom: '16px' }}>週間サマリー（7日間）</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {getWeekSummary().map((day, index) => (
                        <div
                          key={index}
                          style={{
                            border: index === 0 ? `2px solid ${colors.todayBorder}` : `1px solid ${colors.cardBorder}`,
                            borderRadius: '12px',
                            padding: '12px',
                            backgroundColor: index === 0 ? colors.todayHighlight : colors.tabUnselected
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontWeight: 'bold', color: colors.text.primary, fontSize: '15px' }}>
                              {day.dateStr}
                              {index === 0 && <span style={{ marginLeft: '8px', fontSize: '12px', color: colors.todayBorder }}>(今日)</span>}
                            </span>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '14px' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4ade80' }}>
                                🍚 {day.homeUsers.length}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fb923c' }}>
                                🍴 {day.outUsers.length}
                              </span>
                            </div>
                          </div>
                          {(day.homeUsers.length > 0 || day.outUsers.length > 0) && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {day.homeUsers.map(user => (
                                <span key={user} style={{ backgroundColor: `${colors.statusYes}cc`, color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' }}>
                                  {user}
                                </span>
                              ))}
                              {day.outUsers.map(user => (
                                <span key={user} style={{ backgroundColor: `${colors.statusNo}cc`, color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '13px' }}>
                                  {user}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* カレンダータブ */}
          {activeTab === 'calendar' && (
            <>
              {/* 月の切り替え */}
              <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setCurrentDate(newDate);
                    }}
                    style={{ padding: '8px', backgroundColor: colors.buttonGray, border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '20px' }}
                  >
                    ◀
                  </button>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: colors.text.primary, margin: 0 }}>
                    {currentDate.getFullYear()}年{currentDate.getMonth() + 1}月
                  </h2>
                  <button
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setCurrentDate(newDate);
                    }}
                    style={{ padding: '8px', backgroundColor: colors.buttonGray, border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white', fontSize: '20px' }}
                  >
                    ▶
                  </button>
                </div>
              </div>

              {/* カレンダー */}
              <div style={{ backgroundColor: colors.card, borderRadius: '16px', padding: '24px' }}>
                {/* 曜日ヘッダー */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                    <div
                      key={day}
                      style={{
                        textAlign: 'center',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        padding: '8px 0',
                        color: index === 0 ? '#f87171' : index === 6 ? '#60a5fa' : colors.text.primary
                      }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* 日付グリッド */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {getMonthDays(currentDate).map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} style={{ aspectRatio: '1', minHeight: '50px' }} />;
                    }

                    const response = getResponse(currentUser.userId, date);
                    const isToday = formatDate(date) === formatDate(today);

                    return (
                      <div
                        key={index}
                        onClick={() => {
                          const current = getResponse(currentUser.userId, date);
                          if (!current) handleResponseChange(currentUser.userId, date, 'yes');
                          else if (current === 'yes') handleResponseChange(currentUser.userId, date, 'no');
                          else handleResponseChange(currentUser.userId, date, null);
                        }}
                        style={{
                          aspectRatio: '1',
                          minHeight: '50px',
                          padding: '8px',
                          textAlign: 'center',
                          backgroundColor: response === 'yes' ? colors.statusYes : response === 'no' ? colors.statusNo : colors.tabUnselected,
                          color: 'white',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          border: isToday ? `2px solid ${colors.todayBorder}` : 'none',
                          fontSize: '14px',
                          fontWeight: isToday ? 'bold' : 'normal',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: '16px', padding: '16px', backgroundColor: colors.buttonGray, borderRadius: '8px' }}>
                  <p style={{ fontSize: '12px', color: colors.text.secondary, marginBottom: '8px' }}>📱 操作方法</p>
                  <p style={{ fontSize: '12px', color: colors.text.primary, lineHeight: '1.6', margin: 0 }}>
                    日付をクリック: 未回答 → 食べる(緑) → 食べない(オレンジ) → 未回答
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default PitameshiMinimal;
