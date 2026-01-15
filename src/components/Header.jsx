import { useState } from 'react';
import { Settings, UserPlus, LogOut, X } from 'lucide-react';
import { getUsers, addUser } from '../utils/localStorage';

const Header = ({ currentUser, onLogout, onRefresh }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const handleAddMember = (e) => {
    e.preventDefault();
    if (newMemberName.trim()) {
      addUser(newMemberName.trim());
      setNewMemberName('');
      setShowAddMember(false);
      onRefresh();
    }
  };

  const users = getUsers();

  return (
    <>
      <header className="bg-slate-800 border-b border-slate-700 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">今日家でご飯食べる?</h1>
            <p className="text-sm text-slate-400">ログイン中: {currentUser}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowAddMember(true)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="メンバーを追加"
            >
              <UserPlus className="w-5 h-5 text-slate-300" />
            </button>

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              title="設定"
            >
              <Settings className="w-5 h-5 text-slate-300" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">設定</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">現在のユーザー</h3>
                <div className="bg-slate-700 px-4 py-3 rounded-lg text-white">
                  {currentUser}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2">登録済みメンバー</h3>
                <div className="bg-slate-700 px-4 py-3 rounded-lg">
                  {users.length > 0 ? (
                    <ul className="space-y-2">
                      {users.map((user) => (
                        <li key={user} className="text-slate-300 flex items-center gap-2">
                          <span className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                            {user.charAt(0).toUpperCase()}
                          </span>
                          {user}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400">メンバーがいません</p>
                  )}
                </div>
              </div>

              <button
                onClick={onLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                ログアウト（名前を変更）
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">メンバーを追加</h2>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setNewMemberName('');
                }}
                className="p-1 hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-6 h-6 text-slate-300" />
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="mb-6">
                <label htmlFor="memberName" className="block text-sm font-medium text-slate-300 mb-2">
                  メンバーの名前
                </label>
                <input
                  type="text"
                  id="memberName"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  placeholder="例: 花子"
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div className="bg-slate-700 p-3 rounded-lg mb-4">
                <p className="text-xs text-slate-400">
                  ℹ️ このメンバーはシミュレーション用です。実際の回答は各メンバーが自分のデバイスから行う必要があります。
                </p>
              </div>

              <button
                type="submit"
                disabled={!newMemberName.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
              >
                追加
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
