function ActivityHeatmap({ data }) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setFullYear(startDate.getFullYear() - 1);
  startDate.setDate(startDate.getDate() + (7 - startDate.getDay()));

  const days = [];
  const day = new Date(startDate);
  while (day <= today) {
    days.push(new Date(day));
    day.setDate(day.getDate() + 1);
  }

  const weeks = [];
  let week = [];
  days.forEach((d, i) => {
    week.push(d);
    if (d.getDay() === 6 || i === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  const getCount = (date) => {
    const key = date.toISOString().slice(0, 10);
    return data?.[key] || 0;
  };

  const getColor = (count) => {
    if (count === 0) return "bg-gray-100";
    if (count <= 1) return "bg-green-200";
    if (count <= 2) return "bg-green-400";
    return "bg-green-600";
  };

  const totalPosts = days.reduce((sum, d) => sum + getCount(d), 0);
  const maxStreak = () => {
    let streak = 0, max = 0;
    days.forEach((d) => {
      if (getCount(d) > 0) { streak++; max = Math.max(max, streak); }
      else streak = 0;
    });
    return max;
  };

  const labels = ["Mon", "", "Wed", "", "Fri", ""];

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Posting Activity</h2>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{totalPosts} posts in a year</span>
          <span>Best streak: {maxStreak()} days</span>
        </div>
      </div>
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        <div className="flex flex-col gap-0.5 pr-1 pt-0">
          {labels.map((l, i) => (
            <span key={i} className="text-[10px] text-gray-400 h-3 leading-3">{l}</span>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((d, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-sm ${getColor(getCount(d))}`}
                title={`${d.toISOString().slice(0, 10)}: ${getCount(d)} post${getCount(d) !== 1 ? 's' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1 mt-2 text-[10px] text-gray-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-gray-100" />
        <div className="w-3 h-3 rounded-sm bg-green-200" />
        <div className="w-3 h-3 rounded-sm bg-green-400" />
        <div className="w-3 h-3 rounded-sm bg-green-600" />
        <span>More</span>
      </div>
    </div>
  );
}

export default ActivityHeatmap;
