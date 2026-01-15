import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getCalendarDays, formatDate, getMonthName, isToday } from '../utils/dateHelpers';
import { getAnswerForDate, toggleAnswer } from '../utils/localStorage';

const ANSWER_ICONS = {
  home: '🏠',
  out: '🍴',
  unknown: '❓',
};

const Calendar = ({ currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [answers, setAnswers] = useState({});

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadAnswers();
  }, [currentDate]);

  const loadAnswers = () => {
    const days = getCalendarDays(year, month);
    const newAnswers = {};

    days.forEach((day) => {
      if (day) {
        const dateStr = formatDate(day);
        newAnswers[dateStr] = getAnswerForDate(dateStr);
      }
    });

    setAnswers(newAnswers);
  };

  const handleDayClick = (day) => {
    if (!day) return;

    const dateStr = formatDate(day);
    const newAnswer = toggleAnswer(dateStr, currentUser);

    setAnswers((prev) => ({
      ...prev,
      [dateStr]: {
        ...prev[dateStr],
        [currentUser]: newAnswer,
      },
    }));
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = getCalendarDays(year, month);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];

  const renderDayContent = (day) => {
    if (!day) return null;

    const dateStr = formatDate(day);
    const dayAnswers = answers[dateStr] || {};
    const userAnswer = dayAnswers[currentUser];

    return (
      <div className="h-full flex flex-col p-2">
        <div className="flex justify-between items-start mb-1">
          <span
            className={`text-sm font-semibold ${
              isToday(day) ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            {day.getDate()}
          </span>
          {userAnswer && (
            <span className="text-xl">{ANSWER_ICONS[userAnswer]}</span>
          )}
        </div>

        <div className="flex-1 flex flex-wrap gap-1 content-start">
          {Object.entries(dayAnswers).map(([userName, status]) => {
            const initial = userName.charAt(0).toUpperCase();
            const isCurrentUser = userName === currentUser;

            return (
              <div
                key={userName}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs ${
                  isCurrentUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-slate-300'
                }`}
                title={`${userName}: ${
                  status === 'home' ? '家で食べる' : status === 'out' ? '外で食べる' : '未定'
                }`}
              >
                <span className="font-medium">{initial}</span>
                <span className="text-xs">{ANSWER_ICONS[status]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-300" />
        </button>

        <h2 className="text-2xl font-bold text-white">{getMonthName(currentDate)}</h2>

        <button
          onClick={goToNextMonth}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-slate-300" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-slate-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day)}
            className={`
              aspect-square rounded-lg border transition-all
              ${
                day
                  ? 'bg-slate-800 border-slate-700 hover:border-indigo-500 cursor-pointer hover:shadow-lg hover:shadow-indigo-500/20'
                  : 'bg-transparent border-transparent'
              }
              ${isToday(day) ? 'ring-2 ring-indigo-500' : ''}
            `}
          >
            {renderDayContent(day)}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">使い方</h3>
        <ul className="text-sm text-slate-400 space-y-1">
          <li>• 日付をタップして、回答を切り替えます</li>
          <li>• 🏠 家で食べる → 🍴 外で食べる → ❓ 未定</li>
          <li>• あなたの回答は青色で表示されます</li>
        </ul>
      </div>
    </div>
  );
};

export default Calendar;
