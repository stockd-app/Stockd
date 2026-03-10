import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import "./changemode.css";

const ChangeMode: React.FC = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    document.body.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="theme-toggle" onClick={toggleTheme}>
      <div className={`toggle-indicator ${theme}`} />

      <Moon
        size={18}
        className={`toggle-icon left ${theme === "dark" ? "active" : ""}`}
      />

      <Sun
        size={18}
        className={`toggle-icon right ${theme === "light" ? "active" : ""}`}
      />
    </div>
  );
};

export default ChangeMode;