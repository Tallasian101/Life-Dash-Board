import { useEffect, useState } from "react";
import { format } from "date-fns";

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end">
      <div className="text-xl font-bold tracking-tight text-white/90">
        {format(time, "HH:mm")}
      </div>
      <div className="text-sm font-medium text-white/50">
        {format(time, "EEEE, MMMM do")}
      </div>
    </div>
  );
}
